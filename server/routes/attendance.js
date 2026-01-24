const express = require('express');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Site = require('../models/Site');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/attendance
// @desc    Mark worker attendance
// @access  Private (Supervisor, Admin)
router.post('/', auth, authorize('supervisor', 'admin'), async (req, res) => {
  try {
    const { workerID, siteID, date, status, overtime } = req.body;

    if (!workerID || !siteID || !date || !status) {
      return res.status(400).json({ message: 'Please provide workerID, siteID, date, and status' });
    }

    // Verify worker exists and is actually a worker
    const worker = await User.findById(workerID);
    if (!worker || worker.role !== 'worker') {
      return res.status(400).json({ message: 'Invalid worker ID' });
    }

    // Verify site exists
    const site = await Site.findById(siteID);
    if (!site) {
      return res.status(400).json({ message: 'Invalid site ID' });
    }

    // Supervisor can only mark attendance for their assigned sites
    if (req.user.role === 'supervisor' && site.supervisorID.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only mark attendance for your assigned sites' });
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      workerID,
      siteID,
      date: new Date(date)
    });

    if (existingAttendance) {
      // Update existing attendance
      existingAttendance.status = status;
      if (overtime !== undefined) existingAttendance.overtime = overtime;
      await existingAttendance.save();

      const populated = await Attendance.findById(existingAttendance._id)
        .populate('workerID', 'name email')
        .populate('siteID', 'siteName location');

      return res.json({
        success: true,
        message: 'Attendance updated successfully',
        data: populated
      });
    }

    // Create new attendance
    const attendance = await Attendance.create({
      workerID,
      siteID,
      date: new Date(date),
      status,
      overtime: overtime || 0
    });

    const populated = await Attendance.findById(attendance._id)
      .populate('workerID', 'name email')
      .populate('siteID', 'siteName location');

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/attendance/:siteId
// @desc    View attendance by site
// @access  Private
router.get('/site/:siteId', auth, async (req, res) => {
  try {
    const site = await Site.findById(req.params.siteId);

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    // Supervisor can only view attendance for their assigned sites
    if (req.user.role === 'supervisor' && site.supervisorID.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const attendance = await Attendance.find({ siteID: req.params.siteId })
      .populate('workerID', 'name email')
      .populate('siteID', 'siteName location')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/attendance/worker/:workerId
// @desc    View attendance by worker
// @access  Private (Worker can see own, Admin/Supervisor can see any)
router.get('/worker/:workerId', auth, async (req, res) => {
  try {
    // Worker can only see their own attendance
    if (req.user.role === 'worker' && req.params.workerId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const attendance = await Attendance.find({ workerID: req.params.workerId })
      .populate('workerID', 'name email')
      .populate('siteID', 'siteName location')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/attendance
// @desc    Get all attendance (Admin only, or filtered by role)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let attendance;

    if (req.user.role === 'admin') {
      attendance = await Attendance.find()
        .populate('workerID', 'name email')
        .populate('siteID', 'siteName location')
        .sort({ date: -1 });
    } else if (req.user.role === 'worker') {
      attendance = await Attendance.find({ workerID: req.user.id })
        .populate('workerID', 'name email')
        .populate('siteID', 'siteName location')
        .sort({ date: -1 });
    } else if (req.user.role === 'supervisor') {
      // Get sites assigned to supervisor
      const sites = await Site.find({ supervisorID: req.user.id });
      const siteIds = sites.map(site => site._id);
      attendance = await Attendance.find({ siteID: { $in: siteIds } })
        .populate('workerID', 'name email')
        .populate('siteID', 'siteName location')
        .sort({ date: -1 });
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

