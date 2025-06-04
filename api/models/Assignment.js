const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  engineerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  allocationPercentage: Number,
  startDate: Date,
  endDate: Date,
  role: String,
});

module.exports = mongoose.model("Assignment", assignmentSchema);
