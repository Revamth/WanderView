const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");

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

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      return next(
        new HttpError("User already exists, please login instead.", 422)
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const createdUser = new User({
      name,
      email,
      image: req.file.path,
      password: hashedPassword,
      places: [],
    });

    await createdUser.save();

    const token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      userId: createdUser.id,
      email: createdUser.email,
      token: token,
      message: "Signed up successfully!",
    });
  } catch (err) {
    console.error("Signup error:", err);
    return next(new HttpError("Signing up failed, please try again.", 500));
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      return next(
        new HttpError("Invalid credentials, could not log you in.", 401)
      );
    }

    const isValidPassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isValidPassword) {
      return next(
        new HttpError("Invalid credentials, could not log you in.", 401)
      );
    }

    const token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Logged in successfully!",
      userId: existingUser.id,
      email: existingUser.email,
      token: token,
    });
  } catch (err) {
    console.error("Login error:", err);
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
