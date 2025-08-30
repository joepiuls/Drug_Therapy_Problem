const express = require('express');
const multer = require('multer');
const path = require('path');
const DTPReport = require('../models/DTPReport');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 2 // Max 2 files
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Create report
router.post('/', auth, upload.array('photos', 2), async (req, res) => {
  try {
    const {
      hospitalName,
      ward,
      prescriptionDetails,
      dtpCategory,
      customCategory,
      severity,
      prescribingDoctor,
      comments
    } = req.body;

    // Validation
    if (!hospitalName || !prescriptionDetails || !dtpCategory || !severity) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Process uploaded files
    const photos = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    })) : [];

    const report = new DTPReport({
      pharmacist: req.user._id,
      pharmacistName: req.user.name,
      hospitalName: hospitalName || req.user.hospital,
      ward,
      prescriptionDetails,
      dtpCategory,
      customCategory: dtpCategory === 'Other' ? customCategory : undefined,
      severity,
      prescribingDoctor,
      comments,
      photos
    });

    await report.save();

    res.status(201).json({
      message: 'DTP report submitted successfully',
      report: {
        id: report._id,
        ...report.toObject()
      }
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ message: 'Server error creating report' });
  }
});

// Get reports (with filtering)
router.get('/', auth, async (req, res) => {
  try {
    const { 
      hospital, 
      category, 
      severity, 
      status, 
      dateFrom, 
      dateTo,
      page = 1,
      limit = 50
    } = req.query;

    let query = {};

    // Role-based filtering
    if (req.user.role === 'pharmacist') {
      query.pharmacist = req.user._id;
    } else if (req.user.role === 'hospital_admin') {
      query.hospitalName = req.user.hospital;
    }
    // State admin can see all reports

    // Apply filters
    if (hospital) query.hospitalName = hospital;
    if (category) query.dtpCategory = category;
    if (severity) query.severity = severity;
    if (status) query.status = status;
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reports = await DTPReport.find(query)
      .populate('pharmacist', 'name email')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DTPReport.countDocuments(query);

    res.json({
      reports,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error fetching reports' });
  }
});

// Get single report
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await DTPReport.findById(req.params.id)
      .populate('pharmacist', 'name email')
      .populate('reviewedBy', 'name');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check permissions
    if (req.user.role === 'pharmacist' && report.pharmacist._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'hospital_admin' && report.hospitalName !== req.user.hospital) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ report });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ message: 'Server error fetching report' });
  }
});

// Update report status/feedback (Admin only)
router.patch('/:id', auth, requireRole(['hospital_admin', 'state_admin']), async (req, res) => {
  try {
    const { status, feedback } = req.body;
    
    const report = await DTPReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check hospital admin permissions
    if (req.user.role === 'hospital_admin' && report.hospitalName !== req.user.hospital) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (status) report.status = status;
    if (feedback) report.feedback = feedback;
    
    if (status === 'reviewed' || feedback) {
      report.reviewedBy = req.user._id;
      report.reviewedAt = new Date();
    }

    await report.save();

    res.json({
      message: 'Report updated successfully',
      report
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ message: 'Server error updating report' });
  }
});

// Get analytics data
router.get('/analytics/stats', auth, requireRole(['hospital_admin', 'state_admin']), async (req, res) => {
  try {
    let matchQuery = {};
    
    if (req.user.role === 'hospital_admin') {
      matchQuery.hospitalName = req.user.hospital;
    }

    // Category stats
    const categoryStats = await DTPReport.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$dtpCategory', count: { $sum: 1 } } },
      { $project: { category: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    // Severity stats
    const severityStats = await DTPReport.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $project: { severity: '$_id', count: 1, _id: 0 } }
    ]);

    // Monthly trends
    const trendStats = await DTPReport.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: 1
            }
          },
          count: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Hospital stats (for state admin)
    let hospitalStats = [];
    if (req.user.role === 'state_admin') {
      hospitalStats = await DTPReport.aggregate([
        { $group: { _id: '$hospitalName', count: { $sum: 1 } } },
        { $project: { hospital: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
    }

    res.json({
      categoryStats,
      severityStats,
      trendStats,
      hospitalStats
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
});

module.exports = router;