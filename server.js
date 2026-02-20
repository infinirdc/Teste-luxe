/**
 * Server Entry Point
 * Starts the Express application
 */

require('dotenv').config();
const { createApp } = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';

/**
 * Start server
 */
async function startServer() {
    try {
        const app = await createApp();

        app.listen(PORT, () => {
            logger.info(`✓ Server running on port ${PORT} (${NODE_ENV} mode)`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('SIGTERM received, shutting down gracefully');
            process.exit(0);
        });

    } catch (error) {
        logger.error('Failed to start server', {
            error: error.message,
            stack: error.stack
        });
        process.exit(1);
    }
}

startServer();
