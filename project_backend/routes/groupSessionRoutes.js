// file: groupSessionRoutes.js
const express = require("express");
const router = express.Router();
const groupSessionController = require("../controllers/groupSessionController");
const { authenticate } = require("../middleware/auth");
const upload = require("../middleware/upload"); // Import your centralized upload middleware

router.post('/', authenticate, groupSessionController.createGroupSession);
router.get('/tutor/:tutorId', groupSessionController.checkAndUpdateGroupSessions, groupSessionController.getTutorsGroupSession);
router.delete('/:id', authenticate, groupSessionController.deleteGroupSession);
router.get("/availability", groupSessionController.checkAndUpdateGroupSessions ,groupSessionController.getAvailableGroupSessions);
router.get("/group-sessions/:id/participants", groupSessionController.getGroupSessionParticipants);
router.post("/groupSessionBooking", authenticate, groupSessionController.joinGroupSession);
router.get("/student/my-group-sessions", authenticate, groupSessionController.checkAndUpdateGroupSessions, groupSessionController.getStudentGroupSessions);
router.patch("/booking/:id/cancel", authenticate, groupSessionController.cancelGroupSessionBooking);
router.patch("/:id/cancel-by-tutor", authenticate, groupSessionController.cancelGroupSessionByTutor);
// Use the same upload middleware as booking routes
router.patch("/booking/:id/complete", authenticate, upload.single("proof"), groupSessionController.completeGroupSessionBooking);

module.exports = router;