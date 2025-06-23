import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
        this.scrollErrorCount = 0;
        this.maxScrollErrors = 5; // Maximum scroll errors before showing error UI
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to console for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Enhanced scroll error detection
        const scrollErrors = [
            'scrollTop', 'scrollLeft', 'scrollHeight', 'scrollWidth',
            'clientHeight', 'clientWidth', 'offsetHeight', 'offsetWidth'
        ];

        const isScrollError = scrollErrors.some(scrollProp =>
            error.message && (
                error.message.includes(`reading '${scrollProp}'`) ||
                error.message.includes(`reading "${scrollProp}"`) ||
                error.message.includes(scrollProp)
            )
        );

        if (isScrollError) {
            this.scrollErrorCount++;
            console.warn(`Scroll-related error caught and ignored (${this.scrollErrorCount}/${this.maxScrollErrors}):`, error.message);

            // Only reset error state if we haven't exceeded the maximum scroll errors
            if (this.scrollErrorCount <= this.maxScrollErrors) {
                // Prevent the error from showing by resetting state immediately
                this.setState({ hasError: false, error: null });
                return;
            } else {
                console.error('Too many scroll errors, showing error boundary');
            }
        }
    }

    render() {
        if (this.state.hasError) {
            // Enhanced scroll error detection
            const scrollErrorPatterns = [
                'scrollTop', 'scrollLeft', 'scrollHeight', 'scrollWidth',
                'clientHeight', 'clientWidth', 'offsetHeight', 'offsetWidth'
            ];

            const isScrollError = scrollErrorPatterns.some(pattern =>
                this.state.error?.message?.includes(pattern)
            );

            if (isScrollError && this.scrollErrorCount <= this.maxScrollErrors) {
                // For scroll errors within limit, just render children normally
                return this.props.children;
            }
            
            // For other errors, show fallback UI
            return (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '200px',
                        p: 4,
                        textAlign: 'center'
                    }}
                >
                    <Typography variant="h6" color="error" gutterBottom>
                        Something went wrong
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => this.setState({ hasError: false, error: null })}
                    >
                        Try Again
                    </Button>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
