/**
 * controllers/places.js — request handlers for place CRUD.
 *
 * Implements read (by id / by user), create, update, and delete for places.
 * Coordinates geocoding (util/location), Cloudinary image upload/cleanup, and
 * keeps the Place collection and each User's `places` array in sync via
 * MongoDB transactions.
 */

const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const getCoordsAndAddress = require("../util/location");
const Place = require("../models/places");
const User = require("../models/user");
const mongoose = require("mongoose");
const cloudinary = require("../util/cloudinary");

// Converts an in-memory multer file (Buffer) into a base64 data URI string.
// Cloudinary's uploader.upload() accepts a data URI directly, so this lets us
// upload the buffer without writing it to disk or opening a stream.
const toDataURI = (file) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  return `data:${file.mimetype};base64,${b64}`;
};

// Fetch one place by its id (req.params.pid) and return it as JSON. If not found, 404.
const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not find a place.", 500)
    );
  }
  if (!place)
    return next(
      new HttpError("Could not find a place for the provided id.", 404)
    );
  res.json({ place: place.toObject({ getters: true }) });
};

// Fetch all places for a user
const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    return next(
      new HttpError("Fetching places failed, please try again later.", 500)
    );
  }
  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user id.", 404)
    );
  }
  res.json({ places: places.map((p) => p.toObject({ getters: true })) });
};

// Create place: geocode + upload image + MongoDB transaction
const createPlace = async (req, res, next) => {
  // express-validator results were collected by the route's check() middleware.
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError("Invalid inputs.", 422));

  const { title, description, address } = req.body;
  // Geocode the address into coordinates before persisting the place.
  let coordinates;
  try {
    coordinates = await getCoordsAndAddress(title, address);
  } catch (err) {
    return next(new HttpError(err.message || "Could not fetch location.", 500));
  }

  // Default to no image
  let imageUrl = null;
  let imagePublicId = null;

  // Only upload if the client actually sent a file.
  if (req.file) {
    try {
      const uploadRes = await cloudinary.uploader.upload(toDataURI(req.file), {
        folder: process.env.CLOUDINARY_FOLDER || "wanderview",
      });
      imageUrl = uploadRes.secure_url;
      // Store the public_id so the image can be deleted later (update/delete).
      imagePublicId = uploadRes.public_id;
    } catch (err) {
      return next(new HttpError("Image upload failed.", 500));
    }
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    imageUrl,
    imagePublicId,
    creator: req.userData.userId,
  });

  // Confirm the creator exists before touching the database.
  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again.", 500));
  }
  if (!user)
    return next(new HttpError("Could not find user for provided id.", 404));

  // Atomic via a transaction: saving the new place AND pushing it onto the
  // user's `places` array must both succeed or both roll back. 
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again.", 500));
  }

  res.status(201).json({ place: createdPlace.toObject({ getters: true }) });
};

// Update title/description + optional new image
const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError("Invalid inputs.", 422));

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not update place.", 500)
    );
  }
  if (!place) return next(new HttpError("Place not found.", 404));
  // Ownership check: only the creator may edit. 
  if (place.creator.toString() !== req.userData.userId) {
    return next(
      new HttpError("You are not allowed to update this place.", 401)
    );
  }

  place.title = title;
  place.description = description;

  if (req.file) {
    try {
      // Replacing the image: delete the old Cloudinary asset first to avoid
      // leaving an orphaned file, then upload the new one.
      if (place.imagePublicId) {
        await cloudinary.uploader.destroy(place.imagePublicId);
      }
      const uploaded = await cloudinary.uploader.upload(toDataURI(req.file), {
        folder: process.env.CLOUDINARY_FOLDER || "wanderview",
      });
      place.imageUrl = uploaded.secure_url;
      place.imagePublicId = uploaded.public_id;
    } catch (err) {
      return next(new HttpError("Image update failed.", 500));
    }
  }

  try {
    await place.save();
  } catch (err) {
    return next(new HttpError("Could not update place.", 500));
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

// Delete place + Cloudinary cleanup
const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    // .populate("creator") swaps the creator ObjectId for the full User
    // document, so we can both authorize the delete AND mutate the user's
    // `places` array within the same transaction below.
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not delete place.", 500)
    );
  }
  if (!place)
    return next(new HttpError("Could not find place for this id.", 404));
  // Ownership check: creator is populated here, so compare its `.id`.
  if (place.creator.id !== req.userData.userId) {
    return next(
      new HttpError("You are not allowed to delete this place.", 401)
    );
  }

  try {
    // Atomic: removing the place AND pulling its reference off the user's
    // `places` array must both commit or both roll back.
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await place.deleteOne({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });

    await sess.commitTransaction();

    if (place.imagePublicId) {
      await cloudinary.uploader.destroy(place.imagePublicId);
    }
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not delete place.", 500)
    );
  }
  res.status(200).json({ message: "Deleted place." });
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
};
