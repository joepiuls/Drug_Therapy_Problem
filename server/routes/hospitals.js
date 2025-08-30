const express = require('express');
const Hospital = require('../models/Hospital');

const router = express.Router();

// Get all hospitals
router.get('/', async (req, res) => {
  try {
    const hospitals = await Hospital.find({ active: true })
      .select('name location type')
      .sort({ name: 1 });
    
    res.json({ hospitals });
  } catch (error) {
    console.error('Get hospitals error:', error);
    res.status(500).json({ message: 'Server error fetching hospitals' });
  }
});

module.exports = router;