import React, { useState, useContext, useEffect } from 'react';
import {
    Box,
    Card,
    TextField,
    Button,
    Typography,
    Container,
    IconButton,
    InputAdornment,
    Tabs,
    Tab,
    Alert,
    CircularProgress,
    Chip,
    Stack,
} from '@mui/material';
import {
    LockOutlined,
    Visibility,
    VisibilityOff,
    Person,
    Email,
    ArrowBack,
    Security as SecurityIcon,
    Speed as SpeedIcon,
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/animations.css';

export default function Authentication() {
    const navigate = useNavigate();

    const [formState, setFormState] = useState(0); // 0 = login, 1 = register
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: ''
    });
    const [error, setError] = useState('');

    const { handleRegister, handleLogin } = useContext(AuthContext);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleInputChange = (field) => (event) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
        setError('');
    };

    const handleAuth = async () => {
        if (!formData.username || !formData.password) {
            setError('Please fill in all required fields');
            return;
        }

        if (formState === 1 && !formData.name) {
            setError('Please enter your full name');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (formState === 0) {
                // Login
                await handleLogin(formData.username, formData.password);
                alert('Welcome back!');
            } else {
                // Register
                await handleRegister(formData.name, formData.username, formData.password);
                alert('Account created successfully! Please login.');
                setFormData({ name: '', username: '', password: '' });
                setFormState(0);
            }
        } catch (err) {
            console.error('Auth error:', err);
            const message = err.response?.data?.message || 'Authentication failed';
            setError(message);
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setFormState(newValue);
        setError('');
        setFormData({ name: '', username: '', password: '' });
    };


    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: `
                    radial-gradient(circle at 20% 80%, rgba(0, 212, 255, 0.15) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
                    linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #2A2A2A 100%)
                `,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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

            {/* Floating Elements */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '15%',
                    right: '15%',
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0, 212, 255, 0.3) 0%, transparent 70%)',
                    zIndex: 1,
                }}
                className="animate-float"
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: '25%',
                    left: '10%',
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%)',
                    zIndex: 1,
                }}
                className="animate-float"
                style={{ animationDelay: '1.5s' }}
            />

            {/* Back to Landing Button */}
            <IconButton
                onClick={() => navigate('/')}
                sx={{
                    position: 'absolute',
                    top: 24,
                    left: 24,
                    color: '#00D4FF',
                    bgcolor: 'rgba(0, 212, 255, 0.1)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 10,
                    '&:hover': {
                        bgcolor: 'rgba(0, 212, 255, 0.2)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0px 8px 25px rgba(0, 212, 255, 0.3)',
                    }
                }}
                className="hover-lift"
            >
                <ArrowBack />
            </IconButton>

            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
                <Card
                    sx={{
                        background: 'rgba(26, 26, 26, 0.9)',
                        backdropFilter: 'blur(30px)',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        borderRadius: 4,
                        p: 5,
                        boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.5)',
                    }}
                    className={isVisible ? 'animate-fade-in-scale glass-morphism' : ''}
                >
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 5 }} className={isVisible ? 'stagger-children' : ''}>
                        <Chip
                            icon={<SecurityIcon />}
                            label="Secure Authentication"
                            sx={{
                                mb: 3,
                                px: 2,
                                py: 1,
                                background: 'rgba(0, 212, 255, 0.1)',
                                color: '#00D4FF',
                                border: '1px solid rgba(0, 212, 255, 0.3)',
                                backdropFilter: 'blur(10px)',
                            }}
                            className="glow-cyber"
                        />

                        <Typography
                            variant="h3"
                            sx={{
                                background: 'linear-gradient(135deg, #00D4FF 0%, #FFD700 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontWeight: 800,
                                mb: 2,
                                fontSize: { xs: '2.5rem', md: '3rem' },
                            }}
                            className="glow-text"
                        >
                            FusionMeet
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: 'text.secondary',
                                mb: 3,
                                fontSize: '1.1rem',
                                lineHeight: 1.6,
                            }}
                        >
                            Connect with your team through secure, high-quality video meetings
                        </Typography>

                        <Stack direction="row" spacing={2} justifyContent="center">
                            <Chip
                                icon={<SecurityIcon sx={{ fontSize: 16 }} />}
                                label="End-to-End Encrypted"
                                size="small"
                                sx={{
                                    background: 'rgba(0, 255, 136, 0.1)',
                                    color: '#00FF88',
                                    border: '1px solid rgba(0, 255, 136, 0.3)',
                                }}
                            />
                            <Chip
                                icon={<SpeedIcon sx={{ fontSize: 16 }} />}
                                label="Lightning Fast"
                                size="small"
                                sx={{
                                    background: 'rgba(255, 215, 0, 0.1)',
                                    color: '#FFD700',
                                    border: '1px solid rgba(255, 215, 0, 0.3)',
                                }}
                            />
                        </Stack>
                    </Box>

                    {/* Tabs */}
                    <Box sx={{ mb: 4 }}>
                        <Tabs
                            value={formState}
                            onChange={handleTabChange}
                            centered
                            sx={{
                                '& .MuiTab-root': {
                                    color: 'text.secondary',
                                    fontWeight: 600,
                                    fontSize: '1.1rem',
                                    textTransform: 'none',
                                    minHeight: 48,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&.Mui-selected': {
                                        color: '#00D4FF',
                                    },
                                    '&:hover': {
                                        color: '#33DDFF',
                                    }
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#00D4FF',
                                    height: 3,
                                    borderRadius: 2,
                                    boxShadow: '0px 0px 10px rgba(0, 212, 255, 0.5)',
                                }
                            }}
                        >
                            <Tab label="Sign In" />
                            <Tab label="Sign Up" />
                        </Tabs>
                    </Box>

                    {/* Form */}
                    <Box component="form" noValidate className={isVisible ? 'stagger-children' : ''}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Full Name (Register only) */}
                            {formState === 1 && (
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    value={formData.name}
                                    onChange={handleInputChange('name')}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Person sx={{ color: '#00D4FF' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: 'rgba(42, 42, 42, 0.8)',
                                            borderRadius: 3,
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
                                        '& .MuiInputLabel-root': {
                                            color: 'text.secondary',
                                            '&.Mui-focused': {
                                                color: '#00D4FF',
                                            }
                                        },
                                        '& .MuiOutlinedInput-input': {
                                            color: 'text.primary',
                                        }
                                    }}
                                    className="hover-lift"
                                />
                            )}

                            {/* Username */}
                            <TextField
                                fullWidth
                                label="Username"
                                value={formData.username}
                                onChange={handleInputChange('username')}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email sx={{ color: '#00D4FF' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(42, 42, 42, 0.8)',
                                        borderRadius: 3,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
                                    '& .MuiInputLabel-root': {
                                        color: 'text.secondary',
                                        '&.Mui-focused': {
                                            color: '#00D4FF',
                                        }
                                    },
                                    '& .MuiOutlinedInput-input': {
                                        color: 'text.primary',
                                    }
                                }}
                                className="hover-lift"
                            />

                            {/* Password */}
                            <TextField
                                fullWidth
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleInputChange('password')}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlined sx={{ color: '#00D4FF' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                sx={{
                                                    color: '#00D4FF',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(0, 212, 255, 0.1)',
                                                    }
                                                }}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: 'rgba(42, 42, 42, 0.8)',
                                        borderRadius: 3,
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
                                    '& .MuiInputLabel-root': {
                                        color: 'text.secondary',
                                        '&.Mui-focused': {
                                            color: '#00D4FF',
                                        }
                                    },
                                    '& .MuiOutlinedInput-input': {
                                        color: 'text.primary',
                                    }
                                }}
                                className="hover-lift"
                            />

                            {/* Error Message */}
                            {error && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        backgroundColor: 'rgba(255, 68, 68, 0.1)',
                                        color: '#FF4444',
                                        border: '1px solid rgba(255, 68, 68, 0.3)',
                                        borderRadius: 3,
                                        backdropFilter: 'blur(10px)',
                                        '& .MuiAlert-icon': {
                                            color: '#FF4444'
                                        }
                                    }}
                                    className="animate-slide-in-up"
                                >
                                    {error}
                                </Alert>
                            )}

                            {/* Submit Button */}
                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                onClick={handleAuth}
                                disabled={loading}
                                sx={{
                                    background: 'linear-gradient(135deg, #00D4FF 0%, #FFD700 100%)',
                                    color: '#000000',
                                    py: 2.5,
                                    fontSize: '1.2rem',
                                    fontWeight: 700,
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    boxShadow: '0px 8px 25px rgba(0, 212, 255, 0.4)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        transform: 'translateY(-3px)',
                                        boxShadow: '0px 12px 35px rgba(0, 212, 255, 0.6)',
                                        background: 'linear-gradient(135deg, #33DDFF 0%, #FFED4A 100%)',
                                    },
                                    '&:disabled': {
                                        background: 'rgba(176, 176, 176, 0.3)',
                                        color: 'rgba(255, 255, 255, 0.5)',
                                        transform: 'none',
                                        boxShadow: 'none',
                                    }
                                }}
                                className="hover-lift glow-cyber"
                            >
                                {loading ? (
                                    <CircularProgress size={24} sx={{ color: '#000000' }} />
                                ) : (
                                    formState === 0 ? 'Sign In to FusionMeet' : 'Create Your Account'
                                )}
                            </Button>
                        </Box>
                    </Box>
                </Card>
            </Container>
        </Box>
    );
}