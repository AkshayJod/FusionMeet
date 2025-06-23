import React from 'react';

/**
 * Utility functions to safely handle scroll operations and prevent null reference errors
 */

/**
 * Safely get scroll position of an element
 * @param {HTMLElement|null} element - The element to get scroll position from
 * @returns {Object} - Object with scrollTop, scrollLeft, scrollHeight, scrollWidth
 */
export const safeGetScrollPosition = (element) => {
    if (!element || typeof element.scrollTop === 'undefined') {
        return {
            scrollTop: 0,
            scrollLeft: 0,
            scrollHeight: 0,
            scrollWidth: 0
        };
    }

    try {
        return {
            scrollTop: element.scrollTop || 0,
            scrollLeft: element.scrollLeft || 0,
            scrollHeight: element.scrollHeight || 0,
            scrollWidth: element.scrollWidth || 0
        };
    } catch (error) {
        console.warn('Error getting scroll position:', error);
        return {
            scrollTop: 0,
            scrollLeft: 0,
            scrollHeight: 0,
            scrollWidth: 0
        };
    }
};

/**
 * Safely set scroll position of an element
 * @param {HTMLElement|null} element - The element to set scroll position on
 * @param {number} scrollTop - The scroll top position
 * @param {number} scrollLeft - The scroll left position
 */
export const safeSetScrollPosition = (element, scrollTop = 0, scrollLeft = 0) => {
    if (!element || typeof element.scrollTo !== 'function') {
        return false;
    }

    try {
        element.scrollTo({
            top: scrollTop,
            left: scrollLeft,
            behavior: 'smooth'
        });
        return true;
    } catch (error) {
        console.warn('Error setting scroll position:', error);
        try {
            // Fallback to direct property assignment
            element.scrollTop = scrollTop;
            element.scrollLeft = scrollLeft;
            return true;
        } catch (fallbackError) {
            console.warn('Fallback scroll setting also failed:', fallbackError);
            return false;
        }
    }
};

/**
 * Safely scroll element into view
 * @param {HTMLElement|null} element - The element to scroll into view
 * @param {Object} options - Scroll options
 */
export const safeScrollIntoView = (element, options = { behavior: 'smooth', block: 'nearest' }) => {
    if (!element || typeof element.scrollIntoView !== 'function') {
        return false;
    }

    try {
        element.scrollIntoView(options);
        return true;
    } catch (error) {
        console.warn('Error scrolling into view:', error);
        return false;
    }
};

/**
 * Safely get element dimensions
 * @param {HTMLElement|null} element - The element to get dimensions from
 * @returns {Object} - Object with width, height, clientWidth, clientHeight, offsetWidth, offsetHeight
 */
export const safeGetElementDimensions = (element) => {
    if (!element) {
        return {
            width: 0,
            height: 0,
            clientWidth: 0,
            clientHeight: 0,
            offsetWidth: 0,
            offsetHeight: 0
        };
    }

    try {
        return {
            width: element.getBoundingClientRect?.()?.width || 0,
            height: element.getBoundingClientRect?.()?.height || 0,
            clientWidth: element.clientWidth || 0,
            clientHeight: element.clientHeight || 0,
            offsetWidth: element.offsetWidth || 0,
            offsetHeight: element.offsetHeight || 0
        };
    } catch (error) {
        console.warn('Error getting element dimensions:', error);
        return {
            width: 0,
            height: 0,
            clientWidth: 0,
            clientHeight: 0,
            offsetWidth: 0,
            offsetHeight: 0
        };
    }
};

/**
 * Create a safe ref callback that handles null references
 * @param {Function} callback - The callback to execute when ref is set
 * @returns {Function} - Safe ref callback
 */
export const createSafeRefCallback = (callback) => {
    return (element) => {
        if (element && typeof callback === 'function') {
            try {
                callback(element);
            } catch (error) {
                console.warn('Error in ref callback:', error);
            }
        }
    };
};

/**
 * Debounced scroll handler to prevent excessive scroll event handling
 * @param {Function} handler - The scroll handler function
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} - Debounced scroll handler
 */
export const createDebouncedScrollHandler = (handler, delay = 100) => {
    let timeoutId;
    
    return function debouncedHandler(event) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            if (typeof handler === 'function') {
                try {
                    handler(event);
                } catch (error) {
                    console.warn('Error in scroll handler:', error);
                }
            }
        }, delay);
    };
};

/**
 * Prevent scroll restoration on page navigation
 */
export const preventScrollRestoration = () => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
    }
};

/**
 * Restore scroll restoration on page navigation
 */
export const restoreScrollRestoration = () => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
    }
};

/**
 * Hook to safely handle scroll events
 * @param {Function} handler - The scroll handler function
 * @param {HTMLElement|null} element - The element to attach scroll listener to (defaults to window)
 * @param {Object} options - Options for the scroll handler
 */
export const useSafeScrollHandler = (handler, element = null, options = {}) => {
    const { debounce = true, delay = 100 } = options;
    
    React.useEffect(() => {
        if (typeof handler !== 'function') return;
        
        const target = element || window;
        const scrollHandler = debounce 
            ? createDebouncedScrollHandler(handler, delay)
            : (event) => {
                try {
                    handler(event);
                } catch (error) {
                    console.warn('Error in scroll handler:', error);
                }
            };
        
        if (target && typeof target.addEventListener === 'function') {
            target.addEventListener('scroll', scrollHandler, { passive: true });
            
            return () => {
                if (typeof target.removeEventListener === 'function') {
                    target.removeEventListener('scroll', scrollHandler);
                }
            };
        }
    }, [handler, element, debounce, delay]);
};
