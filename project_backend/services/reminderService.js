// services/reminderService.js
const cron = require("node-cron");
const Booking = require("../models/Booking");
const NotificationService = require("./notificationService");

class ReminderService {
  static async sendSessionReminders() {
    try {
      console.log("🔔 Running session reminder job...");
      
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Find bookings happening tomorrow that are confirmed
      const tomorrowBookings = await Booking.find({
        date: {
          $gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
          $lt: new Date(tomorrow.setHours(23, 59, 59, 999))
        },
        status: "confirmed"
      })
      .populate("student", "name email profileImage")
      .populate("tutor", "name email profileImage");

      console.log(`📅 Found ${tomorrowBookings.length} bookings for tomorrow`);

      let reminderCount = 0;
      for (const booking of tomorrowBookings) {
        try {
          await NotificationService.createBookingNotification(booking, "booking_reminder");
          reminderCount++;
        } catch (notificationError) {
          console.error(`❌ Error sending reminder for booking ${booking._id}:`, notificationError);
        }
      }

      console.log(`✅ Sent ${reminderCount}/${tomorrowBookings.length} session reminders`);
      return { success: true, remindersSent: reminderCount };
    } catch (error) {
      console.error("❌ Error sending session reminders:", error);
      throw error;
    }
  }

  static async sendTodaySessionReminders() {
    try {
      console.log("🔔 Running today's session reminder job...");
      
      const now = new Date();
      const today = new Date(now);
      
      // Find bookings happening today that are confirmed
      const todayBookings = await Booking.find({
        date: {
          $gte: new Date(today.setHours(0, 0, 0, 0)),
          $lt: new Date(today.setHours(23, 59, 59, 999))
        },
        status: "confirmed",
        startTime: { $gte: now.getHours() + ":" + now.getMinutes() } // Only future sessions today
      })
      .populate("student", "name email profileImage")
      .populate("tutor", "name email profileImage");

      console.log(`📅 Found ${todayBookings.length} bookings for today`);

      let reminderCount = 0;
      for (const booking of todayBookings) {
        try {
          // Send a more urgent reminder for today's sessions
          await NotificationService.createBookingNotification(booking, "booking_reminder");
          reminderCount++;
        } catch (notificationError) {
          console.error(`❌ Error sending today's reminder for booking ${booking._id}:`, notificationError);
        }
      }

      console.log(`✅ Sent ${reminderCount} today's session reminders`);
      return { success: true, remindersSent: reminderCount };
    } catch (error) {
      console.error("❌ Error sending today's session reminders:", error);
      throw error;
    }
  }

  static startReminderCron() {
    // Schedule jobs
    try {
      // Send tomorrow's session reminders at 9 AM daily
      cron.schedule("0 9 * * *", async () => {
        console.log("⏰ Running daily session reminder job...");
        await this.sendSessionReminders();
      });

      // Send today's session reminders every 2 hours from 8 AM to 6 PM
      cron.schedule("0 8,10,12,14,16,18 * * *", async () => {
        console.log("⏰ Running today's session reminder check...");
        await this.sendTodaySessionReminders();
      });

      console.log("✅ Session reminder cron jobs scheduled");
    } catch (error) {
      console.error("❌ Error scheduling cron jobs:", error);
      throw error;
    }
  }

  // Manual trigger for testing
  static async testReminders() {
    console.log("🧪 Testing reminder system...");
    const result = await this.sendSessionReminders();
    console.log("✅ Test completed:", result);
    return result;
  }
}

module.exports = ReminderService;