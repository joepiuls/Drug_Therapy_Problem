// routes/reports.js
const express = require("express");
const multer = require("multer");
const DTPReport = require("../models/DTPReport");
const { auth } = require("../middleware/auth");
const upload = require("../utils/upload"); // { upload, deleteFile }
const {requireRole} = require('../middleware/auth')

const router = express.Router();

// Use memory storage - files are available at file.buffer
const storage = multer.memoryStorage();
const uploads = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 2
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only image files are allowed"));
    }
  }
});

router.post("/", auth,  uploads.array("photos", 2), async (req, res) => {
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

    // Basic validation
    if (!hospitalName || !prescriptionDetails || !dtpCategory || !severity) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const files = Array.isArray(req.files) ? req.files : [];

    // If there are uploads, upload them to ImageKit in parallel
    let uploadedPhotos = [];
    if (files.length > 0) {
      const uploadsPromises = files.map(f =>
        // upload(buffer, filename, folder)
        upload(f.buffer, f.originalname, "/reports")
      );

      const settled = await Promise.allSettled(uploadsPromises);

      const successes = [];
      const failures = [];

      settled.forEach((r, idx) => {
        if (r.status === "fulfilled" && r.value) {
          successes.push({ idx, value: r.value });
        } else {
          failures.push({ idx, reason: r.status === "rejected" ? r.reason : r });
        }
      });

      if (failures.length > 0) {
        // attempt rollback of any succeeded uploads to avoid orphan files
        await Promise.all(
          successes.map(s => {
            const fileId = s.value?.fileId;
            if (fileId) {
              return uploadUtil.deleteFile(fileId).catch(err => {
                console.warn("Rollback delete failed for", fileId, err?.message || err);
                return false;
              });
            }
            return Promise.resolve(false);
          })
        );

        console.error("One or more photo uploads failed:", failures);
        return res.status(500).json({ message: "Failed to upload one or more photos" });
      }

      // normalize metadata for DB
      uploadedPhotos = successes.map(s => {
        const meta = s.value;
        const f = files[s.idx];
        return {
          url: meta.url || null,
          thumbnailUrl: meta.thumbnailUrl || meta.thumbnail || null,
          fileId: meta.fileId || null,
          originalName: f.originalname,
          size: f.size,
          mimetype: f.mimetype
        };
      });
    }

    // Create and save report
    const reportDoc = new DTPReport({
      pharmacist: req.user._id,
      pharmacistName: req.user.name,
      pharmacistNo: req.user.phone,
      hospitalName: hospitalName || req.user.hospital,
      ward,
      prescriptionDetails,
      dtpCategory,
      customCategory: dtpCategory === "Other" ? customCategory : undefined,
      severity,
      prescribingDoctor,
      comments,
      photos: uploadedPhotos
    });

    await reportDoc.save();

    // Return a safe shape
    const safeReport = {
      id: reportDoc._id,
      pharmacist: reportDoc.pharmacist,
      pharmacistName: reportDoc.pharmacistName,
      pharmacistNo: reportDoc.pharmacistNo,
      hospitalName: reportDoc.hospitalName,
      ward: reportDoc.ward,
      prescriptionDetails: reportDoc.prescriptionDetails,
      dtpCategory: reportDoc.dtpCategory,
      customCategory: reportDoc.customCategory,
      severity: reportDoc.severity,
      prescribingDoctor: reportDoc.prescribingDoctor,
      comments: reportDoc.comments,
      photos: reportDoc.photos,
      createdAt: reportDoc.createdAt
    };

    return res.status(201).json({ message: "DTP report submitted successfully", report: safeReport });
  } catch (err) {
    console.error("Create report error:", err);

    // Handle Multer errors nicely
    if (err instanceof multer.MulterError) {
      let msg = err.message;
      if (err.code === "LIMIT_FILE_SIZE") msg = "File too large (max 5MB)";
      if (err.code === "LIMIT_FILE_COUNT") msg = "Too many files (max 2)";
      if (err.code === "LIMIT_UNEXPECTED_FILE") msg = "Invalid file type";
      return res.status(400).json({ message: msg });
    }

    return res.status(500).json({ message: "Server error creating report" });
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

    console.log(status);
    

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
router.get('/analytics/stats', auth, requireRole(['hospital_admin', 'nafdac_admin', 'state_admin']), async (req, res) => {
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

    if (req.user.role === 'state_admin' || req.user.role === 'nafdac_admin') {
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