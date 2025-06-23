/**
 * Emergency Camera Cleanup Utility
 * This utility provides comprehensive camera cleanup functions that can be called
 * from anywhere in the application to ensure camera resources are properly released.
 */

class CameraCleanupManager {
    constructor() {
        this.activeStreams = new Set();
        this.cleanupCallbacks = new Set();
        this.isCleaningUp = false;
    }

    // Register a stream for tracking
    registerStream(stream, label = 'Unknown') {
        if (stream && stream.getTracks) {
            console.log(`CameraCleanup: Registering stream - ${label}`);
            this.activeStreams.add({ stream, label, timestamp: Date.now() });
        }
    }

    // Register a cleanup callback
    registerCleanupCallback(callback, label = 'Unknown') {
        if (typeof callback === 'function') {
            console.log(`CameraCleanup: Registering cleanup callback - ${label}`);
            this.cleanupCallbacks.add({ callback, label });
        }
    }

    // Unregister a stream
    unregisterStream(stream) {
        for (const streamData of this.activeStreams) {
            if (streamData.stream === stream) {
                console.log(`CameraCleanup: Unregistering stream - ${streamData.label}`);
                this.activeStreams.delete(streamData);
                break;
            }
        }
    }

    // Emergency cleanup - stops ALL camera streams
    emergencyCleanup() {
        if (this.isCleaningUp) {
            console.log('CameraCleanup: Emergency cleanup already in progress');
            return;
        }

        this.isCleaningUp = true;
        console.log('CameraCleanup: Starting EMERGENCY camera cleanup...');

        // Stop all registered streams
        for (const streamData of this.activeStreams) {
            try {
                console.log(`CameraCleanup: Emergency stopping stream - ${streamData.label}`);
                streamData.stream.getTracks().forEach(track => {
                    console.log(`CameraCleanup: Emergency stopping ${track.kind} track: ${track.label}`);
                    track.stop();
                });
            } catch (error) {
                console.error(`CameraCleanup: Error stopping stream ${streamData.label}:`, error);
            }
        }

        // Call all cleanup callbacks
        for (const callbackData of this.cleanupCallbacks) {
            try {
                console.log(`CameraCleanup: Calling cleanup callback - ${callbackData.label}`);
                callbackData.callback();
            } catch (error) {
                console.error(`CameraCleanup: Error in cleanup callback ${callbackData.label}:`, error);
            }
        }

        // Clear all references
        this.activeStreams.clear();
        this.cleanupCallbacks.clear();

        // Additional safety: try to stop any remaining media streams
        this.stopAllMediaStreams();

        this.isCleaningUp = false;
        console.log('CameraCleanup: Emergency cleanup completed');
    }

    // Stop all media streams found in the DOM
    stopAllMediaStreams() {
        console.log('CameraCleanup: Scanning for remaining media streams...');
        
        // Check all video elements
        const videoElements = document.querySelectorAll('video');
        videoElements.forEach((video, index) => {
            if (video.srcObject && video.srcObject.getTracks) {
                console.log(`CameraCleanup: Found video element ${index} with stream, stopping tracks`);
                video.srcObject.getTracks().forEach(track => {
                    console.log(`CameraCleanup: Stopping track from video element: ${track.kind} - ${track.label}`);
                    track.stop();
                });
                video.srcObject = null;
            }
        });

        // Try to access and stop any remaining getUserMedia streams
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
            navigator.mediaDevices.enumerateDevices()
                .then(devices => {
                    console.log('CameraCleanup: Available media devices:', devices.length);
                })
                .catch(error => {
                    console.log('CameraCleanup: Could not enumerate devices:', error);
                });
        }
    }

    // Get status of active streams
    getStatus() {
        return {
            activeStreams: this.activeStreams.size,
            cleanupCallbacks: this.cleanupCallbacks.size,
            isCleaningUp: this.isCleaningUp
        };
    }

    // Force cleanup on page unload
    setupPageUnloadCleanup() {
        const cleanup = () => {
            console.log('CameraCleanup: Page unload detected, performing emergency cleanup');
            this.emergencyCleanup();
        };

        window.addEventListener('beforeunload', cleanup);
        window.addEventListener('unload', cleanup);
        window.addEventListener('pagehide', cleanup);

        // Also handle visibility change (when tab is closed/hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                console.log('CameraCleanup: Page hidden, performing emergency cleanup');
                this.emergencyCleanup();
            }
        });
    }
}

// Create global instance
const cameraCleanupManager = new CameraCleanupManager();

// Setup page unload cleanup
cameraCleanupManager.setupPageUnloadCleanup();

// Export functions for easy use
export const registerStream = (stream, label) => cameraCleanupManager.registerStream(stream, label);
export const unregisterStream = (stream) => cameraCleanupManager.unregisterStream(stream);
export const registerCleanupCallback = (callback, label) => cameraCleanupManager.registerCleanupCallback(callback, label);
export const emergencyCleanup = () => cameraCleanupManager.emergencyCleanup();
export const getCleanupStatus = () => cameraCleanupManager.getStatus();

export default cameraCleanupManager;
