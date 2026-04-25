const express = require('express');
const router = express.Router();
const academicCalendarController = require('../controllers/academicCalendarController');
const { authenticate } = require('../middleware/auth'); // If you have authentication middleware
const { isAdmin } = require('../middleware/isAdmin');

// Public route - anyone can check vacation mode
router.get('/vacation-mode', academicCalendarController.checkVacationMode);

// Protected routes
router.get('/', academicCalendarController.getAcademicCalendar);
router.put('/', authenticate, isAdmin, academicCalendarController.updateAcademicCalendar);

module.exports = router;