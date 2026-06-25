/**
 * places.js (model) — Mongoose schema/model for a user-created Place.
 *
 * Defines the shape of a place document: text fields, the Cloudinary image
 * reference, geocoded coordinates, and a reference back to its creator (User).
 * Exported as the "Place" model used throughout the places controller.
 */

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const placeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  // imageUrl = Cloudinary secure URL; imagePublicId = handle used to delete it.
  imageUrl: { type: String, required: true },
  imagePublicId: { type: String, required: true },
  address: { type: String, required: true },
  // Geocoded coordinates from util/location.js, used for map display.
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  // Reference to the owning User; `ref` enables .populate("creator").
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("Place", placeSchema);
