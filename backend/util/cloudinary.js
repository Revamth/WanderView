/**
 * cloudinary.js — configured Cloudinary client (singleton).
 *
 * Centralizes Cloudinary SDK setup so controllers can `require` a ready-to-use,
 * authenticated client for image upload/destroy. All image storage in the app
 * goes through Cloudinary (replacing the old local /uploads disk storage).
 */

// `.v2` is Cloudinary's current API surface (upload/destroy/upload_stream live here).
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
