const express = require('express');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Site = require('../models/Site');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/attendance
// @desc    Mark worker attendance (Supervisor/Admin: any worker; Worker: self only)
// @access  Private (Supervisor, Admin, Worker)
router.post('/', auth, authorize('supervisor', 'admin', 'worker'), async (req, res) => {
  try {
    const { workerID, siteID, date, status, overtime } = req.body;
    const userId = req.user._id.toString();

    if (!workerID || !siteID || !date || !status) {
      return res.status(400).json({ message: 'Please provide workerID, siteID, date, and status' });
    }

    // Normalize to a single day value (UTC 00:00:00.000) so duplicates by "same calendar date"
    // are reliably detected and blocked.
    const attendanceDate = new Date(date);
    attendanceDate.setUTCHours(0, 0, 0, 0);

    // Worker can only mark their own attendance
    if (req.user.role === 'worker') {
      if (workerID !== userId) {
        return res.status(403).json({ message: 'You can only mark your own attendance' });
      }
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

    // Deactivated sites: only admin can mark attendance (site is hidden from others)
    if (site.isActive === false && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'This site is not available' });
    }

    // Worker can only mark attendance for Ongoing sites (Temporarily Paused = disabled for use)
    if (req.user.role === 'worker' && site.status !== 'Ongoing') {
      return res.status(403).json({ message: 'You can only mark attendance for Ongoing sites' });
    }

    // Supervisor can only mark attendance for their assigned sites
    if (req.user.role === 'supervisor' && site.supervisorID.toString() !== userId) {
      return res.status(403).json({ message: 'You can only mark attendance for your assigned sites' });
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      workerID,
      siteID,
      date: attendanceDate
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
      date: attendanceDate,
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
    // Unique index fallback (race condition): prevent duplicates cleanly
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Attendance already marked for this worker, site, and date' });
    }
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

    if (site.isActive === false && req.user.role !== 'admin') {
      return res.status(404).json({ message: 'Site not found' });
    }

    // Supervisor can only view attendance for their assigned sites
    if (req.user.role === 'supervisor' && site.supervisorID.toString() !== req.user._id.toString()) {
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
    if (req.user.role === 'worker' && req.params.workerId !== req.user._id.toString()) {
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
    const userId = req.user._id.toString();

    if (req.user.role === 'admin') {
      attendance = await Attendance.find()
        .populate('workerID', 'name email')
        .populate('siteID', 'siteName location')
        .sort({ date: -1 });
    } else if (req.user.role === 'accountant') {
      // Deactivated sites are hidden from non-admin users (treat as deleted)
      const activeSites = await Site.find({ isActive: { $ne: false } }).select('_id');
      const siteIds = activeSites.map(s => s._id);
      attendance = await Attendance.find({ siteID: { $in: siteIds } })
        .populate('workerID', 'name email')
        .populate('siteID', 'siteName location')
        .sort({ date: -1 });
    } else if (req.user.role === 'worker') {
      attendance = await Attendance.find({ workerID: userId })
        .populate('workerID', 'name email')
        .populate('siteID', 'siteName location')
        .sort({ date: -1 });
    } else if (req.user.role === 'supervisor') {
      const sites = await Site.find({ supervisorID: userId, isActive: { $ne: false } });
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

