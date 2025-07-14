const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import object storage utility
const objectStorage = require('./objectStorage');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for log entries
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += ` | ${JSON.stringify(meta)}`;
    }
    
    return log;
  })
);

// Console transport for development
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
});

// File transport with configurable rotation duration
const rotationDuration = process.env.LOG_ROTATION_DURATION || 60; // minutes, default 60
const fileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD-HH:mm',
  zippedArchive: false, // Disable compression
  maxSize: '20m',
  maxFiles: '14d', // Keep logs for 14 days
  format: logFormat,
  level: 'info',
  frequency: `${rotationDuration}m` // Rotate every N minutes
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    fileTransport
  ],
  // Don't exit on error
  exitOnError: false
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(consoleTransport);
}

// Handle rotation events and upload to object storage
fileTransport.on('rotate', async (oldFilename, newFilename) => {
  logger.info('Log file rotated', {
    oldFile: oldFilename,
    newFile: newFilename,
    timestamp: new Date().toISOString()
  });

  // Upload the rotated file to object storage
  // Since compression is disabled, oldFilename points to the .log file
  if (oldFilename && fs.existsSync(oldFilename)) {
    try {
      const success = await objectStorage.uploadRotatedLog(oldFilename);
      if (success) {
        logger.info('Rotated log file uploaded to object storage', {
          file: oldFilename
        });
      }
    } catch (error) {
      logger.error('Failed to upload rotated log file', {
        file: oldFilename,
        error: error.message
      });
    }
  } else {
    logger.warn('Rotated log file not found for upload', {
      oldFile: oldFilename,
      exists: oldFilename ? fs.existsSync(oldFilename) : false
    });
  }
});

module.exports = logger; 