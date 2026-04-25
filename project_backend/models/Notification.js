// models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Reference to either User or Tutor
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    recipientType: {
      type: String,
      enum: ["User", "Tutor"],
      required: true,
    },
    type: {
      type: String,
      enum: [
        "booking_request", // New booking request
        "booking_confirmed", // Booking confirmed by tutor
        "booking_cancelled", // Booking cancelled
        "booking_completed", // Booking marked as completed
        "booking_reminder", // Upcoming session reminder
        "payment_received", // Payment received
        "new_review", // New review received
        "new_message", // New message
        "system_alert", // System notification
        "schedule_updated", // Schedule change
        "group_session_created", // Tutor creates session
        "group_student_joined", // Student joins session
        "group_session_initiated", // Student creates session
        "group_session_cancelled", // Session cancelled
        "group_session_completed", // Session completed
        "group_session_expired", // Session auto-expired
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    // Related booking ID (if applicable)
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    // Related user ID (e.g., who sent message/request)
    relatedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "relatedUserType",
      default: null,
    },
    relatedUserType: {
      type: String,
      enum: ["User", "Tutor"],
      default: null,
    },
    // Additional data
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Read status
    isRead: {
      type: Boolean,
      default: false,
    },
    // Important flag for critical notifications
    isImportant: {
      type: Boolean,
      default: false,
    },
    // Expiry for temporary notifications
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for faster queries
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for recipient details
notificationSchema.virtual("recipient", {
  ref: function () {
    return this.recipientType;
  },
  localField: "recipientId",
  foreignField: "_id",
  justOne: true,
});

// Virtual for related user details
notificationSchema.virtual("relatedUser", {
  ref: function () {
    return this.relatedUserType;
  },
  localField: "relatedUserId",
  foreignField: "_id",
  justOne: true,
});

module.exports = mongoose.model("Notification", notificationSchema);
