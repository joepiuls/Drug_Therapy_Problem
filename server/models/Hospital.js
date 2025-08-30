const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Federal', 'State', 'General', 'Private', 'Teaching', 'Specialist']
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

hospitalSchema.index({ name: 1 });
hospitalSchema.index({ location: 1 });

module.exports = mongoose.model('Hospital', hospitalSchema);