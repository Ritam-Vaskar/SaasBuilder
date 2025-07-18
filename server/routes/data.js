const express = require('express');
const AppData = require('../models/AppData');
const App = require('../models/App');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Create data record
router.post('/:appId', authMiddleware, async (req, res) => {
  try {
    const { collection, data } = req.body;
    
    // Verify app ownership
    const app = await App.findOne({ 
      _id: req.params.appId, 
      userId: req.user._id 
    });
    
    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }
    
    const appData = new AppData({
      appId: req.params.appId,
      userId: req.user._id,
      collection,
      data,
      metadata: {
        createdBy: req.user.name,
        updatedBy: req.user.name
      }
    });
    
    await appData.save();
    
    res.status(201).json({
      message: 'Data created successfully',
      data: appData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get data records
router.get('/:appId', optionalAuth, async (req, res) => {
  try {
    const { collection, page = 1, limit = 50 } = req.query;
    
    // Check if app exists and is accessible
    const app = await App.findById(req.params.appId);
    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }
    
    // Check permissions
    if (!app.isPublic && (!req.user || app.userId.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const query = { appId: req.params.appId };
    if (collection) query.collection = collection;
    
    const skip = (page - 1) * limit;
    const data = await AppData.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await AppData.countDocuments(query);
    
    res.json({
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update data record
router.put('/:appId/:recordId', authMiddleware, async (req, res) => {
  try {
    const { data } = req.body;
    
    const appData = await AppData.findOneAndUpdate(
      { 
        _id: req.params.recordId, 
        appId: req.params.appId,
        userId: req.user._id 
      },
      { 
        data,
        'metadata.updatedBy': req.user.name,
        'metadata.version': { $inc: 1 }
      },
      { new: true }
    );
    
    if (!appData) {
      return res.status(404).json({ message: 'Data record not found' });
    }
    
    res.json({
      message: 'Data updated successfully',
      data: appData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete data record
router.delete('/:appId/:recordId', authMiddleware, async (req, res) => {
  try {
    const appData = await AppData.findOneAndDelete({
      _id: req.params.recordId,
      appId: req.params.appId,
      userId: req.user._id
    });
    
    if (!appData) {
      return res.status(404).json({ message: 'Data record not found' });
    }
    
    res.json({ message: 'Data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;