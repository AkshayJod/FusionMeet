import httpStatus from "http-status";
import { Notification } from '../models/notification.model.js';
import { User } from '../models/user.model.js';
import { Meeting } from '../models/meeting.model.js';
import crypto from "crypto";

// Verify token helper function
const verifyToken = async (token) => {
    try {
        const user = await User.findOne({ token: token });
        return user;
    } catch (error) {
        return null;
    }
};

// Create a new notification
const createNotification = async (req, res) => {
    const { token, type, title, message, data, priority, scheduledFor, expiresAt } = req.body;

    try {
        const user = await verifyToken(token);
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
        }

        const notification = new Notification({
            userId: user._id,
            type,
            title,
            message,
            data: data || {},
            priority: priority || 'medium',
            scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined
        });

        await notification.save();

        // Emit real-time notification via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.to(`user_${user._id}`).emit('new-notification', {
                id: notification._id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                data: notification.data,
                priority: notification.priority,
                createdAt: notification.createdAt
            });
        }

        res.status(httpStatus.CREATED).json({
            message: "Notification created successfully",
            notification: {
                id: notification._id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                priority: notification.priority,
                createdAt: notification.createdAt
            }
        });

    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: "Failed to create notification" 
        });
    }
};

// Get user notifications
const getUserNotifications = async (req, res) => {
    const { token } = req.query;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    try {
        const user = await verifyToken(token);
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
        }

        const query = { userId: user._id };
        if (unreadOnly === 'true') {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const totalCount = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({ 
            userId: user._id, 
            isRead: false 
        });

        res.status(httpStatus.OK).json({
            notifications,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
                unreadCount
            }
        });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: "Failed to fetch notifications" 
        });
    }
};

// Mark notification as read
const markAsRead = async (req, res) => {
    const { token, notificationId } = req.body;

    try {
        const user = await verifyToken(token);
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId: user._id },
            { 
                isRead: true, 
                readAt: new Date() 
            },
            { new: true }
        );

        if (!notification) {
            return res.status(httpStatus.NOT_FOUND).json({ 
                message: "Notification not found" 
            });
        }

        res.status(httpStatus.OK).json({
            message: "Notification marked as read",
            notification
        });

    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: "Failed to mark notification as read" 
        });
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    const { token } = req.body;

    try {
        const user = await verifyToken(token);
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
        }

        await Notification.updateMany(
            { userId: user._id, isRead: false },
            { 
                isRead: true, 
                readAt: new Date() 
            }
        );

        res.status(httpStatus.OK).json({
            message: "All notifications marked as read"
        });

    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: "Failed to mark all notifications as read" 
        });
    }
};

// Delete notification
const deleteNotification = async (req, res) => {
    const { notificationId } = req.params;
    const { token } = req.query;

    try {
        const user = await verifyToken(token);
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid token" });
        }

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            userId: user._id
        });

        if (!notification) {
            return res.status(httpStatus.NOT_FOUND).json({ 
                message: "Notification not found" 
            });
        }

        res.status(httpStatus.OK).json({
            message: "Notification deleted successfully"
        });

    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: "Failed to delete notification" 
        });
    }
};

// Helper function to create system notifications
const createSystemNotification = async (userId, type, title, message, data = {}) => {
    try {
        const notification = new Notification({
            userId,
            type,
            title,
            message,
            data,
            priority: 'medium'
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating system notification:', error);
        return null;
    }
};

export {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createSystemNotification
};
