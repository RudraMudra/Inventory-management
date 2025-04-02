// models/ActionLog.js
const mongoose = require('mongoose');

const actionLogSchema = new mongoose.Schema({
  actionType: { type: String, required: true }, // e.g., 'transfer', 'reduce', 'add', 'delete'
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, if tracking users
  quantity: { type: Number }, // Quantity involved in the action (e.g., 5 items transferred)
  fromWarehouse: { type: String }, // For transfers
  toWarehouse: { type: String }, // For transfers
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ActionLog', actionLogSchema);