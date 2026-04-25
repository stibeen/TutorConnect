const Pricing = require('../models/Pricing');

// Get current pricing
const getPricing = async (req, res) => {
  try {
    const pricing = await Pricing.getPricing();
    res.json(pricing);
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({ 
      error: 'Failed to fetch pricing settings',
      message: error.message 
    });
  }
};

// Update pricing
const updatePricing = async (req, res) => {
  try {
    const { individualSessionPrice, groupSessionPrice, currency, effectiveDate } = req.body;
    
    // Validate required fields
    if (individualSessionPrice === undefined || groupSessionPrice === undefined) {
      return res.status(400).json({
        error: 'Individual session price and group session price are required'
      });
    }

    if (individualSessionPrice < 0 || groupSessionPrice < 0) {
      return res.status(400).json({
        error: 'Prices cannot be negative'
      });
    }

    // Get current pricing or create if doesn't exist
    let pricing = await Pricing.findOne();
    if (!pricing) {
      pricing = new Pricing({
        individualSessionPrice,
        groupSessionPrice,
        currency: currency || 'PHP',
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
        updatedBy: req.user.id // Assuming you have user authentication
      });
    } else {
      pricing.individualSessionPrice = individualSessionPrice;
      pricing.groupSessionPrice = groupSessionPrice;
      pricing.currency = currency || pricing.currency;
      pricing.effectiveDate = effectiveDate ? new Date(effectiveDate) : pricing.effectiveDate;
      pricing.updatedBy = req.user.id;
    }

    await pricing.save();
    res.json({
      message: 'Pricing updated successfully',
      pricing
    });
  } catch (error) {
    console.error('Error updating pricing:', error);
    res.status(500).json({ 
      error: 'Failed to update pricing settings',
      message: error.message 
    });
  }
};

// Get pricing history (optional - for future features)
const getPricingHistory = async (req, res) => {
  try {
    const pricingHistory = await Pricing.find()
      .sort({ effectiveDate: -1 })
      .populate('updatedBy', 'name email')
      .limit(10); // Get last 10 changes
    
    res.json(pricingHistory);
  } catch (error) {
    console.error('Error fetching pricing history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch pricing history',
      message: error.message 
    });
  }
};

module.exports = {
    getPricing,
    updatePricing,
    getPricingHistory,
}