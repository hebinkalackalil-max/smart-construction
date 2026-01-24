const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  workerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  siteID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    required: true
  },
  overtime: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Prevent duplicate attendance entries for same worker, site, and date
attendanceSchema.index({ workerID: 1, siteID: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

