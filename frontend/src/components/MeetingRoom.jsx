import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    IconButton,
    Typography,
    Paper,
    Avatar,
    Badge,
    Tooltip,
    Chip,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Divider,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Switch,
    FormControlLabel
} from '@mui/material';
import {
    Videocam,
    VideocamOff,
    Mic,
    MicOff,
    ScreenShare,
    StopScreenShare,
    CallEnd,
    Chat,
    People,
    MoreVert,
    Fullscreen,
    FullscreenExit,
    VolumeUp,
    VolumeOff,
    SignalWifi4Bar,
    SignalWifi3Bar,
    SignalWifi2Bar,
    SignalWifi1Bar,
    SignalWifiOff,
    Warning,
    CheckCircle,
    FiberManualRecord,
    Stop,
    Pause,
    PlayArrow,
    Settings,
    Wallpaper as BackgroundIcon,
    Hd,
    HighQuality,
    VideoSettings,
    Tune,
    AttachFile,
    EmojiEmotions,
    Send,
    Download
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import BackgroundSelector from './BackgroundSelector';

const MeetingRoom = ({
    localStream,
    remoteStreams,
    participants,
    meetingId,
    username,
    onToggleVideo,
    onToggleAudio,
    onToggleScreenShare,
    onEndCall,
    onSendMessage,
    messages,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    connectionQuality = {},
    isConnecting = false,
    connectionErrors = [],
    // Recording props
    isRecording = false,
    isPaused = false,
    recordingDuration = 0,
    recordingQuality = 'medium',
    onStartRecording,
    onPauseRecording,
    onStopRecording,
    onSetRecordingQuality,
    formatRecordingDuration,
    // Virtual background props
    onBackgroundChange,
    currentBackground = 'none',
    currentBlurAmount = 15
}) => {
    const [showChat, setShowChat] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [newMessageCount, setNewMessageCount] = useState(0);
    const [message, setMessage] = useState('');
    const [showRecordingSettings, setShowRecordingSettings] = useState(false);
    const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);
    const [showVideoSettings, setShowVideoSettings] = useState(false);
    const [videoQuality, setVideoQuality] = useState('high');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef(null);
    const localVideoRef = useRef(null);
    const navigate = useNavigate();



    // Debug effect to log component mount and props
    useEffect(() => {
        console.log('MeetingRoom: Component mounted/updated with props:', {
            hasLocalStream: !!localStream,
            localStreamTracks: localStream ? localStream.getTracks().length : 0,
            remoteStreamsCount: remoteStreams.length,
            isVideoEnabled,
            isAudioEnabled,
            username,
            meetingId
        });
    }, [localStream, remoteStreams, isVideoEnabled, isAudioEnabled, username, meetingId]);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            console.log('MeetingRoom: Setting local video stream');
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (showChat) {
            setNewMessageCount(0);
        }
    }, [showChat]);

    useEffect(() => {
        if (!showChat && messages.length > 0) {
            setNewMessageCount(prev => prev + 1);
        }
    }, [messages, showChat]);

    const handleEndCall = () => {
        if (window.confirm('Are you sure you want to leave the meeting?')) {
            onEndCall();
            navigate('/home');
        }
    };

    const handleSendMessage = () => {
        if (message.trim()) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleFileShare = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Check file size (limit to 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                return;
            }

            // Create file message
            const fileMessage = {
                type: 'file',
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                data: file
            };

            onSendMessage(fileMessage);
        }
        // Reset file input
        event.target.value = '';
    };

    const handleEmojiSelect = (emoji) => {
        setMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getConnectionQualityIcon = (socketId) => {
        const quality = connectionQuality[socketId];
        if (!quality) return <SignalWifiOff sx={{ color: 'grey.500', fontSize: 16 }} />;

        const packetsLost = quality.packetsLost || 0;
        const jitter = quality.jitter || 0;

        if (packetsLost > 50 || jitter > 0.1) {
            return <SignalWifi1Bar sx={{ color: 'error.main', fontSize: 16 }} />;
        } else if (packetsLost > 20 || jitter > 0.05) {
            return <SignalWifi2Bar sx={{ color: 'warning.main', fontSize: 16 }} />;
        } else if (packetsLost > 5 || jitter > 0.02) {
            return <SignalWifi3Bar sx={{ color: 'info.main', fontSize: 16 }} />;
        } else {
            return <SignalWifi4Bar sx={{ color: 'success.main', fontSize: 16 }} />;
        }
    };

    const handleStartRecording = () => {
        if (onStartRecording) {
            onStartRecording();
        }
    };

    const handlePauseRecording = () => {
        if (onPauseRecording) {
            onPauseRecording();
        }
    };

    const handleStopRecording = () => {
        if (onStopRecording) {
            onStopRecording();
        }
    };

    const handleRecordingQualityChange = (quality) => {
        if (onSetRecordingQuality) {
            onSetRecordingQuality(quality);
        }
        setShowRecordingSettings(false);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Google Meet style layout - no grid needed

    return (
        <Box sx={{ height: '100vh', bgcolor: '#1a1a1a', position: 'relative', overflow: 'hidden' }}>
            {/* Header */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    p: 2,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)'
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="h6" color="white" fontWeight="bold">
                                FusionMeet
                            </Typography>
                            {isConnecting ? (
                                <Chip
                                    label="Connecting..."
                                    size="small"
                                    sx={{ bgcolor: 'warning.main', color: 'white' }}
                                />
                            ) : connectionErrors.length > 0 ? (
                                <Tooltip title={`${connectionErrors.length} connection issues`}>
                                    <Warning sx={{ color: 'error.main', fontSize: 20 }} />
                                </Tooltip>
                            ) : (
                                <Tooltip title="Connected">
                                    <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                                </Tooltip>
                            )}
                        </Box>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Typography variant="body2" color="rgba(255,255,255,0.7)">
                                Meeting ID: {meetingId}
                            </Typography>
                            {isRecording && (
                                <Box display="flex" alignItems="center" gap={1}>
                                    <FiberManualRecord
                                        sx={{
                                            color: 'error.main',
                                            fontSize: 12,
                                            animation: isPaused ? 'none' : 'pulse 1.5s infinite'
                                        }}
                                    />
                                    <Typography variant="caption" color="error.main" fontWeight="bold">
                                        {isPaused ? 'PAUSED' : 'REC'} {formatRecordingDuration && formatRecordingDuration(recordingDuration)}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                    <Box display="flex" gap={1}>
                        <Tooltip title="Participants">
                            <IconButton 
                                onClick={() => setShowParticipants(true)}
                                sx={{ color: 'white' }}
                            >
                                <Badge badgeContent={participants.length} color="primary">
                                    <People />
                                </Badge>
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                            <IconButton onClick={toggleFullscreen} sx={{ color: 'white' }}>
                                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="More options">
                            <IconButton sx={{ color: 'white' }}>
                                <MoreVert />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Box>

            {/* Main Video Area - Google Meet Style */}
            <Box
                sx={{
                    height: 'calc(100vh - 160px)', // Leave space for header and controls
                    position: 'relative',
                    pt: 8, // Space for header
                    pb: 2 // Space before controls
                }}
            >
                {/* Remote Participants - Main View */}
                {remoteStreams.length > 0 ? (
                    <Box
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                            p: 2,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        {remoteStreams.map((stream, index) => (
                            <Paper
                                key={stream.socketId}
                                elevation={3}
                                sx={{
                                    position: 'relative',
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    bgcolor: '#000',
                                    width: remoteStreams.length === 1 ? '80%' : '45%',
                                    height: remoteStreams.length === 1 ? '80%' : '45%',
                                    minWidth: '300px',
                                    minHeight: '200px'
                                }}
                            >
                                <video
                                    autoPlay
                                    playsInline
                                    ref={ref => {
                                        if (ref && stream.stream) {
                                            ref.srcObject = stream.stream;
                                            console.log(`Remote video ${index} assigned stream:`, stream.stream);
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />

                                {/* Remote Video Overlay */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: 12,
                                        left: 12,
                                        right: 12,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Chip
                                        label={`Participant ${index + 1}`}
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(0,0,0,0.8)',
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                        {getConnectionQualityIcon(stream.socketId)}
                                    </Box>
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                ) : (
                    // No remote participants - show waiting message
                    <Box
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="h4" gutterBottom sx={{ opacity: 0.7 }}>
                            Waiting for others to join...
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.5 }}>
                            Share the meeting ID: {meetingId}
                        </Typography>
                    </Box>
                )}

                {/* Local Video - Bottom Right Corner (Google Meet Style) */}
                <Paper
                    elevation={6}
                    sx={{
                        position: 'absolute',
                        bottom: 20,
                        right: 20,
                        width: 240,
                        height: 180,
                        borderRadius: 3,
                        overflow: 'hidden',
                        bgcolor: '#000',
                        border: '3px solid rgba(255,255,255,0.2)',
                        zIndex: 10
                    }}
                >
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: 'scaleX(-1)',
                            backgroundColor: '#000'
                        }}
                    />
                    {!isVideoEnabled && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                textAlign: 'center',
                                zIndex: 2
                            }}
                        >
                            <Avatar sx={{ width: 60, height: 60, mx: 'auto', mb: 1, bgcolor: 'primary.main' }}>
                                {username.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="caption" color="white">
                                Camera off
                            </Typography>
                        </Box>
                    )}



                    {/* Local Video Overlay */}
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 8,
                            left: 8,
                            right: 8,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <Chip
                            label="You"
                            size="small"
                            sx={{
                                bgcolor: 'rgba(0,0,0,0.8)',
                                color: 'white',
                                fontSize: '0.7rem'
                            }}
                        />
                        <Box display="flex" gap={0.5}>
                            {!isAudioEnabled && (
                                <MicOff sx={{ color: 'error.main', fontSize: 14 }} />
                            )}
                            {!isVideoEnabled && (
                                <VideocamOff sx={{ color: 'error.main', fontSize: 14 }} />
                            )}
                        </Box>
                    </Box>
                </Paper>
            </Box>

            {/* Bottom Controls */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 3,
                    background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2
                }}
            >
                <Tooltip title={isAudioEnabled ? "Mute" : "Unmute"}>
                    <IconButton
                        onClick={onToggleAudio}
                        sx={{
                            bgcolor: isAudioEnabled ? 'rgba(255,255,255,0.2)' : 'error.main',
                            color: 'white',
                            '&:hover': {
                                bgcolor: isAudioEnabled ? 'rgba(255,255,255,0.3)' : 'error.dark'
                            }
                        }}
                    >
                        {isAudioEnabled ? <Mic /> : <MicOff />}
                    </IconButton>
                </Tooltip>

                <Tooltip title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}>
                    <IconButton
                        onClick={onToggleVideo}
                        sx={{
                            bgcolor: isVideoEnabled ? 'rgba(255,255,255,0.2)' : 'error.main',
                            color: 'white',
                            '&:hover': {
                                bgcolor: isVideoEnabled ? 'rgba(255,255,255,0.3)' : 'error.dark'
                            }
                        }}
                    >
                        {isVideoEnabled ? <Videocam /> : <VideocamOff />}
                    </IconButton>
                </Tooltip>

                <Tooltip title={isScreenSharing ? "Stop sharing" : "Share screen"}>
                    <IconButton
                        onClick={onToggleScreenShare}
                        sx={{
                            bgcolor: isScreenSharing ? 'primary.main' : 'rgba(255,255,255,0.2)',
                            color: 'white',
                            '&:hover': {
                                bgcolor: isScreenSharing ? 'primary.dark' : 'rgba(255,255,255,0.3)'
                            }
                        }}
                    >
                        {isScreenSharing ? <StopScreenShare /> : <ScreenShare />}
                    </IconButton>
                </Tooltip>

                <Tooltip title="Virtual Background">
                    <IconButton
                        onClick={() => setShowBackgroundSelector(true)}
                        disabled={!isVideoEnabled}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                            '&:disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }
                        }}
                    >
                        <BackgroundIcon />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Chat">
                    <IconButton
                        onClick={() => setShowChat(true)}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                        }}
                    >
                        <Badge badgeContent={newMessageCount} color="error">
                            <Chat />
                        </Badge>
                    </IconButton>
                </Tooltip>

                {/* Recording Controls */}
                {!isRecording ? (
                    <Tooltip title="Start recording">
                        <IconButton
                            onClick={handleStartRecording}
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                            }}
                        >
                            <FiberManualRecord />
                        </IconButton>
                    </Tooltip>
                ) : (
                    <Box display="flex" gap={1}>
                        <Tooltip title={isPaused ? "Resume recording" : "Pause recording"}>
                            <IconButton
                                onClick={handlePauseRecording}
                                sx={{
                                    bgcolor: 'warning.main',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'warning.dark' }
                                }}
                            >
                                {isPaused ? <PlayArrow /> : <Pause />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Stop recording">
                            <IconButton
                                onClick={handleStopRecording}
                                sx={{
                                    bgcolor: 'error.main',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'error.dark' }
                                }}
                            >
                                <Stop />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}

                <Tooltip title="Video settings">
                    <IconButton
                        onClick={() => setShowVideoSettings(true)}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                        }}
                    >
                        <VideoSettings />
                    </IconButton>
                </Tooltip>

                <Tooltip title="Recording settings">
                    <IconButton
                        onClick={() => setShowRecordingSettings(true)}
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                        }}
                    >
                        <Settings />
                    </IconButton>
                </Tooltip>



                <Tooltip title="End call">
                    <IconButton
                        onClick={handleEndCall}
                        sx={{
                            bgcolor: 'error.main',
                            color: 'white',
                            '&:hover': { bgcolor: 'error.dark' }
                        }}
                    >
                        <CallEnd />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Chat Drawer */}
            <Drawer
                anchor="right"
                open={showChat}
                onClose={() => setShowChat(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 350,
                        bgcolor: 'background.paper',
                        display: 'flex',
                        flexDirection: 'column'
                    }
                }}
            >
                {/* Chat Header */}
                <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" gutterBottom>
                        Meeting Chat
                    </Typography>
                </Box>

                {/* Chat Messages */}
                <Box sx={{
                    flex: 1,
                    p: 2,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                }}>
                    {messages.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                            No messages yet. Start the conversation!
                        </Typography>
                    ) : (
                        messages.map((msg, index) => (
                            <Box
                                key={index}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: msg.sender === username ? 'primary.light' : 'grey.100',
                                    alignSelf: msg.sender === username ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%'
                                }}
                            >
                                <Typography variant="caption" color="text.secondary">
                                    {msg.sender === username ? 'You' : msg.sender}
                                </Typography>

                                {/* Handle different message types */}
                                {msg.type === 'file' ? (
                                    <Box sx={{ mt: 1 }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                p: 1,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 1,
                                                bgcolor: 'background.paper'
                                            }}
                                        >
                                            <AttachFile sx={{ fontSize: 16 }} />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" fontWeight="bold">
                                                    {msg.fileName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatFileSize(msg.fileSize)}
                                                </Typography>
                                            </Box>
                                            <IconButton size="small" color="primary">
                                                <Download sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                        {msg.data}
                                    </Typography>
                                )}

                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                                </Typography>
                            </Box>
                        ))
                    )}
                </Box>

                {/* Chat Input */}
                <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            multiline
                            maxRows={3}
                        />
                        <IconButton
                            onClick={handleSendMessage}
                            disabled={!message.trim()}
                            color="primary"
                        >
                            <Chat />
                        </IconButton>
                    </Box>
                </Box>
            </Drawer>

            {/* Participants Drawer */}
            <Drawer
                anchor="right"
                open={showParticipants}
                onClose={() => setShowParticipants(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 300,
                        bgcolor: 'background.paper'
                    }
                }}
            >
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Participants ({participants.length + 1})
                    </Typography>
                    <List>
                        {/* Local User */}
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>{username.charAt(0).toUpperCase()}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={`${username} (You)`}
                                secondary="Host"
                            />
                            <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                        </ListItem>
                        <Divider />

                        {/* Remote Participants */}
                        {participants.map((participant, index) => (
                            <ListItem key={index}>
                                <ListItemAvatar>
                                    <Avatar>{participant.name.charAt(0).toUpperCase()}</Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={participant.name}
                                    secondary={connectionQuality[participant.socketId] ?
                                        `Packets lost: ${connectionQuality[participant.socketId].packetsLost || 0}` :
                                        'Connecting...'
                                    }
                                />
                                {getConnectionQualityIcon(participant.socketId)}
                            </ListItem>
                        ))}
                    </List>

                    {/* Connection Errors */}
                    {connectionErrors.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="error" gutterBottom>
                                Connection Issues:
                            </Typography>
                            {connectionErrors.slice(-3).map((error, index) => (
                                <Typography key={index} variant="caption" color="error" display="block">
                                    {error.context}: {error.error}
                                </Typography>
                            ))}
                        </Box>
                    )}
                </Box>
            </Drawer>

            {/* Recording Settings Dialog */}
            <Dialog
                open={showRecordingSettings}
                onClose={() => setShowRecordingSettings(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Recording Settings</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Recording Quality</InputLabel>
                            <Select
                                value={recordingQuality}
                                label="Recording Quality"
                                onChange={(e) => handleRecordingQualityChange(e.target.value)}
                                disabled={isRecording}
                            >
                                <MenuItem value="low">
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">Low Quality</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            640x480, ~500 kbps - Smaller file size
                                        </Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="medium">
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">Medium Quality</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            1280x720, ~1.5 Mbps - Balanced quality and size
                                        </Typography>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="high">
                                    <Box>
                                        <Typography variant="body2" fontWeight="bold">High Quality</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            1920x1080, ~4 Mbps - Best quality, larger file
                                        </Typography>
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>

                        {isRecording && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                Recording quality cannot be changed during an active recording.
                            </Alert>
                        )}

                        <Box sx={{ mt: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                • Recordings include all participants' video and audio
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                • Files are saved locally to your device
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                • Recording will automatically download when stopped
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowRecordingSettings(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Video Settings Dialog */}
            <Dialog
                open={showVideoSettings}
                onClose={() => setShowVideoSettings(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Video Settings</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Video Quality</InputLabel>
                            <Select
                                value={videoQuality}
                                label="Video Quality"
                                onChange={(e) => setVideoQuality(e.target.value)}
                            >
                                <MenuItem value="low">
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Hd sx={{ color: 'text.secondary' }} />
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">Low Quality</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                480p - Better for slow connections
                                            </Typography>
                                        </Box>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="medium">
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Hd sx={{ color: 'primary.main' }} />
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">Medium Quality</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                720p - Balanced quality and bandwidth
                                            </Typography>
                                        </Box>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="high">
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <HighQuality sx={{ color: 'success.main' }} />
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">High Quality</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                1080p - Best quality, requires good connection
                                            </Typography>
                                        </Box>
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Video Enhancements
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={1}>
                                <FormControlLabel
                                    control={<Switch defaultChecked />}
                                    label="Auto adjust for lighting"
                                />
                                <FormControlLabel
                                    control={<Switch defaultChecked />}
                                    label="Noise reduction"
                                />
                                <FormControlLabel
                                    control={<Switch />}
                                    label="Mirror my video"
                                />
                            </Box>
                        </Box>

                        <Box sx={{ mt: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                • Higher quality requires more bandwidth
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                • Auto-adjust will optimize based on connection
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                • Changes apply immediately
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowVideoSettings(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Background Selector Dialog */}
            <BackgroundSelector
                open={showBackgroundSelector}
                onClose={() => setShowBackgroundSelector(false)}
                onBackgroundChange={onBackgroundChange}
                currentBackground={currentBackground}
                currentBlurAmount={currentBlurAmount}
            />
        </Box>
    );
};

export default MeetingRoom;
