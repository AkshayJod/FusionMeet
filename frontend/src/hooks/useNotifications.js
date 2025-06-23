import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../utils/apiClient';
import io from 'socket.io-client';
import server from '../environment';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [socket, setSocket] = useState(null);
    const { token, user } = useContext(AuthContext);

    // Initialize socket connection for real-time notifications
    useEffect(() => {
        if (token && user) {
            const socketConnection = io(server, {
                transports: ['websocket', 'polling']
            });

            socketConnection.on('connect', () => {
                // Authenticate user for notifications
                socketConnection.emit('authenticate-user', user._id);
            });

            // Listen for new notifications
            socketConnection.on('new-notification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
                
                // Show browser notification if permission granted
                if (Notification.permission === 'granted') {
                    new Notification(notification.title, {
                        body: notification.message,
                        icon: '/favicon.ico',
                        tag: notification.type
                    });
                }
            });

            setSocket(socketConnection);

            return () => {
                socketConnection.disconnect();
            };
        }
    }, [token, user]);

    // Request browser notification permission
    const requestNotificationPermission = useCallback(async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return Notification.permission === 'granted';
    }, []);

    // Fetch notifications from server
    const fetchNotifications = useCallback(async (page = 1, unreadOnly = false) => {
        if (!token) return;

        setLoading(true);
        try {
            const response = await api.notifications.getAll({
                page,
                limit: 20,
                unreadOnly
            });

            if (page === 1) {
                setNotifications(response.data.notifications);
            } else {
                setNotifications(prev => [...prev, ...response.data.notifications]);
            }
            
            setUnreadCount(response.data.pagination.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId) => {
        if (!token) return;

        try {
            await api.notifications.markAsRead(notificationId);
            
            setNotifications(prev => 
                prev.map(notification => 
                    notification.id === notificationId 
                        ? { ...notification, isRead: true, readAt: new Date() }
                        : notification
                )
            );
            
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, [token]);

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        if (!token) return;

        try {
            await api.notifications.markAllAsRead();
            
            setNotifications(prev => 
                prev.map(notification => ({ 
                    ...notification, 
                    isRead: true, 
                    readAt: new Date() 
                }))
            );
            
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }, [token]);

    // Delete notification
    const deleteNotification = useCallback(async (notificationId) => {
        if (!token) return;

        try {
            await api.notifications.delete(notificationId);
            
            setNotifications(prev => 
                prev.filter(notification => notification.id !== notificationId)
            );
            
            // Update unread count if the deleted notification was unread
            const deletedNotification = notifications.find(n => n.id === notificationId);
            if (deletedNotification && !deletedNotification.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }, [token, notifications]);

    // Send notification to other users (for meeting events)
    const sendNotification = useCallback((targetUserId, type, title, message, data = {}) => {
        if (socket) {
            socket.emit('send-notification', {
                targetUserId,
                type,
                title,
                message,
                notificationData: data
            });
        }
    }, [socket]);

    // Initialize notifications on mount
    useEffect(() => {
        if (token) {
            fetchNotifications();
            requestNotificationPermission();
        }
    }, [token, fetchNotifications, requestNotificationPermission]);

    return {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        sendNotification,
        requestNotificationPermission
    };
};
