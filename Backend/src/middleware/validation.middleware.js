import { ApiError } from "../utils/apierror.js";
import mongoose from "mongoose";

// Sanitize input to prevent XSS
const sanitizeInput = (obj) => {
    if (typeof obj === 'string') {
        return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                 .replace(/javascript:/gi, '')
                 .replace(/on\w+\s*=/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[key] = sanitizeInput(value);
        }
        return sanitized;
    }
    return obj;
};

// Validate ObjectId
const validateObjectId = (id, fieldName = 'id') => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, `Invalid ${fieldName} format`);
    }
};

// Validate email format
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }
};

// Validate required fields
const validateRequiredFields = (data, requiredFields) => {
    const missingFields = [];
    
    for (const field of requiredFields) {
        if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
            missingFields.push(field);
        }
    }
    
    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
    }
};

// Input sanitization middleware
const sanitizeInputMiddleware = (req, res, next) => {
    req.body = sanitizeInput(req.body);
    req.query = sanitizeInput(req.query);
    req.params = sanitizeInput(req.params);
    next();
};

// Validate pagination parameters
const validatePagination = (req, res, next) => {
    const { page, limit } = req.query;
    
    if (page && (isNaN(page) || parseInt(page) < 1)) {
        throw new ApiError(400, "Page must be a positive integer");
    }
    
    if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
        throw new ApiError(400, "Limit must be between 1 and 100");
    }
    
    next();
};

export {
    sanitizeInput,
    validateObjectId,
    validateEmail,
    validateRequiredFields,
    sanitizeInputMiddleware,
    validatePagination
};