const User = require("../models/User");
const Tutor = require("../models/Tutor");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Please fill in all required fields" });
  }

  try {
    // Check if email exists in either collection
    const existingUser =
      (await User.findOne({ email })) || (await Tutor.findOne({ email }));
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
      name,
      email,
      role: "admin", // Force student role for this endpoint
      password,
    });

    await newAdmin.save();

    const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "Admin account created successfully",
      token,
      user: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (err) {
    console.error("Signup Error:", err);

    // Handle specific errors
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: Object.values(err.errors).map((e) => e.message) });
    }

    res.status(500).json({
      error: "Internal server error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Admin.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials line 73" });
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials line 78" });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Return appropriate response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login failed",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const resetTutorPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const tutor = await Tutor.findOne({ email });
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    // Critical Check: Verify tutor uses local auth
    if (tutor.authProvider !== 'local') {
      return res.status(400).json({ 
        message: "Cannot reset password for social login accounts" 
      });
    }

    const newPassword = Math.random().toString(36).slice(-8);
    tutor.password = newPassword; // Let the pre-save hook handle hashing
    await tutor.save();

    console.log(`New password for ${email}: ${newPassword}`);
    return res.json({
      success: true,
      newPassword // Still showing for debugging
    });

  } catch (error) {
    console.error("Reset error:", error);
    return res.status(500).json({ message: "Password reset failed" });
  }
};

const resetStudentPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const student = await User.findOne({ email });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Critical Check: Verify tutor uses local auth
    if (student.authProvider !== 'local') {
      return res.status(400).json({ 
        message: "Cannot reset password for social login accounts" 
      });
    }

    const newPassword = Math.random().toString(36).slice(-8);
    student.password = newPassword; // Let the pre-save hook handle hashing
    await student.save();

    console.log(`New password for ${email}: ${newPassword}`);
    return res.json({
      success: true,
      newPassword // Still showing for debugging
    });

  } catch (error) {
    console.error("Reset error:", error);
    return res.status(500).json({ message: "Password reset failed" });
  }
};

module.exports = { createAdmin, loginAdmin, resetTutorPassword, resetStudentPassword };
