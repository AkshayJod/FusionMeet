import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    Slider,
    IconButton,
    Tooltip,
    Alert
} from '@mui/material';
import {
    Close as CloseIcon,
    BlurOn as BlurIcon,
    Image as ImageIcon,
    CloudUpload as UploadIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

const BackgroundSelector = ({ 
    open, 
    onClose, 
    onBackgroundChange,
    currentBackground = 'none',
    currentBlurAmount = 15 
}) => {
    const [selectedBackground, setSelectedBackground] = useState(currentBackground);
    const [blurAmount, setBlurAmount] = useState(currentBlurAmount);
    const [customImages, setCustomImages] = useState([]);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef(null);

    // Predefined background images
    const predefinedBackgrounds = [
        {
            id: 'office',
            name: 'Modern Office',
            url: '/backgrounds/office.jpg',
            thumbnail: '/backgrounds/office-thumb.jpg'
        },
        {
            id: 'home',
            name: 'Cozy Home',
            url: '/backgrounds/home.jpg',
            thumbnail: '/backgrounds/home-thumb.jpg'
        },
        {
            id: 'nature',
            name: 'Nature View',
            url: '/backgrounds/nature.jpg',
            thumbnail: '/backgrounds/nature-thumb.jpg'
        },
        {
            id: 'abstract',
            name: 'Abstract',
            url: '/backgrounds/abstract.jpg',
            thumbnail: '/backgrounds/abstract-thumb.jpg'
        }
    ];

    const handleBackgroundSelect = (type, imageUrl = null) => {
        setSelectedBackground(type);
        if (type === 'image' && imageUrl) {
            // Load the image for processing
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                onBackgroundChange({
                    type: 'image',
                    image: img,
                    blurAmount: blurAmount
                });
            };
            img.src = imageUrl;
        } else {
            onBackgroundChange({
                type: type,
                image: null,
                blurAmount: blurAmount
            });
        }
    };

    const handleBlurAmountChange = (event, newValue) => {
        setBlurAmount(newValue);
        if (selectedBackground === 'blur') {
            onBackgroundChange({
                type: 'blur',
                image: null,
                blurAmount: newValue
            });
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setUploadError('Please select a valid image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Image size should be less than 5MB');
            return;
        }

        setUploadError('');

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            const newCustomImage = {
                id: `custom-${Date.now()}`,
                name: file.name,
                url: imageUrl,
                thumbnail: imageUrl
            };
            
            setCustomImages(prev => [...prev, newCustomImage]);
            handleBackgroundSelect('image', imageUrl);
        };
        reader.readAsDataURL(file);
    };

    const handleApply = () => {
        onClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { minHeight: '500px' }
            }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Choose Background</Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                {uploadError && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUploadError('')}>
                        {uploadError}
                    </Alert>
                )}

                <Grid container spacing={2}>
                    {/* None Option */}
                    <Grid item xs={6} sm={4} md={3}>
                        <Card 
                            sx={{ 
                                cursor: 'pointer',
                                border: selectedBackground === 'none' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                                '&:hover': { boxShadow: 3 }
                            }}
                            onClick={() => handleBackgroundSelect('none')}
                        >
                            <CardMedia
                                sx={{
                                    height: 100,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: '#f5f5f5'
                                }}
                            >
                                <VisibilityOffIcon sx={{ fontSize: 40, color: '#666' }} />
                            </CardMedia>
                            <CardContent sx={{ p: 1, textAlign: 'center' }}>
                                <Typography variant="caption">None</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Blur Option */}
                    <Grid item xs={6} sm={4} md={3}>
                        <Card 
                            sx={{ 
                                cursor: 'pointer',
                                border: selectedBackground === 'blur' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                                '&:hover': { boxShadow: 3 }
                            }}
                            onClick={() => handleBackgroundSelect('blur')}
                        >
                            <CardMedia
                                sx={{
                                    height: 100,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: '#f0f0f0',
                                    backgroundImage: 'radial-gradient(circle, #ddd 1px, transparent 1px)',
                                    backgroundSize: '10px 10px',
                                    filter: 'blur(3px)'
                                }}
                            >
                                <BlurIcon sx={{ fontSize: 40, color: '#666' }} />
                            </CardMedia>
                            <CardContent sx={{ p: 1, textAlign: 'center' }}>
                                <Typography variant="caption">Blur</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Predefined Backgrounds */}
                    {predefinedBackgrounds.map((bg) => (
                        <Grid item xs={6} sm={4} md={3} key={bg.id}>
                            <Card 
                                sx={{ 
                                    cursor: 'pointer',
                                    border: selectedBackground === 'image' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                                    '&:hover': { boxShadow: 3 }
                                }}
                                onClick={() => handleBackgroundSelect('image', bg.url)}
                            >
                                <CardMedia
                                    component="img"
                                    height="100"
                                    image={bg.thumbnail || bg.url}
                                    alt={bg.name}
                                    sx={{ objectFit: 'cover' }}
                                    onError={(e) => {
                                        // Fallback to a placeholder if image fails to load
                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                                    }}
                                />
                                <CardContent sx={{ p: 1, textAlign: 'center' }}>
                                    <Typography variant="caption">{bg.name}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}

                    {/* Custom Images */}
                    {customImages.map((bg) => (
                        <Grid item xs={6} sm={4} md={3} key={bg.id}>
                            <Card 
                                sx={{ 
                                    cursor: 'pointer',
                                    border: selectedBackground === 'image' ? '2px solid #1976d2' : '1px solid #e0e0e0',
                                    '&:hover': { boxShadow: 3 }
                                }}
                                onClick={() => handleBackgroundSelect('image', bg.url)}
                            >
                                <CardMedia
                                    component="img"
                                    height="100"
                                    image={bg.thumbnail}
                                    alt={bg.name}
                                    sx={{ objectFit: 'cover' }}
                                />
                                <CardContent sx={{ p: 1, textAlign: 'center' }}>
                                    <Typography variant="caption" noWrap>
                                        {bg.name.length > 15 ? bg.name.substring(0, 15) + '...' : bg.name}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}

                    {/* Upload Option */}
                    <Grid item xs={6} sm={4} md={3}>
                        <Card 
                            sx={{ 
                                cursor: 'pointer',
                                border: '1px dashed #ccc',
                                '&:hover': { boxShadow: 3, borderColor: '#1976d2' }
                            }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <CardMedia
                                sx={{
                                    height: 100,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: '#fafafa'
                                }}
                            >
                                <UploadIcon sx={{ fontSize: 40, color: '#666' }} />
                            </CardMedia>
                            <CardContent sx={{ p: 1, textAlign: 'center' }}>
                                <Typography variant="caption">Upload</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Blur Amount Slider */}
                {selectedBackground === 'blur' && (
                    <Box sx={{ mt: 3, px: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Blur Amount
                        </Typography>
                        <Slider
                            value={blurAmount}
                            onChange={handleBlurAmountChange}
                            min={1}
                            max={50}
                            step={1}
                            marks={[
                                { value: 1, label: 'Light' },
                                { value: 25, label: 'Medium' },
                                { value: 50, label: 'Heavy' }
                            ]}
                            valueLabelDisplay="auto"
                            sx={{ mt: 2 }}
                        />
                    </Box>
                )}

                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleApply} variant="contained">
                    Apply
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BackgroundSelector;
