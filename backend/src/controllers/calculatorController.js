const CarbonRecord = require('../models/CarbonRecord');
const calculatorService = require('../services/calculatorService');
const catchAsync = require('../middlewares/catchAsync');

exports.calculate = catchAsync(async (req, res, next) => {
  const data = req.body;
  
  // 1. Process data through placeholder ML service
  const results = calculatorService.calculateFootprint(data);
  
  // 2. Save record to DB
  const newRecord = await CarbonRecord.create({
    ...data,
    results
  });

  // 3. Return results
  res.status(201).json({
    status: 'success',
    data: {
      record: newRecord
    }
  });
});

exports.getResult = catchAsync(async (req, res, next) => {
  const record = await CarbonRecord.findById(req.params.id);
  
  if (!record) {
    return res.status(404).json({ status: 'error', message: 'Record not found' });
  }

  res.status(200).json({
    status: 'success',
    data: {
      record
    }
  });
});

exports.getLeaderboard = catchAsync(async (req, res, next) => {
  // Dummy leaderboard data for now
  const leaderboard = [
    { rank: 1, user: 'EcoWarrior', score: 95, category: 'Low', badge: '🌍 Planet Protector' },
    { rank: 2, user: 'GreenLife', score: 90, category: 'Low', badge: '🌳 Sustainability Champion' },
    { rank: 3, user: 'Jane Doe', score: 85, category: 'Low', badge: '🌿 Green Citizen' },
    { rank: 4, user: 'John S', score: 70, category: 'Moderate', badge: '🌱 Eco Beginner' },
  ];

  res.status(200).json({
    status: 'success',
    data: {
      leaderboard
    }
  });
});

exports.mlPredict = catchAsync(async (req, res, next) => {
  res.status(200).json({
    message: "Machine Learning Integration Coming Soon"
  });
});
