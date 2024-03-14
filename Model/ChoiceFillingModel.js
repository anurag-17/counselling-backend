const mongoose = require("mongoose");

const choiceListSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collegeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "College" }],
  },
  { timestamps: true }
);

const ChoiceList = mongoose.model("ChoiceList", choiceListSchema);

module.exports = ChoiceList;
