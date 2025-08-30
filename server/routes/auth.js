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
    const { name, email, password, hospital, registrationNumber } = req.body;

    // Validation
    if (!name || !email || !password || !hospital) {
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
      password: hashedPassword,
      hospital,
      registrationNumber,
      role: 'pharmacist',
      approved: false
    });

    await user.save();

    res.status(201).json({ 
      message: 'Registration successful! Awaiting admin approval.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hospital: user.hospital,
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

module.exports = router;