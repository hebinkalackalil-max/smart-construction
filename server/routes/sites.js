const express = require('express');
const Site = require('../models/Site');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/sites
// @desc    Get all construction sites
// @access  Private (All authenticated users)
router.get('/', auth, async (req, res) => {
  try {
    let sites;

    // Admin can see all sites, Supervisor sees only assigned sites, others see all
    if (req.user.role === 'supervisor') {
      sites = await Site.find({ supervisorID: req.user.id }).populate('supervisorID', 'name email');
    } else {
      sites = await Site.find().populate('supervisorID', 'name email');
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

// @route   GET /api/sites/:id
// @desc    Get single site by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id).populate('supervisorID', 'name email');

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    // Supervisor can only access their assigned sites
    if (req.user.role === 'supervisor' && site.supervisorID._id.toString() !== req.user.id) {
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
// @desc    Update site
// @access  Private (Admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { siteName, location, supervisorID, status } = req.body;

    const site = await Site.findById(req.params.id);

    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    if (siteName) site.siteName = siteName;
    if (location) site.location = location;
    if (supervisorID) site.supervisorID = supervisorID;
    if (status) site.status = status;

    await site.save();

    const populatedSite = await Site.findById(site._id).populate('supervisorID', 'name email');

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

