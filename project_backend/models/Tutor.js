const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const tutorSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
    },
    authProvider: { type: String, required: true, enum: ["local", "google"] },
    profileImage: { type: String, required: false },
    isActive: {
      type: Boolean,
      default: true
    },
    onDayCancellationCount: {
      type: Number,
      default: 0,
    },
    isReadyToTeach: {
      type: Boolean,
      default: false,
    },
    expertise: {
      type: [String],
      default: [],
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    contactInfo: {
      phone: { type: String },
      contactEmail: { type: String },
      messenger: { type: String },
    },
    schedule: {
      Monday: { type: [String], default: [] },
      Tuesday: { type: [String], default: [] },
      Wednesday: { type: [String], default: [] },
      Thursday: { type: [String], default: [] },
      Friday: { type: [String], default: [] },
      Saturday: { type: [String], default: [] },
      Sunday: { type: [String], default: [] },
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true } }
);

// Virtual for real-time calculation
tutorSchema.virtual('isReadyToTeachCalculated').get(function() {
  const hasExpertise = this.expertise && this.expertise.length > 0;
  const hasSchedule = this.schedule && Object.values(this.schedule).some(day => day && day.length > 0);
  
  return hasExpertise && hasSchedule;
});

// Pre-save middleware to persist the value
tutorSchema.pre("save", async function (next) {
  const hasExpertise = this.expertise && this.expertise.length > 0;
  const hasSchedule = this.schedule && Object.values(this.schedule).some(day => day && day.length > 0);
  
  this.isReadyToTeach = hasExpertise && hasSchedule;
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Hash password before saving
// tutorSchema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

// Generate JWT token
tutorSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = mongoose.model("Tutor", tutorSchema);
