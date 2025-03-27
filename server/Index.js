const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const connectDB = require('./config/db');
const itemRoutes = require('./routes/itemRoutes');
const authRoutes = require('./routes/authRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const forecastRoutes = require('./routes/forecastRoutes');
const reorderRoutes = require('./routes/reorderRoutes');

require('dotenv').config();

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
}));
app.use(express.json());

connectDB();

app.use('/api', itemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/reorder', reorderRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports.handler = serverless(app);