import { Router } from "express";
import {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from "../controllers/notification.controller.js";
import { validateToken } from "../middleware/validation.js";

const router = Router();

// Create a new notification
router.route("/create").post(validateToken, createNotification);

// Get user notifications
router.route("/").get(validateToken, getUserNotifications);

// Mark notification as read
router.route("/mark-read").post(validateToken, markAsRead);

// Mark all notifications as read
router.route("/mark-all-read").post(validateToken, markAllAsRead);

// Delete notification
router.route("/:notificationId").delete(validateToken, deleteNotification);

export default router;
