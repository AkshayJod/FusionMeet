import React from 'react';
import { Box, Avatar, Typography, useTheme } from '@mui/material';
import { keyframes } from '@emotion/react';

// Batman logo animation
const batGlow = keyframes`
  0%, 100% { 
    filter: drop-shadow(0 0 5px #ffd700) drop-shadow(0 0 10px #ffd700) drop-shadow(0 0 15px #ffd700);
  }
  50% { 
    filter: drop-shadow(0 0 10px #ffd700) drop-shadow(0 0 20px #ffd700) drop-shadow(0 0 30px #ffd700);
  }
`;

const BatmanLogo = ({ size = 48, showText = true, variant = 'default' }) => {
    const theme = useTheme();

    // Fallback gradients if theme.custom is not available
    const gradients = theme.custom?.gradients || {
        batman: 'linear-gradient(135deg, #000000 0%, #1a1a1a 30%, #ffd700 100%)',
        secondary: 'linear-gradient(135deg, #ffd700 0%, #ffcc00 50%, #e6b800 100%)'
    };

    // Generate unique ID for gradient to avoid conflicts
    const gradientId = `batGradient-${Math.random().toString(36).substr(2, 9)}`;

    // Batman logo SVG path (simplified bat symbol)
    const BatSymbol = () => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            style={{
                animation: `${batGlow} 3s ease-in-out infinite`,
            }}
        >
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#000000" />
                    <stop offset="50%" stopColor="#1a1a1a" />
                    <stop offset="100%" stopColor="#ffd700" />
                </linearGradient>
            </defs>
            
            {/* Batman symbol */}
            <path
                d="M50 20 
                   C30 25, 20 35, 15 45
                   C10 55, 15 65, 25 70
                   C35 75, 45 70, 50 65
                   C55 70, 65 75, 75 70
                   C85 65, 90 55, 85 45
                   C80 35, 70 25, 50 20 Z
                   
                   M50 30
                   C45 35, 40 40, 35 45
                   C40 50, 45 55, 50 50
                   C55 55, 60 50, 65 45
                   C60 40, 55 35, 50 30 Z"
                fill={`url(#${gradientId})`}
                stroke="#ffd700"
                strokeWidth="1"
            />
            
            {/* Eyes */}
            <circle cx="42" cy="40" r="2" fill="#ffd700" />
            <circle cx="58" cy="40" r="2" fill="#ffd700" />
        </svg>
    );

    if (variant === 'avatar') {
        return (
            <Avatar
                sx={{
                    bgcolor: 'transparent',
                    background: gradients.batman,
                    border: `2px solid ${theme.palette.secondary.main}`,
                    width: size,
                    height: size,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 20px ${theme.palette.secondary.main}40`,
                }}
            >
                <BatSymbol />
            </Avatar>
        );
    }

    if (variant === 'icon') {
        return <BatSymbol />;
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
                sx={{
                    bgcolor: 'transparent',
                    background: gradients.batman,
                    border: `2px solid ${theme.palette.secondary.main}`,
                    width: size,
                    height: size,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 20px ${theme.palette.secondary.main}40`,
                }}
            >
                <BatSymbol />
            </Avatar>
            
            {showText && (
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 800,
                        background: gradients.secondary,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        fontFamily: '"Orbitron", "Roboto", sans-serif', // More tech/Batman-like font
                    }}
                >
                    FusionMeet
                </Typography>
            )}
        </Box>
    );
};

// Alternative text logo with Batman styling
export const BatmanTextLogo = ({ variant = 'h4' }) => {
    const theme = useTheme();

    // Fallback gradients if theme.custom is not available
    const gradients = theme.custom?.gradients || {
        secondary: 'linear-gradient(135deg, #ffd700 0%, #ffcc00 50%, #e6b800 100%)'
    };
    
    return (
        <Typography
            variant={variant}
            sx={{
                fontWeight: 900,
                background: gradients.secondary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 2px 8px rgba(255, 215, 0, 0.3)',
                fontFamily: '"Orbitron", "Roboto", sans-serif',
                letterSpacing: '0.1em',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: gradients.secondary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'blur(2px)',
                    opacity: 0.5,
                    zIndex: -1,
                }
            }}
        >
            FUSIONMEET
        </Typography>
    );
};

export default BatmanLogo;
