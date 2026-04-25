const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Tutor = require("../models/Tutor");
const Admin = require("../models/Admin");

const authenticate = async (req, res, next) => {
  try {
    // 1. Get token from headers
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find user (check both User and Tutor collections)
    const user =
      (await User.findById(decoded.id)) ||
      (await Tutor.findById(decoded.id)) ||
      (await Admin.findById(decoded.id));

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // 4. Attach user to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Please authenticate" });
  }
};

module.exports = { authenticate };
