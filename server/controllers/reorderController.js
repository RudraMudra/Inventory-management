// server/controllers/reorderController.js
const mongoose = require('mongoose');
const Item = require('../models/Item');

exports.placeReorder = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid item ID' });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Simulate placing a reorder (you can integrate with a real supplier API here)
    console.log(`Reorder placed: ${quantity} units of ${item.name}`);

    // Optionally, update the item quantity (if you want to simulate the reorder being fulfilled)
    item.quantity += quantity;
    await item.save();

    res.json({ message: 'Reorder request placed successfully' });
  } catch (error) {
    console.error('Error in placeReorder:', error);
    res.status(500).json({ message: 'Failed to place reorder', error: error.message });
  }
};