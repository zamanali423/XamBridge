const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  title: String,
  course: String,
  description: String,
  category: String,
  duration: Number,
  starttime: Date,
  endtime: Date,
  question: String,
  answers: [String],
  correctanswer: String,
  status: String,
  createdby: String,
});

const Exam = mongoose.model("Exam", examSchema);

module.exports = Exam;
