const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  supervisorID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Ongoing', 'Temporarily Paused', 'Completed'],
    default: 'Ongoing'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  workerIDs: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Site', siteSchema);

