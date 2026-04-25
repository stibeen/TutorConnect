const express = require("express");
const router = express.Router();
const expertiseController = require("../controllers/expertiseController");
const { authenticate } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin"); // You'll need to create this

// Public route - get active expertise options
router.get("/options", expertiseController.getExpertiseOptions);

// Admin routes
router.get("/", authenticate, isAdmin, expertiseController.getAllExpertise);
router.post("/", authenticate, isAdmin, expertiseController.createExpertise);
router.put("/:id", authenticate, isAdmin, expertiseController.updateExpertise);
router.delete("/:id", authenticate, isAdmin, expertiseController.deleteExpertise);

module.exports = router;