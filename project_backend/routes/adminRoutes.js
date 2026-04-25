const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate } = require("../middleware/auth"); // Assuming you have auth middleware

router.post("/login", adminController.loginAdmin);
router.post("/createAdmin", adminController.createAdmin);
router.patch('/resetTutorPassword', authenticate, adminController.resetTutorPassword);
router.patch('/resetStudentPassword', authenticate, adminController.resetStudentPassword);

module.exports = router;