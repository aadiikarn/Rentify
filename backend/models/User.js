const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  image: String, // base64 image
  address: String,
  phone: String
});

module.exports = mongoose.model("User", userSchema);