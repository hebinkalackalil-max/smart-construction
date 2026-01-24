const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const Site = require('../models/Site');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/tasks
// @desc    Assign task to worker
// @access  Private (Supervisor, Admin)
router.post('/', auth, authorize('supervisor', 'admin'), async (req, res) => {
  try {
    const { workerID, siteID, taskDescription } = req.body;

    if (!workerID || !siteID || !taskDescription) {
      return res.status(400).json({ 
        message: 'Please provide workerID, siteID, and taskDescription' 
      });
    }

    // Verify worker exists
    const worker = await User.findById(workerID);
    if (!worker || worker.role !== 'worker') {
      return res.status(400).json({ message: 'Invalid worker ID' });
    }

    // Verify site exists
    const site = await Site.findById(siteID);
    if (!site) {
      return res.status(400).json({ message: 'Invalid site ID' });
    }

    // Supervisor can only assign tasks for their assigned sites
    if (req.user.role === 'supervisor' && site.supervisorID.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only assign tasks for your assigned sites' });
    }

    const task = await Task.create({
      workerID,
      siteID,
      taskDescription,
      status: 'Pending',
      assignedBy: req.user.id
    });

    const populated = await Task.findById(task._id)
      .populate('workerID', 'name email')
      .populate('siteID', 'siteName location')
      .populate('assignedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task assigned successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task status
// @access  Private (Worker can update own tasks, Supervisor/Admin can update any)
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, taskDescription } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Worker can only update their own tasks
    if (req.user.role === 'worker' && task.workerID.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own tasks' });
    }

    if (status) {
      if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      task.status = status;
    }

    if (taskDescription && (req.user.role === 'supervisor' || req.user.role === 'admin')) {
      task.taskDescription = taskDescription;
    }

    await task.save();

    const populated = await Task.findById(task._id)
      .populate('workerID', 'name email')
      .populate('siteID', 'siteName location')
      .populate('assignedBy', 'name email');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/tasks
// @desc    Get all tasks (filtered by role)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let tasks;

    if (req.user.role === 'worker') {
      // Worker sees only their tasks
      tasks = await Task.find({ workerID: req.user.id })
        .populate('workerID', 'name email')
        .populate('siteID', 'siteName location')
        .populate('assignedBy', 'name email')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'supervisor') {
      // Supervisor sees tasks for their assigned sites
      const sites = await Site.find({ supervisorID: req.user.id });
      const siteIds = sites.map(site => site._id);
      tasks = await Task.find({ siteID: { $in: siteIds } })
        .populate('workerID', 'name email')
        .populate('siteID', 'siteName location')
        .populate('assignedBy', 'name email')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'admin') {
      // Admin sees all tasks
      tasks = await Task.find()
        .populate('workerID', 'name email')
        .populate('siteID', 'siteName location')
        .populate('assignedBy', 'name email')
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('workerID', 'name email')
      .populate('siteID', 'siteName location')
      .populate('assignedBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Worker can only see their own tasks
    if (req.user.role === 'worker' && task.workerID._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Supervisor can only see tasks for their assigned sites
    if (req.user.role === 'supervisor') {
      const site = await Site.findById(task.siteID._id);
      if (site.supervisorID.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private (Supervisor, Admin)
router.delete('/:id', auth, authorize('supervisor', 'admin'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Supervisor can only delete tasks for their assigned sites
    if (req.user.role === 'supervisor') {
      const site = await Site.findById(task.siteID);
      if (site.supervisorID.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

