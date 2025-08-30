const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const streamifier = require("streamifier");

const HttpError = require("../models/http-error");
const User = require("../models/user");
const cloudinary = require("../util/cloudinary");

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, "-password");
    res.json({ users: users.map((user) => user.toObject({ getters: true })) });
  } catch (err) {
    return next(
      new HttpError("Fetching users failed, please try again later.", 500)
    );
  }
};

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

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { name, email, password } = req.body;

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

    let isValidPassword = await bcrypt.compare(password, existingUser.password);
    if (!isValidPassword) {
      return next(
        new HttpError("Invalid Credentials, Could not log you in.", 401)
      );
    }

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
