const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
    },
    warehouse: {
        type: String,
        required: true,
    },
    lowStockThreshold: {
        type: Number,
        default: 10,
    },
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);