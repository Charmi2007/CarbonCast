const mongoose = require('mongoose');

const carbonRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  personal: {
    name: String,
    age: Number
  },
  home: {
    homeType: { type: String, enum: ['Apartment', 'Independent House', 'Hostel', 'PG'] },
    peopleCount: Number,
    electricityBill: Number,
    acCount: Number,
    acUsageDaily: Number
  },
  transportation: {
    primaryTransport: { type: String, enum: ['Car', 'Bike', 'Bus', 'Train', 'Metro', 'Walk', 'Cycle'] },
    weeklyDistance: Number,
    flightsYearly: Number
  },
  food: {
    diet: { type: String, enum: ['Vegan', 'Vegetarian', 'Eggetarian', 'Non-Vegetarian'] },
    chickenMealsWeekly: Number,
    redMeatMealsMonthly: Number
  },
  lifestyle: {
    onlineShoppingMonthly: Number,
    newClothesMonthly: Number,
    plasticBottlesWeekly: Number
  },
  results: {
    totalCarbonFootprint: Number, // In tonnes CO2/year
    carbonScore: Number,
    category: { type: String, enum: ['Low', 'Moderate', 'High'] },
    breakdown: {
      transportation: Number,
      electricity: Number,
      food: Number,
      lifestyle: Number
    },
    recommendations: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CarbonRecord', carbonRecordSchema);
