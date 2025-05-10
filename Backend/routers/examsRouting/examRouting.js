const express = require("express");
const router = express.Router();
const Exam = require("../../models/exams/examsModel");
const Result = require("../../models/exams/resultsModel");
const { verifyToken } = require("../../authentication/generateToken");

// ✅ GET all exams
router.get("/", verifyToken, async (req, res) => {
  try {
    const exams = await Exam.find();
    if (!exams.length) {
      return res.status(404).json({ message: "No exams found" });
    }
    return res.status(200).json(exams);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ✅ POST - Add Exam to an Existing Category or Create a New One
router.post("/create", verifyToken, async (req, res) => {
  try {
    const {
      category,
      title,
      course,
      description,
      duration,
      starttime,
      endtime,
      question,
      option1,
      option2,
      option3,
      option4,
      correctanswer,
      status,
      createdby,
    } = req.body;
   
    if (
      !category ||
      !question ||
      !option1 ||
      !option2 ||
      !option3 ||
      !option4 ||
      !correctanswer
    ) {
      return res
        .status(400)
        .json({ message: "All fields are required" });
    }

    const newExamData = {
      title,
      course,
      description,
      category,
      duration,
      starttime,
      endtime,
      question,
      answers: [option1, option2, option3, option4],
      correctanswer,
      status,
      createdby,
    };

    const newExam = new Exam(newExamData);
    await newExam.save();
    return res
      .status(201)
      .json({ message: "New category created with exam", newExam });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


// ✅ Update exams
router.put("/update/:id", verifyToken, async (req, res) => {
  try {
    const exams = await Exam.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true });
    if (!exams) {
      return res.status(404).json({ message: "No exams found" });
    }
    return res.status(200).json({ message: "Exam updated successfully", exams });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ✅ Delete exams
router.delete("/delete/:id", verifyToken, async (req, res) => {
  try {
    const exams = await Exam.findOneAndDelete({ _id: req.params.id });
    if (!exams) {
      return res.status(404).json({ message: "No exams found" });
    }
    return res.status(200).json({ message: "Exam deleted successfully", exams });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
