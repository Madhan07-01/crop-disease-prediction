const express = require('express');
const mongoose = require('mongoose');
const Prediction = require('../models/Prediction');
const authMiddleware = require('../middleware/authMiddleware');
const memoryStore = require('../utils/memoryStore');
const ApiError = require('../utils/apiError');

const router = express.Router();

// Fetch history for logged-in user
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    if (!memoryStore.isMongoConnected(mongoose)) {
      return res.json({ predictions: memoryStore.getPredictionsForUser(req.user.id), source: 'memory' });
    }

    const history = await Prediction.find({ userId: req.user.id }).sort({ scannedAt: -1 });
    res.json({ predictions: history, source: 'mongodb' });
  } catch (err) {
    next(new ApiError(500, 'Unable to fetch prediction history.'));
  }
});

module.exports = router;
