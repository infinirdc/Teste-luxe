/**
 * Environment variables validation and configuration
 * Ensures all required env vars are set before app starts
 */

function validateEnv() {
    const required = ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            'Please set them in .env file or Vercel environment settings'
        );
    }

    // Validate formats
    if (!process.env.MONGODB_URI.includes('mongodb')) {
        throw new Error('MONGODB_URI must be a valid MongoDB connection string');
    }

    if (process.env.JWT_SECRET.length < 32) {
        console.warn('⚠️  Warning: JWT_SECRET is too short (< 32 chars), use at least 32 characters');
    }

    return {
        MONGODB_URI: process.env.MONGODB_URI,
        JWT_SECRET: process.env.JWT_SECRET,
        ADMIN_USERNAME: process.env.ADMIN_USERNAME,
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
        ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost', 'https://localhost'],
        NODE_ENV: process.env.NODE_ENV || 'production',
        PORT: process.env.PORT || 3000
    };
}

// Validate immediately when imported
const config = validateEnv();

module.exports = config;
