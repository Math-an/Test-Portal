const router = require("express").Router();
const Exam = require("../models/examModel");
const authMiddleware = require("../middlewares/authMiddleware");
const Question = require("../models/questionModel");

// add exam
router.post("/add", authMiddleware, async (req, res) => {
  try {
    // check if exam already exists
    const examExists = await Exam.findOne({ name: req.body.name });
    if (examExists) {
      return res.send({
        success: false,
        message: "Exam already exists",
      });
    }
    const newExam = new Exam(req.body);
    await newExam.save();
    res.send({
      success: true,
      message: "Exam added successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// get all exams
router.post("/get-all-exams", authMiddleware, async (req, res) => {
  try {
    const exams = await Exam.find({});
    res.send({
      success: true,
      data: exams,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// get exam by id
router.post("/get-exam-by-id", authMiddleware, async (req, res) => {
  try {
    const exam = await Exam.findById(req.body.examId).populate("questions");
    res.send({
      success: true,
      data: exam,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// edit exam by id
router.post("/edit/:id", authMiddleware, async (req, res) => {
  try {
    await Exam.findByIdAndUpdate(req.params.id, req.body);
    res.send({
      success: true,
      message: "Exam updated successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// delete exam by id
router.post("/delete/:id", authMiddleware, async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.send({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

// add question to exam
router.post("/add-question-to-exam", authMiddleware, async (req, res) => {
  try {
    const newQuestion = new Question(req.body);
    const question = await newQuestion.save();

    const exam = await Exam.findById(req.body.exam);
    exam.questions.push(question._id);
    await exam.save();
    res.send({
      message: "Question added successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// edit question in exam
router.post("/edit-question-in-exam", authMiddleware, async (req, res) => {
  try {
    await Question.findByIdAndUpdate(req.body.questionId, req.body);
    res.send({
      message: "Question edited successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

// delete question in exam
router.post("/delete-question-in-exam", authMiddleware, async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.body.questionId);

    const exam = await Exam.findById(req.body.examId);
    exam.questions = exam.questions.filter(
      (question) => question._id != req.body.questionId
    );
    await exam.save();
    res.send({
      message: "Question deleted successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      data: error,
      success: false,
    });
  }
});

module.exports = router;
