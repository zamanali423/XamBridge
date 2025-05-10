const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  phone: Number,
  image: String,
  tokens: [String],
  otp: String,
  otpExpires: Date,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
