const Expertise = require("../models/Expertise");

// GET all active expertise options
const getExpertiseOptions = async (req, res) => {
  try {
    const expertise = await Expertise.find({ isActive: true })
      .select("name category description")
      .sort({ category: 1, name: 1 });

    res.json(expertise);
  } catch (error) {
    console.error("Error fetching expertise options:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET all expertise (including inactive - for admin)
const getAllExpertise = async (req, res) => {
  try {
    const expertise = await Expertise.find()
      .populate("createdBy", "name email")
      .sort({ category: 1, name: 1 });

    res.json(expertise);
  } catch (error) {
    console.error("Error fetching all expertise:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// CREATE new expertise (admin only)
const createExpertise = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    const adminId = req.user.id;

    // Validate input
    if (!name || !category) {
      return res.status(400).json({ 
        message: "Name and category are required" 
      });
    }

    // Check if expertise already exists
    const existingExpertise = await Expertise.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingExpertise) {
      return res.status(409).json({ 
        message: "Expertise with this name already exists" 
      });
    }

    // Create new expertise
    const newExpertise = new Expertise({
      name: name.trim(),
      category,
      description,
      createdBy: adminId
    });

    await newExpertise.save();

    res.status(201).json({
      message: "Expertise created successfully",
      expertise: newExpertise
    });
  } catch (error) {
    console.error("Error creating expertise:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE expertise (admin only)
const updateExpertise = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, isActive } = req.body;

    const expertise = await Expertise.findById(id);
    if (!expertise) {
      return res.status(404).json({ message: "Expertise not found" });
    }

    // Check for duplicate name (excluding current expertise)
    if (name && name !== expertise.name) {
      const existingExpertise = await Expertise.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });

      if (existingExpertise) {
        return res.status(409).json({ 
          message: "Expertise with this name already exists" 
        });
      }
    }

    // Update fields
    if (name) expertise.name = name.trim();
    if (category) expertise.category = category;
    if (description !== undefined) expertise.description = description;
    if (isActive !== undefined) expertise.isActive = isActive;

    await expertise.save();

    res.json({
      message: "Expertise updated successfully",
      expertise
    });
  } catch (error) {
    console.error("Error updating expertise:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE expertise (soft delete - admin only)
const deleteExpertise = async (req, res) => {
  try {
    const { id } = req.params;

    const expertise = await Expertise.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!expertise) {
      return res.status(404).json({ message: "Expertise not found" });
    }

    res.json({
      message: "Expertise deleted successfully",
      expertise
    });
  } catch (error) {
    console.error("Error deleting expertise:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getExpertiseOptions,
  getAllExpertise,
  createExpertise,
  updateExpertise,
  deleteExpertise
};