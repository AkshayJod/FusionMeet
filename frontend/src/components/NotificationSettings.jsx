import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControlLabel,
    Switch,
    Typography,
    Box,
    Divider,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Badge,
    Chip
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    Settings as SettingsIcon,
    Delete as DeleteIcon,
    MarkEmailRead as MarkReadIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useNotifications } from '../hooks/useNotifications';
import { useNotification } from './NotificationSystem';

const NotificationSettings = ({ open, onClose }) => {
    const [settings, setSettings] = useState({
        browserNotifications: false,
        meetingReminders: true,
        participantUpdates: true,
        chatMessages: true,
        systemNotifications: true
    });
    const [showNotificationList, setShowNotificationList] = useState(false);
    
    const {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        requestNotificationPermission
    } = useNotifications();
    
    const { showSuccess, showError } = useNotification();

    useEffect(() => {
        // Load settings from localStorage
        const savedSettings = localStorage.getItem('notificationSettings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
        
        // Check browser notification permission
        if ('Notification' in window) {
            setSettings(prev => ({
                ...prev,
                browserNotifications: Notification.permission === 'granted'
            }));
        }
    }, []);

    const handleSettingChange = async (setting) => {
        const newValue = !settings[setting];
        
        if (setting === 'browserNotifications' && newValue) {
            const granted = await requestNotificationPermission();
            if (!granted) {
                showError('Browser notifications permission denied');
                return;
            }
        }
        
        const newSettings = {
            ...settings,
            [setting]: newValue
        };
        
        setSettings(newSettings);
        localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
        
        showSuccess(`${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} ${newValue ? 'enabled' : 'disabled'}`);
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            showSuccess('All notifications marked as read');
        } catch (error) {
            showError('Failed to mark notifications as read');
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            await deleteNotification(notificationId);
            showSuccess('Notification deleted');
        } catch (error) {
            showError('Failed to delete notification');
        }
    };

    const formatNotificationTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'meeting_reminder':
            case 'meeting_started':
            case 'meeting_ended':
                return '📅';
            case 'participant_joined':
            case 'participant_left':
                return '👥';
            case 'chat_message':
                return '💬';
            case 'file_shared':
                return '📎';
            default:
                return '🔔';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'error';
            case 'high': return 'warning';
            case 'medium': return 'info';
            case 'low': return 'default';
            default: return 'default';
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: { minHeight: '500px' }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsIcon />
                Notification Settings
                {unreadCount > 0 && (
                    <Badge badgeContent={unreadCount} color="error" sx={{ ml: 1 }} />
                )}
            </DialogTitle>
            
            <DialogContent>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Notification Preferences
                    </Typography>
                    
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings.browserNotifications}
                                onChange={() => handleSettingChange('browserNotifications')}
                            />
                        }
                        label="Browser Notifications"
                    />
                    
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings.meetingReminders}
                                onChange={() => handleSettingChange('meetingReminders')}
                            />
                        }
                        label="Meeting Reminders"
                    />
                    
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings.participantUpdates}
                                onChange={() => handleSettingChange('participantUpdates')}
                            />
                        }
                        label="Participant Updates"
                    />
                    
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings.chatMessages}
                                onChange={() => handleSettingChange('chatMessages')}
                            />
                        }
                        label="Chat Messages"
                    />
                    
                    <FormControlLabel
                        control={
                            <Switch
                                checked={settings.systemNotifications}
                                onChange={() => handleSettingChange('systemNotifications')}
                            />
                        }
                        label="System Notifications"
                    />
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                        Recent Notifications ({notifications.length})
                    </Typography>
                    <Box>
                        <Button
                            startIcon={<MarkReadIcon />}
                            onClick={handleMarkAllAsRead}
                            disabled={unreadCount === 0}
                            size="small"
                        >
                            Mark All Read
                        </Button>
                    </Box>
                </Box>

                {notifications.length === 0 ? (
                    <Alert severity="info">No notifications yet</Alert>
                ) : (
                    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {notifications.slice(0, 10).map((notification) => (
                            <ListItem
                                key={notification.id}
                                sx={{
                                    bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                                    borderRadius: 1,
                                    mb: 1,
                                    cursor: 'pointer'
                                }}
                                onClick={() => !notification.isRead && markAsRead(notification.id)}
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <span>{getNotificationIcon(notification.type)}</span>
                                            <Typography variant="subtitle2">
                                                {notification.title}
                                            </Typography>
                                            <Chip
                                                label={notification.priority}
                                                size="small"
                                                color={getPriorityColor(notification.priority)}
                                                variant="outlined"
                                            />
                                        </Box>
                                    }
                                    secondary={
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {notification.message}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatNotificationTime(notification.createdAt)}
                                            </Typography>
                                        </Box>
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <IconButton
                                        edge="end"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteNotification(notification.id);
                                        }}
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
            
            <DialogActions>
                <Button onClick={onClose} startIcon={<CloseIcon />}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NotificationSettings;
