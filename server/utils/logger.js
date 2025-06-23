const winston = require('winston');

// Define logging format
const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} ${level}: ${message}`;
    })
);

// Create and configure the logger
const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new winston.transports.Console({ level: 'info' }),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
    ],
});

module.exports = logger;
