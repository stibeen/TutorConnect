const mongoose = require('mongoose');

const academicCalendarSchema = new mongoose.Schema({
  termStart: {
    type: Date,
    required: true
  },
  termEnd: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Singleton pattern - only one academic calendar should exist
academicCalendarSchema.statics.getCurrentCalendar = async function() {
  let calendar = await this.findOne({ isActive: true });
  if (!calendar) {
    // Create default calendar if none exists
    const defaultStart = new Date();
    const defaultEnd = new Date();
    defaultEnd.setMonth(defaultEnd.getMonth() + 4); // 4 months from now
    
    calendar = await this.create({
      termStart: defaultStart,
      termEnd: defaultEnd,
      isActive: true,
      updatedBy: new mongoose.Types.ObjectId() // Default admin ID
    });
  }
  return calendar;
};

module.exports = mongoose.model('AcademicCalendar', academicCalendarSchema);