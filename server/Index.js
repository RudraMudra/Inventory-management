const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const connectDB = require('./config/db');
const itemRoutes = require('./routes/itemRoutes');
const authRoutes = require('./routes/authRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');

require('dotenv').config();

const app = express();

// Configure CORS
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL || 'https://inventory-management-client.vercel.app', // Add your deployed frontend URL
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  credentials: true,
}));
app.use(express.json());

// Connect to the database
connectDB();

// Define routes
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the StockFlow API' });
});
app.use('/api', itemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/warehouses', warehouseRoutes);

// Error handling middleware for 404s
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Export the app as a serverless function for Vercel
module.exports = app;
module.exports.handler = serverless(app);

// Start the server locally (only for development)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}