import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';

const CameraTest = () => {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [error, setError] = useState(null);
    const [permissionStatus, setPermissionStatus] = useState('checking');

    const startCamera = async () => {
        try {
            console.log('Requesting camera access...');
            setError(null);
            setPermissionStatus('requesting');

            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia is not supported in this browser');
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: true
            });

            console.log('Camera access granted!', mediaStream);
            setStream(mediaStream);
            setPermissionStatus('granted');

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

        } catch (err) {
            console.error('Camera access error:', err);
            setError(err.message);
            setPermissionStatus('denied');

            // Provide specific error messages
            if (err.name === 'NotAllowedError') {
                setError('Camera access denied. Please allow camera permissions and refresh the page.');
            } else if (err.name === 'NotFoundError') {
                setError('No camera found. Please connect a camera and try again.');
            } else if (err.name === 'NotReadableError') {
                setError('Camera is already in use by another application.');
            } else {
                setError(`Camera error: ${err.message}`);
            }
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setPermissionStatus('stopped');
        }
    };

    // Check browser support on mount
    useEffect(() => {
        console.log('=== Camera Test Debug Info ===');
        console.log('Navigator exists:', !!navigator);
        console.log('MediaDevices exists:', !!navigator.mediaDevices);
        console.log('getUserMedia exists:', !!navigator.mediaDevices?.getUserMedia);
        console.log('Current URL:', window.location.href);
        console.log('Is HTTPS or localhost:', window.location.protocol === 'https:' || window.location.hostname === 'localhost');

        // Don't auto-start, let user click button
        // startCamera();

        // Cleanup on unmount
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                Camera Test - Debug Mode
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
                Permission Status: <strong>{permissionStatus}</strong>
            </Typography>

            <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>Debug Info:</Typography>
                <Typography variant="body2">
                    • Browser: {navigator.userAgent.split(' ').pop()}<br/>
                    • URL: {window.location.href}<br/>
                    • Protocol: {window.location.protocol}<br/>
                    • MediaDevices Support: {navigator.mediaDevices ? '✅ Yes' : '❌ No'}<br/>
                    • getUserMedia Support: {navigator.mediaDevices?.getUserMedia ? '✅ Yes' : '❌ No'}<br/>
                    • Is Secure Context: {window.isSecureContext ? '✅ Yes' : '❌ No'}
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box
                sx={{
                    width: '100%',
                    height: 300,
                    bgcolor: '#000',
                    borderRadius: 2,
                    overflow: 'hidden',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
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
                        objectFit: 'cover'
                    }}
                />
                {!stream && (
                    <Typography color="white">
                        {permissionStatus === 'checking' && 'Checking camera...'}
                        {permissionStatus === 'requesting' && 'Requesting camera access...'}
                        {permissionStatus === 'denied' && 'Camera access denied'}
                        {permissionStatus === 'stopped' && 'Camera stopped'}
                    </Typography>
                )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                    variant="contained" 
                    onClick={startCamera}
                    disabled={permissionStatus === 'requesting'}
                >
                    Start Camera
                </Button>
                <Button 
                    variant="outlined" 
                    onClick={stopCamera}
                    disabled={!stream}
                >
                    Stop Camera
                </Button>
            </Box>

            <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Troubleshooting Tips:
                </Typography>
                <Typography variant="body2" component="div">
                    <ul>
                        <li>Make sure you're using HTTPS or localhost</li>
                        <li>Check browser permissions (click the camera icon in address bar)</li>
                        <li>Ensure no other application is using the camera</li>
                        <li>Try refreshing the page</li>
                        <li>Check browser console for detailed errors</li>
                    </ul>
                </Typography>
            </Box>
        </Box>
    );
};

export default CameraTest;
