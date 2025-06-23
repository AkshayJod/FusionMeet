import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    IconButton,
    Switch,
    FormControlLabel
} from '@mui/material';
import {
    Close as CloseIcon,
    Event as EventIcon,
    ContentCopy as CopyIcon
} from '@mui/icons-material';
import { api } from '../utils/apiClient';
import { useNotification, handleApiError } from './NotificationSystem';

const MeetingScheduler = ({ open, onClose, onMeetingCreated, defaultDate = null }) => {
    const [formData, setFormData] = useState({
        meetingTitle: '',
        scheduledDate: '',
        scheduledTime: '',
        duration: 60, // minutes
        description: '',
        // Recurring meeting options
        isRecurring: false,
        recurrenceType: 'weekly',
        recurrenceInterval: 1,
        recurrenceEndDate: '',
        maxOccurrences: 10,
        // Meeting settings
        requirePassword: false,
        password: '',
        waitingRoom: false,
        muteOnEntry: false,
        allowEarlyJoin: true,
        recordMeeting: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [createdMeeting, setCreatedMeeting] = useState(null);
    const { showSuccess, showError } = useNotification();

    const handleInputChange = (field) => (event) => {
        setFormData(prev => ({
            ...prev,
            [field]: event.target.value
        }));
        setError('');
    };

    const handleScheduleMeeting = async () => {
        try {
            setLoading(true);
            setError('');

            // Validate form
            if (!formData.meetingTitle.trim()) {
                setError('Meeting title is required');
                return;
            }

            if (!formData.scheduledDate || !formData.scheduledTime) {
                setError('Please select date and time');
                return;
            }

            // Combine date and time
            const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
            
            // Check if the scheduled time is in the future
            if (scheduledDateTime <= new Date()) {
                setError('Please select a future date and time');
                return;
            }

            const response = await api.meetings.create({
                meeting_title: formData.meetingTitle,
                scheduled_time: scheduledDateTime.toISOString(),
                description: formData.description,
                duration: formData.duration
            });

            if (response.status === 201) {
                const meetingData = response.data;
                setCreatedMeeting(meetingData);
                setSuccess('Meeting scheduled successfully!');
                showSuccess('Meeting scheduled successfully!');

                // Call parent callback
                if (onMeetingCreated) {
                    onMeetingCreated(meetingData);
                }

                // Reset form
                setFormData({
                    meetingTitle: '',
                    scheduledDate: '',
                    scheduledTime: '',
                    duration: 60,
                    description: '',
                    isRecurring: false,
                    recurrenceType: 'weekly',
                    recurrenceInterval: 1,
                    recurrenceEndDate: '',
                    maxOccurrences: 10,
                    requirePassword: false,
                    password: '',
                    waitingRoom: false,
                    muteOnEntry: false,
                    allowEarlyJoin: true,
                    recordMeeting: false
                });
            }

        } catch (err) {
            console.error('Error scheduling meeting:', err);
            handleApiError(err, showError);
            setError(err.message || 'Failed to schedule meeting');
        } finally {
            setLoading(false);
        }
    };

    const copyMeetingLink = () => {
        if (createdMeeting) {
            const meetingLink = `${window.location.origin}/${createdMeeting.meetingId}`;
            navigator.clipboard.writeText(meetingLink);
            showSuccess('Meeting link copied to clipboard!');
        }
    };

    const handleClose = () => {
        setFormData({
            meetingTitle: '',
            scheduledDate: '',
            scheduledTime: '',
            duration: 60,
            description: '',
            isRecurring: false,
            recurrenceType: 'weekly',
            recurrenceInterval: 1,
            recurrenceEndDate: '',
            maxOccurrences: 10,
            requirePassword: false,
            password: '',
            waitingRoom: false,
            muteOnEntry: false,
            allowEarlyJoin: true,
            recordMeeting: false
        });
        setError('');
        setSuccess('');
        setCreatedMeeting(null);
        onClose();
    };

    // Get current date and time for min values
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon color="primary" />
                    <Typography variant="h6">Schedule Meeting</Typography>
                </Box>
                <IconButton onClick={handleClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && !createdMeeting && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                {createdMeeting && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Meeting scheduled successfully!
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Chip 
                                label={`Meeting ID: ${createdMeeting.meetingId}`}
                                variant="outlined"
                                size="small"
                            />
                            <IconButton size="small" onClick={copyMeetingLink}>
                                <CopyIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Alert>
                )}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Meeting Title"
                        value={formData.meetingTitle}
                        onChange={handleInputChange('meetingTitle')}
                        fullWidth
                        required
                        placeholder="Enter meeting title"
                    />

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Date"
                            type="date"
                            value={formData.scheduledDate}
                            onChange={handleInputChange('scheduledDate')}
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ min: currentDate }}
                        />

                        <TextField
                            label="Time"
                            type="time"
                            value={formData.scheduledTime}
                            onChange={handleInputChange('scheduledTime')}
                            fullWidth
                            required
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ 
                                min: formData.scheduledDate === currentDate ? currentTime : undefined 
                            }}
                        />
                    </Box>

                    <FormControl fullWidth>
                        <InputLabel>Duration</InputLabel>
                        <Select
                            value={formData.duration}
                            onChange={handleInputChange('duration')}
                            label="Duration"
                        >
                            <MenuItem value={30}>30 minutes</MenuItem>
                            <MenuItem value={60}>1 hour</MenuItem>
                            <MenuItem value={90}>1.5 hours</MenuItem>
                            <MenuItem value={120}>2 hours</MenuItem>
                            <MenuItem value={180}>3 hours</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Description (Optional)"
                        value={formData.description}
                        onChange={handleInputChange('description')}
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Add meeting description or agenda"
                    />

                    {/* Recurring Meeting Options */}
                    <Box sx={{ mt: 2 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isRecurring}
                                    onChange={handleInputChange('isRecurring')}
                                />
                            }
                            label="Recurring Meeting"
                        />

                        {formData.isRecurring && (
                            <Box sx={{ mt: 2, pl: 2, borderLeft: 2, borderColor: 'primary.main' }}>
                                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <FormControl sx={{ minWidth: 120 }}>
                                        <InputLabel>Repeat</InputLabel>
                                        <Select
                                            value={formData.recurrenceType}
                                            onChange={handleInputChange('recurrenceType')}
                                            label="Repeat"
                                        >
                                            <MenuItem value="daily">Daily</MenuItem>
                                            <MenuItem value="weekly">Weekly</MenuItem>
                                            <MenuItem value="monthly">Monthly</MenuItem>
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        label="Every"
                                        type="number"
                                        value={formData.recurrenceInterval}
                                        onChange={handleInputChange('recurrenceInterval')}
                                        inputProps={{ min: 1, max: 30 }}
                                        sx={{ width: 100 }}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <TextField
                                        label="End Date"
                                        type="date"
                                        value={formData.recurrenceEndDate}
                                        onChange={handleInputChange('recurrenceEndDate')}
                                        InputLabelProps={{ shrink: true }}
                                        inputProps={{ min: formData.scheduledDate }}
                                    />

                                    <TextField
                                        label="Max Occurrences"
                                        type="number"
                                        value={formData.maxOccurrences}
                                        onChange={handleInputChange('maxOccurrences')}
                                        inputProps={{ min: 1, max: 100 }}
                                        sx={{ width: 150 }}
                                    />
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* Advanced Settings */}
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Meeting Settings
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.allowEarlyJoin}
                                        onChange={handleInputChange('allowEarlyJoin')}
                                    />
                                }
                                label="Allow participants to join before host"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.muteOnEntry}
                                        onChange={handleInputChange('muteOnEntry')}
                                    />
                                }
                                label="Mute participants on entry"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.waitingRoom}
                                        onChange={handleInputChange('waitingRoom')}
                                    />
                                }
                                label="Enable waiting room"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.recordMeeting}
                                        onChange={handleInputChange('recordMeeting')}
                                    />
                                }
                                label="Record meeting automatically"
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.requirePassword}
                                        onChange={handleInputChange('requirePassword')}
                                    />
                                }
                                label="Require password"
                            />

                            {formData.requirePassword && (
                                <TextField
                                    label="Meeting Password"
                                    value={formData.password}
                                    onChange={handleInputChange('password')}
                                    type="password"
                                    size="small"
                                    sx={{ ml: 3, maxWidth: 200 }}
                                />
                            )}
                        </Box>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} variant="outlined">
                    Cancel
                </Button>
                <Button 
                    onClick={handleScheduleMeeting}
                    variant="contained"
                    disabled={loading}
                    startIcon={<EventIcon />}
                >
                    {loading ? 'Scheduling...' : 'Schedule Meeting'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MeetingScheduler;
