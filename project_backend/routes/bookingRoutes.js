const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { authenticate } = require("../middleware/auth"); // Assuming you have auth middleware
const upload = require("../middleware/upload"); 

router.post("/", authenticate, bookingController.createBooking);
router.get("/availability", bookingController.checkExpiredBookings, bookingController.checkAvailability);
router.get("/", bookingController.checkExpiredBookings , bookingController.getBookings);
router.get("/my-bookings", authenticate, bookingController.checkExpiredBookings, bookingController.getUserBookings);
// router.get("/availability", bookingController.checkAvailability);
// router.get("/", bookingController.getBookings);
// router.get("/my-bookings", authenticate, bookingController.getUserBookings);
router.put("/:id/review", authenticate, bookingController.submitReview);
router.patch("/:id/cancel", authenticate, bookingController.cancelBooking);
router.patch("/:id/confirm", authenticate, bookingController.confirmBooking);
router.patch("/:id/complete", authenticate, upload.single("proof"), // 'proof' matches the field name in FormData
 bookingController.completeBooking
);
router.get("/tutor/:tutorId/reviews", bookingController.getTutorReviews);
router.patch('/:bookingId/mark-paid', bookingController.markBookingAsPaid);

// Add the new route for group session reviews

router.get("/group-session/:groupId/reviews", bookingController.getGroupSessionReviews);

// Debug route - remove in production
router.get("/debug/tutor/:tutorId/ratings", bookingController.debugTutorRatings);

module.exports = router;
