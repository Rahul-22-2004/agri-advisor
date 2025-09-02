const express = require("express");
const AdviceHistory = require("../models/AdviceHistory");

const router = express.Router();

// GET /api/history - Fetch user's advice history
router.get("/", async (req, res) => {
  const { offset = 0, limit = 10 } = req.query;
  try {
    const histories = await AdviceHistory.find({ userId: req.user.id })
      .sort({ queriedAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    const total = await AdviceHistory.countDocuments({ userId: req.user.id });
    console.log("History Fetch for user:", req.user.id, "Offset:", offset, "Limit:", limit);
    res.json({ histories, total, offset: parseInt(offset), limit: parseInt(limit) });
  } catch (err) {
    console.error("History Fetch Error:", err.message);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// DELETE /api/history/:id - Delete a specific history entry
router.delete("/:id", async (req, res) => {
  try {
    const history = await AdviceHistory.findOne({ _id: req.params.id, userId: req.user.id });
    if (!history) {
      return res.status(404).json({ error: "History not found or not authorized" });
    }
    await AdviceHistory.deleteOne({ _id: req.params.id });
    console.log("History deleted for user:", req.user.id, "History ID:", req.params.id);
    res.json({ message: "History deleted successfully" });
  } catch (err) {
    console.error("History Delete Error:", err.message);
    res.status(500).json({ error: "Failed to delete history" });
  }
});

module.exports = router;