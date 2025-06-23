import React from 'react';
import { Box, Typography, Avatar, useTheme } from '@mui/material';
import { keyframes } from '@emotion/react';

// Modern animations
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
`;

const glow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
    filter: drop-shadow(0 0 10px rgba(102, 126, 234, 0.3));
  }
  50% { 
    box-shadow: 0 0 30px rgba(217, 70, 239, 0.7);
    filter: drop-shadow(0 0 15px rgba(217, 70, 239, 0.5));
  }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const ModernLogo = ({ 
  size = 48, 
  showText = false, 
  variant = 'default',
  animated = true 
}) => {
  const theme = useTheme();
  
  // Modern gradient ID for SVG
  const gradientId = `modern-gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  // Modern logo symbol - abstract geometric design
  const ModernSymbol = () => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        animation: animated ? `${float} 4s ease-in-out infinite` : 'none',
      }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="50%" stopColor="#764ba2" />
          <stop offset="100%" stopColor="#f093fb" />
        </linearGradient>
        <linearGradient id={`${gradientId}-glow`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(102, 126, 234, 0.8)" />
          <stop offset="50%" stopColor="rgba(118, 75, 162, 0.8)" />
          <stop offset="100%" stopColor="rgba(240, 147, 251, 0.8)" />
        </linearGradient>
      </defs>
      
      {/* Outer ring */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        opacity="0.3"
      />
      
      {/* Main geometric shape - modern abstract */}
      <path
        d="M30 30 L70 30 L85 50 L70 70 L30 70 L15 50 Z"
        fill={`url(#${gradientId})`}
        opacity="0.9"
      />
      
      {/* Inner accent */}
      <path
        d="M40 40 L60 40 L70 50 L60 60 L40 60 L30 50 Z"
        fill="rgba(255, 255, 255, 0.2)"
      />
      
      {/* Central dot */}
      <circle
        cx="50"
        cy="50"
        r="8"
        fill="rgba(255, 255, 255, 0.9)"
      />
      
      {/* Accent lines */}
      <line x1="20" y1="50" x2="35" y2="50" stroke={`url(#${gradientId})`} strokeWidth="3" opacity="0.7" />
      <line x1="65" y1="50" x2="80" y2="50" stroke={`url(#${gradientId})`} strokeWidth="3" opacity="0.7" />
      <line x1="50" y1="20" x2="50" y2="35" stroke={`url(#${gradientId})`} strokeWidth="3" opacity="0.7" />
      <line x1="50" y1="65" x2="50" y2="80" stroke={`url(#${gradientId})`} strokeWidth="3" opacity="0.7" />
    </svg>
  );

  if (variant === 'avatar') {
    return (
      <Avatar
        sx={{
          bgcolor: 'transparent',
          background: theme.custom?.gradients?.primary || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: animated ? `${glow} 3s ease-in-out infinite` : 'none',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
          }
        }}
      >
        <ModernSymbol />
      </Avatar>
    );
  }

  if (variant === 'icon') {
    return <ModernSymbol />;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar
        sx={{
          bgcolor: 'transparent',
          background: theme.custom?.gradients?.primary || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: animated ? `${glow} 3s ease-in-out infinite` : 'none',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
          }
        }}
      >
        <ModernSymbol />
      </Avatar>
      
      {showText && (
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            background: theme.custom?.gradients?.cosmic || 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: '"Poppins", "Inter", sans-serif',
            letterSpacing: '0.05em',
            position: 'relative',
            animation: animated ? `${shimmer} 3s linear infinite` : 'none',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: theme.custom?.gradients?.cosmic || 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'blur(1px)',
              opacity: 0.3,
              zIndex: -1,
            }
          }}
        >
          FusionMeet
        </Typography>
      )}
    </Box>
  );
};

// Modern text logo component
export const ModernTextLogo = ({ variant = 'h4', animated = true }) => {
  const theme = useTheme();
  
  return (
    <Typography
      variant={variant}
      sx={{
        fontWeight: 900,
        background: theme.custom?.gradients?.cosmic || 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        backgroundSize: '200% 200%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        fontFamily: '"Poppins", "Inter", sans-serif',
        letterSpacing: '0.1em',
        position: 'relative',
        animation: animated ? `${shimmer} 4s linear infinite` : 'none',
        textShadow: '0 0 30px rgba(102, 126, 234, 0.5)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.custom?.gradients?.cosmic || 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'blur(2px)',
          opacity: 0.4,
          zIndex: -1,
        }
      }}
    >
      FUSIONMEET
    </Typography>
  );
};

export default ModernLogo;
