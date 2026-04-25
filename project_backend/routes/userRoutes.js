const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/auth"); // Assuming you have auth middleware
const upload = require("../middleware/upload"); // Import your centralized upload middleware

router.get("/", userController.getStudents);
router.get("/:id", userController.getStudent);
router.post("/register", userController.createUser);
router.patch('/:id/status', authenticate, userController.updateIsActive);
router.post("/login", userController.loginUser);
router.post("/googleLogin", userController.loginGoogle);
router.patch('/email', authenticate, userController.updateEmail);
router.patch('/password', authenticate, userController.updatePassword);
router.patch('/profile-image', authenticate, upload.single("profile"), userController.updateProfileImage)

module.exports = router;
