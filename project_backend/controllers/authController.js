const User = require('../models/User');
const Tutor = require('../models/Tutor');
const Admin = require('../models/Admin');

exports.verifyToken = async (req, res) => {
  try {
    // User is attached to request by auth middleware
    const user = req.user;
    
    // Get fresh user data
    const freshUser = await User.findById(user.id) || await Tutor.findById(user.id) || await Admin.findById(user.id);
    
    if (!freshUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      user: {
        id: freshUser._id,
        name: freshUser.name,
        email: freshUser.email,
        role: freshUser.role,
        profileImage: freshUser.profileImage,
        ...(freshUser.expertise && { expertise: freshUser.expertise })
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};