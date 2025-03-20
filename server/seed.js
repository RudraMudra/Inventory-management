const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Item = require('./models/Item');
require('dotenv').config();

const seedData = Array.from({ length: 100 }, (_, i) => ({
    name: `Item ${i + 1}`,
    quantity: Math.floor(Math.random() * 100) + 1,
    warehouse: `WH${Math.floor(Math.random() * 5) + 1}`
}));

const seedDB = async () => {
    try {
        await connectDB();
        await Item.deleteMany({});
        await Item.insertMany(seedData);
        console.log('Database seeded successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();