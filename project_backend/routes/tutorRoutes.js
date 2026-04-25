const express = require("express");
const router = express.Router();
const tutorController = require("../controllers/tutorController");
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // memory storage for now
const { authenticate } = require("../middleware/auth"); // Assuming you have auth middleware
const uploadTwo = require("../middleware/upload"); // Import your centralized upload middleware

router.get("/image/:email", tutorController.getImage);
router.get("/", tutorController.getTutors);
router.get("/:id", tutorController.getTutor);
router.post("/registerTutor", tutorController.createTutor);
router.patch('/:id/status', authenticate, tutorController.updateIsActive);
router.post("/login", tutorController.loginTutor);
router.get("/:tutorId/reviews", tutorController.getTutorReviews);
router.patch('/bio', authenticate, tutorController.updateDescription);
router.patch('/email', authenticate, tutorController.updateEmail);
router.patch('/password', authenticate, tutorController.updatePassword);
router.patch('/contact', authenticate, tutorController.updateContactInfo);
router.put('/:id/schedule', authenticate, tutorController.updateSchedule);
router.patch('/expertise', authenticate, tutorController.updateExpertise);
router.patch('/profile-image', authenticate, uploadTwo.single("profile"), tutorController.updateProfileImage)
router.get('/readiness-status', authenticate, tutorController.getReadinessStatus);

module.exports = router;