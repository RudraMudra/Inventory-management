const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: { type: String },
  createdAt: { type: Date, default: Date.now },
  capacity: { type: Number, required: true, default: 1000 },
});

module.exports = mongoose.model('Warehouse', warehouseSchema);