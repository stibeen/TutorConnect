const User = require("../models/User");
const Tutor = require("../models/Tutor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//GET all students
const getStudents = async (req, res) => {
  try {
    const students = await User.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

// GET student by id
const getStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

const updateIsActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const student = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      message: `Student ${isActive ? "activated" : "deactivated"} successfully`,
      student,
    });
  } catch (error) {
    console.error("Error updating student status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST new user (signup) local - FOR STUDENTS ONLY
const createUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email || !password) {
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
    const newUser = new User({
      firstName,
      lastName,
      name: `${firstName} ${lastName}`, // Maintain backward compatibility
      email,
      role: "student",
      password,
      authProvider: "local",
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "Student account created successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        authProvider: newUser.authProvider,
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

// login local - FOR BOTH STUDENTS AND TUTORS
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
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
        authProvider: user.authProvider,
        isActive: user.isActive,
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

const updateEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const studentId = req.user.id; // Assuming you're using authentication

    // Basic validation
    if (!newEmail || !newEmail.includes("@")) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address" });
    }

    // Check if email already exists (optional)
    const existingStudent = await User.findOne({ email: newEmail });
    if (existingStudent && existingStudent._id.toString() !== studentId) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Update email
    const updatedStudent = await User.findByIdAndUpdate(
      studentId,
      { email: newEmail },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Email updated successfully",
      tutor: {
        id: updatedStudent._id,
        email: updatedStudent.email,
      },
    });
  } catch (error) {
    console.error("Error updating email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const student = await User.findById(req.user.id);

    // Check if tutor exists
    if (!student) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    // Verify current password (only for local auth)
    if (student.authProvider === "local") {
      const isMatch = await bcrypt.compare(currentPassword, student.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }
    }

    // Validate new password
    if (!newPassword || newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    } else if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Password does not match" });
    }

    // Update password
    student.password = newPassword;
    await student.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateProfileImage = async (req, res) => {
  try {
    const studentId = req.user.id; // Assuming you're using authentication

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Profile image is required" });
    }

    // Get the proof file name from multer
    const profileImgFileName = req.file.filename;

    // Update email
    const updatedStudent = await User.findByIdAndUpdate(
      studentId,
      { profileImage: profileImgFileName },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Profile image updated successfully",
      student: {
        id: updatedStudent._id,
        profileImage: updatedStudent.profileImage,
      },
    });
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getStudents,
  getStudent,
  createUser,
  loginUser,
  updateEmail,
  updatePassword,
  updateProfileImage,
  updateIsActive,
};
