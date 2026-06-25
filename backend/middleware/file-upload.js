/**
 * file-upload.js — multer middleware for image uploads (user routes).
 *
 * Configures multer to accept a single image, hold it in memory, cap its size,
 * and reject non-image MIME types. Memory storage is used (not disk) because
 * the buffer is streamed straight to Cloudinary by the controllers.
 */

const multer = require("multer");

// Allow-list of accepted image MIME types; the value is the file extension.
const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "image/avif": "avif",
};

const fileUpload = multer({
  storage: multer.memoryStorage(),
  // Reject uploads larger than 5MB.
  limits: { fileSize: 5000000 },
  fileFilter: (req, file, cb) => {
    // Only let through MIME types present in the allow-list above.
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    // multer convention: first arg is the error (null = accept), second is keep/drop.
    cb(isValid ? null : new Error("Invalid mime type!"), isValid);
  },
});

module.exports = fileUpload;
