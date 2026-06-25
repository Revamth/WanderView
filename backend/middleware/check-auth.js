/**
 * check-auth.js — route guard that validates the JWT on protected requests.
 *
 * Mounted via router.use() in routes/places.js so every route below it requires
 * a valid token. On success it attaches the authenticated user's id to
 * req.userData, which downstream controllers use for ownership checks.
 */

const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  // Let CORS preflight (OPTIONS) requests through untouched — browsers send them
  // without an Authorization header, so blocking them would break every request.
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

    // Header format is "Bearer <token>"; split on the space to grab the token.
    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(new HttpError("Authentication failed!", 401));
    }

    // Verify the signature/expiry; throws if the token is invalid or expired.
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    // Expose the user id to later handlers (used for ownership/authorization).
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (err) {
    // Any failure (missing/malformed/expired token) collapses to a 401.
    return next(new HttpError("Authentication failed!", 401));
  }
};
