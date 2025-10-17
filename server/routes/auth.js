const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    console.log(req.body);

    const { name, email, password, hospital, role, registrationNumber, lastname, phone } = req.body;

    // Validation
    if (!name || !email || !password || !hospital || !role || !registrationNumber || !lastname || !phone) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Verify hospital exists
    const hospitalExists = await Hospital.findOne({ name: hospital });
    if (!hospitalExists) {
      return res.status(400).json({ message: 'Invalid hospital selection' });

    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      hospital,
      registrationNumber,
      role: role,
      approved:false
    });

    await user.save();

    res.status(201).json({ 
      message: 'Registration successful! Awaiting admin approval.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hospital: user.hospital,
        phone: user.phone,
        role: user.role,
        approved: user.approved
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if approved
    if (!user.approved) {
      return res.status(403).json({ message: 'Account not approved yet' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hospital: user.hospital,
        registrationNumber: user.registrationNumber,
        role: user.role,
        approved: user.approved,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        hospital: req.user.hospital,
        phone: req.user.phone,
        registrationNumber: req.user.registrationNumber,
        role: req.user.role,
        approved: req.user.approved,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// reset password
router.patch('/reset-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword, userId } = req.body;

    // Basic validation
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // If userId provided -> admin trying to reset someone else's password
    if (userId) {
      // Only allow privileged roles to reset others' passwords
      const allowedRoles = ['hospital_admin', 'nafdac_admin', 'state_admin'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Unauthorized to reset other users password' });
      }

      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return res.status(404).json({ message: 'Target user not found' });
      }

      // Hash and set the new password
      const salt = await bcrypt.genSalt(10);
      targetUser.password = await bcrypt.hash(newPassword, salt);
      await targetUser.save();

      return res.json({ message: 'Password reset successfully for target user' });
    }

    // Otherwise: user changing their own password
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!currentPassword) {
      return res.status(400).json({ message: 'Current password is required' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash and set new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Server error while resetting password' });
  }
});




module.exports = router;