const express = require('express');
const router = express.Router();
const AppData = require('../models/AppData');
const auth = require('../middleware/auth');

// Create app data
router.post('/', auth, async (req, res) => {
  try {
    const { appId, collection, data } = req.body;
    const userId = req.user.id;

    const appData = new AppData({
      appId,
      userId,
      collection,
      data,
      metadata: {
        createdBy: req.user.email,
        updatedBy: req.user.email,
        version: 1
      }
    });

    await appData.save();
    res.status(201).json(appData);
  } catch (error) {
    console.error('Error creating app data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get app data by collection
router.get('/:appId/:collection', auth, async (req, res) => {
  try {
    const { appId, collection } = req.params;
    const appData = await AppData.find({ appId, collection })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(appData);
  } catch (error) {
    console.error('Error fetching app data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update app data
router.put('/:id', auth, async (req, res) => {
  try {
    const { data } = req.body;
    const appData = await AppData.findById(req.params.id);

    if (!appData) {
      return res.status(404).json({ message: 'App data not found' });
    }

    if (appData.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    appData.data = data;
    appData.metadata.updatedBy = req.user.email;
    appData.metadata.version += 1;

    await appData.save();
    res.json(appData);
  } catch (error) {
    console.error('Error updating app data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete app data
router.delete('/:id', auth, async (req, res) => {
  try {
    const appData = await AppData.findById(req.params.id);

    if (!appData) {
      return res.status(404).json({ message: 'App data not found' });
    }

    if (appData.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await appData.remove();
    res.json({ message: 'App data removed' });
  } catch (error) {
    console.error('Error deleting app data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;