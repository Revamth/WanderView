/**
 * user.js (model) — Mongoose schema/model for an application User.
 *
 * Defines the account shape: name, unique email, hashed password, Cloudinary
 * avatar reference, and the list of places the user owns. Exported as the
 * "User" model used by the users/places controllers.
 */

const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true, maxlength: 15, trim: true },
  // `unique` builds a DB index; the plugin below turns violations into nice errors.
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  // imageUrl = Cloudinary secure URL; imagePublicId = handle used to delete it.
  imageUrl: { type: String, required: true },
  imagePublicId: { type: String, required: true },
  // One-to-many link to Place documents; `ref` enables population of a user's places.
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: "Place" }],
});

// mongoose-unique-validator surfaces duplicate-email violations as validation
// errors (instead of a raw MongoDB E11000), so the email `unique` index is
// reported cleanly during save.
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
