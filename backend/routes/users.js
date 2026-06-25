/**
 * routes/users.js — Express router for /api/users endpoints.
 *
 * Wires user-facing endpoints (list users, signup, login) to the users
 * controller. Signup runs the shared file-upload middleware plus input
 * validation; none of these routes are behind checkAuth (login/signup must be
 * reachable without a token).
 */

const express = require("express");
const { check } = require("express-validator");

const usersControllers = require("../controllers/users");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/", usersControllers.getUsers);

router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("name").notEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersControllers.signup
);

router.post("/login", usersControllers.login);

module.exports = router;
