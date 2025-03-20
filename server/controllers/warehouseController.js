const Warehouse = require('../models/Warehouse'); // Assuming a Warehouse model is created

// Get all warehouses
const getWarehouses = async (req, res) => {
    try {
      const warehouses = await Warehouse.find();
      res.json(warehouses);
    } catch (err) {
      console.error('Error in getWarehouses:', err);
      res.status(500).json({ message: 'Failed to fetch warehouses', error: err.message });
    }
  };

// create a new warehouse
const createWarehouse = async (req, res) => {
    try {
        const { name, location } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Warehouse name is required' });
        }
        const existingWarehouse = await Warehouse.findOne({ name });
        if (existingWarehouse) {
            return res.status(400).json({ message: 'Warehouse name already exists' });
        }
        const warehouse = new Warehouse({ name, location });
        await warehouse.save();
        res.status(201).json({ message: 'Warehouse created successfully', warehouse });
    } catch (err) {
        console.error('Error in createWarehouse:', err);
        res.status(500).json({ message: 'Failed to create warehouse', error: err.message });
    }
};

// update a warehouse
const updateWarehouse = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, location } = req.body;
        const warehouse = await Warehouse.findById(id);
        if (!warehouse) {
            return res.status(404).json({ message: 'Warehouse not found' });
        }
        if (name && name !== warehouse.name) {
            const existingWarehouse = await Warehouse.findOne({ name });
            if (existingWarehouse) {
                return res.status(400).json({ message: 'Warehouse name already exists' });
            }
        }
        warehouse.name = name || warehouse.name;
        warehouse.location = location || warehouse.location;
        await warehouse.save();
        res.json({ message: 'Warehouse updated successfully', warehouse });
    } catch (err) {
        console.error('Error in updateWarehouse:', err);
        res.status(500).json({ message: 'Failed to update warehouse', error: err.message });
    }
};

// delete a warehouse
const deleteWarehouse = async (req, res) => {
    try {
        const { id } = req.params;
        const warehouse = await Warehouse.findById(id);
        if (!warehouse) {
            return res.status(404).json({ message: 'Warehouse not found' });
        }
        await warehouse.deleteOne();
        res.json({ message: 'Warehouse deleted successfully' });
    } catch (err) {
        console.error('Error in deleteWarehouse:', err);
        res.status(500).json({ message: 'Failed to delete warehouse', error: err.message });
    }
};



module.exports = { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse };