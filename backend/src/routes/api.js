const express = require('express');
const calculatorController = require('../controllers/calculatorController');
const tipsController = require('../controllers/tipsController');
const contactController = require('../controllers/contactController');

const router = express.Router();

// Calculator Routes
router.post('/calculate', calculatorController.calculate);
router.get('/results/:id', calculatorController.getResult);
router.get('/leaderboard', calculatorController.getLeaderboard);

// ML Placeholder Route
router.post('/ml/predict', calculatorController.mlPredict);

// Tips Route
router.get('/tips', tipsController.getTips);

// Contact Route
router.post('/contact', contactController.submitContact);

module.exports = router;
