const express = require("express");
const { check } = require("express-validator");
const multer = require("multer");

const placesControllers = require("../controllers/places");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get("/:pid", placesControllers.getPlaceById);
router.get("/user/:uid", placesControllers.getPlacesByUserId);

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
