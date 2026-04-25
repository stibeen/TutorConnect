const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const bookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tutor",
      required: true,
    },
    date: { type: Date, required: true },
    formattedDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    topic: { type: String, required: true },
    modality: {
      type: String,
      enum: ["face-to-face", "online"],
      required: true,
    },
    sessionType: {
      type: String,
      enum: ["individual", "group"],
      required: true,
    },
    groupSession: {
      isGroup: {
        type: Boolean,
        default: false,
      },
      groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GroupSession",
      },
      maxParticipants: {
        type: Number,
        default: 1,
      },
      currentParticipants: {
        type: Number,
        default: 1,
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
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "expired"],
      default: "pending",
    },
    expiryDateTime: {
      type: String,
    },
    isPayable: {
      type: Boolean,
      default: true,
    },
    confirmedDateTime: {
      type: String,
    },
    // Payment related fields
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
      required: true,
    },
    paidAt: {
      type: Date,
      required: function () {
        return this.paymentStatus === "paid";
      },
    },
    payReceiver: {
      type: String,
      required: function () {
        return this.paymentStatus === "paid";
      },
    },
    // New fields
    cancellationReason: {
      type: String,
      required: function () {
        return this.status === "cancelled";
      },
    },
    cancelledBy: {
      type: String,
      enum: ["student", "tutor", "system"],
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
    meetingLink: {
      type: String,
      required: function () {
        return (
          this.status === "confirmed" &&
          this.modality === "online" &&
          this.sessionType === "individual"
        );
      },
      // validate: {
      //   validator: function (v) {
      //     return /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/.test(
      //       v
      //     );
      //   },
      //   message: (props) => `${props.value} is not a valid URL!`,
      // },
    },
    locationDetails: {
      type: String,
      required: function () {
        if (this.modality === "face-to-face" && this.status === "confirmed") {
          return true;
        }
        return false;
      },
      validate: {
        validator: function (v) {
          if (this.modality !== "face-to-face") return true;
          return v && v.trim().length >= 6;
        },
        message: "Face-to-face requires location (10+ chars)",
      },
    },
    specialInstructions: {
      type: String,
      maxlength: [500, "Special instructions cannot exceed 500 characters"],
    },
    createdAt: { type: Date, default: Date.now },
    // Update the review section in your bookingSchema:
    review: {
      rating: {
        type: Number,
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"],
      },
      comment: {
        type: String,
        maxlength: [1000, "Review cannot exceed 1000 characters"],
        trim: true,
      },
      // NEW FIELDS FOR GROUP SESSIONS
      isForGroup: {
        type: Boolean,
        default: false,
      },
      groupSessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GroupSession",
      },
      reviewedAt: {
        type: Date,
        default: Date.now,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
      },
    },
    // Add this to your bookingSchema fields
    timeSlotReleased: {
      type: Boolean,
      default: false,
    },
    proofOfCompletion: {
      type: String, // Store URL or path to the file
      required: function () {
        return this.status === "completed";
      },
    },
  },
  { timestamps: true }
);

// Add indexes for better performance
bookingSchema.index({ tutor: 1, date: 1 });
bookingSchema.index({ student: 1, date: 1 });
bookingSchema.index({ status: 1 });
// Add new index for reviews
bookingSchema.index({ tutor: 1, "review.rating": 1 });

// Add pre-save hook for date validation
bookingSchema.pre("save", function (next) {
  const bookingDate = new Date(this.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  // Additional validation - ensure date isn't too far in the future if needed
  const maxBookingDate = new Date(today);
  maxBookingDate.setDate(today.getDate() + 30); // Example: 3 months in future
  if (bookingDate > maxBookingDate) {
    const err = new Error(
      "Bookings cannot be made more than 1 month in advance"
    );
    err.name = "ValidationError"; // Use Mongoose validation error name
    return next(err);
  }

  next();
});

// Update the calculateTutorRating static method
bookingSchema.statics.calculateTutorRating = async function (tutorId) {
  try {
    console.log(`Calculating ratings for tutor: ${tutorId}`);

    const stats = await this.aggregate([
      {
        $match: {
          tutor: new mongoose.Types.ObjectId(tutorId),
          "review.rating": { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$tutor",
          averageRating: { $avg: "$review.rating" },
          reviewCount: { $sum: 1 },
          totalRatings: { $sum: "$review.rating" },
        },
      },
    ]);

    console.log("Aggregation stats:", stats);

    let updateData = {
      averageRating: 0,
      reviewCount: 0,
    };

    if (stats.length > 0) {
      updateData.averageRating = Math.round(stats[0].averageRating * 10) / 10; // Round to 1 decimal
      updateData.reviewCount = stats[0].reviewCount;
    }

    console.log("Updating tutor with:", updateData);

    // Update the Tutor model
    const result = await mongoose
      .model("Tutor")
      .findByIdAndUpdate(tutorId, updateData, {
        new: true,
        runValidators: true,
      });

    console.log("Tutor update result:", result);

    return result;
  } catch (error) {
    console.error("Error in calculateTutorRating:", error);
    throw error;
  }
};

// Add pre-save hook to handle review updates
bookingSchema.pre("save", function (next) {
  if (this.isModified("review") && this.review) {
    this.review.updatedAt = new Date();
  }
  next();
});

// Fix the post-save hook
bookingSchema.post("save", async function (doc) {
  try {
    // Only recalculate if review rating was modified or added
    if (doc.review?.rating && this.isModified("review.rating")) {
      console.log("Review rating modified, recalculating tutor ratings...");
      await doc.constructor.calculateTutorRating(doc.tutor);
    }
  } catch (error) {
    console.error("Error in post-save hook:", error);
  }
});

// Also add post-findOneAndUpdate hook for when using findByIdAndUpdate
bookingSchema.post("findOneAndUpdate", async function (doc) {
  try {
    if (doc && doc.review?.rating) {
      console.log("findOneAndUpdate - recalculating tutor ratings...");
      await doc.constructor.calculateTutorRating(doc.tutor);
    }
  } catch (error) {
    console.error("Error in findOneAndUpdate hook:", error);
  }
});
// Add static method to calculate tutor ratings
// bookingSchema.statics.calculateTutorRating = async function (tutorId) {
//   const stats = await this.aggregate([
//     {
//       $match: {
//         tutor: tutorId,
//         "review.rating": { $exists: true },
//       },
//     },
//     {
//       $group: {
//         _id: "$tutor",
//         averageRating: { $avg: "$review.rating" },
//         reviewCount: { $sum: 1 },
//       },
//     },
//   ]);

//   // Update the Tutor model with these stats
//   if (stats.length > 0) {
//     await mongoose.model("Tutor").findByIdAndUpdate(tutorId, {
//       averageRating: stats[0].averageRating,
//       reviewCount: stats[0].reviewCount,
//     });
//   }
// };

// Call calculateTutorRating after saving a review
// bookingSchema.post("save", async function (doc) {
//   if (doc.review?.rating) {
//     await doc.constructor.calculateTutorRating(doc.tutor);
//   }
// });
module.exports = mongoose.model("Booking", bookingSchema);
