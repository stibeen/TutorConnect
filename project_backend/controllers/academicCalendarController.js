const AcademicCalendar = require('../models/AcademicCalendar');

// Get current academic calendar
const getAcademicCalendar = async (req, res) => {
  try {
    const calendar = await AcademicCalendar.getCurrentCalendar();
    res.json(calendar);
  } catch (error) {
    console.error('Error fetching academic calendar:', error);
    res.status(500).json({ 
      error: 'Failed to fetch academic calendar',
      message: error.message 
    });
  }
};

// Update academic calendar
const updateAcademicCalendar = async (req, res) => {
  try {
    const { termStart, termEnd } = req.body;
    
    if (!termStart || !termEnd) {
      return res.status(400).json({
        error: 'Term start and end dates are required'
      });
    }

    const startDate = new Date(termStart);
    const endDate = new Date(termEnd);

    if (endDate <= startDate) {
      return res.status(400).json({
        error: 'Term end date must be after term start date'
      });
    }

    // Get current calendar or create if doesn't exist
    let calendar = await AcademicCalendar.findOne({ isActive: true });
    if (!calendar) {
      calendar = new AcademicCalendar({
        termStart: startDate,
        termEnd: endDate,
        isActive: true,
        updatedBy: req.user.id
      });
    } else {
      calendar.termStart = startDate;
      calendar.termEnd = endDate;
      calendar.updatedBy = req.user.id;
    }

    await calendar.save();
    res.json({
      message: 'Academic calendar updated successfully',
      calendar
    });
  } catch (error) {
    console.error('Error updating academic calendar:', error);
    res.status(500).json({ 
      error: 'Failed to update academic calendar',
      message: error.message 
    });
  }
};

// Check if platform should be in vacation mode
const checkVacationMode = async (req, res) => {
  try {
    const calendar = await AcademicCalendar.getCurrentCalendar();
    const now = new Date();
    const isVacationMode = now > new Date(calendar.termEnd);
    
    res.json({
      isVacationMode,
      termEnd: calendar.termEnd,
      message: isVacationMode ? 'Platform is in vacation mode' : 'Platform is active'
    });
  } catch (error) {
    console.error('Error checking vacation mode:', error);
    res.status(500).json({ 
      error: 'Failed to check vacation mode',
      message: error.message 
    });
  }
};

module.exports = {
    getAcademicCalendar,
    updateAcademicCalendar,
    checkVacationMode,
}