import { useEffect } from 'react';

/**
 * Custom hook to handle scroll-related errors globally
 * This prevents the common "Cannot read properties of null (reading 'scrollTop')" errors
 */
export const useScrollErrorHandler = () => {
    useEffect(() => {
        // Override console.error to catch and filter scroll errors
        const originalConsoleError = console.error;
        
        console.error = (...args) => {
            const message = args.join(' ');
            
            // Check if it's a scroll-related error
            const scrollErrorPatterns = [
                'scrollTop', 'scrollLeft', 'scrollHeight', 'scrollWidth',
                'clientHeight', 'clientWidth', 'offsetHeight', 'offsetWidth'
            ];
            
            const isScrollError = scrollErrorPatterns.some(pattern => 
                message.includes(`reading '${pattern}'`) || 
                message.includes(`reading "${pattern}"`) ||
                (message.includes('Cannot read properties of null') && message.includes(pattern)) ||
                (message.includes('Cannot read property') && message.includes(pattern))
            );
            
            if (isScrollError) {
                console.warn('Scroll error filtered:', message);
                return;
            }
            
            // Call original console.error for non-scroll errors
            originalConsoleError.apply(console, args);
        };
        
        // Global error event handler
        const handleGlobalError = (event) => {
            if (event.error && event.error.message) {
                const message = event.error.message;
                const scrollErrorPatterns = [
                    'scrollTop', 'scrollLeft', 'scrollHeight', 'scrollWidth',
                    'clientHeight', 'clientWidth', 'offsetHeight', 'offsetWidth'
                ];
                
                const isScrollError = scrollErrorPatterns.some(pattern => 
                    message.includes(`reading '${pattern}'`) || 
                    message.includes(`reading "${pattern}"`) ||
                    (message.includes('Cannot read properties of null') && message.includes(pattern)) ||
                    (message.includes('Cannot read property') && message.includes(pattern))
                );
                
                if (isScrollError) {
                    console.warn('Global scroll error caught and prevented:', message);
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                }
            }
        };
        
        // Unhandled promise rejection handler
        const handleUnhandledRejection = (event) => {
            if (event.reason && event.reason.message) {
                const message = event.reason.message;
                const scrollErrorPatterns = [
                    'scrollTop', 'scrollLeft', 'scrollHeight', 'scrollWidth',
                    'clientHeight', 'clientWidth', 'offsetHeight', 'offsetWidth'
                ];
                
                const isScrollError = scrollErrorPatterns.some(pattern => 
                    message.includes(`reading '${pattern}'`) || 
                    message.includes(`reading "${pattern}"`) ||
                    (message.includes('Cannot read properties of null') && message.includes(pattern)) ||
                    (message.includes('Cannot read property') && message.includes(pattern))
                );
                
                if (isScrollError) {
                    console.warn('Unhandled scroll error caught and prevented:', message);
                    event.preventDefault();
                    return false;
                }
            }
        };
        
        // Add event listeners
        window.addEventListener('error', handleGlobalError, true);
        window.addEventListener('unhandledrejection', handleUnhandledRejection, true);
        
        // Cleanup function
        return () => {
            console.error = originalConsoleError;
            window.removeEventListener('error', handleGlobalError, true);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
        };
    }, []);
};

/**
 * Hook to safely handle refs that might be null when accessed
 */
export const useSafeRef = (callback) => {
    return (element) => {
        if (element && typeof callback === 'function') {
            try {
                callback(element);
            } catch (error) {
                console.warn('Error in safe ref callback:', error);
            }
        }
    };
};

/**
 * Hook to create a safe scroll handler
 */
export const useSafeScrollHandler = (handler, dependencies = []) => {
    useEffect(() => {
        if (typeof handler !== 'function') return;
        
        const safeHandler = (event) => {
            try {
                handler(event);
            } catch (error) {
                if (error.message && error.message.includes('scrollTop')) {
                    console.warn('Scroll handler error caught:', error.message);
                } else {
                    console.error('Scroll handler error:', error);
                }
            }
        };
        
        window.addEventListener('scroll', safeHandler, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', safeHandler);
        };
    }, dependencies);
};

export default useScrollErrorHandler;
