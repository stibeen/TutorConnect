const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');
const { authenticate } = require('../middleware/auth'); // If you have authentication middleware
const { isAdmin } = require('../middleware/isAdmin');

// Public route - anyone can see current pricing
router.get('/', pricingController.getPricing);

// Protected routes - only admins can update pricing
router.put('/', authenticate, isAdmin, pricingController.updatePricing);
router.get('/history', authenticate, isAdmin, pricingController.getPricingHistory);

module.exports = router;