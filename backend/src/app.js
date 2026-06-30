const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes (To be created)
const routes = require('./routes/api');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running smoothly.' });
});

app.use('/api/v1', routes);

// Handle undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
