const express = require('express');
const App = require('../models/App');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Create app
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, type, layout, settings } = req.body;
    
    const app = new App({
      userId: req.user._id,
      name,
      description,
      type,
      layout,
      settings
    });
    
    app.generateSlug();
    await app.save();
    
    res.status(201).json({
      message: 'App created successfully',
      app
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's apps
router.get('/', authMiddleware, async (req, res) => {
  try {
    const apps = await App.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select('-layout.components.data');
    
    res.json({ apps });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get specific app
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const app = await App.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }
    
    res.json({ app });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update app
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    
    const app = await App.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...updates, version: { $inc: 1 } },
      { new: true }
    );
    
    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }
    
    res.json({ message: 'App updated successfully', app });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete app
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const app = await App.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }
    
    res.json({ message: 'App deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get public app
router.get('/:slug/public', optionalAuth, async (req, res) => {
  try {
    const app = await App.findOne({ 
      slug: req.params.slug, 
      isPublic: true 
    }).populate('userId', 'name workspace');
    
    if (!app) {
      return res.status(404).json({ message: 'App not found or not public' });
    }
    
    // Increment view count
    app.analytics.views += 1;
    app.analytics.lastViewed = new Date();
    await app.save();
    
    res.json({ app });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle app visibility
router.patch('/:id/visibility', authMiddleware, async (req, res) => {
  try {
    const { isPublic } = req.body;
    
    const app = await App.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isPublic },
      { new: true }
    );
    
    if (!app) {
      return res.status(404).json({ message: 'App not found' });
    }
    
    res.json({ 
      message: `App ${isPublic ? 'published' : 'unpublished'} successfully`,
      app 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;