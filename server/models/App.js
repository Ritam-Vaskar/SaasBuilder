const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['text', 'button', 'form', 'table', 'chart', 'calendar', 'kanban', 'fileUpload', 'timer', 'counter']
  },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    width: { type: Number, default: 200 },
    height: { type: Number, default: 100 }
  },
  props: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  styling: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  events: [{
    trigger: String,
    action: String,
    target: String,
    params: mongoose.Schema.Types.Mixed
  }]
}, { _id: false });

const appSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['todo', 'crm', 'budget', 'project', 'event', 'custom'],
    default: 'custom'
  },
  slug: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  customUrl: String,
  layout: {
    components: [componentSchema],
    gridSize: {
      type: Number,
      default: 10
    },
    theme: {
      primaryColor: { type: String, default: '#3B82F6' },
      secondaryColor: { type: String, default: '#10B981' },
      accentColor: { type: String, default: '#F97316' },
      backgroundColor: { type: String, default: '#FFFFFF' },
      textColor: { type: String, default: '#1F2937' },
      darkMode: { type: Boolean, default: false }
    }
  },
  settings: {
    allowComments: { type: Boolean, default: false },
    requireAuth: { type: Boolean, default: false },
    collectAnalytics: { type: Boolean, default: true }
  },
  analytics: {
    views: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    lastViewed: Date
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Generate unique slug
appSchema.methods.generateSlug = function() {
  const slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  this.slug = slug + '-' + Date.now().toString().slice(-6);
};

// Ensure user can only access their own apps
appSchema.index({ userId: 1 });
appSchema.index({ slug: 1 });
appSchema.index({ isPublic: 1 });

module.exports = mongoose.model('App', appSchema);