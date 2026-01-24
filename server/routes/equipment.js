const express = require('express');
const Equipment = require('../models/Equipment');
const Site = require('../models/Site');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/equipment
// @desc    Get all equipment (filtered by site if provided)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let query = {};

    // Filter by site if siteID is provided
    if (req.query.siteID) {
      query.siteID = req.query.siteID;

      // Supervisor can only see equipment for their assigned sites
      if (req.user.role === 'supervisor') {
        const site = await Site.findById(req.query.siteID);
        if (!site || site.supervisorID.toString() !== req.user.id) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }
    } else if (req.user.role === 'supervisor') {
      // Supervisor sees equipment for all their assigned sites
      const sites = await Site.find({ supervisorID: req.user.id });
      const siteIds = sites.map(site => site._id);
      query.siteID = { $in: siteIds };
    }

    const equipment = await Equipment.find(query)
      .populate('siteID', 'siteName location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: equipment.length,
      data: equipment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/equipment/:id
// @desc    Get single equipment by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('siteID', 'siteName location');

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Supervisor can only see equipment for their assigned sites
    if (req.user.role === 'supervisor') {
      const site = await Site.findById(equipment.siteID._id);
      if (site.supervisorID.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/equipment
// @desc    Add new equipment
// @access  Private (Admin, Supervisor)
router.post('/', auth, authorize('admin', 'supervisor'), async (req, res) => {
  try {
    const { equipmentName, siteID, status, lastMaintenance } = req.body;

    if (!equipmentName || !siteID) {
      return res.status(400).json({ message: 'Please provide equipmentName and siteID' });
    }

    // Verify site exists
    const site = await Site.findById(siteID);
    if (!site) {
      return res.status(400).json({ message: 'Invalid site ID' });
    }

    // Supervisor can only add equipment to their assigned sites
    if (req.user.role === 'supervisor' && site.supervisorID.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only add equipment to your assigned sites' });
    }

    const equipment = await Equipment.create({
      equipmentName,
      siteID,
      status: status || 'Available',
      lastMaintenance: lastMaintenance ? new Date(lastMaintenance) : undefined
    });

    const populated = await Equipment.findById(equipment._id)
      .populate('siteID', 'siteName location');

    res.status(201).json({
      success: true,
      message: 'Equipment added successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/equipment/:id
// @desc    Update equipment
// @access  Private (Admin, Supervisor)
router.put('/:id', auth, authorize('admin', 'supervisor'), async (req, res) => {
  try {
    const { equipmentName, status, lastMaintenance } = req.body;

    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    // Supervisor can only update equipment for their assigned sites
    if (req.user.role === 'supervisor') {
      const site = await Site.findById(equipment.siteID);
      if (site.supervisorID.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    if (equipmentName) equipment.equipmentName = equipmentName;
    if (status) {
      if (!['Available', 'In Use', 'Maintenance'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      equipment.status = status;
    }
    if (lastMaintenance) equipment.lastMaintenance = new Date(lastMaintenance);

    await equipment.save();

    const populated = await Equipment.findById(equipment._id)
      .populate('siteID', 'siteName location');

    res.json({
      success: true,
      message: 'Equipment updated successfully',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/equipment/:id
// @desc    Delete equipment
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }

    await equipment.deleteOne();

    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

