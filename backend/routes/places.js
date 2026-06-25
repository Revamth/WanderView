/**
 * routes/places.js — Express router for /api/places endpoints.
 *
 * Maps place CRUD endpoints to the places controller. Read routes are public;
 * everything below the router.use(checkAuth) line requires a valid JWT. Image
 * uploads use a locally-defined multer instance.
 */

const express = require("express");
const { check } = require("express-validator");
const multer = require("multer");

const placesControllers = require("../controllers/places");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// Public reads (no auth) — must stay ABOVE router.use(checkAuth).
router.get("/:pid", placesControllers.getPlaceById);
router.get("/user/:uid", placesControllers.getPlacesByUserId);

// Auth gate: every route registered BELOW this line is protected by checkAuth.
// Routes above remain publicly accessible.
router.use(checkAuth);

router.post(
  "/",
  upload.single("image"),
  [
    check("title").notEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").notEmpty(),
  ],
  placesControllers.createPlace
);

router.put(
  "/:pid",
  upload.single("image"),
  [check("title").notEmpty(), check("description").isLength({ min: 5 })],
  placesControllers.updatePlace
);

router.delete("/:pid", placesControllers.deletePlace);

module.exports = router;
