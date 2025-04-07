require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const mongoose = require('mongoose'); // Use mongoose directly instead of connectDB
const itemRoutes = require('./routes/itemRoutes');
const authRoutes = require('./routes/authRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const forecastRoutes = require('./routes/forecastRoutes');
const reorderRoutes = require('./routes/reorderRoutes');
const analyticsRoutes = require('./routes/analytics');
const authController = require('./controllers/authController');

const app = express();

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true,
}));

// Middleware to parse JSON
app.use(express.json());

// Register routes
app.use('/api', itemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/reorder', reorderRoutes);
app.use('/api/analytics', analyticsRoutes);

app.post('/api/auth/reset-password', authController.resetPassword);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Local development server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Serverless handler
module.exports.handler = serverless(app);