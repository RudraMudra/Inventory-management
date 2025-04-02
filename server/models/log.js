const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action: { type: String, required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
  newItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' }, // Add this field
  user: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: Object },
});

module.exports = mongoose.models.Log || mongoose.model('Log', logSchema);