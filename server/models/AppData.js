const mongoose = require('mongoose');

const appDataSchema = new mongoose.Schema({
  appId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'App',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collection: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  metadata: {
    createdBy: String,
    updatedBy: String,
    version: { type: Number, default: 1 }
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
appDataSchema.index({ appId: 1, collection: 1 });
appDataSchema.index({ userId: 1 });

module.exports = mongoose.model('AppData', appDataSchema);