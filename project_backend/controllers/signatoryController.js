// controllers/signatoryController.js
const Signatory = require("../models/Signatory");

// GET all signatories (admin only)
const getAllSignatories = async (req, res) => {
  try {
    const signatories = await Signatory.find()
      .populate("createdBy", "name email")
      .sort({ role: 1 });

    // Format response as array
    res.json(signatories);
  } catch (error) {
    console.error("Error fetching signatories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET signatory by role (public - for reports)
const getSignatoryByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    const signatory = await Signatory.findOne({ 
      role,
      isActive: true 
    });

    if (!signatory) {
      return res.status(404).json({ message: "Signatory not found" });
    }

    res.json(signatory);
  } catch (error) {
    console.error("Error fetching signatory by role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET all active signatories (public - for reports)
const getActiveSignatories = async (req, res) => {
  try {
    const signatories = await Signatory.find({ isActive: true })
      .select("role name title")
      .sort({ role: 1 });

    res.json(signatories);
  } catch (error) {
    console.error("Error fetching active signatories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// CREATE or UPDATE signatory (admin only)
const upsertSignatory = async (req, res) => {
  try {
    const { role } = req.params;
    const { name, title } = req.body;
    const adminId = req.user.id;

    // Validate input
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        message: "Name is required" 
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ 
        message: "Title is required" 
      });
    }

    // Validate role
    if (!['administrator', 'dean'].includes(role)) {
      return res.status(400).json({ 
        message: "Invalid role. Must be 'administrator' or 'dean'" 
      });
    }

    // Upsert (update or create) signatory
    const signatory = await Signatory.findOneAndUpdate(
      { role },
      {
        name: name.trim(),
        title: title.trim(),
        createdBy: adminId,
        lastUpdated: Date.now(),
        isActive: true
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    // Populate createdBy field
    await signatory.populate("createdBy", "name email");

    const action = signatory.createdAt === signatory.updatedAt ? "created" : "updated";
    
    res.json({
      message: `Signatory ${action} successfully`,
      signatory
    });
  } catch (error) {
    console.error("Error upserting signatory:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE signatory (admin only)
const updateSignatory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, title, isActive } = req.body;
    const adminId = req.user.id;

    const signatory = await Signatory.findById(id);
    
    if (!signatory) {
      return res.status(404).json({ message: "Signatory not found" });
    }

    // Validate input
    if (name !== undefined && (!name || !name.trim())) {
      return res.status(400).json({ 
        message: "Name cannot be empty" 
      });
    }

    if (title !== undefined && (!title || !title.trim())) {
      return res.status(400).json({ 
        message: "Title cannot be empty" 
      });
    }

    // Update fields
    if (name !== undefined) signatory.name = name.trim();
    if (title !== undefined) signatory.title = title.trim();
    if (isActive !== undefined) signatory.isActive = isActive;
    
    signatory.createdBy = adminId;
    signatory.lastUpdated = Date.now();

    await signatory.save();
    await signatory.populate("createdBy", "name email");

    res.json({
      message: "Signatory updated successfully",
      signatory
    });
  } catch (error) {
    console.error("Error updating signatory:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: "Validation error", 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: "Internal server error" });
  }
};

// SOFT DELETE signatory (admin only)
const softDeleteSignatory = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const signatory = await Signatory.findByIdAndUpdate(
      id,
      { 
        isActive: false,
        createdBy: adminId,
        lastUpdated: Date.now()
      },
      { new: true }
    );

    if (!signatory) {
      return res.status(404).json({ message: "Signatory not found" });
    }

    await signatory.populate("createdBy", "name email");

    res.json({
      message: "Signatory deactivated successfully",
      signatory
    });
  } catch (error) {
    console.error("Error deactivating signatory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ACTIVATE signatory (admin only)
const activateSignatory = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const signatory = await Signatory.findByIdAndUpdate(
      id,
      { 
        isActive: true,
        createdBy: adminId,
        lastUpdated: Date.now()
      },
      { new: true }
    );

    if (!signatory) {
      return res.status(404).json({ message: "Signatory not found" });
    }

    await signatory.populate("createdBy", "name email");

    res.json({
      message: "Signatory activated successfully",
      signatory
    });
  } catch (error) {
    console.error("Error activating signatory:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllSignatories,
  getSignatoryByRole,
  getActiveSignatories,
  upsertSignatory,
  updateSignatory,
  softDeleteSignatory,
  activateSignatory
};