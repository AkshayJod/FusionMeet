import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Button,
    Grid,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Tooltip,
    Badge
} from '@mui/material';
import {
    ChevronLeft,
    ChevronRight,
    Today,
    Event,
    Schedule,
    People,
    VideoCall,
    Add as AddIcon
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../utils/apiClient';
import { useNotification } from './NotificationSystem';
import MeetingScheduler from './MeetingScheduler';

const CalendarView = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [meetings, setMeetings] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [dayMeetings, setDayMeetings] = useState([]);
    const [showDayDialog, setShowDayDialog] = useState(false);
    const [showScheduler, setShowScheduler] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const { showError, showSuccess } = useNotification();
    const { token } = useContext(AuthContext);

    // Get calendar data
    const fetchMeetings = async () => {
        if (!token) return;
        
        setLoading(true);
        try {
            const response = await api.meetings.getHistory();
            setMeetings(response.data || []);
        } catch (error) {
            showError('Failed to fetch meetings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, [token]);

    // Calendar navigation
    const navigateMonth = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + direction);
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Get days in month
    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }
        
        return days;
    };

    // Get meetings for a specific date
    const getMeetingsForDate = (date) => {
        if (!date) return [];
        
        return meetings.filter(meeting => {
            const meetingDate = new Date(meeting.scheduledTime || meeting.date);
            return (
                meetingDate.getDate() === date.getDate() &&
                meetingDate.getMonth() === date.getMonth() &&
                meetingDate.getFullYear() === date.getFullYear()
            );
        });
    };

    // Handle day click
    const handleDayClick = (date) => {
        if (!date) return;
        
        const dayMeetings = getMeetingsForDate(date);
        setSelectedDate(date);
        setDayMeetings(dayMeetings);
        setShowDayDialog(true);
    };

    // Format time
    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Get meeting status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'primary';
            case 'active': return 'success';
            case 'completed': return 'default';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    // Check if date is today
    const isToday = (date) => {
        if (!date) return false;
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                {/* Calendar Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h4" component="h1">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </Typography>
                        <Button
                            startIcon={<Today />}
                            onClick={goToToday}
                            variant="outlined"
                            size="small"
                        >
                            Today
                        </Button>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                            startIcon={<AddIcon />}
                            onClick={() => setShowScheduler(true)}
                            variant="contained"
                            color="primary"
                        >
                            Schedule Meeting
                        </Button>
                        <IconButton onClick={() => navigateMonth(-1)}>
                            <ChevronLeft />
                        </IconButton>
                        <IconButton onClick={() => navigateMonth(1)}>
                            <ChevronRight />
                        </IconButton>
                    </Box>
                </Box>

                {/* Calendar Grid */}
                <Grid container spacing={1}>
                    {/* Day headers */}
                    {dayNames.map(day => (
                        <Grid item xs key={day} sx={{ textAlign: 'center' }}>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ p: 1 }}>
                                {day}
                            </Typography>
                        </Grid>
                    ))}
                    
                    {/* Calendar days */}
                    {getDaysInMonth().map((date, index) => {
                        const dayMeetings = getMeetingsForDate(date);
                        const hasEvents = dayMeetings.length > 0;
                        
                        return (
                            <Grid item xs key={index} sx={{ aspectRatio: '1', minHeight: 100 }}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        cursor: date ? 'pointer' : 'default',
                                        bgcolor: date ? (isToday(date) ? 'primary.light' : 'background.paper') : 'transparent',
                                        border: date && isToday(date) ? 2 : 1,
                                        borderColor: date && isToday(date) ? 'primary.main' : 'divider',
                                        '&:hover': {
                                            bgcolor: date ? 'action.hover' : 'transparent'
                                        }
                                    }}
                                    onClick={() => handleDayClick(date)}
                                >
                                    <CardContent sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        {date && (
                                            <>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: isToday(date) ? 'bold' : 'normal',
                                                        color: isToday(date) ? 'primary.contrastText' : 'text.primary'
                                                    }}
                                                >
                                                    {date.getDate()}
                                                </Typography>
                                                
                                                {hasEvents && (
                                                    <Box sx={{ mt: 0.5 }}>
                                                        <Badge
                                                            badgeContent={dayMeetings.length}
                                                            color="secondary"
                                                            max={9}
                                                        >
                                                            <Event fontSize="small" color="primary" />
                                                        </Badge>
                                                    </Box>
                                                )}
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Paper>

            {/* Day Details Dialog */}
            <Dialog
                open={showDayDialog}
                onClose={() => setShowDayDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {selectedDate && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Event />
                            {selectedDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Box>
                    )}
                </DialogTitle>
                
                <DialogContent>
                    {dayMeetings.length === 0 ? (
                        <Typography color="text.secondary">
                            No meetings scheduled for this day.
                        </Typography>
                    ) : (
                        <List>
                            {dayMeetings.map((meeting) => (
                                <ListItem key={meeting._id} divider>
                                    <ListItemIcon>
                                        <VideoCall color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={meeting.meetingTitle}
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    <Schedule sx={{ fontSize: 14, mr: 0.5 }} />
                                                    {formatTime(meeting.scheduledTime || meeting.date)}
                                                    {meeting.duration && ` (${meeting.duration} min)`}
                                                </Typography>
                                                {meeting.description && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        {meeting.description}
                                                    </Typography>
                                                )}
                                                <Box sx={{ mt: 1 }}>
                                                    <Chip
                                                        label={meeting.status || 'scheduled'}
                                                        size="small"
                                                        color={getStatusColor(meeting.status)}
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                
                <DialogActions>
                    <Button onClick={() => setShowScheduler(true)} startIcon={<AddIcon />}>
                        Schedule Meeting
                    </Button>
                    <Button onClick={() => setShowDayDialog(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Meeting Scheduler Dialog */}
            <MeetingScheduler
                open={showScheduler}
                onClose={() => setShowScheduler(false)}
                onMeetingCreated={(meeting) => {
                    fetchMeetings();
                    setShowScheduler(false);
                    showSuccess('Meeting scheduled successfully!');
                }}
                defaultDate={selectedDate}
            />
        </Box>
    );
};

export default CalendarView;
