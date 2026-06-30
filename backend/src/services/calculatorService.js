/**
 * Dummy calculation logic.
 * Designed to be easily replaced by ML models in the future.
 */
exports.calculateFootprint = (data) => {
  // Dummy logic for calculating footprint
  let total = 0;
  let breakdown = {
    transportation: 0,
    electricity: 0,
    food: 0,
    lifestyle: 0
  };

  // Home/Electricity
  if (data.home) {
    breakdown.electricity += (data.home.electricityBill || 0) * 0.05;
    breakdown.electricity += (data.home.acUsageDaily || 0) * (data.home.acCount || 0) * 0.1;
  }

  // Transportation
  if (data.transportation) {
    const transportMultipliers = { Car: 0.2, Bike: 0.1, Bus: 0.05, Train: 0.02, Metro: 0.02, Walk: 0, Cycle: 0 };
    const transport = data.transportation.primaryTransport || 'Walk';
    breakdown.transportation += (data.transportation.weeklyDistance || 0) * (transportMultipliers[transport] || 0) * 52;
    breakdown.transportation += (data.transportation.flightsYearly || 0) * 0.5;
  }

  // Food
  if (data.food) {
    const dietBase = { Vegan: 1.5, Vegetarian: 1.7, Eggetarian: 1.8, 'Non-Vegetarian': 2.5 };
    breakdown.food += dietBase[data.food.diet || 'Vegan'];
    breakdown.food += (data.food.chickenMealsWeekly || 0) * 0.05 * 52;
    breakdown.food += (data.food.redMeatMealsMonthly || 0) * 0.2 * 12;
  }

  // Lifestyle
  if (data.lifestyle) {
    breakdown.lifestyle += (data.lifestyle.onlineShoppingMonthly || 0) * 0.02 * 12;
    breakdown.lifestyle += (data.lifestyle.newClothesMonthly || 0) * 0.05 * 12;
    breakdown.lifestyle += (data.lifestyle.plasticBottlesWeekly || 0) * 0.01 * 52;
  }

  total = breakdown.transportation + breakdown.electricity + breakdown.food + breakdown.lifestyle;
  
  // Normalize total to reasonable Tonnes per year scale (e.g. 1-20)
  total = parseFloat((total / 100).toFixed(2));
  if (total < 1) total = 1.2;

  let category = 'Moderate';
  let score = 50;
  
  if (total < 3) {
    category = 'Low';
    score = 85;
  } else if (total > 8) {
    category = 'High';
    score = 30;
  } else {
    score = 100 - (total * 5); // Rough score 
  }

  const recommendations = [];
  if (breakdown.transportation > 200) recommendations.push('Use public transport twice a week.');
  if (breakdown.electricity > 100) recommendations.push('Reduce AC usage by one hour.');
  if (data.transportation?.primaryTransport === 'Car') recommendations.push('Walk or cycle for short trips.');
  if (data.lifestyle?.plasticBottlesWeekly > 0) recommendations.push('Replace disposable plastic bottles with reusable bottles.');
  if (recommendations.length === 0) recommendations.push('Great job maintaining a low carbon footprint!');

  // Formatting breakdown to percentage or normalized values
  const normalize = (val) => parseFloat(((val / 100) / total).toFixed(2)) || 0;

  return {
    totalCarbonFootprint: total,
    carbonScore: Math.round(score),
    category,
    breakdown: {
      transportation: normalize(breakdown.transportation),
      electricity: normalize(breakdown.electricity),
      food: normalize(breakdown.food),
      lifestyle: normalize(breakdown.lifestyle),
    },
    recommendations
  };
};
