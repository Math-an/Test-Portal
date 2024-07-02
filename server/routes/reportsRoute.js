const authMiddleware = require("../middlewares/authMiddleware");
const Exam = require("../models/examModel");
const User = require("../models/userModel");
const Report = require("../models/reportModel");
const router = require("express").Router();

// Add report
router.post("/add-report", authMiddleware, async (req, res) => {
  try {
    const newReport = new Report(req.body);
    await newReport.save();
    res.send({
      message: "Report added successfully",
      success: true,
      data: newReport,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

router.post("/get-all-reports", authMiddleware, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("exam")
      .populate("user")
      .sort({ createdAt: -1 });
    res.send({
      success: true,
      data: reports,
    });
  } catch (error) {
    console.error("Failed to fetch reports:", error.message); // Log error message
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});

// Get all reports by user
router.post("/get-all-reports-by-user", authMiddleware, async (req, res) => {
  try {
    const reports = await Report.find({ user: req.body.userId })
      .populate("exam")
      .populate("user")
      .sort({ createdAt: -1 });
    res.send({
      message: "Reports fetched successfully",
      success: true,
      data: reports,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
});



module.exports = router;
