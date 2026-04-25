const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  individualSessionPrice: {
    type: Number,
    required: true,
    default: 30.0,
    min: 0
  },
  groupSessionPrice: {
    type: Number,
    required: true,
    default: 15.0,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'PHP',
    enum: ['PHP', 'USD', 'EUR']
  },
  effectiveDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create a singleton - only one pricing document should exist
pricingSchema.statics.getPricing = async function() {
  let pricing = await this.findOne();
  if (!pricing) {
    pricing = await this.create({
      individualSessionPrice: 30.0,
      groupSessionPrice: 15.0,
      currency: 'PHP',
      effectiveDate: new Date(),
      updatedBy: new mongoose.Types.ObjectId() // You might want to set a default admin ID
    });
  }
  return pricing;
};

module.exports = mongoose.model('Pricing', pricingSchema);