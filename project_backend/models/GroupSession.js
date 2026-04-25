const mongoose = require("mongoose");

const groupSessionSchema = new mongoose.Schema(
  {
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },
    date: {
      // CHANGE: from 'day' to 'date'
      type: Date,
      required: true,
    },
    formattedDate: { type: String, required: true },
    startTime: {
      // ADD: startTime field for consistency
      type: String,
      required: true,
    },
    endTime: {
      // ADD: endTime field for consistency
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    modality: {
      type: String,
      enum: ["online", "face-to-face"],
      required: true,
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: 2,
      max: 10,
    },
    currentParticipants: {
      type: Number,
      default: 0,
    },
    participants: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["confirmed", "waiting", "cancelled"],
          default: "confirmed",
        },
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "full", "completed", "cancelled"], // ADDED 'open'
      default: "open",
    },
    expiryDateTime: {
      type: String,
    },
    // ADD: Optional fields for meeting details
    meetingLink: {
      type: String,
      default: "",
    },
    locationDetails: {
      type: String,
      required: function () {
        if (this.modality === "face-to-face") {
          return true;
        }
        return false;
      },
    },
    specialInstructions: {
      type: String,
      maxlength: [500, "Special instructions cannot exceed 500 characters"],
    }, // Add to your GroupSession schema:
    cancellationReason: {
      type: String,
      required: function () {
        return this.status === "cancelled";
      },
    },
    cancelledBy: {
      type: String,
      enum: ["tutor", "system"],
      required: function () {
        return this.status === "cancelled";
      },
    },
    cancelledAt: {
      type: Date,
      required: function () {
        return this.status === "cancelled";
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GroupSession", groupSessionSchema);
