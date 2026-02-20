/**
 * Security Middleware
 * Handles CORS, rate limiting, and HTTP security headers
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Configure CORS with whitelist
 */
function setupCors() {
    return cors({
        origin: function(origin, callback) {
            const allowedOrigins = config.ALLOWED_ORIGINS;

            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            if (allowedOrigins.indexOf(origin) > -1 || allowedOrigins.includes('*')) {
                callback(null, true);
            } else {
                logger.warn('CORS blocked request from unauthorized origin', { origin });
                callback(new Error('CORS policy: Origin not allowed'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
        maxAge: 86400  // 24 hours
    });
}

/**
 * Helmet middleware for security headers
 */
function setupHelmet() {
    return helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.tailwindcss.com', 'https://cdnjs.cloudflare.com'],
                styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com'],
                imgSrc: ["'self'", 'data:', 'https:'],
                fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
                connectSrc: ["'self'", 'http://localhost:3000', 'https://*.vercel.app'],
            }
        },
        hsts: {
            maxAge: 31536000,  // 1 year
            includeSubDomains: true,
            preload: true
        },
        frameguard: { action: 'DENY' },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    });
}

/**
 * Global rate limiter (100 requests per 15 minutes)
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100,  // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,  // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
    skip: (req) => {
        // Don't count health checks
        return req.path === '/health';
    },
    handler: (req, res) => {
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            method: req.method
        });
        res.status(429).json({
            success: false,
            message: 'Too many requests, please try again later'
        });
    }
});

/**
 * Strict rate limiter for login endpoints (5 requests per 15 minutes)
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 5,  // 5 attempts per 15 minutes
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: false,  // Count all requests including successful ones
    handler: (req, res) => {
        logger.warn('Login rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            username: req.body.username || req.body.phone
        });
        res.status(429).json({
            success: false,
            message: 'Too many login attempts, please try again in 15 minutes'
        });
    }
});

/**
 * Middleware to add security headers
 */
function securityHeaders(req, res, next) {
    // Disable X-Powered-By header
    res.removeHeader('X-Powered-By');

    // Add security headers (CSP is already handled by Helmet)
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    next();
}

/**
 * Request logging middleware
 */
function requestLogger(req, res, next) {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

        logger[logLevel]('HTTP Request', {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userId: req.user?.userId || 'anonymous'
        });
    });

    next();
}

module.exports = {
    setupCors,
    setupHelmet,
    globalLimiter,
    loginLimiter,
    securityHeaders,
    requestLogger
};
