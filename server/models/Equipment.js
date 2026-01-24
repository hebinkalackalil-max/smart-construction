const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  equipmentName: {
    type: String,
    required: true,
    trim: true
  },
  siteID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'In Use', 'Maintenance'],
    default: 'Available'
  },
  lastMaintenance: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Equipment', equipmentSchema);

