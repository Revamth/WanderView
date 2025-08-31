const multer = require("multer");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
  "image/avif": "avif",
};

const fileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5000000 },
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    cb(isValid ? null : new Error("Invalid mime type!"), isValid);
  },
});

module.exports = fileUpload;
