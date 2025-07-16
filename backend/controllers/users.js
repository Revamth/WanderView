const { validationResult } = require("express-validator");

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

    const createdUser = new User({
      name,
      email,
      image: req.file.path,
      password,
      places: [],
    });

    await createdUser.save();
    res.status(201).json({ user: createdUser.toObject({ getters: true }) });
  } catch (err) {
    return next(new HttpError("Signing up failed, please try again.", 500));
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email: email });

    if (!existingUser || existingUser.password !== password) {
      return next(
        new HttpError("Invalid credentials, could not log you in.", 401)
      );
    }

    res.json({
      message: "Logged in successfully!",
      user: existingUser.toObject({ getters: true }),
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
