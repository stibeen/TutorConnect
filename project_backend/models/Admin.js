const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema(
    {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String, // e.g. 'student' or 'tutor' or 'admin'
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: { 
      type: String, 
      required: false }
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Generate JWT token
adminSchema.methods.generateAuthToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

module.exports = mongoose.model('Admin', adminSchema);