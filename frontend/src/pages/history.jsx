import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../components/NotificationSystem';
import {
    Card,
    CardContent,
    CardActions,
    Button,
    Typography,
    Box,
    Container,
    AppBar,
    Toolbar,
    IconButton,
    Chip,
    Grid,
    Paper,
    TextField,
    InputAdornment,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Home as HomeIcon,
    VideoCall as VideoCallIcon,
    Search as SearchIcon,
    ContentCopy as CopyIcon,
    AccessTime as AccessTimeIcon,
    CalendarToday as CalendarIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const { showSuccess, showError, showInfo } = useNotification();

    // State management
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch meeting history
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                setError('');

                // Check if user is logged in
                const token = localStorage.getItem('token');
                console.log('Token exists:', !!token);

                if (!token) {
                    setError('Please log in to view your meeting history.');
                    setLoading(false);
                    return;
                }

                console.log('Fetching meeting history...');
                const history = await getHistoryOfUser();
                console.log('History received:', history);
                setMeetings(history || []);

                if (history && history.length > 0) {
                    showSuccess(`Loaded ${history.length} meetings from your history`);
                }
            } catch (err) {
                console.error('Error fetching history:', err);
                let errorMessage = 'Failed to load meeting history. ';

                if (err.response) {
                    // Server responded with error status
                    const status = err.response.status;
                    const message = err.response.data?.message;

                    if (status === 401) {
                        errorMessage = 'Your session has expired. Please log in again.';
                        // Optionally redirect to login
                        setTimeout(() => navigate('/auth'), 2000);
                    } else {
                        errorMessage += `Server error (${status}): ${message || 'Unknown server error'}`;
                    }
                } else if (err.request) {
                    // Request was made but no response received
                    errorMessage += 'Unable to connect to server. Please check if the backend is running.';
                } else {
                    // Something else happened
                    errorMessage += err.message || 'Unknown error occurred.';
                }

                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [getHistoryOfUser, navigate]);

    // Filter meetings based on search term
    const filteredMeetings = meetings.filter(meeting => 
        meeting.meetingCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.meetingTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.createdBy?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Utility functions
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleJoinMeeting = (meetingCode) => {
        navigate(`/${meetingCode}`);
    };

    const handleCopyMeetingLink = (meetingCode) => {
        const meetingLink = `${window.location.origin}/${meetingCode}`;
        navigator.clipboard.writeText(meetingLink);
        showSuccess('Meeting link copied to clipboard!');
    };

    const handleRefresh = async () => {
        setLoading(true);
        setError('');
        try {
            console.log('Refreshing meeting history...');
            const history = await getHistoryOfUser();
            console.log('Refresh - History received:', history);
            setMeetings(history || []);
            showInfo('Meeting history refreshed successfully');
        } catch (err) {
            console.error('Error refreshing history:', err);
            let errorMessage = 'Failed to refresh meeting history. ';

            if (err.response) {
                errorMessage += `Server error: ${err.response.data?.message || err.response.status}`;
            } else if (err.request) {
                errorMessage += 'Unable to connect to server. Please check if the backend is running.';
            } else {
                errorMessage += err.message || 'Unknown error occurred.';
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* App Bar */}
            <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => navigate('/home')}
                        sx={{ mr: 2 }}
                    >
                        <HomeIcon />
                    </IconButton>
                    
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Meeting History
                    </Typography>

                    <IconButton color="inherit" onClick={handleRefresh} disabled={loading}>
                        <RefreshIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Header Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" gutterBottom fontWeight="bold">
                        Your Meeting History
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        View and manage your past meetings
                    </Typography>
                </Box>

                {/* Search Bar */}
                <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                    <TextField
                        placeholder="Search meetings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                        fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            )
                        }}
                    />
                </Paper>

                {/* Content Area */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                        <Button onClick={handleRefresh} sx={{ ml: 2 }}>
                            Try Again
                        </Button>
                    </Alert>
                ) : filteredMeetings.length === 0 ? (
                    <Paper elevation={1} sx={{ p: 6, textAlign: 'center' }}>
                        <VideoCallIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            {searchTerm ? 'No meetings found' : 'No meeting history yet'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {searchTerm
                                ? 'Try adjusting your search terms'
                                : 'Your meeting history will appear here after you join or create meetings'
                            }
                        </Typography>
                        {!searchTerm && (
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    startIcon={<VideoCallIcon />}
                                    onClick={() => navigate('/home')}
                                >
                                    Start New Meeting
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={handleRefresh}
                                    disabled={loading}
                                >
                                    Refresh
                                </Button>
                            </Box>
                        )}
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {filteredMeetings.map((meeting, index) => (
                            <Grid item xs={12} sm={6} md={4} key={meeting._id || index}>
                                <Card 
                                    elevation={2}
                                    sx={{ 
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            elevation: 4,
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        {/* Meeting Title */}
                                        <Typography variant="h6" gutterBottom noWrap>
                                            {meeting.meetingTitle || 'Untitled Meeting'}
                                        </Typography>

                                        {/* Meeting Code */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Chip
                                                label={meeting.meetingCode}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </Box>

                                        {/* Meeting Details */}
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatDate(meeting.date)}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatTime(meeting.date)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>

                                    <CardActions sx={{ p: 2, pt: 0 }}>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            startIcon={<VideoCallIcon />}
                                            onClick={() => handleJoinMeeting(meeting.meetingCode)}
                                            sx={{ mr: 1 }}
                                        >
                                            Join Again
                                        </Button>

                                        <IconButton
                                            size="small"
                                            onClick={() => handleCopyMeetingLink(meeting.meetingCode)}
                                        >
                                            <CopyIcon />
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
}
