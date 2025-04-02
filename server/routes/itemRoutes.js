const express = require('express');
const Item = require('../models/Item');
const StockHistory = require('../models/StockHistory');
const router = express.Router();
const { getItems,
  createItem,
  updateItem,
  deleteItem,
  exportItems,
  getBarChartData,
  getPieChartData,
  getLowStockAlert,
  createLog,
  transferItem
} = require('../controllers/itemController');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');

router.get('/items', authMiddleware, getItems);
router.post('/items', authMiddleware, roleMiddleware(['admin']), createItem);
router.put('/items/:id', authMiddleware, roleMiddleware(['admin']), updateItem);
router.delete('/items/:id', authMiddleware, roleMiddleware(['admin']), deleteItem);
router.get('/items/export', authMiddleware, exportItems);
router.get('/items/bar-chart', authMiddleware, getBarChartData);
router.get('/items/pie-chart', authMiddleware, getPieChartData);
router.get('/items/low-stock-alert', authMiddleware, getLowStockAlert);
router.post('/logs', authMiddleware, createLog);
router.post('/items/transfer', authMiddleware, transferItem);


router.get('/warehouse-quantities', authMiddleware, async (req, res) => {
  try {
    const quantities = await Item.aggregate([
      {
        $group: {
          _id: '$warehouse', // Group by warehouse name
          totalQuantity: { $sum: '$quantity' }, // Sum the quantities
        },
      },
      {
        $project: {
          warehouse: '$_id',
          totalQuantity: 1,
          _id: 0,
        },
      },
    ]);
    res.json(quantities);
  } catch (err) {
    console.error('Error fetching warehouse quantities:', err);
    res.status(500).json({ message: 'Failed to fetch warehouse quantities', error: err.message });
  }
});

router.get('/by-warehouse/:warehouseName', authMiddleware, async (req, res) => {
  try {
    const { warehouseName } = req.params;
    const items = await Item.find({ warehouse: warehouseName });
    res.json(items);
  } catch (err) {
    console.error('Error fetching items by warehouse:', err);
    res.status(500).json({ message: 'Failed to fetch items by warehouse', error: err.message });
  }
});

router.post('/transfer/:id', async (req, res) => {
  const { id } = req.params;
  const { toWarehouse } = req.body;

  const item = await Item.findById(id);
  if (!item) return res.status(404).json({ message: 'Item not found' });

  // Log the transfer action
  await ActionLog.create({
    actionType: 'transfer',
    itemId: id,
    userId: req.user ? req.user.id : null, // Assuming user is added to req by auth middleware
    quantity: item.quantity,
    fromWarehouse: item.warehouse,
    toWarehouse,
    timestamp: new Date(),
  });

  // Update the item
  item.warehouse = toWarehouse;
  await item.save();

  res.json(item);
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  const item = await Item.findById(id);
  if (!item) return res.status(404).json({ message: 'Item not found' });

  // Log stock history
  const status = quantity <= item.lowStockThreshold ? 'Low Stock' : 'In Stock';
  await StockHistory.create({
    itemId: id,
    quantity,
    status,
    timestamp: new Date(),
  });

  // Update the item
  item.quantity = quantity;
  await item.save();

  res.json(item);
});


module.exports = router;