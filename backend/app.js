/**
 * app.js — Express application entry point and server bootstrap.
 *
 * Configures global middleware (JSON parsing, CORS), mounts the /api/places and
 * /api/users routers, registers the 404 + central error handlers, and finally
 * connects to MongoDB before starting the HTTP listener.
 */

require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const placesRoutes = require("./routes/places");
const usersRoutes = require("./routes/users");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

// Manual CORS middleware 
// allowed origin/methods/headers are explicit and driven by env config.
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONT_END_URL);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Short-circuit CORS preflight: the browser only needs the headers above, so
  // answer OPTIONS immediately and don't let it fall through to the routes/auth.
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

// Catch-all for unmatched routes: throwing here hands off to the error handler below.
app.use((req, res, next) => {
  throw new HttpError("Could not find this route.", 404);
});

// Central error-handling middleware: Express recognizes it as such because it
// takes 4 args (error, req, res, next). Every `next(err)` in the app lands here.
app.use((error, req, res, next) => {
  // If a response was already started, let Express's default handler finish it.
  if (res.headersSent) {
    return next(error);
  }

  // Default to 500, but honor an HttpError's `.code` (set in models/http-error.js).
  let statusCode = 500;
  if (typeof error.code === "number") {
    statusCode = error.code;
  }

  res
    .status(statusCode)
    .json({ message: error.message || "An unknown error occurred!" });
});

// Only start listening AFTER Mongo connects, so the API never accepts traffic
// while the database is unavailable. A failed connection logs and never listens.
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server listening on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
