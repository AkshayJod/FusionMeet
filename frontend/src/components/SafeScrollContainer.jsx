import React, { useRef, useEffect, forwardRef } from 'react';
import { Box } from '@mui/material';
import { safeGetScrollPosition, safeSetScrollPosition } from '../utils/scrollUtils';

/**
 * A safe scroll container that prevents null reference errors
 * when accessing scroll properties
 */
const SafeScrollContainer = forwardRef(({ 
    children, 
    onScroll, 
    autoScrollToBottom = false,
    sx = {},
    ...props 
}, ref) => {
    const containerRef = useRef(null);
    const combinedRef = ref || containerRef;

    // Safe scroll handler
    const handleScroll = (event) => {
        if (typeof onScroll === 'function') {
            try {
                const scrollInfo = safeGetScrollPosition(event.target);
                onScroll({
                    ...event,
                    scrollInfo
                });
            } catch (error) {
                console.warn('Error in scroll handler:', error);
            }
        }
    };

    // Auto scroll to bottom when content changes
    useEffect(() => {
        if (autoScrollToBottom && combinedRef.current) {
            const element = combinedRef.current;
            const scrollInfo = safeGetScrollPosition(element);
            
            if (scrollInfo.scrollHeight > scrollInfo.clientHeight) {
                safeSetScrollPosition(
                    element, 
                    scrollInfo.scrollHeight - scrollInfo.clientHeight, 
                    0
                );
            }
        }
    }, [children, autoScrollToBottom]);

    return (
        <Box
            ref={combinedRef}
            onScroll={handleScroll}
            sx={{
                overflow: 'auto',
                ...sx
            }}
            {...props}
        >
            {children}
        </Box>
    );
});

SafeScrollContainer.displayName = 'SafeScrollContainer';

export default SafeScrollContainer;
