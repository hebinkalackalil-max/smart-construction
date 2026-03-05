const express = require('express');
const Site = require('../models/Site');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/sites
// @desc    Get all construction sites (deactivated sites only visible to admin)
// @access  Private (All authenticated users)
router.get('/', auth, async (req, res) => {
  try {
    let sites;
    const onlyActive = { isActive: { $ne: false } }; // hide deactivated from non-admin

    if (req.user.role === 'admin') {
      sites = await Site.find()
        .populate('supervisorID', 'name email')
        .populate('workerIDs', 'name email');
    } else if (req.user.role === 'supervisor') {
      sites = await Site.find({ supervisorID: req.user._id, ...onlyActive })
        .populate('supervisorID', 'name email')
        .populate('workerIDs', 'name email');
    } else {
      // Worker, accountant: only active sites (deactivated = like deleted for them)
      sites = await Site.find(onlyActive)
        .populate('supervisorID', 'name email')
        .populate('workerIDs', 'name email');
    }

    res.json({
      success: true,
      count: sites.length,
      data: sites
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/sites/:siteId/workers
// @desc    Get workers assigned to a site
// @access  Private (Supervisor for own sites, Admin for any; deactivated = 404 for non-admin)
router.get('/:siteId/workers', auth, async (req, res) => {
  try {
    const site = await Site.findById(req.params.siteId).populate('workerIDs', 'name email role');

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    if (site.isActive === false && req.user.role !== 'admin') {
      return res.status(404).json({ message: 'Site not found' });
    }

    if (req.user.role === 'supervisor' && site.supervisorID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied to this site' });
    }

    res.json({
      success: true,
      data: site.workerIDs || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/sites/:siteId/workers
// @desc    Add a worker to a site (Supervisor for own sites, Admin for any)
// @access  Private
router.post('/:siteId/workers', auth, authorize('supervisor', 'admin'), async (req, res) => {
  try {
    const { workerID } = req.body;
    if (!workerID) {
      return res.status(400).json({ message: 'Please provide workerID' });
    }

    const site = await Site.findById(req.params.siteId);
    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    if (site.isActive === false && req.user.role !== 'admin') {
      return res.status(404).json({ message: 'Site not found' });
    }

    if (req.user.role === 'supervisor' && site.supervisorID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied to this site' });
    }

    const worker = await User.findById(workerID);
    if (!worker || worker.role !== 'worker') {
      return res.status(400).json({ message: 'Invalid worker ID or user is not a worker' });
    }

    const idStr = worker._id.toString();
    if (site.workerIDs.some(id => id.toString() === idStr)) {
      return res.status(400).json({ message: 'Worker is already assigned to this site' });
    }

    site.workerIDs.push(worker._id);
    await site.save();
    const updated = await Site.findById(site._id).populate('workerIDs', 'name email').populate('supervisorID', 'name email');

    res.json({
      success: true,
      data: updated,
      message: 'Worker added to site'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/sites/:siteId/workers/:workerId
// @desc    Remove a worker from a site
// @access  Private (Supervisor for own sites, Admin for any)
router.delete('/:siteId/workers/:workerId', auth, authorize('supervisor', 'admin'), async (req, res) => {
  try {
    const site = await Site.findById(req.params.siteId);
    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    if (site.isActive === false && req.user.role !== 'admin') {
      return res.status(404).json({ message: 'Site not found' });
    }

    if (req.user.role === 'supervisor' && site.supervisorID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied to this site' });
    }

    site.workerIDs = site.workerIDs.filter(id => id.toString() !== req.params.workerId);
    await site.save();
    const updated = await Site.findById(site._id).populate('workerIDs', 'name email').populate('supervisorID', 'name email');

    res.json({
      success: true,
      data: updated,
      message: 'Worker removed from site'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/sites/:id
// @desc    Get single site by ID (deactivated only visible to admin)
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id)
      .populate('supervisorID', 'name email')
      .populate('workerIDs', 'name email');

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    if (site.isActive === false && req.user.role !== 'admin') {
      return res.status(404).json({ message: 'Site not found' });
    }

    // Supervisor can only access their assigned sites
    if (req.user.role === 'supervisor' && site.supervisorID._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      success: true,
      data: site
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/sites
// @desc    Create new site
// @access  Private (Admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { siteName, location, supervisorID, status } = req.body;

    if (!siteName || !location || !supervisorID) {
      return res.status(400).json({ message: 'Please provide siteName, location, and supervisorID' });
    }

    const site = await Site.create({
      siteName,
      location,
      supervisorID,
      status: status || 'Ongoing'
    });

    const populatedSite = await Site.findById(site._id).populate('supervisorID', 'name email');

    res.status(201).json({
      success: true,
      data: populatedSite
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/sites/:id
// @desc    Update site (Admin: all fields + isActive; Supervisor: status only for own sites)
// @access  Private (Admin, Supervisor for own sites)
router.put('/:id', auth, authorize('admin', 'supervisor'), async (req, res) => {
  try {
    const { siteName, location, supervisorID, status, isActive } = req.body;
    const site = await Site.findById(req.params.id);

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    if (site.isActive === false && req.user.role !== 'admin') {
      return res.status(404).json({ message: 'Site not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isSupervisor = req.user.role === 'supervisor';

    if (isSupervisor) {
      if (site.supervisorID.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only update your assigned sites' });
      }
      // Supervisor can only update status
      if (status !== undefined) {
        if (!['Ongoing', 'Temporarily Paused', 'Completed'].includes(status)) {
          return res.status(400).json({ message: 'Invalid status' });
        }
        site.status = status;
      }
    } else {
      // Admin can update everything
      if (siteName !== undefined) site.siteName = siteName;
      if (location !== undefined) site.location = location;
      if (supervisorID !== undefined) site.supervisorID = supervisorID;
      // Apply isActive first (handle both boolean and string from form/JSON)
      if (isActive !== undefined) {
        const active = isActive === true || isActive === 'true';
        site.isActive = active;
        if (!active) {
          site.status = 'Temporarily Paused';
        } else {
          site.status = 'Ongoing';
        }
      }
      // Status can only be changed when site is active. When deactivated, status stays Temporarily Paused.
      if (status !== undefined && (site.isActive === true || site.isActive === 'true')) {
        if (!['Ongoing', 'Temporarily Paused', 'Completed'].includes(status)) {
          return res.status(400).json({ message: 'Invalid status' });
        }
        site.status = status;
      }
    }

    await site.save();

    const populatedSite = await Site.findById(site._id).populate('supervisorID', 'name email').populate('workerIDs', 'name email');

    res.json({
      success: true,
      data: populatedSite
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/sites/:id
// @desc    Delete site
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const site = await Site.findById(req.params.id);

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    await site.deleteOne();

    res.json({
      success: true,
      message: 'Site deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

