import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// TODO: Install helmet for security headers: npm install helmet

const app = express();

// Start email worker
import "./controllers/Email/email.worker.js";

// Basic security headers (install helmet for more comprehensive security)
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true, // Fixed typo: Credential -> credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware with size limits
app.use(express.json({ limit: "10mb" })); // Increased for file uploads
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// Disable X-Powered-By header
app.disable('x-powered-by');

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// User routes
import userRouter from "./routes/user.routes.js";
app.use("/api/v1/User", userRouter);

// Project routes
import { Projectrouter } from './routes/project.route.js';
app.use("/api/v1/project", Projectrouter);

// Issue routes
import { issueRouter } from './routes/issue.route.js';
app.use("/api/v1/issue", issueRouter);

// 404 handler for unmatched routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(isDevelopment && { stack: err.stack })
    });
});

export default app;

