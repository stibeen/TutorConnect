// models/Signatory.js
const mongoose = require('mongoose');

const signatorySchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['administrator', 'dean'],
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
signatorySchema.index({ role: 1, isActive: 1 });

const Signatory = mongoose.model('Signatory', signatorySchema);

module.exports = Signatory;