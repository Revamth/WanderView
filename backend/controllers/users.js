/**
 * controllers/users.js — request handlers for user auth and listing.
 *
 * Implements getUsers, signup, and login. Handles password hashing (bcrypt),
 * optional avatar upload to Cloudinary, and issuing JWTs that authenticate
 * subsequent requests via the check-auth middleware.
 */

const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const streamifier = require("streamifier");

const HttpError = require("../models/http-error");
const User = require("../models/user");
const cloudinary = require("../util/cloudinary");

// List all users (password excluded)
const getUsers = async (req, res, next) => {
  try {
    // "-password" excludes the hashed password from the projection so it never
    // leaves the server.
    const users = await User.find({}, "-password");
    res.json({ users: users.map((user) => user.toObject({ getters: true })) });
  } catch (err) {
    return next(
      new HttpError("Fetching users failed, please try again later.", 500)
    );
  }
};

// Promisified wrapper around Cloudinary's streaming upload. Cloudinary's
// upload_stream is callback-based and expects a readable stream, but multer's
// memoryStorage gives us a Buffer — streamifier turns that Buffer into a stream
// we can pipe in, and the Promise lets callers `await` the result.
const uploadToCloudinary = (fileBuffer, folder = "wanderview/users") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// Register: hash password, upload image, return JWT
const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { name, email, password } = req.body;

  // Reject duplicate signups before doing any expensive hashing/upload work.
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(
      new HttpError("Signing up failed, please try again later.", 500)
    );
  }

  if (existingUser) {
    return next(
      new HttpError("User already exists, please login instead.", 422)
    );
  }

  // Hash the password with bcrypt at cost factor 12 (2^12 rounds) — never store the raw password. 
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError("Could not create user, please try again.", 500));
  }

  let imageUrl = null;
  let imagePublicId = null;

  if (req.file) {
    try {
      const uploadRes = await uploadToCloudinary(req.file.buffer);
      imageUrl = uploadRes.secure_url;
      imagePublicId = uploadRes.public_id;
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      return next(new HttpError("Profile image upload failed.", 500));
    }
  }

  const createdUser = new User({
    name,
    email,
    imageUrl,
    imagePublicId,
    password: hashedPassword,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError("Signing up failed, please try again.", 500));
  }

  // Issue a JWT so the client is logged in immediately after signup. 
  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Signing up failed, please try again.", 500));
  }

  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    image: createdUser.imageUrl,
    token: token,
  });
};

// Verify password, return JWT
const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      return next(
        new HttpError("Invalid credentials, could not log you in.", 401)
      );
    }

    // Compare the submitted plaintext against the stored bcrypt hash; 
    let isValidPassword = await bcrypt.compare(password, existingUser.password);
    if (!isValidPassword) {
      return next(
        new HttpError("Invalid Credentials, Could not log you in.", 401)
      );
    }

    // Same token contract as signup so the client can authenticate going forward.
    let token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    res.json({
      userId: existingUser.id,
      email: existingUser.email,
      image: existingUser.imageUrl,
      token: token,
    });
  } catch (err) {
    return next(
      new HttpError("Logging in failed, please try again later.", 500)
    );
  }
};

module.exports = {
  getUsers,
  signup,
  login,
};
