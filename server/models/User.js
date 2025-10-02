const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  hospital: {
    type: String,
    required: true
  },
  registrationNumber: {
    type: String,
    sparse: true // Allows null values but ensures uniqueness when present
  },
  role: {
    type: String,
    enum: ['pharmacist', 'hospital_admin', 'nafdac_admin', 'state_admin'],
    default: 'pharmacist'
  },
  approved: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ hospital: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);