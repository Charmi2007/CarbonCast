Build the CarbonCast application according to the following requirements...

Build a complete production-ready full-stack web application called CarbonCast.

CarbonCast is a climate-tech platform that helps users estimate, visualize, and improve their annual carbon footprint.

Do NOT integrate Machine Learning at this stage.

Another team will provide the ML model later.

Instead, build the entire application so that the ML model can easily replace the placeholder calculation service.

------------------------------------------------
LANDING PAGE
------------------------------------------------

Include

• Professional Navbar
• CarbonCast Logo
• Hero Section
• Feature Cards
• Statistics Section
• How It Works Preview
• Testimonials
• Call-to-Action
• Newsletter Subscription
• Professional Footer

Hero Title

Estimate your annual carbon footprint in under a minute.

Hero Description

Understand your environmental impact with an intuitive carbon footprint calculator and personalized sustainability insights.

Buttons

Calculate My Footprint

Learn More

------------------------------------------------
CARBON FOOTPRINT CALCULATOR
------------------------------------------------

Build a professional multi-step form with validation and progress tracking.

Personal

• Name (Optional)
• Age (Optional)

Home

• Home Type
  Apartment
  Independent House
  Hostel
  PG

• Number of People

• Monthly Electricity Bill

• Number of ACs

• Daily AC Usage

Transportation

• Primary Transport

Car

Bike

Bus

Train

Metro

Walk

Cycle

• Weekly Distance

• Flights in Last 12 Months

Food

Diet

• Vegan

• Vegetarian

• Eggetarian

• Non-Vegetarian

• Chicken Meals Per Week

• Red Meat Meals Per Month

Lifestyle

• Online Shopping Orders

• New Clothes Bought

• Plastic Water Bottles Per Week

Button

Calculate My Carbon Footprint

------------------------------------------------
RESULTS DASHBOARD
------------------------------------------------

Display

• Estimated Annual Carbon Footprint

Example

3.8 tonnes CO₂/year

• Carbon Score

• Carbon Category

Low

Moderate

High

• Circular Progress Indicator

• Pie Chart

• Bar Chart

• Emission Breakdown

Transportation

Electricity

Food

Lifestyle

• Personalized Sustainability Recommendations

Examples

✓ Use public transport twice a week.

✓ Reduce AC usage by one hour.

✓ Walk for short trips.

✓ Replace disposable plastic bottles with reusable bottles.

Buttons

Download Report (Placeholder)

Share Results (Placeholder)

------------------------------------------------
LEADERBOARD
------------------------------------------------

Show Top Eco Performers

Columns

• Rank

• User

• Carbon Score

• Category

• Badge

Sample badges

🌱 Eco Beginner

🌿 Green Citizen

🌳 Sustainability Champion

🌍 Planet Protector

------------------------------------------------
MONTHLY ANALYTICS
------------------------------------------------

Show

• Monthly Comparison

• Carbon Trend Line Chart

• Reduction Percentage

• Highest Emission Source

• Progress Towards Goal

------------------------------------------------
SUSTAINABILITY TIPS
------------------------------------------------

Categories

• Energy

• Transportation

• Food

• Shopping

• Recycling

• Water Conservation

Each card should include

• Icon

• Title

• Description

• Estimated CO₂ Savings

------------------------------------------------
ABOUT
------------------------------------------------

Mission

Vision

Technology Stack

Future AI Integration

------------------------------------------------
HOW IT WORKS
------------------------------------------------

Create a professional timeline explaining how CarbonCast estimates carbon emissions.

------------------------------------------------
CONTACT
------------------------------------------------

Contact Form

Name

Email

Message

------------------------------------------------
FOOTER
------------------------------------------------

Quick Links

Privacy Policy

Terms & Conditions

GitHub

LinkedIn

Newsletter

------------------------------------------------
BACKEND
------------------------------------------------

Create modular REST APIs

POST /api/calculate

GET /api/results/:id

GET /api/leaderboard

GET /api/tips

POST /api/contact

Create a placeholder endpoint

POST /api/ml/predict

Return

{
  "message": "Machine Learning Integration Coming Soon"
}

Use dummy calculation logic for now.

------------------------------------------------
FINAL REQUIREMENTS
------------------------------------------------

Generate:

• Production-ready React frontend

• Production-ready Node.js backend

• MongoDB models

• Responsive layouts

• Clean architecture

• Modular codebase

• Modern UI

• Professional dashboards

• Responsive navigation

• Accessibility support

• Loading states

• Error handling

• Form validation

• Future-ready ML integration

The finished application should look and feel like a commercial climate-tech SaaS platform suitable for deployment and portfolio presentation.