const isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: "Access denied. Admin privileges required." 
      });
    }
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ error: "Server error during authorization" });
  }
};

module.exports = { isAdmin };