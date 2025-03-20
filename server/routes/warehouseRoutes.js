const express = require('express');
const router = express.Router();
const { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } = require('../controllers/warehouseController');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');

router.get('/', authMiddleware, getWarehouses);
router.post('/', authMiddleware, roleMiddleware(['admin']), createWarehouse);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateWarehouse);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteWarehouse);



module.exports = router;