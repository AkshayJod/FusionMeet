import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    Snackbar,
    Alert,
    AlertTitle,
    Slide,
    IconButton,
    Badge,
    Fab,
    Box
} from '@mui/material';
import {
    Close as CloseIcon,
    Notifications as NotificationsIcon
} from '@mui/icons-material';
import NotificationSettings from './NotificationSettings';

// Notification Context
const NotificationContext = createContext();

// Transition component for slide animation
function SlideTransition(props) {
    return <Slide {...props} direction="up" />;
}

// Notification Provider Component
export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((notification) => {
        const id = Date.now() + Math.random();
        const newNotification = {
            id,
            severity: 'info',
            autoHideDuration: 6000,
            ...notification,
        };

        setNotifications(prev => [...prev, newNotification]);

        // Auto remove notification
        if (newNotification.autoHideDuration) {
            setTimeout(() => {
                removeNotification(id);
            }, newNotification.autoHideDuration);
        }

        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const showSuccess = useCallback((message, options = {}) => {
        return addNotification({
            message,
            severity: 'success',
            ...options
        });
    }, [addNotification]);

    const showError = useCallback((message, options = {}) => {
        return addNotification({
            message,
            severity: 'error',
            autoHideDuration: 8000, // Longer for errors
            ...options
        });
    }, [addNotification]);

    const showWarning = useCallback((message, options = {}) => {
        return addNotification({
            message,
            severity: 'warning',
            ...options
        });
    }, [addNotification]);

    const showInfo = useCallback((message, options = {}) => {
        return addNotification({
            message,
            severity: 'info',
            ...options
        });
    }, [addNotification]);

    const value = {
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            
            {/* Render notifications */}
            {notifications.map((notification, index) => (
                <Snackbar
                    key={notification.id}
                    open={true}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    TransitionComponent={SlideTransition}
                    style={{
                        marginBottom: index * 70, // Stack notifications
                    }}
                >
                    <Alert
                        severity={notification.severity}
                        variant="filled"
                        action={
                            <IconButton
                                size="small"
                                aria-label="close"
                                color="inherit"
                                onClick={() => removeNotification(notification.id)}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        }
                        sx={{
                            minWidth: 300,
                            maxWidth: 500,
                        }}
                    >
                        {notification.title && (
                            <AlertTitle>{notification.title}</AlertTitle>
                        )}
                        {notification.message}
                    </Alert>
                </Snackbar>
            ))}
        </NotificationContext.Provider>
    );
};

// Hook to use notifications
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

// Helper function to handle API errors
export const handleApiError = (error, showError) => {
    console.error('API Error:', error);
    
    if (error.type === 'network') {
        showError('Network error. Please check your connection.');
    } else if (error.type === 'validation' && error.errors?.length > 0) {
        showError(error.errors.join(', '));
    } else {
        showError(error.message || 'An unexpected error occurred');
    }
};

// Notification Bell Component
export const NotificationBell = () => {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <>
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    zIndex: 1000
                }}
            >
                <Fab
                    color="primary"
                    onClick={() => setShowSettings(true)}
                    sx={{
                        bgcolor: 'primary.main',
                        '&:hover': {
                            bgcolor: 'primary.dark'
                        }
                    }}
                >
                    <Badge badgeContent={0} color="error">
                        <NotificationsIcon />
                    </Badge>
                </Fab>
            </Box>

            <NotificationSettings
                open={showSettings}
                onClose={() => setShowSettings(false)}
            />
        </>
    );
};

// Main NotificationSystem component that renders notifications
const NotificationSystem = () => {
    return null; // This component doesn't render anything itself
};

export default NotificationSystem;
