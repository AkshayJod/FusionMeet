import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Avatar,
    Switch,
    FormControlLabel,
    Divider,
    Paper,
    IconButton,
    Alert
} from '@mui/material';
import {
    Videocam,
    VideocamOff,
    Mic,
    MicOff,
    Settings,
    ArrowBack,
    Wallpaper as BackgroundIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import BackgroundSelector from './BackgroundSelector';
import useVirtualBackground from '../hooks/useVirtualBackground';
import { registerStream, unregisterStream, emergencyCleanup } from '../utils/cameraCleanup';

const MeetingLobby = ({ onJoinMeeting }) => {
    const [username, setUsername] = useState('');
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const processedStreamRef = useRef(null);
    const navigate = useNavigate();
    const { meetingId } = useParams();

    // Virtual background hook
    const {
        isEnabled: isVirtualBgEnabled,
        isInitialized: isVirtualBgInitialized,
        backgroundType,
        blurAmount,
        error: virtualBgError,
        initialize: initializeVirtualBg,
        toggleVirtualBackground,
        changeBackground,
        createProcessedStream
    } = useVirtualBackground();

    useEffect(() => {
        // Get user media for preview
        const getUserMedia = async () => {
            try {
                setCameraError(null);
                console.log('Requesting camera access...');

                // Check if getUserMedia is supported
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error('Camera not supported in this browser');
                }

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: videoEnabled ? {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'user'
                    } : false,
                    audio: audioEnabled
                });

                console.log('Camera access granted, stream:', stream);
                console.log('Video tracks:', stream.getVideoTracks().map(t => ({
                    kind: t.kind,
                    enabled: t.enabled,
                    readyState: t.readyState,
                    label: t.label
                })));
                console.log('Audio tracks:', stream.getAudioTracks().map(t => ({
                    kind: t.kind,
                    enabled: t.enabled,
                    readyState: t.readyState,
                    label: t.label
                })));
                streamRef.current = stream;

                // Register stream for emergency cleanup
                registerStream(stream, 'MeetingLobby-OriginalStream');

                // Create processed stream if virtual background is enabled
                console.log('Virtual background status:', { isVirtualBgEnabled, isVirtualBgInitialized });
                if (isVirtualBgEnabled && isVirtualBgInitialized) {
                    try {
                        console.log('Creating processed stream...');
                        const processed = await createProcessedStream(stream);
                        console.log('Processed stream created:', processed);
                        processedStreamRef.current = processed;

                        // Register processed stream for emergency cleanup
                        registerStream(processed, 'MeetingLobby-ProcessedStream');
                        if (videoRef.current) {
                            videoRef.current.srcObject = processed;
                            // Force video to play
                            videoRef.current.play().catch(error => {
                                console.warn('MeetingLobby: Processed video play failed:', error);
                            });
                        }
                    } catch (error) {
                        console.error('Error creating processed stream:', error);
                        if (videoRef.current) {
                            videoRef.current.srcObject = stream;
                        }
                    }
                } else {
                    console.log('Using original stream');
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        // Force video to play
                        videoRef.current.play().catch(error => {
                            console.warn('MeetingLobby: Video play failed:', error);
                        });
                    }
                }
            } catch (error) {
                console.error('Error accessing media devices:', error);
                let errorMessage = 'Camera access failed';

                if (error.name === 'NotAllowedError') {
                    errorMessage = 'Camera permission denied. Please allow camera access and refresh.';
                } else if (error.name === 'NotFoundError') {
                    errorMessage = 'No camera found. Please connect a camera.';
                } else if (error.name === 'NotReadableError') {
                    errorMessage = 'Camera is being used by another application.';
                } else {
                    errorMessage = `Camera error: ${error.message}`;
                }

                setCameraError(errorMessage);
            }
        };

        getUserMedia();

        // Navigation cleanup handlers
        const handleBeforeUnload = (event) => {
            console.log('MeetingLobby: Before unload detected, performing emergency cleanup');
            emergencyCleanup();
        };

        const handlePopState = (event) => {
            console.log('MeetingLobby: Navigation detected (back button), performing emergency cleanup');
            emergencyCleanup();
        };

        // Add event listeners for navigation
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        // Cleanup function
        return () => {
            // Remove navigation event listeners
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
            console.log('MeetingLobby: Cleaning up streams...');

            if (streamRef.current) {
                console.log('MeetingLobby: Stopping original stream tracks');
                streamRef.current.getTracks().forEach(track => {
                    console.log(`MeetingLobby: Stopping ${track.kind} track:`, track.label);
                    track.stop();
                });
                streamRef.current = null;
            }

            if (processedStreamRef.current) {
                console.log('MeetingLobby: Stopping processed stream tracks');
                processedStreamRef.current.getTracks().forEach(track => {
                    console.log(`MeetingLobby: Stopping ${track.kind} track:`, track.label);
                    track.stop();
                });
                processedStreamRef.current = null;
            }

            console.log('MeetingLobby: Stream cleanup completed');

            // CRITICAL: Trigger emergency cleanup as final safety measure
            console.log('MeetingLobby: Triggering emergency cleanup as final safety measure');
            emergencyCleanup();
        };
    }, [videoEnabled, audioEnabled, isVirtualBgEnabled, isVirtualBgInitialized, createProcessedStream]);

    const handleJoinMeeting = () => {
        if (!username.trim()) {
            alert('Please enter your name');
            return;
        }

        const streamToUse = processedStreamRef.current || streamRef.current;
        console.log('MeetingLobby: Joining meeting with stream', {
            hasProcessedStream: !!processedStreamRef.current,
            hasOriginalStream: !!streamRef.current,
            usingStream: streamToUse,
            streamTracks: streamToUse ? streamToUse.getTracks().map(t => ({
                kind: t.kind,
                enabled: t.enabled,
                readyState: t.readyState,
                label: t.label
            })) : null,
            videoEnabled,
            audioEnabled
        });

        setIsLoading(true);
        onJoinMeeting({
            username: username.trim(),
            videoEnabled,
            audioEnabled,
            stream: streamToUse,
            // Pass virtual background state
            virtualBackground: {
                isEnabled: isVirtualBgEnabled,
                isInitialized: isVirtualBgInitialized,
                backgroundType,
                blurAmount,
                hasProcessedStream: !!processedStreamRef.current
            }
        });
    };

    const handleBackgroundChange = async ({ type, image, blurAmount }) => {
        try {
            await changeBackground({ type, image, blurAmount });

            // Recreate processed stream with new background
            if (streamRef.current) {
                const processed = await createProcessedStream(streamRef.current);
                processedStreamRef.current = processed;
                if (videoRef.current) {
                    videoRef.current.srcObject = processed;
                }
            }
        } catch (error) {
            console.error('Error changing background:', error);
        }
    };

    const handleToggleVirtualBackground = async () => {
        if (!isVirtualBgInitialized) {
            await initializeVirtualBg();
        }

        const enabled = !isVirtualBgEnabled;
        await toggleVirtualBackground(enabled);

        if (enabled && streamRef.current) {
            const processed = await createProcessedStream(streamRef.current);
            processedStreamRef.current = processed;
            if (videoRef.current) {
                videoRef.current.srcObject = processed;
            }
        } else if (!enabled && streamRef.current) {
            if (videoRef.current) {
                videoRef.current.srcObject = streamRef.current;
            }
        }
    };

    const toggleVideo = async () => {
        const newVideoState = !videoEnabled;
        setVideoEnabled(newVideoState);

        if (!newVideoState) {
            // Video is being turned OFF - stop camera tracks to turn off camera light
            console.log('MeetingLobby: Turning video OFF - stopping camera tracks');
            if (streamRef.current) {
                const videoTrack = streamRef.current.getVideoTracks()[0];
                if (videoTrack) {
                    videoTrack.stop();
                    streamRef.current.removeTrack(videoTrack);
                }
            }

            // Also stop processed stream video tracks
            if (processedStreamRef.current) {
                const processedVideoTrack = processedStreamRef.current.getVideoTracks()[0];
                if (processedVideoTrack) {
                    processedVideoTrack.stop();
                    processedStreamRef.current.removeTrack(processedVideoTrack);
                }
            }

            // Clear video element
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        } else {
            // Video is being turned ON - this will trigger the useEffect to get new stream
            console.log('MeetingLobby: Turning video ON - will request new camera stream');
        }
    };

    const toggleAudio = () => {
        const newAudioState = !audioEnabled;
        setAudioEnabled(newAudioState);
        if (streamRef.current) {
            const audioTrack = streamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = newAudioState;
            }
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2
            }}
        >
            <Card sx={{ maxWidth: 600, width: '100%', borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={2}>
                            <IconButton 
                                onClick={() => navigate('/home')} 
                                sx={{ color: 'white' }}
                            >
                                <ArrowBack />
                            </IconButton>
                            <Typography variant="h5" fontWeight="bold">
                                Join Meeting
                            </Typography>
                        </Box>
                        <IconButton sx={{ color: 'white' }}>
                            <Settings />
                        </IconButton>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                        Meeting ID: {meetingId}
                    </Typography>
                </Box>

                <CardContent sx={{ p: 4 }}>
                    {/* Error Alerts */}
                    {cameraError && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {cameraError}
                        </Alert>
                    )}
                    {virtualBgError && (
                        <Alert severity="warning" sx={{ mb: 3 }}>
                            Virtual Background: {virtualBgError}
                        </Alert>
                    )}

                    {/* Video Preview */}
                    <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Paper
                            elevation={3}
                            sx={{
                                width: 320,
                                height: 240,
                                mx: 'auto',
                                borderRadius: 2,
                                overflow: 'hidden',
                                position: 'relative',
                                bgcolor: '#000'
                            }}
                        >
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    display: videoEnabled ? 'block' : 'none'
                                }}
                            />
                            {!videoEnabled && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }}>
                                        {username.charAt(0).toUpperCase() || 'U'}
                                    </Avatar>
                                    <Typography variant="body2" color="white">
                                        Camera is off
                                    </Typography>
                                </Box>
                            )}
                        </Paper>

                        {/* Media Controls */}
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                            <IconButton
                                onClick={toggleVideo}
                                sx={{
                                    bgcolor: videoEnabled ? 'success.main' : 'error.main',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: videoEnabled ? 'success.dark' : 'error.dark'
                                    }
                                }}
                            >
                                {videoEnabled ? <Videocam /> : <VideocamOff />}
                            </IconButton>
                            <IconButton
                                onClick={toggleAudio}
                                sx={{
                                    bgcolor: audioEnabled ? 'success.main' : 'error.main',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: audioEnabled ? 'success.dark' : 'error.dark'
                                    }
                                }}
                            >
                                {audioEnabled ? <Mic /> : <MicOff />}
                            </IconButton>
                            <IconButton
                                onClick={() => setShowBackgroundSelector(true)}
                                sx={{
                                    bgcolor: isVirtualBgEnabled ? 'primary.main' : 'grey.600',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: isVirtualBgEnabled ? 'primary.dark' : 'grey.700'
                                    }
                                }}
                                disabled={!videoEnabled}
                            >
                                <BackgroundIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* User Input */}
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            fullWidth
                            label="Your Name"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            variant="outlined"
                            placeholder="Enter your name"
                            sx={{ mb: 2 }}
                        />
                    </Box>

                    {/* Join Button */}
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleJoinMeeting}
                        disabled={isLoading || !username.trim()}
                        sx={{
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            borderRadius: 2
                        }}
                    >
                        {isLoading ? 'Joining...' : 'Join Meeting'}
                    </Button>
                </CardContent>
            </Card>

            {/* Background Selector Dialog */}
            <BackgroundSelector
                open={showBackgroundSelector}
                onClose={() => setShowBackgroundSelector(false)}
                onBackgroundChange={handleBackgroundChange}
                currentBackground={backgroundType}
                currentBlurAmount={blurAmount}
            />
        </Box>
    );
};

export default MeetingLobby;
