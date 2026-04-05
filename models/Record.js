const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true
    },
    category: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    note: {
      type: String,
      default: ""
    },
    // BUG FIX: added status — recordController filters & counts by this field
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
    // BUG FIX: removed stray `role` field — roles belong on User, not Record
  },
  { timestamps: true }
);

module.exports = mongoose.model("Record", recordSchema);
