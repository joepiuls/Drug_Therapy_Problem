const mongoose = require('mongoose');

const dtpReportSchema = new mongoose.Schema({
  pharmacist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pharmacistName: {
    type: String,
    required: true
  },
  hospitalName: {
    type: String,
    required: true
  },
  ward: {
    type: String,
    trim: true
  },
  prescriptionDetails: {
    type: String,
    required: true,
    trim: true
  },
  dtpCategory: {
    type: String,
    required: true,
    enum: [
      'Wrong drug',
      'Wrong dose', 
      'Wrong frequency/duration',
      'Drug interaction',
      'Allergy/adverse reaction',
      'Monitoring needed',
      'Drug omission',
      'Other'
    ]
  },
  customCategory: {
    type: String,
    trim: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['mild', 'moderate', 'severe']
  },
  prescribingDoctor: {
    type: String,
    trim: true
  },
  comments: {
    type: String,
    trim: true
  },
  photos: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['submitted', 'reviewed', 'resolved'],
    default: 'submitted'
  },
  feedback: {
    type: String,
    trim: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
dtpReportSchema.index({ pharmacist: 1 });
dtpReportSchema.index({ hospitalName: 1 });
dtpReportSchema.index({ dtpCategory: 1 });
dtpReportSchema.index({ severity: 1 });
dtpReportSchema.index({ status: 1 });
dtpReportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('DTPReport', dtpReportSchema);