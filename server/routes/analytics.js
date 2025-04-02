// routes/analytics.js
const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const StockHistory = require('../models/StockHistory');
const Item = require('../models/Item');
const Warehouse = require('../models/Warehouse');

// Top-Selling Items (based on transfers and reductions)
router.get('/top-selling', async (req, res) => {
  try {
    const actions = await Log.aggregate([
      {
        $match: {
          action: { $in: ['transfer', 'reduce'] }, // Match transfer and reduce actions
        },
      },
      {
        $group: {
          _id: '$itemId',
          totalActions: { $sum: 1 },
          totalQuantity: { $sum: '$details.quantity' }, // Use details.quantity for the quantity moved
        },
      },
      {
        $sort: { totalActions: -1 },
      },
      {
        $limit: 5, // Top 5 items
      },
      {
        $lookup: {
          from: 'items',
          localField: '_id',
          foreignField: '_id',
          as: 'item',
        },
      },
      {
        $unwind: '$item',
      },
      {
        $project: {
          name: '$item.name',
          totalActions: 1,
          totalQuantity: 1,
        },
      },
    ]);

    res.json(actions);
  } catch (error) {
    console.error('Error fetching top-selling items:', error);
    res.status(500).json({ message: 'Error fetching top-selling items', error: error.message });
  }
});

// Stock Turnover Rate (average quantity moved per day)
router.get('/turnover', async (req, res) => {
  try {
    const actions = await Log.aggregate([
      {
        $match: {
          action: { $in: ['transfer', 'reduce'] },
        },
      },
      {
        $group: {
          _id: '$itemId',
          totalQuantity: { $sum: '$details.quantity' }, // Use details.quantity
          firstAction: { $min: '$timestamp' },
          lastAction: { $max: '$timestamp' },
        },
      },
      {
        $lookup: {
          from: 'items',
          localField: '_id',
          foreignField: '_id',
          as: 'item',
        },
      },
      {
        $unwind: '$item',
      },
      {
        $project: {
          name: '$item.name',
          totalQuantity: 1,
          days: {
            $divide: [
              { $subtract: ['$lastAction', '$firstAction'] },
              1000 * 60 * 60 * 24, // Convert milliseconds to days
            ],
          },
        },
      },
      {
        $project: {
          name: 1,
          turnoverRate: {
            $cond: {
              if: { $eq: ['$days', 0] }, // Avoid division by zero
              then: 0,
              else: { $divide: ['$totalQuantity', '$days'] },
            },
          },
        },
      },
    ]);

    res.json(actions);
  } catch (error) {
    console.error('Error fetching turnover rates:', error);
    res.status(500).json({ message: 'Error fetching turnover rates', error: error.message });
  }
});

// Low Stock Trends (number of low stock incidents per month)
router.get('/low-stock-trends', async (req, res) => {
  try {
    const trends = await StockHistory.aggregate([
      {
        $match: {
          status: 'Low Stock',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: '$_id.month' },
            ],
          },
          count: 1,
        },
      },
    ]);

    res.json(trends);
  } catch (error) {
    console.error('Error fetching low stock trends:', error);
    res.status(500).json({ message: 'Error fetching low stock trends', error: error.message });
  }
});

// Warehouse Utilization
router.get('/warehouse-utilization', async (req, res) => {
  try {
    const warehouses = await Warehouse.find();
    const items = await Item.find();

    const utilization = warehouses.map(warehouse => {
      const totalQuantity = items
        .filter(item => item.warehouse.toLowerCase() === warehouse.name.toLowerCase())
        .reduce((sum, item) => sum + item.quantity, 0);
      const utilizationPercentage = (totalQuantity / warehouse.capacity) * 100;
      return {
        name: warehouse.name,
        totalQuantity,
        capacity: warehouse.capacity,
        utilizationPercentage: utilizationPercentage > 100 ? 100 : utilizationPercentage,
      };
    });

    res.json(utilization);
  } catch (error) {
    console.error('Error fetching warehouse utilization:', error);
    res.status(500).json({ message: 'Error fetching warehouse utilization', error: error.message });
  }
});

module.exports = router;