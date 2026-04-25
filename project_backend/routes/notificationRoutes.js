// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
} = require("../controllers/notificationController");
const { authenticate } = require("../middleware/auth");

// All routes require authentication
router.use(authenticate);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);
router.delete("/:id", deleteNotification);
router.delete("/clear-all", clearAllNotifications);

module.exports = router;