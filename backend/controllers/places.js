const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const getCoordsAndAddress = require("../util/location");
const Place = require("../models/places");
const User = require("../models/user");
const mongoose = require("mongoose");
const cloudinary = require("../util/cloudinary");

const toDataURI = (file) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  return `data:${file.mimetype};base64,${b64}`;
};

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

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return next(new HttpError("Invalid inputs.", 422));

  const { title, description, address } = req.body;
  let coordinates;
  try {
    coordinates = await getCoordsAndAddress(title, address);
  } catch (err) {
    return next(new HttpError(err.message || "Could not fetch location.", 500));
  }

  let imageUrl = null;
  let imagePublicId = null;

  if (req.file) {
    try {
      const uploadRes = await cloudinary.uploader.upload(toDataURI(req.file), {
        folder: process.env.CLOUDINARY_FOLDER || "wanderview",
      });
      imageUrl = uploadRes.secure_url;
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

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again.", 500));
  }
  if (!user)
    return next(new HttpError("Could not find user for provided id.", 404));

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
  if (place.creator.toString() !== req.userData.userId) {
    return next(
      new HttpError("You are not allowed to update this place.", 401)
    );
  }

  place.title = title;
  place.description = description;

  if (req.file) {
    try {
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

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    return next(
      new HttpError("Something went wrong, could not delete place.", 500)
    );
  }
  if (!place)
    return next(new HttpError("Could not find place for this id.", 404));
  if (place.creator.id !== req.userData.userId) {
    return next(
      new HttpError("You are not allowed to delete this place.", 401)
    );
  }

  try {
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
