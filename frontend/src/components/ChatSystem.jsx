import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Chip,
    Menu,
    MenuItem,
    Divider,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress,
    Tooltip,
    Badge
} from '@mui/material';
import {
    Send,
    AttachFile,
    EmojiEmotions,
    Search,
    MoreVert,
    Download,
    Delete,
    Reply,
    Close,
    Image,
    PictureAsPdf,
    Description
} from '@mui/icons-material';
import { safeScrollIntoView } from '../utils/scrollUtils';
import SafeScrollContainer from './SafeScrollContainer';

const ChatSystem = ({
    messages = [],
    onSendMessage,
    onSendFile,
    currentUser,
    participants = [],
    isOpen = true,
    onClose
}) => {
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showFileDialog, setShowFileDialog] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [replyingTo, setReplyingTo] = useState(null);
    const [messageMenuAnchor, setMessageMenuAnchor] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Common emojis for quick access
    const quickEmojis = ['😀', '😂', '😍', '👍', '👎', '❤️', '🎉', '🔥', '💯', '👏', '🤔', '😢'];

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        safeScrollIntoView(messagesEndRef.current, { behavior: 'smooth', block: 'end' });
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const messageData = {
                text: newMessage,
                timestamp: new Date(),
                sender: currentUser,
                replyTo: replyingTo
            };
            
            onSendMessage(messageData);
            setNewMessage('');
            setReplyingTo(null);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleEmojiClick = (emoji) => {
        setNewMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        files.forEach(file => {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                alert('File size must be less than 10MB');
                return;
            }
            
            // Simulate file upload progress
            setUploadProgress(0);
            const interval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        onSendFile({
                            file,
                            sender: currentUser,
                            timestamp: new Date()
                        });
                        return 0;
                    }
                    return prev + 10;
                });
            }, 100);
        });
        
        setShowFileDialog(false);
        event.target.value = '';
    };

    const handleMessageMenu = (event, message) => {
        setMessageMenuAnchor(event.currentTarget);
        setSelectedMessage(message);
    };

    const handleReply = () => {
        setReplyingTo(selectedMessage);
        setMessageMenuAnchor(null);
    };

    const handleDeleteMessage = () => {
        // Implement delete message functionality
        setMessageMenuAnchor(null);
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
            return <Image color="primary" />;
        } else if (extension === 'pdf') {
            return <PictureAsPdf color="error" />;
        } else {
            return <Description color="action" />;
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredMessages = messages.filter(message =>
        message.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.sender?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <Paper
            elevation={8}
            sx={{
                position: 'fixed',
                right: 20,
                top: 100,
                bottom: 100,
                width: 350,
                zIndex: 1200,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            {/* Chat Header */}
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                    Chat ({participants.length})
                </Typography>
                <IconButton onClick={onClose} sx={{ color: 'white' }}>
                    <Close />
                </IconButton>
            </Box>

            {/* Search */}
            <Box sx={{ p: 1 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                />
            </Box>

            {/* Messages */}
            <SafeScrollContainer
                ref={chatContainerRef}
                autoScrollToBottom={true}
                sx={{
                    flex: 1,
                    p: 1
                }}
            >
                <List dense>
                    {filteredMessages.map((message, index) => (
                        <ListItem
                            key={index}
                            sx={{
                                flexDirection: 'column',
                                alignItems: message.sender === currentUser ? 'flex-end' : 'flex-start',
                                mb: 1
                            }}
                        >
                            {/* Reply indicator */}
                            {message.replyTo && (
                                <Box sx={{ 
                                    bgcolor: 'grey.100', 
                                    p: 1, 
                                    borderRadius: 1, 
                                    mb: 1, 
                                    maxWidth: '80%',
                                    borderLeft: 3,
                                    borderColor: 'primary.main'
                                }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Replying to: {message.replyTo.text?.substring(0, 50)}...
                                    </Typography>
                                </Box>
                            )}

                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 1,
                                    maxWidth: '80%',
                                    flexDirection: message.sender === currentUser ? 'row-reverse' : 'row'
                                }}
                            >
                                <Avatar sx={{ width: 32, height: 32 }}>
                                    {message.sender?.charAt(0).toUpperCase()}
                                </Avatar>
                                
                                <Box>
                                    <Paper
                                        elevation={1}
                                        sx={{
                                            p: 1.5,
                                            bgcolor: message.sender === currentUser ? 'primary.main' : 'grey.100',
                                            color: message.sender === currentUser ? 'white' : 'text.primary',
                                            borderRadius: 2,
                                            position: 'relative'
                                        }}
                                    >
                                        {/* Message content */}
                                        {message.file ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getFileIcon(message.file.name)}
                                                <Box>
                                                    <Typography variant="body2">
                                                        {message.file.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {(message.file.size / 1024 / 1024).toFixed(2)} MB
                                                    </Typography>
                                                </Box>
                                                <IconButton size="small">
                                                    <Download fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        ) : (
                                            <Typography variant="body2">
                                                {message.text}
                                            </Typography>
                                        )}

                                        {/* Message menu */}
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMessageMenu(e, message)}
                                            sx={{
                                                position: 'absolute',
                                                top: -5,
                                                right: -5,
                                                opacity: 0,
                                                '.MuiListItem-root:hover &': {
                                                    opacity: 1
                                                }
                                            }}
                                        >
                                            <MoreVert fontSize="small" />
                                        </IconButton>
                                    </Paper>
                                    
                                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                        {message.sender} • {formatTime(message.timestamp)}
                                    </Typography>
                                </Box>
                            </Box>
                        </ListItem>
                    ))}
                </List>
                <div ref={messagesEndRef} />
            </SafeScrollContainer>

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
                <Box sx={{ p: 1 }}>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                    <Typography variant="caption" color="text.secondary">
                        Uploading... {uploadProgress}%
                    </Typography>
                </Box>
            )}

            {/* Reply indicator */}
            {replyingTo && (
                <Box sx={{ p: 1, bgcolor: 'grey.50', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption">
                        Replying to: {replyingTo.text?.substring(0, 30)}...
                    </Typography>
                    <IconButton size="small" onClick={() => setReplyingTo(null)}>
                        <Close fontSize="small" />
                    </IconButton>
                </Box>
            )}

            {/* Message Input */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={3}
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        size="small"
                    />
                    
                    <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                        <EmojiEmotions />
                    </IconButton>
                    
                    <IconButton onClick={() => fileInputRef.current?.click()}>
                        <AttachFile />
                    </IconButton>
                    
                    <IconButton 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        color="primary"
                    >
                        <Send />
                    </IconButton>
                </Box>

                {/* Quick Emoji Picker */}
                {showEmojiPicker && (
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {quickEmojis.map((emoji, index) => (
                            <Button
                                key={index}
                                size="small"
                                onClick={() => handleEmojiClick(emoji)}
                                sx={{ minWidth: 'auto', p: 0.5 }}
                            >
                                {emoji}
                            </Button>
                        ))}
                    </Box>
                )}
            </Box>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.txt"
            />

            {/* Message Context Menu */}
            <Menu
                anchorEl={messageMenuAnchor}
                open={Boolean(messageMenuAnchor)}
                onClose={() => setMessageMenuAnchor(null)}
            >
                <MenuItem onClick={handleReply}>
                    <Reply sx={{ mr: 1 }} />
                    Reply
                </MenuItem>
                {selectedMessage?.sender === currentUser && (
                    <MenuItem onClick={handleDeleteMessage}>
                        <Delete sx={{ mr: 1 }} />
                        Delete
                    </MenuItem>
                )}
            </Menu>
        </Paper>
    );
};

export default ChatSystem;
