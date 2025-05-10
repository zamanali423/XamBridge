const mongoose = require("mongoose");

const singleMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  senderName: {
    type: String,
  },
  receiverName: {
    type: String,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [mongoose.Schema.Types.ObjectId], // [senderId, receiverId]
      required: true,
      validate: [
        (arr) => arr.length === 2,
        "Participants must have exactly 2 users",
      ],
    },
    messages: [singleMessageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
