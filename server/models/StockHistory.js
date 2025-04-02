// models/StockHistory.js
const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, required: true },
  status: { type: String, required: true }, // 'Low Stock' or 'In Stock'
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('StockHistory', stockHistorySchema);