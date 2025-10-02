const express = require('express');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get pending users (Admin only)
router.get('/pending', auth, requireRole(['hospital_admin', 'state_admin']), async (req, res) => {
  try {
    let query = { approved: false };
    
    if (req.user.role === 'hospital_admin') {
      query.hospital = req.user.hospital;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Get all hospital admins (State Admin only)
router.get('/hospital-admins', auth, requireRole(['state_admin']), async (req, res) => {
  try {
    const users = await User.find({ role: 'hospital_admin' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    console.error('Get hospital admins error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Get all users based on hospital (Hospital Admin only)
router.get('/', auth, requireRole(['hospital_admin', 'state_admin']), async (req, res) => {
  try {

    let query = {};
    if (req.user.role === 'hospital_admin') {
      query.hospital = req.user.hospital;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});


// Approve user (Admin only)
router.patch('/:id/approve', auth, requireRole(['hospital_admin', 'state_admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check hospital admin permissions
    if (req.user.role === 'hospital_admin' && user.hospital !== req.user.hospital) {
      return res.status(403).json({ message: 'Access denied' });
    }

    user.approved = true;
    await user.save();

    res.json({
      message: 'User approved successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hospital: user.hospital,
        approved: user.approved
      }
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ message: 'Server error approving user' });
  }
});

// Delete user (Admin only)
router.delete('/:id', auth, requireRole(['hospital_admin', 'state_admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check hospital admin permissions
    if (req.user.role === 'hospital_admin' && user.hospital !== req.user.hospital) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await user.deleteOne();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

module.exports = router;