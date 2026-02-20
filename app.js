/**
 * Express Application Setup
 * Initializes and configures the Express app
 */

const express = require('express');
const { connectDB } = require('./config/db');
const config = require('./config/env');
const logger = require('./utils/logger');

// Middleware imports
const {
    setupCors,
    setupHelmet,
    globalLimiter,
    securityHeaders,
    requestLogger
} = require('./middleware/security');

const {
    errorHandler,
    notFoundHandler
} = require('./middleware/errorHandler');

// Routes imports
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const statsRoutes = require('./routes/stats');

/**
 * Create and configure Express app
 */
async function createApp() {
    const app = express();

    // Connect to MongoDB
    try {
        await connectDB();
    } catch (error) {
        logger.error('Failed to connect to MongoDB', { error: error.message });
        throw error;
    }

    // Trust proxy (for Vercel and other reverse proxies)
    app.set('trust proxy', 1);

    // Body parser middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ limit: '10mb', extended: true }));

    // Security middleware
    app.use(setupCors());
    app.use(setupHelmet());
    app.use(securityHeaders);
    app.use(globalLimiter);

    // Logging middleware
    app.use(requestLogger);

    // Health check endpoint (public, no logging)
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/stats', statsRoutes);

    // 404 handler (must be before error handler)
    app.use(notFoundHandler);

    // Error handler (must be last)
    app.use(errorHandler);

    logger.info('Express app created and configured successfully');

    return app;
}

module.exports = { createApp };
