import { ApiError } from "../utils/apierror.js";

// Simple in-memory rate limiter (for production, use Redis)
const requestCounts = new Map();
const WINDOW_SIZE = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // Max requests per window

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of requestCounts.entries()) {
        if (now - data.windowStart > WINDOW_SIZE) {
            requestCounts.delete(key);
        }
    }
}, 5 * 60 * 1000);

const rateLimiter = (maxRequests = MAX_REQUESTS, windowMs = WINDOW_SIZE) => {
    return (req, res, next) => {
        const identifier = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        if (!requestCounts.has(identifier)) {
            requestCounts.set(identifier, {
                count: 1,
                windowStart: now
            });
            return next();
        }
        
        const requestData = requestCounts.get(identifier);
        
        // Reset window if expired
        if (now - requestData.windowStart > windowMs) {
            requestData.count = 1;
            requestData.windowStart = now;
            return next();
        }
        
        // Check if limit exceeded
        if (requestData.count >= maxRequests) {
            throw new ApiError(429, "Too many requests, please try again later");
        }
        
        requestData.count++;
        next();
    };
};

// Stricter rate limiting for auth endpoints
const authRateLimiter = rateLimiter(10, 15 * 60 * 1000); // 10 requests per 15 minutes
const generalRateLimiter = rateLimiter(100, 15 * 60 * 1000); // 100 requests per 15 minutes

export { rateLimiter, authRateLimiter, generalRateLimiter };