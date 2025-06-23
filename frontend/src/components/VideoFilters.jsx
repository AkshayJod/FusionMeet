import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Button,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Divider,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Palette,
    Brightness6,
    Contrast,
    Tune,
    PhotoFilter,
    Blur,
    Close,
    Check,
    Refresh
} from '@mui/icons-material';

const VideoFilters = ({ 
    videoStream, 
    onFilterChange, 
    onClose,
    currentFilters = {}
}) => {
    const [filters, setFilters] = useState({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hue: 0,
        blur: 0,
        sepia: 0,
        grayscale: 0,
        invert: 0,
        ...currentFilters
    });

    const [selectedPreset, setSelectedPreset] = useState('none');
    const canvasRef = useRef(null);
    const videoRef = useRef(null);

    // Filter presets
    const filterPresets = {
        none: { brightness: 100, contrast: 100, saturation: 100, hue: 0, blur: 0, sepia: 0, grayscale: 0, invert: 0 },
        vintage: { brightness: 110, contrast: 120, saturation: 80, hue: 10, blur: 0, sepia: 30, grayscale: 0, invert: 0 },
        blackwhite: { brightness: 100, contrast: 110, saturation: 0, hue: 0, blur: 0, sepia: 0, grayscale: 100, invert: 0 },
        warm: { brightness: 105, contrast: 105, saturation: 120, hue: 15, blur: 0, sepia: 10, grayscale: 0, invert: 0 },
        cool: { brightness: 95, contrast: 105, saturation: 110, hue: -10, blur: 0, sepia: 0, grayscale: 0, invert: 0 },
        dramatic: { brightness: 90, contrast: 140, saturation: 130, hue: 0, blur: 0, sepia: 0, grayscale: 0, invert: 0 },
        soft: { brightness: 110, contrast: 90, saturation: 90, hue: 5, blur: 1, sepia: 5, grayscale: 0, invert: 0 }
    };

    // Apply filters to video stream
    useEffect(() => {
        if (videoStream && canvasRef.current && videoRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const video = videoRef.current;

            video.srcObject = videoStream;
            video.play();

            const applyFilters = () => {
                if (video.videoWidth && video.videoHeight) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    // Apply CSS filters
                    ctx.filter = `
                        brightness(${filters.brightness}%)
                        contrast(${filters.contrast}%)
                        saturate(${filters.saturation}%)
                        hue-rotate(${filters.hue}deg)
                        blur(${filters.blur}px)
                        sepia(${filters.sepia}%)
                        grayscale(${filters.grayscale}%)
                        invert(${filters.invert}%)
                    `;

                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                }
                requestAnimationFrame(applyFilters);
            };

            video.addEventListener('loadedmetadata', applyFilters);
        }
    }, [videoStream, filters]);

    const handleFilterChange = (filterName, value) => {
        const newFilters = { ...filters, [filterName]: value };
        setFilters(newFilters);
        setSelectedPreset('custom');
        
        if (onFilterChange) {
            onFilterChange(newFilters);
        }
    };

    const applyPreset = (presetName) => {
        const preset = filterPresets[presetName];
        setFilters(preset);
        setSelectedPreset(presetName);
        
        if (onFilterChange) {
            onFilterChange(preset);
        }
    };

    const resetFilters = () => {
        applyPreset('none');
    };

    return (
        <Paper 
            elevation={8} 
            sx={{ 
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: 800,
                maxHeight: '90vh',
                overflow: 'auto',
                zIndex: 1300,
                p: 3
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhotoFilter color="primary" />
                    Video Filters & Effects
                </Typography>
                <IconButton onClick={onClose}>
                    <Close />
                </IconButton>
            </Box>

            <Grid container spacing={3}>
                {/* Preview */}
                <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                        Preview
                    </Typography>
                    <Box sx={{ position: 'relative', bgcolor: 'black', borderRadius: 2, overflow: 'hidden' }}>
                        <video
                            ref={videoRef}
                            style={{ display: 'none' }}
                            muted
                            playsInline
                        />
                        <canvas
                            ref={canvasRef}
                            style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: 300,
                                display: 'block'
                            }}
                        />
                    </Box>
                </Grid>

                {/* Controls */}
                <Grid item xs={12} md={6}>
                    {/* Filter Presets */}
                    <Typography variant="h6" gutterBottom>
                        Quick Presets
                    </Typography>
                    <Grid container spacing={1} sx={{ mb: 3 }}>
                        {Object.keys(filterPresets).map((preset) => (
                            <Grid item key={preset}>
                                <Chip
                                    label={preset.charAt(0).toUpperCase() + preset.slice(1)}
                                    onClick={() => applyPreset(preset)}
                                    color={selectedPreset === preset ? 'primary' : 'default'}
                                    variant={selectedPreset === preset ? 'filled' : 'outlined'}
                                />
                            </Grid>
                        ))}
                        <Grid item>
                            <Chip
                                label="Custom"
                                color={selectedPreset === 'custom' ? 'primary' : 'default'}
                                variant={selectedPreset === 'custom' ? 'filled' : 'outlined'}
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    {/* Manual Controls */}
                    <Typography variant="h6" gutterBottom>
                        Manual Adjustments
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                        <Typography gutterBottom>
                            <Brightness6 sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Brightness: {filters.brightness}%
                        </Typography>
                        <Slider
                            value={filters.brightness}
                            onChange={(e, value) => handleFilterChange('brightness', value)}
                            min={50}
                            max={200}
                            step={5}
                        />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography gutterBottom>
                            <Contrast sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Contrast: {filters.contrast}%
                        </Typography>
                        <Slider
                            value={filters.contrast}
                            onChange={(e, value) => handleFilterChange('contrast', value)}
                            min={50}
                            max={200}
                            step={5}
                        />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography gutterBottom>
                            <Palette sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Saturation: {filters.saturation}%
                        </Typography>
                        <Slider
                            value={filters.saturation}
                            onChange={(e, value) => handleFilterChange('saturation', value)}
                            min={0}
                            max={200}
                            step={5}
                        />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography gutterBottom>
                            🎨 Hue: {filters.hue}°
                        </Typography>
                        <Slider
                            value={filters.hue}
                            onChange={(e, value) => handleFilterChange('hue', value)}
                            min={-180}
                            max={180}
                            step={5}
                        />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography gutterBottom>
                            <Blur sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Blur: {filters.blur}px
                        </Typography>
                        <Slider
                            value={filters.blur}
                            onChange={(e, value) => handleFilterChange('blur', value)}
                            min={0}
                            max={10}
                            step={0.5}
                        />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography gutterBottom>
                            📸 Sepia: {filters.sepia}%
                        </Typography>
                        <Slider
                            value={filters.sepia}
                            onChange={(e, value) => handleFilterChange('sepia', value)}
                            min={0}
                            max={100}
                            step={5}
                        />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Typography gutterBottom>
                            ⚫ Grayscale: {filters.grayscale}%
                        </Typography>
                        <Slider
                            value={filters.grayscale}
                            onChange={(e, value) => handleFilterChange('grayscale', value)}
                            min={0}
                            max={100}
                            step={5}
                        />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography gutterBottom>
                            🔄 Invert: {filters.invert}%
                        </Typography>
                        <Slider
                            value={filters.invert}
                            onChange={(e, value) => handleFilterChange('invert', value)}
                            min={0}
                            max={100}
                            step={5}
                        />
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            startIcon={<Refresh />}
                            onClick={resetFilters}
                            variant="outlined"
                        >
                            Reset
                        </Button>
                        <Button
                            startIcon={<Check />}
                            onClick={onClose}
                            variant="contained"
                        >
                            Apply
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default VideoFilters;
