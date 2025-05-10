const { default: mongoose } = require("mongoose");

const userTracking=new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
  },
  ip: String,
  imageUri: String,
  lastActive: Date,
});

const UserTracking = mongoose.model("UserTracking", userTracking);

module.exports = UserTracking;