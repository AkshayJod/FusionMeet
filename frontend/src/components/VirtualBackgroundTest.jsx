import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import useVirtualBackground from '../hooks/useVirtualBackground';
import BackgroundSelector from './BackgroundSelector';

const VirtualBackgroundTest = () => {
    const [stream, setStream] = useState(null);
    const [error, setError] = useState('');
    const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
    const videoRef = useRef(null);
    const processedVideoRef = useRef(null);

    const {
        isEnabled,
        isInitialized,
        isProcessing,
        backgroundType,
        blurAmount,
        performanceMode,
        error: virtualBgError,
        initialize,
        toggleVirtualBackground,
        changeBackground,
        createProcessedStream,
        setPerformanceMode
    } = useVirtualBackground();

    useEffect(() => {
        startCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            setError('Failed to access camera: ' + err.message);
        }
    };

    const handleToggleVirtualBackground = async () => {
        if (!isInitialized) {
            await initialize();
        }
        
        const enabled = !isEnabled;
        await toggleVirtualBackground(enabled);
        
        if (enabled && stream) {
            const processed = await createProcessedStream(stream);
            if (processedVideoRef.current) {
                processedVideoRef.current.srcObject = processed;
            }
        }
    };

    const handleBackgroundChange = async (backgroundSettings) => {
        await changeBackground(backgroundSettings);
        
        if (isEnabled && stream) {
            const processed = await createProcessedStream(stream);
            if (processedVideoRef.current) {
                processedVideoRef.current.srcObject = processed;
            }
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                Virtual Background Test
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {virtualBgError && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Virtual Background: {virtualBgError}
                </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Paper sx={{ p: 2, flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        Original Video
                    </Typography>
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{
                            width: '100%',
                            maxWidth: 320,
                            height: 240,
                            backgroundColor: '#000',
                            borderRadius: 8
                        }}
                    />
                </Paper>

                <Paper sx={{ p: 2, flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                        Processed Video {isProcessing && <CircularProgress size={16} />}
                    </Typography>
                    <video
                        ref={processedVideoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{
                            width: '100%',
                            maxWidth: 320,
                            height: 240,
                            backgroundColor: '#000',
                            borderRadius: 8
                        }}
                    />
                </Paper>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Button
                    variant="contained"
                    onClick={handleToggleVirtualBackground}
                    disabled={!stream}
                >
                    {isEnabled ? 'Disable' : 'Enable'} Virtual Background
                </Button>

                <Button
                    variant="outlined"
                    onClick={() => setShowBackgroundSelector(true)}
                    disabled={!isEnabled}
                >
                    Change Background
                </Button>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Performance</InputLabel>
                    <Select
                        value={performanceMode}
                        label="Performance"
                        onChange={(e) => setPerformanceMode(e.target.value)}
                    >
                        <MenuItem value="performance">Performance</MenuItem>
                        <MenuItem value="balanced">Balanced</MenuItem>
                        <MenuItem value="quality">Quality</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Status: {isInitialized ? 'Initialized' : 'Not initialized'} | 
                    Background: {backgroundType} | 
                    {backgroundType === 'blur' && `Blur: ${blurAmount}px`}
                </Typography>
            </Box>

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

export default VirtualBackgroundTest;
