/**
 * Winston Logger Configuration
 * Structured logging for application events and errors
 */

const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Create logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'opulence-api' },
    transports: [
        // Console transport
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ level, message, timestamp, ...meta }) => {
                    let log = `${timestamp} [${level}]: ${message}`;
                    if (Object.keys(meta).length > 0) {
                        log += ` ${JSON.stringify(meta)}`;
                    }
                    return log;
                })
            )
        })
    ]
});

// Add file transports only in production or if LOG_FILES=true
if (process.env.NODE_ENV === 'production' || process.env.LOG_FILES === 'true') {
    logger.add(
        new winston.transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error',
            maxsize: 5242880,  // 5MB
            maxFiles: 5
        })
    );

    logger.add(
        new winston.transports.File({
            filename: path.join('logs', 'app.log'),
            maxsize: 5242880,  // 5MB
            maxFiles: 10
        })
    );
}

module.exports = logger;
