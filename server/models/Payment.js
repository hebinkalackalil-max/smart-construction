const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  workerID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalDays: {
    type: Number,
    required: true,
    min: 0
  },
  overtimeHours: {
    type: Number,
    default: 0,
    min: 0
  },
  salaryAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);

