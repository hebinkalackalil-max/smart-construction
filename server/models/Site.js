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
    enum: ['Ongoing', 'Completed'],
    default: 'Ongoing'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Site', siteSchema);

