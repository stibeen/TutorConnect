// routes/signatoryRoutes.js
const express = require("express");
const router = express.Router();
const signatoryController = require("../controllers/signatoryController");
const { authenticate } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");

// Public routes - for report generation
router.get("/active", signatoryController.getActiveSignatories);
router.get("/role/:role", signatoryController.getSignatoryByRole);

// Admin routes
router.get("/", authenticate, isAdmin, signatoryController.getAllSignatories);
router.put("/:role", authenticate, isAdmin, signatoryController.upsertSignatory);
router.put("/update/:id", authenticate, isAdmin, signatoryController.updateSignatory);
router.put("/deactivate/:id", authenticate, isAdmin, signatoryController.softDeleteSignatory);
router.put("/activate/:id", authenticate, isAdmin, signatoryController.activateSignatory);

module.exports = router;