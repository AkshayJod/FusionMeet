import React, { useContext, useState, useEffect } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import MeetingScheduler from '../components/MeetingScheduler'
import "../App.css";
import '../styles/animations.css';
import {
    Button,
    IconButton,
    TextField,
    Card,
    Typography,
    Box,
    Grid,
    Paper,
    Container,
    CardContent,
    Stack,
    AppBar,
    Toolbar,
    Avatar,
    Chip,
    Fab,
} from '@mui/material';
import {
    VideoCall as VideoCallIcon,
    Schedule as ScheduleIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    JoinInner as JoinInnerIcon,
    Event as CalendarIcon,
    History as HistoryIcon,
    Add as AddIcon,
    Notifications as NotificationsIcon,
    Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import { useNotification } from '../components/NotificationSystem';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const [showJoinDialog, setShowJoinDialog] = useState(false);
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const {addToUserHistory, user} = useContext(AuthContext);
    const { showSuccess, showError, showInfo } = useNotification();

    useEffect(() => {
        setIsVisible(true);
    }, []);

    let handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) {
            showError("Please enter a meeting code");
            return;
        }

        // Validate meeting code format (basic validation)
        if (meetingCode.length < 3) {
            showError("Meeting code must be at least 3 characters long");
            return;
        }

        try {
            console.log('Attempting to join meeting:', meetingCode);
            showInfo(`Joining meeting: ${meetingCode}...`);

            // Try to add to history, but don't block navigation if it fails
            try {
                await addToUserHistory(meetingCode);
                console.log('Successfully added to user history');
            } catch (historyError) {
                console.warn('Failed to add to history, but continuing:', historyError);
                // Don't show error for history failure, just log it
            }

            showSuccess(`Joining meeting: ${meetingCode}`);
            setMeetingCode(""); // Clear the input after successful join
            navigate(`/${meetingCode}`);
        } catch (error) {
            console.error('Error joining meeting:', error);
            showError("Failed to join meeting. Please try again.");
        }
    }

    let handleNewMeeting = async () => {
        try {
            const meetingId = Math.random().toString(36).substring(2, 15);
            console.log('Creating new meeting:', meetingId);
            showInfo(`Creating new meeting: ${meetingId}...`);

            // Try to add to history, but don't block navigation if it fails
            try {
                await addToUserHistory(meetingId);
                console.log('Successfully added to user history');
            } catch (historyError) {
                console.warn('Failed to add to history, but continuing:', historyError);
                // Don't show error for history failure, just log it
            }

            showSuccess(`Starting new meeting: ${meetingId}`);
            navigate(`/${meetingId}`);
        } catch (error) {
            console.error('Error creating meeting:', error);
            showError("Failed to start meeting. Please try again.");
        }
    }

    let handleScheduleMeeting = () => {
        setShowScheduleDialog(!showScheduleDialog);
        showInfo("Meeting scheduler opened");
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: `
                    radial-gradient(circle at 20% 80%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
                    linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #2A2A2A 100%)
                `,
                position: 'relative',
                overflow: 'hidden',
            }}
            className="gradient-shift"
        >
            {/* Cyber Grid Background */}
            <Box
                className="cyber-grid"
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.2,
                    zIndex: 0,
                }}
            />

            {/* Modern Header */}
            <AppBar
                position="static"
                elevation={0}
                sx={{
                    background: 'rgba(26, 26, 26, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
                }}
                className={isVisible ? 'animate-slide-in-up' : ''}
            >
                <Toolbar sx={{ py: 1 }}>
                    <Container maxWidth="lg">
                        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                            <Box display="flex" alignItems="center" gap={2}>
                                <DashboardIcon sx={{ color: '#00D4FF', fontSize: 32 }} className="glow-cyber" />
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        background: 'linear-gradient(135deg, #00D4FF 0%, #FFD700 100%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                    className="glow-text"
                                >
                                    FusionMeet
                                </Typography>
                                <Chip
                                    label="Dashboard"
                                    size="small"
                                    sx={{
                                        background: 'rgba(0, 212, 255, 0.1)',
                                        color: '#00D4FF',
                                        border: '1px solid rgba(0, 212, 255, 0.3)',
                                    }}
                                />
                            </Box>

                            <Stack direction="row" spacing={1} alignItems="center">
                                <IconButton
                                    onClick={() => navigate("/calendar")}
                                    sx={{
                                        color: '#00D4FF',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 212, 255, 0.1)',
                                            transform: 'translateY(-2px)',
                                        }
                                    }}
                                    className="hover-lift"
                                >
                                    <CalendarIcon />
                                </IconButton>
                                <IconButton
                                    onClick={() => navigate("/history")}
                                    sx={{
                                        color: '#00D4FF',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 212, 255, 0.1)',
                                            transform: 'translateY(-2px)',
                                        }
                                    }}
                                    className="hover-lift"
                                >
                                    <HistoryIcon />
                                </IconButton>
                                <IconButton
                                    sx={{
                                        color: '#FFD700',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                            transform: 'translateY(-2px)',
                                        }
                                    }}
                                    className="hover-lift"
                                >
                                    <NotificationsIcon />
                                </IconButton>
                                <Avatar
                                    sx={{
                                        bgcolor: 'linear-gradient(135deg, #00D4FF 0%, #FFD700 100%)',
                                        color: '#000',
                                        fontWeight: 700,
                                        ml: 1,
                                    }}
                                    className="hover-scale"
                                >
                                    {user?.name?.charAt(0) || 'U'}
                                </Avatar>
                                <Button
                                    startIcon={<LogoutIcon />}
                                    onClick={() => {
                                        localStorage.removeItem("token")
                                        navigate("/auth")
                                    }}
                                    variant="outlined"
                                    sx={{
                                        borderColor: '#FF4444',
                                        color: '#FF4444',
                                        '&:hover': {
                                            borderColor: '#FF6666',
                                            backgroundColor: 'rgba(255, 68, 68, 0.1)',
                                        }
                                    }}
                                    className="hover-lift"
                                >
                                    Logout
                                </Button>
                            </Stack>
                        </Box>
                    </Container>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Container maxWidth="lg" sx={{ py: 6, position: 'relative', zIndex: 2 }}>
                <Grid container spacing={4}>
                    {/* Welcome Section */}
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                textAlign: 'center',
                                mb: 6,
                                p: 6,
                                background: 'rgba(26, 26, 26, 0.8)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(0, 212, 255, 0.2)',
                                borderRadius: 4,
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                            className={isVisible ? 'animate-fade-in-scale glass-morphism' : ''}
                        >
                            {/* Floating decoration */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: -50,
                                    right: -50,
                                    width: 100,
                                    height: 100,
                                    borderRadius: '50%',
                                    background: 'radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%)',
                                }}
                                className="animate-float"
                            />

                            <Chip
                                label={`Welcome back, ${user?.name || 'User'}!`}
                                sx={{
                                    mb: 3,
                                    px: 3,
                                    py: 1,
                                    fontSize: '1rem',
                                    background: 'rgba(255, 215, 0, 0.1)',
                                    color: '#FFD700',
                                    border: '1px solid rgba(255, 215, 0, 0.3)',
                                    backdropFilter: 'blur(10px)',
                                }}
                                className="glow-gold"
                            />

                            <Typography
                                variant="h2"
                                sx={{
                                    fontWeight: 700,
                                    mb: 3,
                                    background: 'linear-gradient(135deg, #00D4FF 0%, #FFD700 100%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                }}
                                className="glow-text"
                            >
                                Your Meeting Hub
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: 'text.secondary',
                                    mb: 4,
                                    maxWidth: 700,
                                    mx: 'auto',
                                    fontSize: '1.2rem',
                                    lineHeight: 1.6,
                                }}
                            >
                                Start instant meetings, join with a code, or schedule for the perfect time.
                                Your team collaboration starts here.
                            </Typography>

                            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                                <Chip
                                    label="🚀 Instant Start"
                                    size="small"
                                    sx={{
                                        background: 'rgba(0, 255, 136, 0.1)',
                                        color: '#00FF88',
                                        border: '1px solid rgba(0, 255, 136, 0.3)',
                                    }}
                                />
                                <Chip
                                    label="🔒 Secure"
                                    size="small"
                                    sx={{
                                        background: 'rgba(0, 212, 255, 0.1)',
                                        color: '#00D4FF',
                                        border: '1px solid rgba(0, 212, 255, 0.3)',
                                    }}
                                />
                                <Chip
                                    label="⚡ Fast"
                                    size="small"
                                    sx={{
                                        background: 'rgba(255, 215, 0, 0.1)',
                                        color: '#FFD700',
                                        border: '1px solid rgba(255, 215, 0, 0.3)',
                                    }}
                                />
                            </Stack>
                        </Box>
                    </Grid>

                    {/* Action Cards */}
                    <Grid item xs={12}>
                        <Grid container spacing={4} sx={{ mb: 6 }} className={isVisible ? 'stagger-children' : ''}>
                            <Grid item xs={12} sm={6} md={4}>
                                <Card
                                    sx={{
                                        p: 4,
                                        cursor: 'pointer',
                                        background: 'rgba(26, 26, 26, 0.8)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(0, 255, 136, 0.3)',
                                        borderRadius: 4,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            border: '1px solid rgba(0, 255, 136, 0.6)',
                                            boxShadow: '0px 20px 40px rgba(0, 255, 136, 0.2)',
                                        }
                                    }}
                                    onClick={handleNewMeeting}
                                    className="glass-morphism hover-lift"
                                >
                                    <CardContent sx={{ textAlign: 'center', p: 0 }}>
                                        <Box
                                            sx={{
                                                mb: 3,
                                                p: 2,
                                                borderRadius: '50%',
                                                background: 'rgba(0, 255, 136, 0.1)',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                            className="glow-cyber"
                                        >
                                            <VideoCallIcon
                                                sx={{
                                                    fontSize: 48,
                                                    color: '#00FF88',
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                                            New Meeting
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                            Start an instant meeting with HD video and crystal-clear audio
                                        </Typography>
                                        <Chip
                                            label="Instant"
                                            size="small"
                                            sx={{
                                                mt: 2,
                                                background: 'rgba(0, 255, 136, 0.2)',
                                                color: '#00FF88',
                                                border: '1px solid rgba(0, 255, 136, 0.4)',
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                                <Card
                                    sx={{
                                        p: 4,
                                        cursor: 'pointer',
                                        background: 'rgba(26, 26, 26, 0.8)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(0, 212, 255, 0.3)',
                                        borderRadius: 4,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            border: '1px solid rgba(0, 212, 255, 0.6)',
                                            boxShadow: '0px 20px 40px rgba(0, 212, 255, 0.2)',
                                        }
                                    }}
                                    onClick={() => setShowJoinDialog(!showJoinDialog)}
                                    className="glass-morphism hover-lift"
                                >
                                    <CardContent sx={{ textAlign: 'center', p: 0 }}>
                                        <Box
                                            sx={{
                                                mb: 3,
                                                p: 2,
                                                borderRadius: '50%',
                                                background: 'rgba(0, 212, 255, 0.1)',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                            className="glow-cyber"
                                        >
                                            <JoinInnerIcon
                                                sx={{
                                                    fontSize: 48,
                                                    color: '#00D4FF',
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                                            Join Meeting
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                            Enter a meeting ID to join an existing session
                                        </Typography>
                                        <Chip
                                            label="Quick Join"
                                            size="small"
                                            sx={{
                                                mt: 2,
                                                background: 'rgba(0, 212, 255, 0.2)',
                                                color: '#00D4FF',
                                                border: '1px solid rgba(0, 212, 255, 0.4)',
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                                <Card
                                    sx={{
                                        p: 4,
                                        cursor: 'pointer',
                                        background: 'rgba(26, 26, 26, 0.8)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(255, 215, 0, 0.3)',
                                        borderRadius: 4,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            border: '1px solid rgba(255, 215, 0, 0.6)',
                                            boxShadow: '0px 20px 40px rgba(255, 215, 0, 0.2)',
                                        }
                                    }}
                                    onClick={handleScheduleMeeting}
                                    className="glass-morphism hover-lift"
                                >
                                    <CardContent sx={{ textAlign: 'center', p: 0 }}>
                                        <Box
                                            sx={{
                                                mb: 3,
                                                p: 2,
                                                borderRadius: '50%',
                                                background: 'rgba(255, 215, 0, 0.1)',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                            className="glow-gold"
                                        >
                                            <ScheduleIcon
                                                sx={{
                                                    fontSize: 48,
                                                    color: '#FFD700',
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                                            Schedule Meeting
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                            Plan and schedule meetings for the perfect time
                                        </Typography>
                                        <Chip
                                            label="Plan Ahead"
                                            size="small"
                                            sx={{
                                                mt: 2,
                                                background: 'rgba(255, 215, 0, 0.2)',
                                                color: '#FFD700',
                                                border: '1px solid rgba(255, 215, 0, 0.4)',
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Join Meeting Dialog */}
                    {showJoinDialog && (
                        <Grid item xs={12}>
                            <Card
                                sx={{
                                    p: 5,
                                    background: 'rgba(26, 26, 26, 0.9)',
                                    backdropFilter: 'blur(30px)',
                                    border: '1px solid rgba(0, 212, 255, 0.3)',
                                    borderRadius: 4,
                                    boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.5)',
                                }}
                                className="animate-slide-in-up glass-morphism"
                            >
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        mb: 2,
                                        textAlign: 'center',
                                        background: 'linear-gradient(135deg, #00D4FF 0%, #FFD700 100%)',
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                    className="glow-text"
                                >
                                    Join a Meeting
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: 'text.secondary',
                                        mb: 4,
                                        textAlign: 'center',
                                    }}
                                >
                                    Enter the meeting ID provided by your host
                                </Typography>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                                    <TextField
                                        value={meetingCode}
                                        onChange={e => setMeetingCode(e.target.value)}
                                        label="Meeting ID"
                                        variant="outlined"
                                        fullWidth
                                        placeholder="e.g., ABC123DEF456"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: 'rgba(42, 42, 42, 0.8)',
                                                borderRadius: 3,
                                                fontSize: '1.2rem',
                                                '& fieldset': {
                                                    borderColor: 'rgba(0, 212, 255, 0.3)',
                                                    borderWidth: 2,
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'rgba(0, 212, 255, 0.5)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#00D4FF',
                                                    boxShadow: '0px 0px 20px rgba(0, 212, 255, 0.3)',
                                                },
                                            },
                                        }}
                                        className="hover-lift"
                                    />
                                    <Button
                                        onClick={handleJoinVideoCall}
                                        variant='contained'
                                        size="large"
                                        startIcon={<JoinInnerIcon />}
                                        sx={{
                                            minWidth: 160,
                                            py: 2,
                                            fontSize: '1.1rem',
                                            fontWeight: 700,
                                        }}
                                        className="hover-lift glow-cyber"
                                    >
                                        Join Now
                                    </Button>
                                </Stack>
                            </Card>
                        </Grid>
                    )}

                    {/* Schedule Meeting Dialog */}
                    {showScheduleDialog && (
                        <Grid item xs={12}>
                            <Card
                                sx={{
                                    p: 5,
                                    background: 'rgba(26, 26, 26, 0.9)',
                                    backdropFilter: 'blur(30px)',
                                    border: '1px solid rgba(255, 215, 0, 0.3)',
                                    borderRadius: 4,
                                    boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.5)',
                                }}
                                className="animate-slide-in-up glass-morphism"
                            >
                                <MeetingScheduler />
                            </Card>
                        </Grid>
                    )}
                </Grid>

                {/* Floating Action Button */}
                <Fab
                    color="primary"
                    sx={{
                        position: 'fixed',
                        bottom: 32,
                        right: 32,
                        background: 'linear-gradient(135deg, #00D4FF 0%, #FFD700 100%)',
                        color: '#000',
                        width: 64,
                        height: 64,
                        '&:hover': {
                            background: 'linear-gradient(135deg, #33DDFF 0%, #FFED4A 100%)',
                            transform: 'scale(1.1)',
                        }
                    }}
                    onClick={handleNewMeeting}
                    className="hover-scale glow-cyber animate-bounce-in"
                    style={{ animationDelay: '1s' }}
                >
                    <AddIcon sx={{ fontSize: 32 }} />
                </Fab>
            </Container>
        </Box>
    )
}

export default withAuth(HomeComponent)
