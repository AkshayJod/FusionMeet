import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Alert,
    Chip,
    LinearProgress
} from '@mui/material';
import {
    FiberManualRecord,
    Stop,
    Pause,
    PlayArrow,
    Download
} from '@mui/icons-material';

const RecordingTest = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [error, setError] = useState('');
    const [isSupported, setIsSupported] = useState(true);

    const mediaRecorderRef = useRef();
    const recordedChunksRef = useRef([]);
    const timerRef = useRef();
    const startTimeRef = useRef();
    const streamRef = useRef();

    useEffect(() => {
        // Check MediaRecorder support
        if (!window.MediaRecorder) {
            setIsSupported(false);
            setError('MediaRecorder is not supported in this browser');
        }

        // Get user media for testing
        const getUserMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                streamRef.current = stream;
            } catch (err) {
                setError('Could not access camera/microphone: ' + err.message);
            }
        };

        getUserMedia();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            if (!streamRef.current) {
                throw new Error('No media stream available');
            }

            recordedChunksRef.current = [];
            setRecordedBlob(null);
            setError('');

            const options = {
                mimeType: 'video/webm;codecs=vp9,opus'
            };

            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'video/webm';
            }

            mediaRecorderRef.current = new MediaRecorder(streamRef.current, options);

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, {
                    type: mediaRecorderRef.current.mimeType
                });
                setRecordedBlob(blob);
            };

            mediaRecorderRef.current.onerror = (event) => {
                setError('Recording error: ' + event.error);
                stopRecording();
            };

            mediaRecorderRef.current.start(1000);
            setIsRecording(true);
            setIsPaused(false);
            startTimeRef.current = Date.now();

            timerRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                setRecordingDuration(elapsed);
            }, 1000);

        } catch (err) {
            setError('Failed to start recording: ' + err.message);
        }
    };

    const pauseRecording = () => {
        if (!mediaRecorderRef.current || !isRecording) return;

        if (isPaused) {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
        } else {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
        }
    };

    const stopRecording = () => {
        if (!isRecording) return;

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setIsRecording(false);
        setIsPaused(false);
        setRecordingDuration(0);
    };

    const downloadRecording = () => {
        if (!recordedBlob) return;

        const url = URL.createObjectURL(recordedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recording-test-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isSupported) {
        return (
            <Paper sx={{ p: 3, m: 2 }}>
                <Alert severity="error">
                    Recording is not supported in this browser. Please use Chrome, Firefox, or Safari.
                </Alert>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 3, m: 2 }}>
            <Typography variant="h6" gutterBottom>
                Recording Test
            </Typography>
            
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ mb: 3 }}>
                {isRecording && (
                    <Box sx={{ mb: 2 }}>
                        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                            <FiberManualRecord 
                                sx={{ 
                                    color: 'error.main',
                                    animation: isPaused ? 'none' : 'pulse 1.5s infinite'
                                }} 
                            />
                            <Typography variant="body1" color="error.main" fontWeight="bold">
                                {isPaused ? 'PAUSED' : 'RECORDING'} {formatDuration(recordingDuration)}
                            </Typography>
                        </Box>
                        <LinearProgress 
                            variant="indeterminate" 
                            sx={{ height: 4, borderRadius: 2 }}
                        />
                    </Box>
                )}

                <Box display="flex" gap={2} flexWrap="wrap">
                    {!isRecording ? (
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<FiberManualRecord />}
                            onClick={startRecording}
                        >
                            Start Recording
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="contained"
                                color="warning"
                                startIcon={isPaused ? <PlayArrow /> : <Pause />}
                                onClick={pauseRecording}
                            >
                                {isPaused ? 'Resume' : 'Pause'}
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<Stop />}
                                onClick={stopRecording}
                            >
                                Stop
                            </Button>
                        </>
                    )}

                    {recordedBlob && (
                        <Button
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={downloadRecording}
                        >
                            Download Recording
                        </Button>
                    )}
                </Box>
            </Box>

            <Box>
                <Typography variant="body2" color="text.secondary">
                    This test records your camera and microphone to verify recording functionality.
                </Typography>
                {recordedBlob && (
                    <Chip 
                        label={`Recording ready (${(recordedBlob.size / 1024 / 1024).toFixed(2)} MB)`}
                        color="success"
                        sx={{ mt: 1 }}
                    />
                )}
            </Box>

            <style jsx>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </Paper>
    );
};

export default RecordingTest;
