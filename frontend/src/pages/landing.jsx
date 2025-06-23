import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Chip,
    Stack,
} from '@mui/material';
import {
    VideoCall as VideoCallIcon,
    Security as SecurityIcon,
    Speed as SpeedIcon,
    Groups as GroupsIcon,
    Star as StarIcon,
    PlayArrow as PlayIcon,
    ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import '../styles/animations.css';

export default function LandingPage() {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const features = [
        {
            icon: <VideoCallIcon sx={{ fontSize: 40 }} />,
            title: "HD Video Calls",
            description: "Crystal clear video quality with advanced compression"
        },
        {
            icon: <SecurityIcon sx={{ fontSize: 40 }} />,
            title: "End-to-End Security",
            description: "Military-grade encryption for all your conversations"
        },
        {
            icon: <SpeedIcon sx={{ fontSize: 40 }} />,
            title: "Lightning Fast",
            description: "Optimized for speed with minimal latency"
        },
        {
            icon: <GroupsIcon sx={{ fontSize: 40 }} />,
            title: "Team Collaboration",
            description: "Built for teams with advanced collaboration tools"
        }
    ];

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
                    opacity: 0.3,
                    zIndex: 0,
                }}
            />

            {/* Floating Elements */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '10%',
                    right: '10%',
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%)',
                    zIndex: 1,
                }}
                className="animate-float"
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '5%',
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)',
                    zIndex: 1,
                }}
                className="animate-float"
                style={{ animationDelay: '1s' }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: 8 }}>
                {/* Hero Section */}
                <Box
                    sx={{
                        textAlign: 'center',
                        mb: 12,
                        pt: 8,
                    }}
                    className={isVisible ? 'stagger-children' : ''}
                >
                    <Chip
                        label="🚀 Next-Gen Video Conferencing"
                        sx={{
                            mb: 4,
                            px: 3,
                            py: 1,
                            fontSize: '1rem',
                            background: 'rgba(0, 212, 255, 0.1)',
                            color: '#00D4FF',
                            border: '1px solid rgba(0, 212, 255, 0.3)',
                            backdropFilter: 'blur(10px)',
                        }}
                        className="glow-cyber"
                    />

                    <Typography
                        variant="h1"
                        sx={{
                            mb: 3,
                            fontWeight: 800,
                            background: 'linear-gradient(135deg, #00D4FF 0%, #FFD700 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontSize: { xs: '3rem', md: '4.5rem' },
                            lineHeight: 1.1,
                        }}
                        className="glow-text"
                    >
                        FusionMeet
                    </Typography>

                    <Typography
                        variant="h4"
                        sx={{
                            mb: 6,
                            color: 'text.secondary',
                            fontWeight: 400,
                            maxWidth: 600,
                            mx: 'auto',
                            fontSize: { xs: '1.5rem', md: '2rem' },
                        }}
                    >
                        The Future of Video Conferencing is Here
                    </Typography>

                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={3}
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/auth')}
                            endIcon={<ArrowForwardIcon />}
                            sx={{
                                px: 6,
                                py: 2,
                                fontSize: '1.2rem',
                                fontWeight: 600,
                                minWidth: 200,
                            }}
                            className="hover-lift glow-cyber"
                        >
                            Get Started
                        </Button>

                        <Button
                            variant="outlined"
                            size="large"
                            onClick={() => {
                                const guestMeetingId = Math.random().toString(36).substring(2, 12);
                                navigate(`/${guestMeetingId}`);
                            }}
                            startIcon={<PlayIcon />}
                            sx={{
                                px: 6,
                                py: 2,
                                fontSize: '1.2rem',
                                fontWeight: 600,
                                minWidth: 200,
                                borderColor: '#FFD700',
                                color: '#FFD700',
                                '&:hover': {
                                    borderColor: '#FFD700',
                                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                },
                            }}
                            className="hover-lift"
                        >
                            Join as Guest
                        </Button>
                    </Stack>
                </Box>

                {/* Features Section */}
                <Box sx={{ mb: 12 }}>
                    <Typography
                        variant="h2"
                        sx={{
                            textAlign: 'center',
                            mb: 8,
                            fontWeight: 700,
                            color: 'text.primary',
                        }}
                        className={isVisible ? 'animate-fade-in-scale' : ''}
                    >
                        Why Choose FusionMeet?
                    </Typography>

                    <Grid container spacing={4} className={isVisible ? 'stagger-children' : ''}>
                        {features.map((feature, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        textAlign: 'center',
                                        p: 3,
                                        background: 'rgba(26, 26, 26, 0.8)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(0, 212, 255, 0.2)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            border: '1px solid rgba(0, 212, 255, 0.5)',
                                            boxShadow: '0px 20px 40px rgba(0, 212, 255, 0.2)',
                                        },
                                    }}
                                    className="glass-morphism hover-lift"
                                >
                                    <CardContent>
                                        <Box
                                            sx={{
                                                color: '#00D4FF',
                                                mb: 2,
                                                display: 'flex',
                                                justifyContent: 'center',
                                            }}
                                            className="glow-cyber"
                                        >
                                            {feature.icon}
                                        </Box>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                mb: 2,
                                                fontWeight: 600,
                                                color: 'text.primary',
                                            }}
                                        >
                                            {feature.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'text.secondary',
                                                lineHeight: 1.6,
                                            }}
                                        >
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* Stats Section */}
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 8,
                        background: 'rgba(0, 212, 255, 0.05)',
                        borderRadius: 4,
                        border: '1px solid rgba(0, 212, 255, 0.1)',
                        mb: 12,
                    }}
                    className="glass-morphism"
                >
                    <Typography
                        variant="h3"
                        sx={{
                            mb: 6,
                            fontWeight: 700,
                            color: 'text.primary',
                        }}
                    >
                        Trusted by Teams Worldwide
                    </Typography>

                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={4}>
                            <Box className="animate-bounce-in" style={{ animationDelay: '0.2s' }}>
                                <Typography
                                    variant="h2"
                                    sx={{
                                        fontWeight: 800,
                                        color: '#00D4FF',
                                        mb: 1,
                                    }}
                                    className="glow-text"
                                >
                                    10K+
                                </Typography>
                                <Typography variant="h6" color="text.secondary">
                                    Active Users
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box className="animate-bounce-in" style={{ animationDelay: '0.4s' }}>
                                <Typography
                                    variant="h2"
                                    sx={{
                                        fontWeight: 800,
                                        color: '#FFD700',
                                        mb: 1,
                                    }}
                                    className="glow-text"
                                >
                                    99.9%
                                </Typography>
                                <Typography variant="h6" color="text.secondary">
                                    Uptime
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box className="animate-bounce-in" style={{ animationDelay: '0.6s' }}>
                                <Typography
                                    variant="h2"
                                    sx={{
                                        fontWeight: 800,
                                        color: '#00FF88',
                                        mb: 1,
                                    }}
                                    className="glow-text"
                                >
                                    <StarIcon sx={{ fontSize: 'inherit', mr: 1 }} />
                                    4.9
                                </Typography>
                                <Typography variant="h6" color="text.secondary">
                                    User Rating
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* CTA Section */}
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 8,
                    }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            mb: 4,
                            fontWeight: 700,
                            color: 'text.primary',
                        }}
                    >
                        Ready to Transform Your Meetings?
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            mb: 6,
                            color: 'text.secondary',
                            maxWidth: 600,
                            mx: 'auto',
                        }}
                    >
                        Join thousands of teams already using FusionMeet for their video conferencing needs.
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/auth')}
                        sx={{
                            px: 8,
                            py: 3,
                            fontSize: '1.3rem',
                            fontWeight: 700,
                            background: 'linear-gradient(135deg, #00D4FF 0%, #FFD700 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #33DDFF 0%, #FFED4A 100%)',
                            },
                        }}
                        className="hover-lift glow-cyber"
                    >
                        Start Your Journey
                    </Button>
                </Box>
            </Container>
        </Box>
    );
}


