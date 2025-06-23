import React, { useEffect, useRef, useState, useContext } from 'react'
import io from "socket.io-client";
import { useParams } from 'react-router-dom';
import MeetingLobby from '../components/MeetingLobby';
import MeetingRoom from '../components/MeetingRoom';
import { AuthContext } from '../contexts/AuthContext';
import server from '../environment';
import useVirtualBackground from '../hooks/useVirtualBackground';
import { registerStream, unregisterStream, registerCleanupCallback, emergencyCleanup } from '../utils/cameraCleanup';
import { useNotification } from '../components/NotificationSystem';

const server_url = server;
var connections = {};
var connectionStates = {};
var reconnectionAttempts = {};

// Enhanced ICE server configuration with multiple STUN/TURN servers
const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" },
        { "urls": "stun:stun1.l.google.com:19302" },
        { "urls": "stun:stun2.l.google.com:19302" },
        { "urls": "stun:stun3.l.google.com:19302" },
        { "urls": "stun:stun4.l.google.com:19302" }
    ],
    "iceCandidatePoolSize": 10
}

export default function VideoMeetComponent() {
    const { meetingId } = useParams();
    const { addToUserHistory } = useContext(AuthContext);
    const { showSuccess, showError, showInfo } = useNotification();

    // State management
    const [inLobby, setInLobby] = useState(true);
    const [username, setUsername] = useState("");
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [messages, setMessages] = useState([]);
    const [remoteStreams, setRemoteStreams] = useState([]);

    // Connection quality and status
    const [connectionQuality, setConnectionQuality] = useState({});
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionErrors, setConnectionErrors] = useState([]);

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [recordingQuality, setRecordingQuality] = useState('high'); // 'low', 'medium', 'high'

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
        createProcessedStream,
        cleanup: cleanupVirtualBackground
    } = useVirtualBackground();

    // Refs
    const socketRef = useRef();
    const socketIdRef = useRef();
    const localStreamRef = useRef();
    const reconnectionTimeouts = useRef({});
    const mediaRecorderRef = useRef();
    const recordedChunksRef = useRef([]);
    const recordingTimerRef = useRef();
    const recordingStartTimeRef = useRef();

    // Utility functions for connection management
    const logConnectionError = (error, context = '') => {
        console.error(`WebRTC Error ${context}:`, error);
        setConnectionErrors(prev => [...prev, {
            error: error.message || error,
            context,
            timestamp: new Date()
        }]);
    };

    // Comprehensive stream disposal utility
    const disposeAllStreams = () => {
        console.log('VideoMeet: Starting comprehensive stream disposal...');

        // Stop local stream
        if (localStreamRef.current) {
            console.log('VideoMeet: Disposing local stream');
            localStreamRef.current.getTracks().forEach(track => {
                console.log(`VideoMeet: Stopping ${track.kind} track: ${track.label}`);
                track.stop();
            });
            localStreamRef.current = null;
        }

        // Clean up virtual background
        if (typeof cleanupVirtualBackground === 'function') {
            console.log('VideoMeet: Disposing virtual background streams');
            cleanupVirtualBackground();
        }

        // Stop all remote streams
        remoteStreams.forEach(streamData => {
            if (streamData.stream) {
                console.log(`VideoMeet: Disposing remote stream for ${streamData.socketId}`);
                streamData.stream.getTracks().forEach(track => {
                    console.log(`VideoMeet: Stopping remote ${track.kind} track: ${track.label}`);
                    track.stop();
                });
            }
        });

        console.log('VideoMeet: Comprehensive stream disposal completed');
    };

    const updateConnectionQuality = (socketId, stats) => {
        setConnectionQuality(prev => ({
            ...prev,
            [socketId]: {
                ...stats,
                lastUpdated: new Date()
            }
        }));
    };

    const cleanupConnection = (socketId) => {
        if (connections[socketId]) {
            connections[socketId].close();
            delete connections[socketId];
        }
        if (connectionStates[socketId]) {
            delete connectionStates[socketId];
        }
        if (reconnectionAttempts[socketId]) {
            delete reconnectionAttempts[socketId];
        }
        if (reconnectionTimeouts.current[socketId]) {
            clearTimeout(reconnectionTimeouts.current[socketId]);
            delete reconnectionTimeouts.current[socketId];
        }
    };

    // Initialize socket connection and WebRTC
    useEffect(() => {
        if (!inLobby && localStreamRef.current) {
            setIsConnecting(true);
            connectToSocketServer();

            // Register the local stream for emergency cleanup
            registerStream(localStreamRef.current, 'VideoMeet-LocalStream');
        }

        // Additional navigation cleanup handlers
        const handleBeforeUnload = (event) => {
            console.log('VideoMeet: Before unload detected, performing emergency cleanup');
            emergencyCleanup();
            // Don't prevent the unload, just cleanup
        };

        const handlePopState = (event) => {
            console.log('VideoMeet: Navigation detected (back button), performing emergency cleanup');
            emergencyCleanup();
        };

        // Add event listeners for navigation
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        // Register cleanup callback for emergency cleanup
        registerCleanupCallback(() => {
            console.log('VideoMeet: Emergency cleanup callback triggered');
            disposeAllStreams();
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        }, 'VideoMeet-EmergencyCleanup');

        return () => {
            // Remove navigation event listeners
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);

            // Cleanup on unmount
            console.log('VideoMeet: Starting comprehensive cleanup...');

            if (socketRef.current) {
                socketRef.current.disconnect();
            }

            // Dispose all streams comprehensively
            disposeAllStreams();

            // Clean up peer connections
            Object.keys(connections).forEach(cleanupConnection);
            // Clear all reconnection timeouts
            Object.values(reconnectionTimeouts.current).forEach(clearTimeout);
            // Stop recording if active
            if (isRecording) {
                stopRecording();
            }

            console.log('VideoMeet: Comprehensive cleanup completed');
        };
    }, [inLobby]);

    const connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });

        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href);
            socketIdRef.current = socketRef.current.id;

            socketRef.current.on('chat-message', addMessage);

            socketRef.current.on('user-left', (id) => {
                setRemoteStreams((streams) => streams.filter((stream) => stream.socketId !== id));
                setParticipants((participants) => participants.filter((p) => p.socketId !== id));

                // Close and clean up the peer connection
                if (connections[id]) {
                    connections[id].close();
                    delete connections[id];
                }
            });

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    if (socketListId === socketIdRef.current) return;

                    createPeerConnection(socketListId);
                });

                if (id === socketIdRef.current) {
                    // Create offers for all existing connections
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue;
                        createOfferForPeer(id2);
                    }
                }
            });
        });
    };

    const createPeerConnection = (socketId) => {
        try {
            // Clean up existing connection if any
            if (connections[socketId]) {
                cleanupConnection(socketId);
            }

            connections[socketId] = new RTCPeerConnection(peerConfigConnections);
            connectionStates[socketId] = 'connecting';
            reconnectionAttempts[socketId] = 0;

            // Connection state monitoring
            connections[socketId].onconnectionstatechange = () => {
                const state = connections[socketId].connectionState;
                connectionStates[socketId] = state;

                console.log(`Connection state for ${socketId}: ${state}`);

                if (state === 'connected') {
                    setIsConnecting(false);
                    // Start monitoring connection quality
                    monitorConnectionQuality(socketId);
                } else if (state === 'disconnected' || state === 'failed') {
                    handleConnectionFailure(socketId);
                }
            };

            // ICE connection state monitoring
            connections[socketId].oniceconnectionstatechange = () => {
                const iceState = connections[socketId].iceConnectionState;
                console.log(`ICE connection state for ${socketId}: ${iceState}`);

                if (iceState === 'failed' || iceState === 'disconnected') {
                    handleConnectionFailure(socketId);
                }
            };

            // Enhanced ICE candidate handling
            connections[socketId].onicecandidate = function (event) {
                if (event.candidate != null) {
                    try {
                        socketRef.current.emit('signal', socketId, JSON.stringify({ 'ice': event.candidate }));
                    } catch (error) {
                        logConnectionError(error, `ICE candidate for ${socketId}`);
                    }
                } else {
                    console.log('ICE gathering complete for', socketId);
                }
            };

            // Enhanced stream handling
            connections[socketId].ontrack = (event) => {
                console.log('Received remote stream:', event.streams[0]);

                setRemoteStreams(streams => {
                    const existingStream = streams.find(stream => stream.socketId === socketId);
                    if (existingStream) {
                        return streams.map(stream =>
                            stream.socketId === socketId
                                ? { ...stream, stream: event.streams[0] }
                                : stream
                        );
                    } else {
                        return [...streams, {
                            socketId: socketId,
                            stream: event.streams[0],
                            autoplay: true,
                            playsinline: true
                        }];
                    }
                });

                setParticipants(participants => {
                    const exists = participants.find(p => p.socketId === socketId);
                    if (!exists) {
                        return [...participants, {
                            socketId: socketId,
                            name: `Participant ${socketId.substring(0, 6)}`
                        }];
                    }
                    return participants;
                });
            };

            // Add local stream tracks
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => {
                    try {
                        connections[socketId].addTrack(track, localStreamRef.current);
                    } catch (error) {
                        logConnectionError(error, `Adding track for ${socketId}`);
                    }
                });
            }

        } catch (error) {
            logConnectionError(error, `Creating peer connection for ${socketId}`);
        }
    };

    const handleConnectionFailure = (socketId) => {
        const maxRetries = 3;
        const retryDelay = 2000; // 2 seconds

        if (!reconnectionAttempts[socketId]) {
            reconnectionAttempts[socketId] = 0;
        }

        if (reconnectionAttempts[socketId] < maxRetries) {
            reconnectionAttempts[socketId]++;
            console.log(`Attempting to reconnect to ${socketId} (attempt ${reconnectionAttempts[socketId]})`);

            reconnectionTimeouts.current[socketId] = setTimeout(() => {
                createPeerConnection(socketId);
                // Trigger renegotiation
                if (connections[socketId] && socketIdRef.current) {
                    connections[socketId].createOffer()
                        .then(description => connections[socketId].setLocalDescription(description))
                        .then(() => {
                            socketRef.current.emit('signal', socketId, JSON.stringify({ 'sdp': connections[socketId].localDescription }));
                        })
                        .catch(error => logConnectionError(error, `Reconnection offer for ${socketId}`));
                }
            }, retryDelay * reconnectionAttempts[socketId]);
        } else {
            logConnectionError(new Error('Max reconnection attempts reached'), `Connection to ${socketId}`);
            cleanupConnection(socketId);
        }
    };

    const monitorConnectionQuality = (socketId) => {
        if (!connections[socketId]) return;

        const interval = setInterval(async () => {
            if (!connections[socketId] || connections[socketId].connectionState !== 'connected') {
                clearInterval(interval);
                return;
            }

            try {
                const stats = await connections[socketId].getStats();
                let inboundRtp = null;
                let outboundRtp = null;

                stats.forEach(report => {
                    if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
                        inboundRtp = report;
                    } else if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
                        outboundRtp = report;
                    }
                });

                if (inboundRtp || outboundRtp) {
                    updateConnectionQuality(socketId, {
                        bytesReceived: inboundRtp?.bytesReceived || 0,
                        bytesSent: outboundRtp?.bytesSent || 0,
                        packetsLost: inboundRtp?.packetsLost || 0,
                        jitter: inboundRtp?.jitter || 0,
                        roundTripTime: outboundRtp?.roundTripTime || 0
                    });
                }
            } catch (error) {
                console.warn('Error getting connection stats:', error);
            }
        }, 5000); // Update every 5 seconds
    };

    const createOfferForPeer = async (socketId) => {
        try {
            if (!connections[socketId]) {
                logConnectionError(new Error('No connection found'), `Creating offer for ${socketId}`);
                return;
            }

            const offer = await connections[socketId].createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });

            await connections[socketId].setLocalDescription(offer);
            socketRef.current.emit('signal', socketId, JSON.stringify({ 'sdp': connections[socketId].localDescription }));
        } catch (error) {
            logConnectionError(error, `Creating offer for ${socketId}`);
        }
    };

    // Recording Functions
    const getRecordingOptions = () => {
        const options = {
            mimeType: 'video/webm;codecs=vp9,opus'
        };

        // Fallback mime types if VP9 is not supported
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
                options.mimeType = 'video/webm;codecs=vp8,opus';
            } else if (MediaRecorder.isTypeSupported('video/webm')) {
                options.mimeType = 'video/webm';
            } else if (MediaRecorder.isTypeSupported('video/mp4')) {
                options.mimeType = 'video/mp4';
            }
        }

        // Set bitrate based on quality
        switch (recordingQuality) {
            case 'low':
                options.videoBitsPerSecond = 500000; // 500 kbps
                options.audioBitsPerSecond = 64000;  // 64 kbps
                break;
            case 'medium':
                options.videoBitsPerSecond = 1500000; // 1.5 Mbps
                options.audioBitsPerSecond = 128000;  // 128 kbps
                break;
            case 'high':
                options.videoBitsPerSecond = 4000000; // 4 Mbps
                options.audioBitsPerSecond = 192000;  // 192 kbps
                break;
            default:
                options.videoBitsPerSecond = 1500000;
                options.audioBitsPerSecond = 128000;
        }

        return options;
    };

    const createRecordingStream = async () => {
        try {
            // Create a canvas to combine all video streams
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas size based on recording quality
            switch (recordingQuality) {
                case 'low':
                    canvas.width = 640;
                    canvas.height = 480;
                    break;
                case 'medium':
                    canvas.width = 1280;
                    canvas.height = 720;
                    break;
                case 'high':
                    canvas.width = 1920;
                    canvas.height = 1080;
                    break;
                default:
                    canvas.width = 1280;
                    canvas.height = 720;
            }

            // Create video elements for each stream
            const videos = [];

            // Add local video
            if (localStreamRef.current) {
                const localVideo = document.createElement('video');
                localVideo.srcObject = localStreamRef.current;
                localVideo.muted = true;
                localVideo.play();
                videos.push({ video: localVideo, label: 'Local' });
            }

            // Add remote videos
            remoteStreams.forEach((streamData, index) => {
                const remoteVideo = document.createElement('video');
                remoteVideo.srcObject = streamData.stream;
                remoteVideo.play();
                videos.push({ video: remoteVideo, label: `Remote ${index + 1}` });
            });

            // Function to draw all videos on canvas
            const drawVideos = () => {
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const videoCount = videos.length;
                if (videoCount === 0) return;

                // Calculate grid layout
                const cols = Math.ceil(Math.sqrt(videoCount));
                const rows = Math.ceil(videoCount / cols);
                const videoWidth = canvas.width / cols;
                const videoHeight = canvas.height / rows;

                videos.forEach((videoData, index) => {
                    const { video } = videoData;
                    if (video.readyState >= 2) { // HAVE_CURRENT_DATA
                        const col = index % cols;
                        const row = Math.floor(index / cols);
                        const x = col * videoWidth;
                        const y = row * videoHeight;

                        ctx.drawImage(video, x, y, videoWidth, videoHeight);

                        // Add label
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                        ctx.fillRect(x + 10, y + videoHeight - 40, 100, 25);
                        ctx.fillStyle = 'white';
                        ctx.font = '14px Arial';
                        ctx.fillText(videoData.label, x + 15, y + videoHeight - 22);
                    }
                });
            };

            // Start drawing loop
            const drawInterval = setInterval(drawVideos, 1000 / 30); // 30 FPS

            // Get canvas stream
            const canvasStream = canvas.captureStream(30);

            // Combine with audio from local stream
            if (localStreamRef.current) {
                const audioTracks = localStreamRef.current.getAudioTracks();
                audioTracks.forEach(track => {
                    canvasStream.addTrack(track);
                });
            }

            // Store cleanup function
            canvasStream.cleanup = () => {
                clearInterval(drawInterval);
                videos.forEach(({ video }) => {
                    video.pause();
                    video.srcObject = null;
                });
            };

            return canvasStream;
        } catch (error) {
            logConnectionError(error, 'Creating recording stream');
            throw error;
        }
    };

    const startRecording = async () => {
        try {
            if (isRecording) return;

            // Check MediaRecorder support
            if (!window.MediaRecorder) {
                throw new Error('MediaRecorder is not supported in this browser. Please use Chrome, Firefox, or Safari.');
            }

            // Check if we have any streams to record
            if (!localStreamRef.current && remoteStreams.length === 0) {
                throw new Error('No video streams available to record');
            }

            // Create recording stream
            const recordingStream = await createRecordingStream();

            // Clear previous recording
            recordedChunksRef.current = [];

            // Create MediaRecorder
            const options = getRecordingOptions();
            mediaRecorderRef.current = new MediaRecorder(recordingStream, options);

            // Handle data available
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            // Handle recording stop
            mediaRecorderRef.current.onstop = () => {
                if (recordingStream.cleanup) {
                    recordingStream.cleanup();
                }
                downloadRecording();
            };

            // Handle errors
            mediaRecorderRef.current.onerror = (event) => {
                logConnectionError(event.error, 'MediaRecorder');
                stopRecording();
            };

            // Start recording
            mediaRecorderRef.current.start(1000); // Collect data every second
            setIsRecording(true);
            setIsPaused(false);
            recordingStartTimeRef.current = Date.now();

            // Start timer
            recordingTimerRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);
                setRecordingDuration(elapsed);
            }, 1000);

            console.log('Recording started');
        } catch (error) {
            logConnectionError(error, 'Starting recording');
            setIsRecording(false);
        }
    };

    const pauseRecording = () => {
        if (!mediaRecorderRef.current || !isRecording) return;

        if (isPaused) {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
            console.log('Recording resumed');
        } else {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            console.log('Recording paused');
        }
    };

    const stopRecording = () => {
        if (!isRecording) return;

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }

        setIsRecording(false);
        setIsPaused(false);
        setRecordingDuration(0);
        console.log('Recording stopped');
    };

    const downloadRecording = () => {
        if (recordedChunksRef.current.length === 0) {
            console.warn('No recorded data available');
            return;
        }

        try {
            const blob = new Blob(recordedChunksRef.current, {
                type: mediaRecorderRef.current.mimeType || 'video/webm'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const extension = mediaRecorderRef.current.mimeType.includes('mp4') ? 'mp4' : 'webm';
            a.download = `FusionMeet-Recording-${timestamp}.${extension}`;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Clean up URL
            setTimeout(() => URL.revokeObjectURL(url), 1000);

            console.log('Recording downloaded');
        } catch (error) {
            logConnectionError(error, 'Downloading recording');
        }
    };

    const formatRecordingDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const gotMessageFromServer = async (fromId, message) => {
        try {
            const signal = JSON.parse(message);

            if (fromId === socketIdRef.current) return;

            // Ensure peer connection exists
            if (!connections[fromId]) {
                createPeerConnection(fromId);
            }

            if (signal.sdp) {
                try {
                    await connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp));

                    if (signal.sdp.type === 'offer') {
                        const answer = await connections[fromId].createAnswer();
                        await connections[fromId].setLocalDescription(answer);
                        socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }));
                    }
                } catch (error) {
                    logConnectionError(error, `SDP handling for ${fromId}`);
                }
            }

            if (signal.ice) {
                try {
                    await connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice));
                } catch (error) {
                    // ICE candidate errors are common and usually not critical
                    console.warn(`ICE candidate error for ${fromId}:`, error);
                }
            }
        } catch (error) {
            logConnectionError(error, `Message parsing from ${fromId}`);
        }
    };

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            {
                sender: sender,
                data: data,
                timestamp: new Date(),
                socketId: socketIdSender
            }
        ]);
    };

    // Meeting control functions
    const handleJoinMeeting = async (lobbyData) => {
        console.log('VideoMeet: Joining meeting with lobby data', {
            username: lobbyData.username,
            videoEnabled: lobbyData.videoEnabled,
            audioEnabled: lobbyData.audioEnabled,
            hasStream: !!lobbyData.stream,
            streamTracks: lobbyData.stream ? lobbyData.stream.getTracks().map(t => ({
                kind: t.kind,
                enabled: t.enabled,
                readyState: t.readyState,
                label: t.label
            })) : null
        });

        setUsername(lobbyData.username);
        setIsVideoEnabled(lobbyData.videoEnabled);
        setIsAudioEnabled(lobbyData.audioEnabled);

        // Ensure the stream is valid before setting it
        if (lobbyData.stream) {
            console.log('VideoMeet: Setting local stream from lobby', {
                streamId: lobbyData.stream.id,
                tracks: lobbyData.stream.getTracks().map(t => ({
                    kind: t.kind,
                    enabled: t.enabled,
                    readyState: t.readyState,
                    label: t.label
                })),
                active: lobbyData.stream.active
            });

            localStreamRef.current = lobbyData.stream;

            // Register the stream for emergency cleanup tracking
            registerStream(lobbyData.stream, 'VideoMeet-JoinedStream');

            // Verify the stream is properly set
            setTimeout(() => {
                console.log('VideoMeet: Verifying local stream after join', {
                    hasLocalStream: !!localStreamRef.current,
                    streamActive: localStreamRef.current?.active,
                    videoTracks: localStreamRef.current?.getVideoTracks().length || 0,
                    audioTracks: localStreamRef.current?.getAudioTracks().length || 0
                });
            }, 100);
        } else {
            console.error('VideoMeet: No stream provided from lobby!');
        }

        // Add to user history
        try {
            await addToUserHistory(meetingId);
        } catch (error) {
            console.error('Failed to add meeting to history:', error);
        }

        console.log('VideoMeet: Setting inLobby to false, localStreamRef.current:', localStreamRef.current);

        // Restore virtual background state from lobby
        if (lobbyData.virtualBackground) {
            const vbState = lobbyData.virtualBackground;
            console.log('VideoMeet: Restoring virtual background state from lobby:', vbState);

            if (vbState.isEnabled && vbState.hasProcessedStream) {
                console.log('VideoMeet: Virtual background was enabled in lobby, restoring state...');

                // Initialize virtual background if needed
                if (!isVirtualBgInitialized) {
                    await initializeVirtualBg();
                }

                // Set background type and blur amount
                await changeBackground({
                    type: vbState.backgroundType,
                    blurAmount: vbState.blurAmount
                });

                // Enable virtual background
                if (!isVirtualBgEnabled) {
                    await toggleVirtualBackground(true);
                }

                console.log('VideoMeet: Virtual background state restored successfully');
            }
        }

        setInLobby(false);
    };

    const handleToggleVideo = async () => {
        const newVideoState = !isVideoEnabled;
        console.log(`VideoMeet: Toggling video to ${newVideoState ? 'ON' : 'OFF'}`);
        setIsVideoEnabled(newVideoState);

        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];

            if (!newVideoState) {
                // Video is being turned OFF - just disable the track (like Google Meet)
                console.log('VideoMeet: Turning video OFF - disabling camera track');
                if (videoTrack) {
                    videoTrack.enabled = false;
                    console.log('VideoMeet: Video track disabled');
                }

                // Update peer connections to disable video
                for (let id in connections) {
                    const sender = connections[id].getSenders().find(s =>
                        s.track && s.track.kind === 'video'
                    );
                    if (sender && sender.track) {
                        sender.track.enabled = false;
                        console.log(`VideoMeet: Disabled video track for peer ${id}`);
                    }
                }
            } else {
                // Video is being turned ON - enable the track or get new stream
                console.log('VideoMeet: Turning video ON');

                if (videoTrack && videoTrack.readyState === 'live') {
                    // Re-enable existing track
                    videoTrack.enabled = true;
                    console.log('VideoMeet: Re-enabled existing video track');

                    // Update peer connections to enable video
                    for (let id in connections) {
                        const sender = connections[id].getSenders().find(s =>
                            s.track && s.track.kind === 'video'
                        );
                        if (sender && sender.track) {
                            sender.track.enabled = true;
                            console.log(`VideoMeet: Enabled video track for peer ${id}`);
                        }
                    }
                } else {
                    // Get new camera stream if track is not available
                    console.log('VideoMeet: Getting new camera stream');
                    try {
                        const newStream = await navigator.mediaDevices.getUserMedia({
                            video: {
                                width: { ideal: 1280 },
                                height: { ideal: 720 },
                                facingMode: 'user'
                            },
                            audio: false // Only get video, keep existing audio
                        });

                        const newVideoTrack = newStream.getVideoTracks()[0];

                        // Replace old video track with new one
                        if (videoTrack) {
                            localStreamRef.current.removeTrack(videoTrack);
                        }
                        localStreamRef.current.addTrack(newVideoTrack);

                        // Update peer connections with new video track
                        for (let id in connections) {
                            const sender = connections[id].getSenders().find(s =>
                                s.track === null || (s.track && s.track.kind === 'video')
                            );
                            if (sender) {
                                await sender.replaceTrack(newVideoTrack);
                                console.log(`VideoMeet: Replaced video track for peer ${id}`);
                            }
                        }

                        console.log('VideoMeet: New camera stream acquired and connected');
                    } catch (error) {
                        console.error('Error getting camera stream:', error);
                        setIsVideoEnabled(false); // Revert state if failed
                        alert('Failed to access camera. Please check permissions.');
                    }
                }
            }
        } else {
            console.warn('VideoMeet: No local stream available for video toggle');
        }
    };

    const handleToggleAudio = () => {
        const newAudioState = !isAudioEnabled;
        setIsAudioEnabled(newAudioState);

        console.log(`VideoMeet: Toggling audio to ${newAudioState ? 'ON' : 'OFF'}`);

        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = newAudioState;
                console.log(`VideoMeet: Audio track enabled set to ${newAudioState}`);
            } else {
                console.warn('VideoMeet: No audio track found in local stream');
            }
        } else {
            console.warn('VideoMeet: No local stream available for audio toggle');
        }
    };

    const handleToggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                // Get screen share stream
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        cursor: 'always',
                        displaySurface: 'monitor'
                    },
                    audio: true
                });

                // Replace video track in all peer connections
                const videoTrack = screenStream.getVideoTracks()[0];

                for (let id in connections) {
                    const sender = connections[id].getSenders().find(s =>
                        s.track && s.track.kind === 'video'
                    );
                    if (sender) {
                        await sender.replaceTrack(videoTrack);
                    }
                }

                // Update local video
                if (localStreamRef.current) {
                    const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
                    if (oldVideoTrack) {
                        localStreamRef.current.removeTrack(oldVideoTrack);
                    }
                    localStreamRef.current.addTrack(videoTrack);
                }

                setIsScreenSharing(true);

                // Handle screen share end
                videoTrack.onended = async () => {
                    setIsScreenSharing(false);

                    // Get camera stream back
                    try {
                        const cameraStream = await navigator.mediaDevices.getUserMedia({
                            video: true,
                            audio: isAudioEnabled
                        });

                        const newVideoTrack = cameraStream.getVideoTracks()[0];

                        // Replace screen share with camera in all connections
                        for (let id in connections) {
                            const sender = connections[id].getSenders().find(s =>
                                s.track && s.track.kind === 'video'
                            );
                            if (sender) {
                                await sender.replaceTrack(newVideoTrack);
                            }
                        }

                        // Update local stream
                        if (localStreamRef.current) {
                            const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
                            if (oldVideoTrack) {
                                localStreamRef.current.removeTrack(oldVideoTrack);
                            }
                            localStreamRef.current.addTrack(newVideoTrack);
                        }
                    } catch (error) {
                        console.error('Error switching back to camera:', error);
                    }
                };

            } catch (error) {
                console.error('Error sharing screen:', error);
                alert('Screen sharing failed. Please try again.');
            }
        } else {
            // Stop screen sharing manually
            setIsScreenSharing(false);

            try {
                const cameraStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: isAudioEnabled
                });

                const newVideoTrack = cameraStream.getVideoTracks()[0];

                for (let id in connections) {
                    const sender = connections[id].getSenders().find(s =>
                        s.track && s.track.kind === 'video'
                    );
                    if (sender) {
                        await sender.replaceTrack(newVideoTrack);
                    }
                }

                if (localStreamRef.current) {
                    const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
                    if (oldVideoTrack) {
                        localStreamRef.current.removeTrack(oldVideoTrack);
                    }
                    localStreamRef.current.addTrack(newVideoTrack);
                }
            } catch (error) {
                console.error('Error switching back to camera:', error);
            }
        }
    };

    const handleEndCall = () => {
        console.log('VideoMeet: Ending call and cleaning up...');

        // Dispose all streams comprehensively
        disposeAllStreams();

        if (socketRef.current) {
            socketRef.current.disconnect();
        }

        // Clean up peer connections
        Object.keys(connections).forEach(cleanupConnection);

        console.log('VideoMeet: End call cleanup completed');
    };

    const handleSendMessage = (message) => {
        if (socketRef.current) {
            socketRef.current.emit('chat-message', message, username);
        }
    };

    // Virtual background change handler
    const handleBackgroundChange = async ({ type, image, blurAmount: newBlurAmount }) => {
        try {
            console.log('VideoMeet: Changing background', { type, image, blurAmount: newBlurAmount });

            if (!isVirtualBgInitialized) {
                console.log('VideoMeet: Initializing virtual background...');
                await initializeVirtualBg();
            }

            await changeBackground({ type, image, blurAmount: newBlurAmount });

            // Enable virtual background if not already enabled and type is not 'none'
            if (type !== 'none' && !isVirtualBgEnabled) {
                console.log('VideoMeet: Enabling virtual background...');
                await toggleVirtualBackground(true);
            } else if (type === 'none' && isVirtualBgEnabled) {
                console.log('VideoMeet: Disabling virtual background...');
                await toggleVirtualBackground(false);
            }

            // Recreate the processed stream with new background settings
            if (localStreamRef.current) {
                console.log('VideoMeet: Creating processed stream with new background...');
                const processed = await createProcessedStream(localStreamRef.current);

                if (processed && processed !== localStreamRef.current) {
                    // Update the local stream reference to use the processed stream
                    localStreamRef.current = processed;

                    // Update all peer connections with the new processed stream
                    for (let socketId in connections) {
                        const connection = connections[socketId];
                        const sender = connection.getSenders().find(s =>
                            s.track && s.track.kind === 'video'
                        );

                        if (sender && processed.getVideoTracks().length > 0) {
                            console.log(`VideoMeet: Updating video track for peer ${socketId}`);
                            await sender.replaceTrack(processed.getVideoTracks()[0]);
                        }
                    }
                    console.log('VideoMeet: Background change completed successfully');
                } else {
                    console.log('VideoMeet: Using original stream (no processing needed)');
                }
            }
        } catch (error) {
            console.error('Error changing background:', error);
        }
    };

    // Render the appropriate component based on state
    if (inLobby) {
        return (
            <MeetingLobby
                onJoinMeeting={handleJoinMeeting}
            />
        );
    }

    return (
        <MeetingRoom
            localStream={localStreamRef.current}
            remoteStreams={remoteStreams}
            participants={participants}
            meetingId={meetingId}
            username={username}
            onToggleVideo={handleToggleVideo}
            onToggleAudio={handleToggleAudio}
            onToggleScreenShare={handleToggleScreenShare}
            onEndCall={handleEndCall}
            onSendMessage={handleSendMessage}
            messages={messages}
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
            isScreenSharing={isScreenSharing}
            connectionQuality={connectionQuality}
            isConnecting={isConnecting}
            connectionErrors={connectionErrors}
            // Recording props
            isRecording={isRecording}
            isPaused={isPaused}
            recordingDuration={recordingDuration}
            recordingQuality={recordingQuality}
            onStartRecording={startRecording}
            onPauseRecording={pauseRecording}
            onStopRecording={stopRecording}
            onSetRecordingQuality={setRecordingQuality}
            formatRecordingDuration={formatRecordingDuration}
            // Virtual background props
            onBackgroundChange={handleBackgroundChange}
            currentBackground={backgroundType}
            currentBlurAmount={blurAmount}
        />
    );
}
