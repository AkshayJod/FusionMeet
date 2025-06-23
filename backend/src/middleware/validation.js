import httpStatus from "http-status";

// Validation helper functions
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidPassword = (password) => {
    // At least 6 characters
    return password && password.length >= 6;
};

const isValidUsername = (username) => {
    // At least 3 characters, alphanumeric and underscore only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
};

const isValidName = (name) => {
    // At least 2 characters, letters and spaces only
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name);
};

// Validation middleware for user registration
export const validateRegistration = (req, res, next) => {
    const { name, username, password } = req.body;
    const errors = [];

    if (!name || !name.trim()) {
        errors.push('Name is required');
    } else if (!isValidName(name.trim())) {
        errors.push('Name must be 2-50 characters long and contain only letters and spaces');
    }

    if (!username || !username.trim()) {
        errors.push('Username is required');
    } else if (!isValidUsername(username.trim())) {
        errors.push('Username must be 3-20 characters long and contain only letters, numbers, and underscores');
    }

    if (!password) {
        errors.push('Password is required');
    } else if (!isValidPassword(password)) {
        errors.push('Password must be at least 6 characters long');
    }

    if (errors.length > 0) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
};

// Validation middleware for user login
export const validateLogin = (req, res, next) => {
    const { username, password } = req.body;
    const errors = [];

    if (!username || !username.trim()) {
        errors.push('Username is required');
    }

    if (!password) {
        errors.push('Password is required');
    }

    if (errors.length > 0) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
};

// Validation middleware for meeting creation
export const validateMeetingCreation = (req, res, next) => {
    const { meeting_title, scheduled_time } = req.body;
    const errors = [];

    if (!meeting_title || !meeting_title.trim()) {
        errors.push('Meeting title is required');
    } else if (meeting_title.trim().length > 100) {
        errors.push('Meeting title must be less than 100 characters');
    }

    if (scheduled_time) {
        const scheduledDate = new Date(scheduled_time);
        if (isNaN(scheduledDate.getTime())) {
            errors.push('Invalid scheduled time format');
        } else if (scheduledDate <= new Date()) {
            errors.push('Scheduled time must be in the future');
        }
    }

    if (errors.length > 0) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
};

// Validation middleware for meeting code
export const validateMeetingCode = (req, res, next) => {
    const { meeting_code } = req.body;
    const errors = [];

    if (!meeting_code || !meeting_code.trim()) {
        errors.push('Meeting code is required');
    }

    if (errors.length > 0) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
};

// Token validation middleware
export const validateToken = (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            success: false,
            message: 'Access token is required'
        });
    }

    req.token = token;
    next();
};
