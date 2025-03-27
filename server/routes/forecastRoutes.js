// server/routes/forecastRoutes.js
const express = require('express');
const router = express.Router();
const forecastController = require('../controllers/forecastController');

// Route to get demand forecasts
router.get('/', forecastController.getDemandForecast);

module.exports = router;