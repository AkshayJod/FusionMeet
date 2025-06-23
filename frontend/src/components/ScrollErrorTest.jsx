import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, Typography, Paper, Alert } from '@mui/material';
import { safeScrollIntoView, safeGetScrollPosition } from '../utils/scrollUtils';
import SafeScrollContainer from './SafeScrollContainer';
import useScrollErrorHandler from '../hooks/useScrollErrorHandler';

/**
 * Test component to verify scroll error fixes are working
 */
const ScrollErrorTest = () => {
    const [errors, setErrors] = useState([]);
    const [testResults, setTestResults] = useState([]);
    const nullRef = useRef(null);
    const validRef = useRef(null);
    
    // Use the scroll error handler
    useScrollErrorHandler();

    useEffect(() => {
        // Override console.error to capture errors for testing
        const originalError = console.error;
        console.error = (...args) => {
            const message = args.join(' ');
            setErrors(prev => [...prev, message]);
            originalError.apply(console, args);
        };

        return () => {
            console.error = originalError;
        };
    }, []);

    const testScrollTopOnNull = () => {
        try {
            // This should normally cause an error
            const element = null;
            const scrollTop = element?.scrollTop; // Safe access
            setTestResults(prev => [...prev, 'Safe null access: PASSED']);
        } catch (error) {
            setTestResults(prev => [...prev, `Safe null access: FAILED - ${error.message}`]);
        }
    };

    const testUnsafeScrollAccess = () => {
        try {
            // This will definitely cause an error
            const element = null;
            const scrollTop = element.scrollTop; // Unsafe access
            setTestResults(prev => [...prev, 'Unsafe null access: PASSED (unexpected)']);
        } catch (error) {
            setTestResults(prev => [...prev, `Unsafe null access: CAUGHT - ${error.message}`]);
        }
    };

    const testSafeScrollUtils = () => {
        try {
            const result = safeGetScrollPosition(null);
            setTestResults(prev => [...prev, `Safe scroll utils: PASSED - ${JSON.stringify(result)}`]);
        } catch (error) {
            setTestResults(prev => [...prev, `Safe scroll utils: FAILED - ${error.message}`]);
        }
    };

    const testSafeScrollIntoView = () => {
        try {
            const result = safeScrollIntoView(null);
            setTestResults(prev => [...prev, `Safe scroll into view: PASSED - ${result}`]);
        } catch (error) {
            setTestResults(prev => [...prev, `Safe scroll into view: FAILED - ${error.message}`]);
        }
    };

    const clearResults = () => {
        setErrors([]);
        setTestResults([]);
    };

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h4" gutterBottom>
                Scroll Error Fix Test
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
                This component tests the scroll error fixes to ensure they prevent 
                "Cannot read properties of null (reading 'scrollTop')" errors.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Button variant="contained" onClick={testScrollTopOnNull}>
                    Test Safe Null Access
                </Button>
                <Button variant="contained" color="warning" onClick={testUnsafeScrollAccess}>
                    Test Unsafe Access
                </Button>
                <Button variant="contained" onClick={testSafeScrollUtils}>
                    Test Safe Utils
                </Button>
                <Button variant="contained" onClick={testSafeScrollIntoView}>
                    Test Safe Scroll Into View
                </Button>
                <Button variant="outlined" onClick={clearResults}>
                    Clear Results
                </Button>
            </Box>

            {/* Test Results */}
            {testResults.length > 0 && (
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Test Results:
                    </Typography>
                    {testResults.map((result, index) => (
                        <Typography 
                            key={index} 
                            variant="body2" 
                            sx={{ 
                                fontFamily: 'monospace',
                                color: result.includes('PASSED') ? 'success.main' : 
                                       result.includes('FAILED') ? 'error.main' : 'warning.main',
                                mb: 1
                            }}
                        >
                            {result}
                        </Typography>
                    ))}
                </Paper>
            )}

            {/* Error Log */}
            {errors.length > 0 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Captured Errors ({errors.length}):
                    </Typography>
                    {errors.slice(-5).map((error, index) => (
                        <Typography 
                            key={index} 
                            variant="body2" 
                            sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                        >
                            {error}
                        </Typography>
                    ))}
                </Alert>
            )}

            {/* Safe Scroll Container Test */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Safe Scroll Container Test:
                </Typography>
                <SafeScrollContainer
                    sx={{ 
                        height: 200, 
                        border: 1, 
                        borderColor: 'divider',
                        p: 2
                    }}
                    autoScrollToBottom={true}
                >
                    {Array.from({ length: 50 }, (_, i) => (
                        <Typography key={i} variant="body2">
                            Line {i + 1}: This is a test line to create scrollable content.
                        </Typography>
                    ))}
                </SafeScrollContainer>
            </Paper>

            {/* Hidden refs for testing */}
            <div ref={nullRef} style={{ display: 'none' }} />
            <div ref={validRef} style={{ display: 'none' }}>Valid element</div>
        </Box>
    );
};

export default ScrollErrorTest;
