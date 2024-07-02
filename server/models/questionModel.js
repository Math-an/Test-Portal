const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  correctOption: {
    type: String,
  },
  options: {
    type: Object,
  },
  testCases: {
    type: [String], // Array of strings for test cases
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "exams",
  },
}, {
  timestamps: true,
});

const Question = mongoose.model("questions", questionSchema);
module.exports = Question;
