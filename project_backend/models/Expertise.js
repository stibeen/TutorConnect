const mongoose = require("mongoose");

const expertiseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: ["Programming", "Web Development", "Mobile Development", "Data Structures", "Algorithms", "Tools", "Other"]
    },
    description: {
      type: String,
      maxlength: 200
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true
    }
  },
  { timestamps: true }
);

// Index for better search performance
expertiseSchema.index({ name: 1, category: 1 });
expertiseSchema.index({ isActive: 1 });

module.exports = mongoose.model("Expertise", expertiseSchema);