const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./utils/logger');
const userRoutes = require('./routes/users');
const objectStorage = require('./utils/objectStorage');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Routes
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, async () => {
  logger.info(`Server started on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });

  // Test object storage connection
  try {
    await objectStorage.testConnection();
  } catch (error) {
    logger.error('Object storage connection test failed', {
      error: error.message
    });
  }
});

module.exports = app; 