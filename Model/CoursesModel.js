const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    branch: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    fees: {
      type: Number,
    },
    admissionCriteria: {
      type: String,
    },
    duration: {
      type: Number,
    },
    minScore: {
      type: String,
    }
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
