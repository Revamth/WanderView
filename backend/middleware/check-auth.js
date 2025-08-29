const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(
        new HttpError("Authentication failed! No token provided.", 401)
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(new HttpError("Authentication failed!", 401));
    }

    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    return next(new HttpError("Authentication failed!", 401));
  }
};
