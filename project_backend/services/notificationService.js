// services/notificationService.js
const Notification = require("../models/Notification");
const User = require("../models/User");
const Tutor = require("../models/Tutor");

const formatTime = (timeString) => {
  return new Date(`1970-01-01T${timeString}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

class NotificationService {
  // Create a notification
  static async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  // Create booking-related notifications
  static async createBookingNotification(booking, type, additionalData = {}) {
    try {
      const {
        student,
        tutor,
        topic,
        formattedDate,
        startTime,
        _id: bookingId,
        price,
      } = booking;

      let recipientId, recipientType, title, message, data;
      const relatedUserId = type.includes("booking_request")
        ? student._id
        : tutor._id;
      const relatedUserType = type.includes("booking_request")
        ? "User"
        : "Tutor";

      switch (type) {
        case "booking_request":
          recipientId = tutor._id;
          recipientType = "Tutor";
          title = "New Booking Request";
          message = `${
            student.name
          } has requested a ${topic} session on ${formattedDate} at ${formatTime(
            startTime
          )}`;
          data = {
            studentName: student.name,
            topic,
            date: formattedDate,
            time: startTime,
            price: price,
          };
          break;

        case "booking_confirmed":
          recipientId = student._id;
          recipientType = "User";
          title = "Booking Confirmed!";
          message = `Your ${topic} session with ${
            tutor.name
          } has been confirmed for ${formattedDate} at ${formatTime(
            startTime
          )}`;
          data = {
            tutorName: tutor.name,
            topic,
            date: formattedDate,
            time: startTime,
            price,
          };
          break;

        case "booking_cancelled":
          const cancelledBy = additionalData.cancelledBy || "system";
          if (cancelledBy === "student") {
            recipientId = tutor._id;
            recipientType = "Tutor";
            title = "Booking Cancelled";
            message = `${student.name} has cancelled the ${topic} session on ${formattedDate}`;
          } else if (cancelledBy === "tutor") {
            recipientId = student._id;
            recipientType = "User";
            title = "Session Cancelled";
            message = `${tutor.name} has cancelled your ${topic} session on ${formattedDate}`;
          } else {
            // System cancellation
            recipientId = student._id;
            recipientType = "User";
            title = "Booking Expired";
            message = `Your ${topic} session request with ${tutor.name} has expired`;
          }
          data = {
            cancelledBy,
            reason: additionalData.reason || "",
            topic,
            date: formattedDate,
            ...additionalData,
          };
          break;

        case "booking_completed":
          recipientId = student._id;
          recipientType = "User";
          title = "Session Completed";
          message = `Your ${topic} session with ${tutor.name} has been marked as completed`;
          data = {
            tutorName: tutor.name,
            topic,
            date: formattedDate,
            ...additionalData,
          };
          break;

        case "booking_reminder":
          // Send to both student and tutor
          const notifications = [];

          // For student
          const studentNotification = await this.createNotification({
            recipientId: student._id,
            recipientType: "User",
            type: "booking_reminder",
            title: "Session Reminder",
            message: `Your ${topic} session with ${
              tutor.name
            } is scheduled for tomorrow at ${formatTime(startTime)}`,
            bookingId,
            relatedUserId: tutor._id,
            relatedUserType: "Tutor",
            data: {
              tutorName: tutor.name,
              topic,
              date: formattedDate,
              time: startTime,
            },
            isImportant: true,
          });

          // For tutor
          const tutorNotification = await this.createNotification({
            recipientId: tutor._id,
            recipientType: "Tutor",
            type: "booking_reminder",
            title: "Session Reminder",
            message: `Your ${topic} session with ${
              student.name
            } is scheduled for tomorrow at ${formatTime(startTime)}`,
            bookingId,
            relatedUserId: student._id,
            relatedUserType: "User",
            data: {
              studentName: student.name,
              topic,
              date: formattedDate,
              time: startTime,
            },
            isImportant: true,
          });

          return [studentNotification, tutorNotification];
      }

      const notification = await this.createNotification({
        recipientId,
        recipientType,
        type,
        title,
        message,
        bookingId,
        relatedUserId,
        relatedUserType,
        data,
        isImportant: type === "booking_reminder",
      });

      return notification;
    } catch (error) {
      console.error("Error creating booking notification:", error);
      throw error;
    }
  }

  // Create review notification
  static async createReviewNotification(booking, rating, comment) {
    try {
      const { tutor, student, topic } = booking;

      const notification = await this.createNotification({
        recipientId: tutor._id,
        recipientType: "Tutor",
        type: "new_review",
        title: "New Review Received",
        message: `${student.name} left a ${rating}-star review for your ${topic} session`,
        bookingId: booking._id,
        relatedUserId: student._id,
        relatedUserType: "User",
        data: {
          rating,
          comment,
          studentName: student.name,
          topic,
          date: new Date().toLocaleDateString(),
        },
        isImportant: true,
      });

      return notification;
    } catch (error) {
      console.error("Error creating review notification:", error);
      throw error;
    }
  }

  // Create payment notification - Fixed for student
  static async createPaymentNotification(booking, amount) {
    try {
      const { student, tutor, topic } = booking;

      const notification = await this.createNotification({
        recipientId: student._id,
        recipientType: "User",
        type: "payment_received",
        title: "Payment Confirmed",
        message: `Your payment of ₱${amount} for the ${topic} session with ${tutor.name} has been confirmed and processed successfully.`,
        bookingId: booking._id,
        relatedUserId: tutor._id,
        relatedUserType: "Tutor",
        data: {
          amount,
          tutorName: tutor.name,
          topic,
          date: new Date().toLocaleDateString(),
          paymentDate: new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
        isImportant: true,
      });

      return notification;
    } catch (error) {
      console.error("Error creating payment notification:", error);
      throw error;
    }
  }

  // Get notifications for user/tutor
  static async getNotifications(userId, userType, options = {}) {
    try {
      const { limit = 50, skip = 0, unreadOnly = false } = options;

      const query = {
        recipientId: userId,
        recipientType: userType,
      };

      if (unreadOnly) {
        query.isRead = false;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("relatedUser", "name profileImage")
        .populate({
          path: "bookingId",
          select: "topic formattedDate startTime status",
        });

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({
        ...query,
        isRead: false,
      });

      return {
        notifications,
        total,
        unreadCount,
      };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId, userType) {
    try {
      const notification = await Notification.findOneAndUpdate(
        {
          _id: notificationId,
          recipientId: userId,
          recipientType: userType,
        },
        { $set: { isRead: true } },
        { new: true }
      );

      return notification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Mark all as read
  static async markAllAsRead(userId, userType) {
    try {
      const result = await Notification.updateMany(
        {
          recipientId: userId,
          recipientType: userType,
          isRead: false,
        },
        { $set: { isRead: true } }
      );

      return result.modifiedCount;
    } catch (error) {
      console.error("Error marking all as read:", error);
      throw error;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId, userId, userType) {
    try {
      const result = await Notification.findOneAndDelete({
        _id: notificationId,
        recipientId: userId,
        recipientType: userType,
      });

      return result;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  // Clean up old notifications
  static async cleanupOldNotifications(days = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate },
        isImportant: false,
      });

      return result.deletedCount;
    } catch (error) {
      console.error("Error cleaning up old notifications:", error);
      throw error;
    }
  } 

  // Notify when tutor creates a group session
  static async createGroupSessionCreatedNotification(groupSession, tutor) {
    try {
      const notification = await this.createNotification({
        recipientId: tutor._id,
        recipientType: "Tutor",
        type: "group_session_created",
        title: "Group Session Created",
        message: `You successfully created a ${groupSession.topic} group session on ${groupSession.formattedDate} at ${formatTime(groupSession.startTime)}`,
        data: {
          topic: groupSession.topic,
          date: groupSession.formattedDate,
          time: groupSession.startTime,
          maxParticipants: groupSession.maxParticipants,
          price: groupSession.price,
          modality: groupSession.modality,
          groupSessionId: groupSession._id,
        },
        isImportant: false,
      });

      return notification;
    } catch (error) {
      console.error(
        "Error creating group session creation notification:",
        error
      );
      throw error;
    }
  }

  // Notify tutor when student joins group session
  static async createGroupSessionJoinNotification(
    booking,
    groupSession,
    student,
    tutor
  ) {
    try {
      const formatTime = (timeString) => {
        return new Date(`1970-01-01T${timeString}`).toLocaleTimeString(
          "en-US",
          {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }
        );
      };

      const notification = await this.createNotification({
        recipientId: tutor._id,
        recipientType: "Tutor",
        type: "group_student_joined",
        title: "New Group Session Participant",
        message: `${student.name} joined your ${groupSession.topic} group session`,
        bookingId: booking._id,
        relatedUserId: student._id,
        relatedUserType: "User",
        data: {
          studentName: student.name,
          topic: groupSession.topic,
          date: groupSession.formattedDate,
          time: formatTime(groupSession.startTime),
          currentParticipants: groupSession.currentParticipants,
          maxParticipants: groupSession.maxParticipants,
          availableSpots:
            groupSession.maxParticipants - groupSession.currentParticipants,
          groupSessionId: groupSession._id,
        },
        isImportant: true,
      });

      return notification;
    } catch (error) {
      console.error("Error creating group join notification:", error);
      throw error;
    }
  }

  // Notify when group session is cancelled (by student or tutor)
  static async createGroupSessionCancellationNotification(
    booking,
    groupSession,
    cancelledBy
  ) {
    try {
      const formatTime = (timeString) => {
        return new Date(`1970-01-01T${timeString}`).toLocaleTimeString(
          "en-US",
          {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }
        );
      };

      let recipientId,
        recipientType,
        title,
        message,
        relatedUserId,
        relatedUserType;

      if (cancelledBy === "student") {
        // Student cancelled - notify tutor
        recipientId = booking.tutor;
        recipientType = "Tutor";
        title = "Student Left Group Session";
        message = `${booking.student?.name || "A student"} left your ${
          groupSession.topic
        } group session`;
        relatedUserId = booking.student;
        relatedUserType = "User";
      } else if (cancelledBy === "tutor") {
        // Tutor cancelled - notify student
        recipientId = booking.student;
        recipientType = "User";
        title = "Group Session Cancelled";
        message = `Your ${groupSession.topic} group session has been cancelled by the tutor`;
        relatedUserId = booking.tutor;
        relatedUserType = "Tutor";
      } else {
        // System cancellation
        recipientId = booking.student || booking.tutor;
        recipientType = booking.student ? "User" : "Tutor";
        title = "Group Session Expired";
        message = `The ${groupSession.topic} group session has been automatically cancelled`;
        relatedUserId = null;
        relatedUserType = null;
      }

      const notification = await this.createNotification({
        recipientId,
        recipientType,
        type: "group_session_cancelled",
        title,
        message,
        bookingId: booking._id,
        relatedUserId,
        relatedUserType,
        data: {
          topic: groupSession.topic,
          date: groupSession.formattedDate,
          time: formatTime(groupSession.startTime),
          cancelledBy,
          reason:
            booking.cancellationReason ||
            groupSession.cancellationReason ||
            "No reason provided",
          currentParticipants: groupSession.currentParticipants,
          groupSessionId: groupSession._id,
        },
        isImportant: true,
      });

      return notification;
    } catch (error) {
      console.error("Error creating group cancellation notification:", error);
      throw error;
    }
  }

  // Notify student when group session is completed
  static async createGroupSessionCompletedNotification(
    booking,
    groupSession,
    tutor
  ) {
    try {
      const formatTime = (timeString) => {
        return new Date(`1970-01-01T${timeString}`).toLocaleTimeString(
          "en-US",
          {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }
        );
      };

      const notification = await this.createNotification({
        recipientId: booking.student,
        recipientType: "User",
        type: "group_session_completed",
        title: "Group Session Completed",
        message: `Your ${groupSession.topic} group session has been completed`,
        bookingId: booking._id,
        relatedUserId: tutor._id,
        relatedUserType: "Tutor",
        data: {
          tutorName: tutor.name,
          topic: groupSession.topic,
          date: groupSession.formattedDate,
          time: formatTime(groupSession.startTime),
          completionDate: new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          groupSessionId: groupSession._id,
        },
        isImportant: true,
      });

      return notification;
    } catch (error) {
      console.error("Error creating group completion notification:", error);
      throw error;
    }
  }

  // Notify tutor when group session auto-expires
  static async createGroupSessionAutoExpiredNotification(groupSession) {
    try {
      const formatTime = (timeString) => {
        return new Date(`1970-01-01T${timeString}`).toLocaleTimeString(
          "en-US",
          {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }
        );
      };

      const notification = await this.createNotification({
        recipientId: groupSession.tutor,
        recipientType: "Tutor",
        type: "group_session_expired",
        title: "Group Session Auto-Expired",
        message: `Your ${groupSession.topic} group session was automatically cancelled`,
        data: {
          topic: groupSession.topic,
          date: groupSession.formattedDate,
          time: formatTime(groupSession.startTime),
          reason:
            groupSession.cancellationReason ||
            "No participants joined within 24 hours",
          maxParticipants: groupSession.maxParticipants,
          groupSessionId: groupSession._id,
        },
        isImportant: false,
      });

      return notification;
    } catch (error) {
      console.error("Error creating group auto-expire notification:", error);
      throw error;
    }
  }

  // Notify all participants when group session is cancelled by tutor (batch notification)
  static async createGroupSessionBulkCancellationNotification(
    participantBookings,
    groupSession,
    tutor
  ) {
    try {
      const formatTime = (timeString) => {
        return new Date(`1970-01-01T${timeString}`).toLocaleTimeString(
          "en-US",
          {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }
        );
      };

      const notifications = [];

      for (const booking of participantBookings) {
        try {
          const notification = await this.createNotification({
            recipientId: booking.student._id,
            recipientType: "User",
            type: "group_session_cancelled",
            title: "Group Session Cancelled",
            message: `Your ${groupSession.topic} group session has been cancelled by the tutor`,
            bookingId: booking._id,
            relatedUserId: tutor._id,
            relatedUserType: "Tutor",
            data: {
              tutorName: tutor.name,
              topic: groupSession.topic,
              date: groupSession.formattedDate,
              time: formatTime(groupSession.startTime),
              reason: groupSession.cancellationReason || "Cancelled by tutor",
              cancelledBy: "tutor",
              refundInfo:
                "Any payments will be refunded within 3-5 business days",
              groupSessionId: groupSession._id,
            },
            isImportant: true,
          });

          notifications.push(notification);
        } catch (error) {
          console.error(
            `Failed to send notification to student ${booking.student._id}:`,
            error
          );
          // Continue with other students
        }
      }

      return notifications;
    } catch (error) {
      console.error("Error creating bulk cancellation notifications:", error);
      throw error;
    }
  }
}

module.exports = NotificationService;
