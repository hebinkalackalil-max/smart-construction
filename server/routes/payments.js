const express = require('express');
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/payments
// @desc    Generate salary payments (Calculate based on attendance)
// @access  Private (Accountant, Admin)
router.post('/', auth, authorize('accountant', 'admin'), async (req, res) => {
  try {
    const { workerID, startDate, endDate, dailyRate, overtimeRate } = req.body;

    if (!workerID || !startDate || !endDate || !dailyRate) {
      return res.status(400).json({ 
        message: 'Please provide workerID, startDate, endDate, and dailyRate' 
      });
    }

    // Verify worker exists
    const worker = await User.findById(workerID);
    if (!worker || worker.role !== 'worker') {
      return res.status(400).json({ message: 'Invalid worker ID' });
    }

    // Normalize date range: start of startDate (00:00:00) to end of endDate (23:59:59.999)
    // so we include the full start and end days regardless of how attendance dates were stored
    const rangeStart = new Date(startDate);
    rangeStart.setUTCHours(0, 0, 0, 0);
    const rangeEnd = new Date(endDate);
    rangeEnd.setUTCHours(23, 59, 59, 999);

    // Match workerID as ObjectId (frontend may send string)
    const workerObjectId = mongoose.Types.ObjectId.isValid(workerID) ? new mongoose.Types.ObjectId(workerID) : workerID;

    // Get attendance records for the date range
    const attendance = await Attendance.find({
      workerID: workerObjectId,
      date: {
        $gte: rangeStart,
        $lte: rangeEnd
      },
      status: 'Present'
    });

    const totalDays = attendance.length;
    const overtimeHours = attendance.reduce((sum, record) => sum + (record.overtime || 0), 0);

    // Calculate salary
    const baseSalary = totalDays * dailyRate;
    const overtimePay = overtimeHours * (overtimeRate || dailyRate / 8); // Default: hourly rate = dailyRate/8
    const salaryAmount = baseSalary + overtimePay;

    // Create payment record
    const payment = await Payment.create({
      workerID,
      totalDays,
      overtimeHours,
      salaryAmount: Math.round(salaryAmount * 100) / 100, // Round to 2 decimal places
      paymentStatus: 'Pending'
    });

    const populated = await Payment.findById(payment._id)
      .populate('workerID', 'name email');

    res.status(201).json({
      success: true,
      message: 'Payment generated successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/payments/:id/approve
// @desc    Approve and process payment
// @access  Private (Accountant, Admin)
router.put('/:id/approve', auth, authorize('accountant', 'admin'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.paymentStatus = 'Paid';
    await payment.save();

    const populated = await Payment.findById(payment._id)
      .populate('workerID', 'name email');

    res.json({
      success: true,
      message: 'Payment approved successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/payments
// @desc    Get all payments
// @access  Private (Accountant, Admin see all, Worker sees own)
router.get('/', auth, async (req, res) => {
  try {
    let payments;
    const userId = req.user._id.toString();

    if (req.user.role === 'worker') {
      payments = await Payment.find({ workerID: userId })
        .populate('workerID', 'name email')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'accountant' || req.user.role === 'admin') {
      payments = await Payment.find()
        .populate('workerID', 'name email')
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/payments/worker/:workerId
// @desc    Get payment history for a worker
// @access  Private (Worker can see own, Accountant/Admin can see any)
router.get('/worker/:workerId', auth, async (req, res) => {
  try {
    // Worker can only see their own payments
    if (req.user.role === 'worker' && req.params.workerId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const payments = await Payment.find({ workerID: req.params.workerId })
      .populate('workerID', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/payments/:id
// @desc    Get single payment by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('workerID', 'name email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Worker can only see their own payments
    const workerIdStr = payment.workerID?._id ? payment.workerID._id.toString() : payment.workerID?.toString?.() || '';
    if (req.user.role === 'worker' && workerIdStr !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

