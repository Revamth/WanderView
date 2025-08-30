const express = require("express");
const { check } = require("express-validator");
const multer = require("multer");

const usersControllers = require("../controllers/users");

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", usersControllers.getUsers);

router.post(
  "/signup",
  upload.single("image"),
  [
    check("name").notEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersControllers.signup
);

router.post("/login", usersControllers.login);

module.exports = router;
