import httpStatus from "http-status";

// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error
    let error = {
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal Server Error'
    };

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        error = {
            statusCode: httpStatus.BAD_REQUEST,
            message: messages.join(', ')
        };
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        error = {
            statusCode: httpStatus.CONFLICT,
            message: `${field} already exists`
        };
    }

    // Mongoose cast error
    if (err.name === 'CastError') {
        error = {
            statusCode: httpStatus.BAD_REQUEST,
            message: 'Invalid ID format'
        };
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = {
            statusCode: httpStatus.UNAUTHORIZED,
            message: 'Invalid token'
        };
    }

    if (err.name === 'TokenExpiredError') {
        error = {
            statusCode: httpStatus.UNAUTHORIZED,
            message: 'Token expired'
        };
    }

    res.status(error.statusCode).json({
        success: false,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// Async error handler wrapper
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler
export const notFound = (req, res, next) => {
    const error = new Error(`Not found - ${req.originalUrl}`);
    res.status(httpStatus.NOT_FOUND);
    next(error);
};
