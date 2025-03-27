const mongoose = require('mongoose');
const Item = require('../models/Item');
const Log = require('../models/Log'); // Assuming a Log model is created
const createCsvWriter = require('csv-writer').createObjectCsvStringifier;

const getItems = async (req, res) => {
  try {
    const { page = 1, limit = 15, search = '', sortBy = 'name', sortOrder = 'asc', minQuantity, maxQuantity } = req.query;
    const query = {};

    // Search logic
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { warehouse: { $regex: search, $options: 'i' } },
        { quantity: { $lte: 10, $exists: search.toLowerCase() === 'low stock' } },
      ];
    }

    // Quantity range filtering
    if (minQuantity || maxQuantity) {
      query.quantity = {};
      if (minQuantity) query.quantity.$gte = Number(minQuantity);
      if (maxQuantity) query.quantity.$lte = Number(maxQuantity);
    }

    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const items = await Item.find(query)
      .sort({ [sortBy]: sortDirection })
      .skip((page - 1) * limit)
      .limit(limit);
    const totalItems = await Item.countDocuments(query);
    res.json({ items, totalItems });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch items' });
  }
};

const createItem = async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    await Log.create({ action: 'add', itemId: item._id, user: req.user?.id || 'anonymous', timestamp: new Date() });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create item' });
  }
};

const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, warehouse, lowStockThreshold } = req.body;
    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Prevent negative quantities
    if (quantity !== undefined && quantity < 0) {
      return res.status(400).json({ message: 'Quantity cannot be negative' });
    }

    item.name = name || item.name;
    item.quantity = quantity !== undefined ? quantity : item.quantity;
    item.warehouse = warehouse || item.warehouse;
    item.lowStockThreshold = lowStockThreshold || item.lowStockThreshold;

    const updatedItem = await item.save();
    await Log.create({ action: 'update', itemId: id, user: req.user?.id || 'anonymous', timestamp: new Date() });

    const changes = { oldQuantity: item.quantity, newQuantity: quantity };
    await Log.create({ action: 'update', itemId: id, user: req.user?.id || 'anonymous', timestamp: new Date(), changes });
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update item' });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    await Log.create({ action: 'delete', itemId: req.params.id, user: req.user?.id || 'anonymous', timestamp: new Date() });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getBarChartData = async (req, res) => {
  try {
    const items = await Item.find();
    const warehouseData = items.reduce((acc, item) => {
      const warehouse = item.warehouse || 'Unknown';
      acc[warehouse] = (acc[warehouse] || 0) + item.quantity;
      return acc;
    }, {});

    // Convert object to array for frontend compatibility
    const chartData = Object.entries(warehouseData).map(([warehouse, totalQuantity]) => ({
      warehouse,
      totalQuantity,
    })).sort((a, b) => a.warehouse.localeCompare(b.warehouse)); // Sort alphabetically

    res.json(chartData);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bar chart data' });
  }
};

const getPieChartData = async (req, res) => {
  try {
    const items = await Item.find();
    const lowStockCount = items.filter(item => item.quantity <= (item.lowStockThreshold || 10)).length;
    const inStockCount = items.length - lowStockCount;

    res.json({ lowStock: lowStockCount, inStock: inStockCount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pie chart data' });
  }
};

const exportItems = async (req, res) => {
  try {
    const items = await Item.find();

    const csvWriter = createCsvWriter({
      header: [
        { id: 'name', title: 'Name' },
        { id: 'quantity', title: 'Quantity' },
        { id: 'warehouse', title: 'Warehouse' },
        { id: 'lowStockThreshold', title: 'Low Stock Threshold' },
      ],
    });

    const csv = csvWriter.stringifyRecords(items);
    const csvWithHeader = csvWriter.getHeaderString() + csv;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="items.csv"');
    res.status(200).send(csvWithHeader);
  } catch (err) {
    res.status(500).json({ message: 'Failed to export items' });
  }
};

const getLowStockAlert = async (req, res) => {
  try {
    const lowStockItems = await Item.find({ quantity: { $lte: '$lowStockThreshold' } });
    res.json(lowStockItems);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch low stock alert' });
  }
};

const createLog = async (req, res) => {
  try {
    const log = new Log(req.body);
    await log.save();
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create log' });
  }
};

// server/controllers/itemController.js
const transferItem = async (req, res) => {
  try {
    const { itemId, fromWarehouse, toWarehouse, quantity } = req.body;
    console.log('Transfer request:', { itemId, fromWarehouse, toWarehouse, quantity });

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      console.log('Invalid item ID:', itemId);
      return res.status(400).json({ message: 'Invalid item ID' });
    }

    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      console.log('Invalid quantity:', quantity);
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    if (!Number.isInteger(parsedQuantity)) {
      console.log('Quantity must be an integer:', quantity);
      return res.status(400).json({ message: 'Quantity must be an integer' });
    }

    if (!fromWarehouse || !toWarehouse) {
      console.log('Missing warehouse details:', { fromWarehouse, toWarehouse });
      return res.status(400).json({ message: 'Source and destination warehouses are required' });
    }

    if (fromWarehouse === toWarehouse) {
      console.log('Source and destination warehouses cannot be the same:', { fromWarehouse, toWarehouse });
      return res.status(400).json({ message: 'Source and destination warehouses cannot be the same' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      console.log('Item not found:', itemId);
      return res.status(404).json({ message: 'Item not found' });
    }
    if (item.warehouse !== fromWarehouse) {
      console.log('Warehouse mismatch:', { itemWarehouse: item.warehouse, fromWarehouse });
      return res.status(400).json({ message: 'Source warehouse does not match item’s current warehouse' });
    }
    if (item.quantity < parsedQuantity) {
      console.log('Insufficient quantity:', { itemQuantity: item.quantity, requestedQuantity: parsedQuantity });
      return res.status(400).json({ message: 'Insufficient quantity in source warehouse' });
    }

    // Update the source item
    item.quantity -= parsedQuantity;
    if (item.quantity === 0) {
      await Item.deleteOne({ _id: itemId });
    } else {
      await item.save();
    }
    console.log('Updated source item:', item);

    // Check if the item already exists in the destination warehouse
    let newItem = await Item.findOne({ name: item.name, warehouse: toWarehouse });
    if (newItem) {
      // If it exists, update the quantity
      newItem.quantity += parsedQuantity;
      await newItem.save();
      console.log('Updated existing item in destination:', newItem);
    } else {
      // Otherwise, create a new item
      newItem = new Item({
        name: item.name,
        quantity: parsedQuantity,
        warehouse: toWarehouse,
        lowStockThreshold: item.lowStockThreshold,
      });
      await newItem.save();
      console.log('Created new item:', newItem);
    }

    console.log('req.user:', req.user);
    await Log.create({
      action: 'transfer',
      itemId,
      newItemId: newItem._id,
      user: req.user?.id || 'anonymous',
      timestamp: new Date(),
      details: { from: fromWarehouse, to: toWarehouse, quantity: parsedQuantity },
    });
    console.log('Logged transfer action');

    res.json({ message: 'Item transferred successfully', itemName: item.name });
  } catch (err) {
    console.error('Error in transferItem:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Duplicate item error in destination warehouse' });
    }
    res.status(500).json({ message: 'Failed to transfer item', error: err.message });
  }
};



module.exports = { getItems, createItem, createLog, transferItem, updateItem, deleteItem, exportItems, getBarChartData, getPieChartData, getLowStockAlert };