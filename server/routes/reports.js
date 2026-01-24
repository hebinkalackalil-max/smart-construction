const express = require('express');
const Site = require('../models/Site');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const Task = require('../models/Task');
const Equipment = require('../models/Equipment');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reports
// @desc    Get system reports and statistics
// @access  Private (Admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    // Get counts
    const totalSites = await Site.countDocuments();
    const ongoingSites = await Site.countDocuments({ status: 'Ongoing' });
    const completedSites = await Site.countDocuments({ status: 'Completed' });

    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const supervisorCount = await User.countDocuments({ role: 'supervisor' });
    const workerCount = await User.countDocuments({ role: 'worker' });
    const accountantCount = await User.countDocuments({ role: 'accountant' });

    const totalAttendance = await Attendance.countDocuments();
    const presentCount = await Attendance.countDocuments({ status: 'Present' });
    const absentCount = await Attendance.countDocuments({ status: 'Absent' });

    const totalPayments = await Payment.countDocuments();
    const pendingPayments = await Payment.countDocuments({ paymentStatus: 'Pending' });
    const paidPayments = await Payment.countDocuments({ paymentStatus: 'Paid' });
    const totalSalaryPaid = await Payment.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$salaryAmount' } } }
    ]);

    const totalTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments({ status: 'Pending' });
    const inProgressTasks = await Task.countDocuments({ status: 'In Progress' });
    const completedTasks = await Task.countDocuments({ status: 'Completed' });

    const totalEquipment = await Equipment.countDocuments();
    const availableEquipment = await Equipment.countDocuments({ status: 'Available' });
    const inUseEquipment = await Equipment.countDocuments({ status: 'In Use' });
    const maintenanceEquipment = await Equipment.countDocuments({ status: 'Maintenance' });

    // Get recent activities
    const recentAttendance = await Attendance.find()
      .populate('workerID', 'name email')
      .populate('siteID', 'siteName location')
      .sort({ createdAt: -1 })
      .limit(10);

    const recentPayments = await Payment.find()
      .populate('workerID', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        sites: {
          total: totalSites,
          ongoing: ongoingSites,
          completed: completedSites
        },
        users: {
          total: totalUsers,
          admin: adminCount,
          supervisor: supervisorCount,
          worker: workerCount,
          accountant: accountantCount
        },
        attendance: {
          total: totalAttendance,
          present: presentCount,
          absent: absentCount
        },
        payments: {
          total: totalPayments,
          pending: pendingPayments,
          paid: paidPayments,
          totalSalaryPaid: totalSalaryPaid[0]?.total || 0
        },
        tasks: {
          total: totalTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks,
          completed: completedTasks
        },
        equipment: {
          total: totalEquipment,
          available: availableEquipment,
          inUse: inUseEquipment,
          maintenance: maintenanceEquipment
        },
        recentActivities: {
          attendance: recentAttendance,
          payments: recentPayments
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

