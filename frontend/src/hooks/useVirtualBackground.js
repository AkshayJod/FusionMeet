import { useState, useEffect, useRef, useCallback } from 'react';
import VirtualBackground from '../utils/VirtualBackground';

const useVirtualBackground = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [backgroundType, setBackgroundType] = useState('none');
    const [blurAmount, setBlurAmount] = useState(15);
    const [performanceMode, setPerformanceMode] = useState('balanced');
    const [error, setError] = useState(null);
    
    const virtualBgRef = useRef(null);
    const processedStreamRef = useRef(null);
    const animationFrameRef = useRef(null);
    const canvasRef = useRef(null);
    const originalStreamRef = useRef(null);

    // Initialize virtual background
    const initialize = useCallback(async () => {
        if (isInitialized) return true;

        try {
            setError(null);
            virtualBgRef.current = new VirtualBackground();
            const success = await virtualBgRef.current.initialize();
            
            if (success) {
                setIsInitialized(true);
                console.log('Virtual background initialized successfully');
                return true;
            } else {
                throw new Error('Failed to initialize virtual background');
            }
        } catch (err) {
            console.error('Virtual background initialization error:', err);
            setError(err.message);
            return false;
        }
    }, [isInitialized]);

    // Create processed video stream
    const createProcessedStream = useCallback(async (originalStream) => {
        if (!isInitialized || !virtualBgRef.current || !originalStream) {
            console.log('VirtualBackground: Cannot create processed stream - not initialized or no stream');
            return originalStream;
        }

        // Clean up previous processed stream if it exists
        if (processedStreamRef.current && processedStreamRef.current !== originalStream) {
            console.log('VirtualBackground: Cleaning up previous processed stream');
            processedStreamRef.current.getTracks().forEach(track => {
                if (track.kind === 'video') {
                    console.log(`VirtualBackground: Stopping previous processed ${track.kind} track`);
                    track.stop();
                }
            });
        }

        try {
            console.log('VirtualBackground: Creating processed stream from original stream');

            // Create canvas for processed video
            if (!canvasRef.current) {
                canvasRef.current = document.createElement('canvas');
            }

            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            // Create video element from stream
            const video = document.createElement('video');
            video.srcObject = originalStream;
            video.autoplay = true;
            video.muted = true;
            video.playsInline = true;

            // Wait for video to be ready
            await new Promise((resolve) => {
                video.onloadedmetadata = () => {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    console.log(`VirtualBackground: Video ready - ${canvas.width}x${canvas.height}`);
                    resolve();
                };
            });

            // Store original stream reference
            originalStreamRef.current = originalStream;

            // Create processing loop
            const processFrame = async () => {
                if (!isEnabled || backgroundType === 'none') {
                    // Just draw original video
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                } else {
                    // Process with virtual background
                    setIsProcessing(true);
                    try {
                        const processedImageData = await virtualBgRef.current.processFrame(video);
                        if (processedImageData) {
                            ctx.putImageData(processedImageData, 0, 0);
                        } else {
                            // Fallback to original video
                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        }
                    } catch (err) {
                        console.error('Frame processing error:', err);
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    }
                    setIsProcessing(false);
                }

                if (isEnabled) {
                    animationFrameRef.current = requestAnimationFrame(processFrame);
                }
            };

            // Start processing loop
            processFrame();

            // Create stream from canvas
            const processedStream = canvas.captureStream(30);
            console.log('VirtualBackground: Created canvas stream with video track');

            // Add audio tracks from original stream
            const audioTracks = originalStream.getAudioTracks();
            audioTracks.forEach(track => {
                processedStream.addTrack(track);
                console.log(`VirtualBackground: Added ${track.kind} track to processed stream`);
            });

            processedStreamRef.current = processedStream;
            console.log('VirtualBackground: Processed stream created successfully');
            return processedStream;

        } catch (err) {
            console.error('Error creating processed stream:', err);
            setError(err.message);
            return originalStream;
        }
    }, [isInitialized, isEnabled, backgroundType]);

    // Enable/disable virtual background
    const toggleVirtualBackground = useCallback(async (enabled) => {
        if (enabled && !isInitialized) {
            const success = await initialize();
            if (!success) return false;
        }

        setIsEnabled(enabled);
        
        if (!enabled && animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        return true;
    }, [initialize, isInitialized]);

    // Change background settings
    const changeBackground = useCallback(async ({ type, image, blurAmount: newBlurAmount }) => {
        if (!virtualBgRef.current) return;

        setBackgroundType(type);
        
        if (newBlurAmount !== undefined) {
            setBlurAmount(newBlurAmount);
            virtualBgRef.current.setBlurAmount(newBlurAmount);
        }

        virtualBgRef.current.setBackgroundType(type);
        
        if (type === 'image' && image) {
            virtualBgRef.current.setBackgroundImage(image);
        }

        console.log(`Background changed to: ${type}`);
    }, []);

    // Get current processed stream
    const getProcessedStream = useCallback(() => {
        return processedStreamRef.current;
    }, []);

    // Get original stream
    const getOriginalStream = useCallback(() => {
        return originalStreamRef.current;
    }, []);

    // Set performance mode
    const setPerformanceModeCallback = useCallback((mode) => {
        if (virtualBgRef.current) {
            virtualBgRef.current.setPerformanceMode(mode);
            setPerformanceMode(mode);
        }
    }, []);

    // Cleanup
    const cleanup = useCallback(() => {
        console.log('VirtualBackground: Starting cleanup...');

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        if (virtualBgRef.current) {
            virtualBgRef.current.cleanup();
            virtualBgRef.current = null;
        }

        if (processedStreamRef.current) {
            console.log('VirtualBackground: Stopping processed stream tracks');
            processedStreamRef.current.getTracks().forEach(track => {
                console.log(`VirtualBackground: Stopping ${track.kind} track:`, track.label);
                track.stop();
            });
            processedStreamRef.current = null;
        }

        if (originalStreamRef.current) {
            console.log('VirtualBackground: Clearing original stream reference');
            originalStreamRef.current = null;
        }

        setIsInitialized(false);
        setIsEnabled(false);
        setIsProcessing(false);
        setError(null);

        console.log('VirtualBackground: Cleanup completed');
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    return {
        isEnabled,
        isInitialized,
        isProcessing,
        backgroundType,
        blurAmount,
        performanceMode,
        error,
        initialize,
        toggleVirtualBackground,
        changeBackground,
        createProcessedStream,
        getProcessedStream,
        getOriginalStream,
        setPerformanceMode: setPerformanceModeCallback,
        cleanup
    };
};

export default useVirtualBackground;
