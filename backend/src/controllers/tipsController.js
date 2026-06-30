const catchAsync = require('../middlewares/catchAsync');

exports.getTips = catchAsync(async (req, res, next) => {
  const tips = [
    { id: 1, category: 'Energy', title: 'Switch to LEDs', description: 'Replace incandescent bulbs with LEDs to save up to 80% on lighting energy.', saving: '150kg CO₂/yr' },
    { id: 2, category: 'Transportation', title: 'Carpooling', description: 'Share a ride to work twice a week to significantly cut down emissions.', saving: '300kg CO₂/yr' },
    { id: 3, category: 'Food', title: 'Meatless Mondays', description: 'Skipping meat one day a week can have a massive environmental impact.', saving: '100kg CO₂/yr' },
    { id: 4, category: 'Recycling', title: 'Compost Waste', description: 'Compost organic waste to reduce methane emissions from landfills.', saving: '50kg CO₂/yr' },
    { id: 5, category: 'Shopping', title: 'Buy Local', description: 'Purchase locally sourced goods to reduce transportation emissions.', saving: '75kg CO₂/yr' },
  ];

  res.status(200).json({
    status: 'success',
    data: {
      tips
    }
  });
});
