const { default: mongoose } = require("mongoose");

const resultSchema = new mongoose.Schema({
  title: String,
  totalMarks: Number,
  obtainedMarks: Number,
  result: String,
  Timestamp: Date,
  email: String,
  examId: String,
  timeTaken: String,
});

module.exports = mongoose.model("Result", resultSchema);
