// server/controllers/forecastController.js
const mongoose = require('mongoose');
const Log = require('../models/Log');
const Item = require('../models/Item');

exports.getDemandForecast = async (req, res) => {
  try {
    const { itemId, days = 30 } = req.query;

    if (itemId && !mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid item ID' });
    }

    const query = itemId ? { _id: itemId } : {};
    const items = await Item.find(query);

    if (!items.length) {
      return res.status(404).json({ message: 'No items found' });
    }

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const forecasts = await Promise.all(
      items.map(async (item) => {
        const logs = await Log.find({
          $or: [{ action: 'transfer' }, { action: 'update' }],
          itemId: item._id,
          timestamp: { $gte: startDate, $lte: endDate },
        });

        const totalQuantity = logs.reduce((sum, log) => {
          const quantity = log.details?.quantity || 0;
          return quantity > 0 ? sum + quantity : sum;
        }, 0);

        const dailyAverage = totalQuantity / days;
        const weeklyForecast = dailyAverage * 7;

        let daysUntilLowStock;
        if (dailyAverage === 0) {
          // If no demand, check if already below threshold
          daysUntilLowStock = item.quantity <= item.lowStockThreshold ? 0 : -1; // -1 indicates "unknown"
        } else {
          daysUntilLowStock = (item.quantity - item.lowStockThreshold) / dailyAverage;
          daysUntilLowStock = daysUntilLowStock > 0 ? Math.floor(daysUntilLowStock) : 0;
        }

        const overstockThreshold = weeklyForecast * 3;
        const isOverstocked = item.quantity > overstockThreshold && weeklyForecast > 0;

        return {
          itemId: item._id,
          itemName: item.name,
          currentQuantity: item.quantity,
          lowStockThreshold: item.lowStockThreshold,
          weeklyForecast: weeklyForecast || 0,
          daysUntilLowStock, // Will be 0 if below threshold, -1 if unknown, or a positive number
          isOverstocked,
          overstockAmount: isOverstocked ? item.quantity - overstockThreshold : 0,
          hasTransferData: logs.some(log => log.details?.quantity > 0),
        };
      })
    );

    res.json(forecasts);
  } catch (error) {
    console.error('Error in getDemandForecast:', error);
    res.status(500).json({ message: 'Failed to fetch demand forecast', error: error.message });
  }
};