const cron = require('node-cron');
const Booking = require('../models/Booking'); // Adjust path as needed
// const logger = require('./logger'); // Optional: if you have logging

// Function to expire old bookings
async function expireOldBookings() {
  const now = new Date();
  const currentDate = new Date(now.setHours(0, 0, 0, 0)); // Today at midnight
  const currentTime = now.toTimeString().substring(0, 5); // Current time in HH:MM format

  try {
    const result = await Booking.updateMany(
      {
        status: { $in: ['pending', 'confirmed'] },
        $or: [
          { date: { $lt: currentDate } }, // Date is before today
          { 
            date: currentDate, // Today's date
            endTime: { $lt: currentTime } // End time has passed today
          }
        ]
      },
      { $set: { status: 'expired' } }
    );

    console.log(`Expired ${result.modifiedCount} bookings`);
    return result;
  } catch (error) {
    console.log('Error expiring old bookings:', error);
    throw error;
  }
}

// Schedule the job to run every hour at minute 0 (e.g., 1:00, 2:00, etc.)
function startBookingExpiryJob() {
  cron.schedule('0 * * * *', async () => {
    console.log('Running booking expiry check...');
    try {
      await expireOldBookings();
    } catch (error) {
      console.log('Failed to run booking expiry check:', error);
    }
  });

  console.log('Booking expiry scheduler started');
}

module.exports = {
  startBookingExpiryJob,
  expireOldBookings // Export for testing purposes
};