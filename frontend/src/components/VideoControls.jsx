import React, { useState } from 'react';
import {
    Box,
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
    Slider,
    Typography,
    FormControl,
    InputLabel,
    Select,
    Switch,
    FormControlLabel,
    Divider,
    Paper,
    Grid,
    Button
} from '@mui/material';
import {
    Videocam,
    VideocamOff,
    Mic,
    MicOff,
    ScreenShare,
    StopScreenShare,
    Settings,
    Tune,
    Brightness6,
    Contrast,
    Palette,
    PictureInPicture,
    Fullscreen,
    FullscreenExit,
    GridView,
    ViewAgenda,
    RecordVoiceOver,
    VolumeUp,
    HighQuality
} from '@mui/icons-material';

const VideoControls = ({
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    onToggleVideo,
    onToggleAudio,
    onToggleScreenShare,
    onEndCall,
    // Video quality settings
    videoQuality = 'medium',
    onVideoQualityChange,
    // Video filters
    brightness = 100,
    contrast = 100,
    saturation = 100,
    onBrightnessChange,
    onContrastChange,
    onSaturationChange,
    // Layout settings
    layout = 'grid',
    onLayoutChange,
    // Picture-in-picture
    isPiPEnabled = false,
    onTogglePiP,
    // Fullscreen
    isFullscreen = false,
    onToggleFullscreen,
    // Audio settings
    micVolume = 100,
    speakerVolume = 100,
    onMicVolumeChange,
    onSpeakerVolumeChange,
    // Noise cancellation
    noiseCancellation = false,
    onToggleNoiseCancellation
}) => {
    const [settingsAnchor, setSettingsAnchor] = useState(null);
    const [videoSettingsAnchor, setVideoSettingsAnchor] = useState(null);
    const [audioSettingsAnchor, setAudioSettingsAnchor] = useState(null);

    const handleSettingsClick = (event) => {
        setSettingsAnchor(event.currentTarget);
    };

    const handleVideoSettingsClick = (event) => {
        setVideoSettingsAnchor(event.currentTarget);
    };

    const handleAudioSettingsClick = (event) => {
        setAudioSettingsAnchor(event.currentTarget);
    };

    const handleCloseMenus = () => {
        setSettingsAnchor(null);
        setVideoSettingsAnchor(null);
        setAudioSettingsAnchor(null);
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                bgcolor: 'rgba(0, 0, 0, 0.9)',
                borderRadius: 2,
                p: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                boxShadow: 2
            }}
        >
            {/* Main Controls */}
            <Tooltip title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}>
                <IconButton
                    onClick={onToggleVideo}
                    sx={{
                        bgcolor: isVideoEnabled ? 'transparent' : 'error.main',
                        color: 'white',
                        '&:hover': {
                            bgcolor: isVideoEnabled ? 'rgba(255,255,255,0.1)' : 'error.dark'
                        }
                    }}
                >
                    {isVideoEnabled ? <Videocam /> : <VideocamOff />}
                </IconButton>
            </Tooltip>

            <Tooltip title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}>
                <IconButton
                    onClick={onToggleAudio}
                    sx={{
                        bgcolor: isAudioEnabled ? 'transparent' : 'error.main',
                        color: 'white',
                        '&:hover': {
                            bgcolor: isAudioEnabled ? 'rgba(255,255,255,0.1)' : 'error.dark'
                        }
                    }}
                >
                    {isAudioEnabled ? <Mic /> : <MicOff />}
                </IconButton>
            </Tooltip>

            <Tooltip title={isScreenSharing ? 'Stop sharing' : 'Share screen'}>
                <IconButton
                    onClick={onToggleScreenShare}
                    sx={{
                        bgcolor: isScreenSharing ? 'primary.main' : 'transparent',
                        color: 'white',
                        '&:hover': {
                            bgcolor: isScreenSharing ? 'primary.dark' : 'rgba(255,255,255,0.1)'
                        }
                    }}
                >
                    {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
                </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)', mx: 1 }} />

            {/* Video Settings */}
            <Tooltip title="Video settings">
                <IconButton
                    onClick={handleVideoSettingsClick}
                    sx={{ color: 'white' }}
                >
                    <Tune />
                </IconButton>
            </Tooltip>

            {/* Audio Settings */}
            <Tooltip title="Audio settings">
                <IconButton
                    onClick={handleAudioSettingsClick}
                    sx={{ color: 'white' }}
                >
                    <RecordVoiceOver />
                </IconButton>
            </Tooltip>

            {/* Layout Controls */}
            <Tooltip title="Change layout">
                <IconButton
                    onClick={() => onLayoutChange(layout === 'grid' ? 'speaker' : 'grid')}
                    sx={{ color: 'white' }}
                >
                    {layout === 'grid' ? <ViewAgenda /> : <GridView />}
                </IconButton>
            </Tooltip>

            {/* Picture-in-Picture */}
            <Tooltip title="Picture-in-picture">
                <IconButton
                    onClick={onTogglePiP}
                    sx={{
                        color: 'white',
                        bgcolor: isPiPEnabled ? 'primary.main' : 'transparent'
                    }}
                >
                    <PictureInPicture />
                </IconButton>
            </Tooltip>

            {/* Fullscreen */}
            <Tooltip title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
                <IconButton
                    onClick={onToggleFullscreen}
                    sx={{ color: 'white' }}
                >
                    {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)', mx: 1 }} />

            {/* General Settings */}
            <Tooltip title="More settings">
                <IconButton
                    onClick={handleSettingsClick}
                    sx={{ color: 'white' }}
                >
                    <Settings />
                </IconButton>
            </Tooltip>

            {/* End Call */}
            <Tooltip title="End call">
                <IconButton
                    onClick={onEndCall}
                    sx={{
                        bgcolor: 'error.main',
                        color: 'white',
                        ml: 1,
                        '&:hover': {
                            bgcolor: 'error.dark'
                        }
                    }}
                >
                    <span style={{ fontSize: '20px' }}>📞</span>
                </IconButton>
            </Tooltip>

            {/* Video Settings Menu */}
            <Menu
                anchorEl={videoSettingsAnchor}
                open={Boolean(videoSettingsAnchor)}
                onClose={handleCloseMenus}
                PaperProps={{
                    sx: { minWidth: 300, p: 2 }
                }}
            >
                <Typography variant="h6" gutterBottom>
                    Video Settings
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Video Quality</InputLabel>
                    <Select
                        value={videoQuality}
                        onChange={(e) => onVideoQualityChange(e.target.value)}
                        label="Video Quality"
                    >
                        <MenuItem value="low">Low (360p)</MenuItem>
                        <MenuItem value="medium">Medium (720p)</MenuItem>
                        <MenuItem value="high">High (1080p)</MenuItem>
                        <MenuItem value="ultra">Ultra (4K)</MenuItem>
                    </Select>
                </FormControl>

                <Typography gutterBottom>
                    <Brightness6 sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Brightness: {brightness}%
                </Typography>
                <Slider
                    value={brightness}
                    onChange={(e, value) => onBrightnessChange(value)}
                    min={50}
                    max={150}
                    sx={{ mb: 2 }}
                />

                <Typography gutterBottom>
                    <Contrast sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Contrast: {contrast}%
                </Typography>
                <Slider
                    value={contrast}
                    onChange={(e, value) => onContrastChange(value)}
                    min={50}
                    max={150}
                    sx={{ mb: 2 }}
                />

                <Typography gutterBottom>
                    <Palette sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Saturation: {saturation}%
                </Typography>
                <Slider
                    value={saturation}
                    onChange={(e, value) => onSaturationChange(value)}
                    min={0}
                    max={200}
                />
            </Menu>

            {/* Audio Settings Menu */}
            <Menu
                anchorEl={audioSettingsAnchor}
                open={Boolean(audioSettingsAnchor)}
                onClose={handleCloseMenus}
                PaperProps={{
                    sx: { minWidth: 300, p: 2 }
                }}
            >
                <Typography variant="h6" gutterBottom>
                    Audio Settings
                </Typography>

                <FormControlLabel
                    control={
                        <Switch
                            checked={noiseCancellation}
                            onChange={(e) => onToggleNoiseCancellation(e.target.checked)}
                        />
                    }
                    label="Noise Cancellation"
                    sx={{ mb: 2 }}
                />

                <Typography gutterBottom>
                    <Mic sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Microphone Volume: {micVolume}%
                </Typography>
                <Slider
                    value={micVolume}
                    onChange={(e, value) => onMicVolumeChange(value)}
                    min={0}
                    max={100}
                    sx={{ mb: 2 }}
                />

                <Typography gutterBottom>
                    <VolumeUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Speaker Volume: {speakerVolume}%
                </Typography>
                <Slider
                    value={speakerVolume}
                    onChange={(e, value) => onSpeakerVolumeChange(value)}
                    min={0}
                    max={100}
                />
            </Menu>

            {/* General Settings Menu */}
            <Menu
                anchorEl={settingsAnchor}
                open={Boolean(settingsAnchor)}
                onClose={handleCloseMenus}
                PaperProps={{
                    sx: { minWidth: 250, p: 2 }
                }}
            >
                <Typography variant="h6" gutterBottom>
                    Meeting Settings
                </Typography>
                
                <MenuItem onClick={() => {
                    // Add settings functionality
                    handleCloseMenus();
                }}>
                    <HighQuality sx={{ mr: 2 }} />
                    Video Quality Settings
                </MenuItem>
                
                <MenuItem onClick={() => {
                    // Add virtual background functionality
                    handleCloseMenus();
                }}>
                    <Palette sx={{ mr: 2 }} />
                    Virtual Backgrounds
                </MenuItem>
                
                <MenuItem onClick={() => {
                    // Add recording settings
                    handleCloseMenus();
                }}>
                    📹 Recording Settings
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default VideoControls;
