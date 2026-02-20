/**
 * MongoDB connection configuration
 * Handles connection lifecycle with logging and error handling
 */

const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

async function connectDB() {
    try {
        logger.info('Starting MongoDB connection...', { uri: config.MONGODB_URI.substring(0, 50) + '...' });

        const conn = await mongoose.connect(config.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            retryWrites: true,
            w: 'majority',
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });

        logger.info('✓ MongoDB connected successfully', {
            host: conn.connection.host,
            db: conn.connection.name
        });

        return conn;
    } catch (error) {
        logger.error('✗ MongoDB connection failed', {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}

// Connection event handlers
mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error', {
        error: err.message,
        stack: err.stack
    });
});

mongoose.connection.on('reconnected', () => {
    logger.info('✓ MongoDB reconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    logger.info('SIGINT received, closing MongoDB connection...');
    await mongoose.connection.close();
    process.exit(0);
});

module.exports = { connectDB };
