// server/routes/reorderRoutes.js
const express = require('express');
const router = express.Router();
const reorderController = require('../controllers/reorderController');

router.post('/', reorderController.placeReorder);

module.exports = router;