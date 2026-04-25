const Tutor = require("../models/Tutor");
const Booking = require("../models/Booking");
const Expertise = require("../models/Expertise"); // Add this import
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getImage = async (req, res) => {
  const { email } = req.params;
  const imageDoc = await Tutor.findOne({ email });

  if (!imageDoc) return res.status(404).json({ error: "Image not found" });

  res.json({ image: imageDoc.profileImage });
};

const updateProfileImage = async (req, res) => {
  try {
    const tutorId = req.user.id; // Assuming you're using authentication

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Profile image is required" });
    }

    // Get the proof file name from multer
    const profileImgFileName = req.file.filename;

    // Update email
    const updatedTutor = await Tutor.findByIdAndUpdate(
      tutorId,
      { profileImage: profileImgFileName },
      { new: true }
    );

    if (!updatedTutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    res.status(200).json({
      message: "Profile image updated successfully",
      tutor: {
        id: updatedTutor._id,
        profileImage: updatedTutor.profileImage,
      },
    });
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);
    if (!tutor) return res.status(404).json({ error: "Tutor not found" });

    tutor.schedule = req.body.schedule;
    await tutor.save();
    res.json(tutor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// GET all tutors
const getTutors = async (req, res) => {
  try {
    const tutors = await Tutor.find();
    res.json(tutors);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tutors" });
  }
};

// GET tutor by id
const getTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });
    res.json(tutor);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// POST new tutor (signup) local
const createTutor = async (req, res) => {
  const { firstName, lastName, email, role, password, expertise, schedule } =
    req.body;

  if (!firstName || !lastName || !email || !role || !password) {
    return res
      .status(400)
      .json({ error: "Please fill in all required fields" });
  }

  try {
    const existingUser = await Tutor.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);

    const newTutor = new Tutor({
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email,
      role: "tutor",
      password: password,
      authProvider: "local",
      expertise: JSON.parse(expertise || "[]"),
      schedule: schedule ? JSON.parse(schedule) : {},
    });

    await newTutor.save();

    const token = jwt.sign({ id: newTutor._id }, process.env.JWT_SECRET);

    res.status(201).json({
      message: "Tutor created successfully",
      token,
      user: {
        id: newTutor._id,
        name: newTutor.name,
        email: newTutor.email,
        role: newTutor.role,
        expertise: newTutor.expertise,
        schedule: newTutor.schedule,
        isReadyToTeach: newTutor.isReadyToTeach, // Include this
      },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
};

const loginTutor = async (req, res) => {
  const { email, password } = req.body;

  try {
    const tutor = await Tutor.findOne({ email });

    if (!tutor) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (tutor.authProvider !== "local") {
      return res.status(401).json({
        error: `Please login using ${tutor.authProvider}`,
      });
    }

    // Trim inputs before comparing
    const isMatch = await bcrypt.compare(password.trim(), tutor.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = tutor.generateAuthToken();
    res.json({
      message: "Logged in successfully",
      token,
      user: {
        id: tutor._id,
        name: tutor.name,
        email: tutor.email,
        role: tutor.role,
        profileImage: tutor.profileImage,
        expertise: tutor.expertise,
        isActive: tutor.isActive,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getTutorReviews = async (req, res) => {
  const reviews = await Booking.find({
    tutor: req.params.tutorId,
    "review.rating": { $exists: true },
  })
    .populate("student", "name avatar")
    .sort({ "review.createdAt": -1 });

  res.json(reviews);
};

const updateDescription = async (req, res) => {
  try {
    const { bio } = req.body;
    const tutorId = req.user.id; // Assuming you're using authentication and the tutor ID is in the user object

    // Validate input
    if (!bio || typeof bio !== "string") {
      return res.status(400).json({ message: "Invalid bio content" });
    }

    // Update the tutor's bio in the database
    const updatedTutor = await Tutor.findByIdAndUpdate(
      tutorId,
      { description: bio },
      { new: true } // Return the updated document
    );

    if (!updatedTutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    res.status(200).json({
      message: "Bio updated successfully",
      tutor: {
        id: updatedTutor._id,
        description: updatedTutor.description,
      },
    });
  } catch (error) {
    console.error("Error updating bio:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;
    const tutorId = req.user.id; // Assuming you're using authentication

    // Basic validation
    if (!newEmail || !newEmail.includes("@")) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address" });
    }

    // Check if email already exists (optional)
    const existingTutor = await Tutor.findOne({ email: newEmail });
    if (existingTutor && existingTutor._id.toString() !== tutorId) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Update email
    const updatedTutor = await Tutor.findByIdAndUpdate(
      tutorId,
      { email: newEmail },
      { new: true }
    );

    if (!updatedTutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    res.status(200).json({
      message: "Email updated successfully",
      tutor: {
        id: updatedTutor._id,
        email: updatedTutor.email,
      },
    });
  } catch (error) {
    console.error("Error updating email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateIsActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const tutorDocument = await Tutor.findById(id);
    const tutor = await Tutor.findByIdAndUpdate(
      id,
      { isActive, onDayCancellationCount: 0 },
      { new: true }
    );

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    res.json({
      message: `Tutor ${isActive ? "activated" : "deactivated"} successfully`,
      tutor,
    });
  } catch (error) {
    console.error("Error updating tutor status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const tutor = await Tutor.findById(req.user.id);

    // Check if tutor exists
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    // Verify current password (only for local auth)
    if (tutor.authProvider === "local") {
      const isMatch = await bcrypt.compare(currentPassword, tutor.password);
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
    tutor.password = newPassword;
    await tutor.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateContactInfo = async (req, res) => {
  try {
    const tutor = await Tutor.findByIdAndUpdate(
      req.user.id,
      { contactInfo: req.body.contactInfo },
      { new: true }
    );
    res.json({ tutor });
  } catch (error) {
    console.error("Error updating contact info:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateExpertise = async (req, res) => {
  try {
    const { expertise } = req.body;
    const tutorId = req.user.id;

    // Validate input
    if (!expertise || !Array.isArray(expertise)) {
      return res.status(400).json({
        message: "Expertise must be provided as an array",
      });
    }

    // Validate that expertise array is not empty
    if (expertise.length === 0) {
      return res.status(400).json({
        message: "At least one area of expertise is required",
      });
    }

    // Validate that all expertise items are strings
    if (expertise.some((item) => typeof item !== "string")) {
      return res.status(400).json({
        message: "All expertise items must be strings",
      });
    }

    // Validate against active expertise options in database
    const activeExpertise = await Expertise.find({
      isActive: true,
      name: { $in: expertise },
    }).select("name");

    const validExpertiseNames = activeExpertise.map((e) => e.name);
    const invalidExpertise = expertise.filter(
      (item) => !validExpertiseNames.includes(item)
    );

    if (invalidExpertise.length > 0) {
      return res.status(400).json({
        message: `Invalid expertise items: ${invalidExpertise.join(", ")}`,
      });
    }

    // Find the tutor and update using the document method
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    tutor.expertise = expertise;
    await tutor.save(); // This will trigger the pre-save middleware

    res.status(200).json({
      message: "Expertise updated successfully",
      tutor: {
        id: tutor._id,
        expertise: tutor.expertise,
        isReadyToTeach: tutor.isReadyToTeach, // Include this in response
      },
    });
  } catch (error) {
    console.error("Error updating expertise:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getReadinessStatus = async (req, res) => {
  try {
    const tutorId = req.user.id;
    const tutor = await Tutor.findById(tutorId);

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    const hasExpertise = tutor.expertise && tutor.expertise.length > 0;
    const hasSchedule =
      tutor.schedule &&
      Object.values(tutor.schedule).some((day) => day && day.length > 0);

    res.json({
      isReadyToTeach: tutor.isReadyToTeach,
      requirements: {
        hasExpertise,
        hasSchedule,
        metAllRequirements: hasExpertise && hasSchedule,
      },
      details: {
        expertiseCount: tutor.expertise ? tutor.expertise.length : 0,
        scheduledDays: tutor.schedule
          ? Object.values(tutor.schedule).filter((day) => day && day.length > 0)
              .length
          : 0,
      },
    });
  } catch (error) {
    console.error("Error checking readiness status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getImage,
  getTutors,
  getTutor,
  createTutor,
  loginTutor,
  getTutorReviews,
  updateDescription,
  updateEmail,
  updatePassword,
  updateContactInfo,
  updateSchedule,
  updateExpertise,
  updateProfileImage,
  updateIsActive,
  getReadinessStatus,
};
