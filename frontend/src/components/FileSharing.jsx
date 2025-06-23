import React, { useState, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    LinearProgress,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Divider,
    Grid,
    Card,
    CardContent
} from '@mui/material';
import {
    CloudUpload,
    Download,
    Delete,
    Image,
    PictureAsPdf,
    Description,
    VideoFile,
    AudioFile,
    Archive,
    Close,
    Share,
    Visibility,
    GetApp
} from '@mui/icons-material';

const FileSharing = ({ 
    open, 
    onClose, 
    onFileUpload, 
    onFileDownload, 
    onFileDelete,
    sharedFiles = [],
    currentUser,
    maxFileSize = 10 * 1024 * 1024, // 10MB
    allowedTypes = ['image/*', '.pdf', '.doc', '.docx', '.txt', '.zip', '.mp4', '.mp3']
}) => {
    const [uploadProgress, setUploadProgress] = useState({});
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const getFileIcon = (fileName, fileType) => {
        const extension = fileName.split('.').pop().toLowerCase();
        
        if (fileType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
            return <Image color="primary" />;
        } else if (extension === 'pdf') {
            return <PictureAsPdf color="error" />;
        } else if (fileType?.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv'].includes(extension)) {
            return <VideoFile color="secondary" />;
        } else if (fileType?.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a'].includes(extension)) {
            return <AudioFile color="info" />;
        } else if (['zip', 'rar', '7z', 'tar'].includes(extension)) {
            return <Archive color="warning" />;
        } else {
            return <Description color="action" />;
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const validateFile = (file) => {
        if (file.size > maxFileSize) {
            return `File size must be less than ${formatFileSize(maxFileSize)}`;
        }
        
        const isAllowedType = allowedTypes.some(type => {
            if (type.includes('*')) {
                return file.type.startsWith(type.replace('*', ''));
            }
            return file.name.toLowerCase().endsWith(type);
        });
        
        if (!isAllowedType) {
            return 'File type not allowed';
        }
        
        return null;
    };

    const handleFileSelect = (files) => {
        Array.from(files).forEach(file => {
            const error = validateFile(file);
            if (error) {
                alert(error);
                return;
            }
            
            uploadFile(file);
        });
    };

    const uploadFile = (file) => {
        const fileId = Date.now() + Math.random();
        
        // Simulate upload progress
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                const currentProgress = prev[fileId] || 0;
                if (currentProgress >= 100) {
                    clearInterval(interval);
                    
                    // File upload completed
                    const fileData = {
                        id: fileId,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        uploadedBy: currentUser,
                        uploadedAt: new Date(),
                        url: URL.createObjectURL(file) // In real app, this would be server URL
                    };
                    
                    onFileUpload(fileData);
                    
                    // Remove from progress tracking
                    const newProgress = { ...prev };
                    delete newProgress[fileId];
                    return newProgress;
                }
                return { ...prev, [fileId]: currentProgress + 10 };
            });
        }, 200);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = e.dataTransfer.files;
        handleFileSelect(files);
    };

    const handleDownload = (file) => {
        // Create download link
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (onFileDownload) {
            onFileDownload(file);
        }
    };

    const handleDelete = (file) => {
        if (window.confirm('Are you sure you want to delete this file?')) {
            onFileDelete(file.id);
        }
    };

    const canDeleteFile = (file) => {
        return file.uploadedBy === currentUser;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { minHeight: '70vh' }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Share color="primary" />
                    <Typography variant="h6">File Sharing</Typography>
                </Box>
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                {/* Upload Area */}
                <Card
                    sx={{
                        mb: 3,
                        border: dragOver ? 2 : 1,
                        borderColor: dragOver ? 'primary.main' : 'divider',
                        borderStyle: 'dashed',
                        bgcolor: dragOver ? 'primary.light' : 'background.paper',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Drop files here or click to upload
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Maximum file size: {formatFileSize(maxFileSize)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Supported formats: Images, PDFs, Documents, Videos, Audio
                        </Typography>
                    </CardContent>
                </Card>

                {/* Upload Progress */}
                {Object.keys(uploadProgress).length > 0 && (
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Uploading Files...
                        </Typography>
                        {Object.entries(uploadProgress).map(([fileId, progress]) => (
                            <Box key={fileId} sx={{ mb: 1 }}>
                                <LinearProgress variant="determinate" value={progress} />
                                <Typography variant="caption" color="text.secondary">
                                    {progress}%
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                )}

                {/* File Statistics */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={4}>
                        <Card variant="outlined">
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h6">{sharedFiles.length}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Files
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={4}>
                        <Card variant="outlined">
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h6">
                                    {formatFileSize(sharedFiles.reduce((total, file) => total + file.size, 0))}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Size
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={4}>
                        <Card variant="outlined">
                            <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h6">
                                    {new Set(sharedFiles.map(f => f.uploadedBy)).size}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Contributors
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Shared Files List */}
                <Typography variant="h6" gutterBottom>
                    Shared Files ({sharedFiles.length})
                </Typography>

                {sharedFiles.length === 0 ? (
                    <Alert severity="info">
                        No files shared yet. Upload files to share with meeting participants.
                    </Alert>
                ) : (
                    <List>
                        {sharedFiles.map((file) => (
                            <ListItem key={file.id} divider>
                                <ListItemIcon>
                                    {getFileIcon(file.name, file.type)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={file.name}
                                    secondary={
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {formatFileSize(file.size)} • Uploaded by {file.uploadedBy}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDate(file.uploadedAt)}
                                            </Typography>
                                        </Box>
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Chip
                                            label={file.uploadedBy}
                                            size="small"
                                            variant="outlined"
                                        />
                                        <IconButton
                                            onClick={() => handleDownload(file)}
                                            title="Download"
                                        >
                                            <Download />
                                        </IconButton>
                                        {canDeleteFile(file) && (
                                            <IconButton
                                                onClick={() => handleDelete(file)}
                                                title="Delete"
                                                color="error"
                                            >
                                                <Delete />
                                            </IconButton>
                                        )}
                                    </Box>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                )}

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileSelect(e.target.files)}
                    accept={allowedTypes.join(',')}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>
                    Close
                </Button>
                <Button
                    variant="contained"
                    startIcon={<CloudUpload />}
                    onClick={() => fileInputRef.current?.click()}
                >
                    Upload Files
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FileSharing;
