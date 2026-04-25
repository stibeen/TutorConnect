// controllers/notificationController.js
const NotificationService = require("../services/notificationService");

// Get notifications for current user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.user.role === "student" ? "User" : "Tutor";
    
    const { limit, skip, unreadOnly } = req.query;

    const result = await NotificationService.getNotifications(userId, userType, {
      limit: parseInt(limit) || 50,
      skip: parseInt(skip) || 0,
      unreadOnly: unreadOnly === "true"
    });

    res.json(result);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.user.role === "student" ? "User" : "Tutor";
    
    const result = await NotificationService.getNotifications(userId, userType, {
      limit: 1,
      unreadOnly: true
    });

    res.json({ unreadCount: result.unreadCount });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ error: "Failed to get unread count" });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userType = req.user.role === "student" ? "User" : "Tutor";

    const notification = await NotificationService.markAsRead(id, userId, userType);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ success: true, notification });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

// Mark all as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.user.role === "student" ? "User" : "Tutor";

    const updatedCount = await NotificationService.markAllAsRead(userId, userType);

    res.json({ 
      success: true, 
      message: `${updatedCount} notifications marked as read` 
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userType = req.user.role === "student" ? "User" : "Tutor";

    const notification = await NotificationService.deleteNotification(id, userId, userType);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
};

// Clear all notifications
const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.user.role === "student" ? "User" : "Tutor";

    // For clearing all, we'll just mark all as read and archive them
    const updatedCount = await NotificationService.markAllAsRead(userId, userType);

    res.json({ 
      success: true, 
      message: `${updatedCount} notifications cleared` 
    });
  } catch (error) {
    console.error("Clear all notifications error:", error);
    res.status(500).json({ error: "Failed to clear notifications" });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
};