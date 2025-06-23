import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

class VirtualBackground {
    constructor() {
        this.selfieSegmentation = null;
        this.isInitialized = false;
        this.isProcessing = false;
        this.backgroundType = 'none'; // 'none', 'blur', 'image'
        this.backgroundImage = null;
        this.blurAmount = 15;
        this.segmentationModel = 1; // 0 for general, 1 for landscape
        
        // Canvas elements for processing
        this.inputCanvas = null;
        this.outputCanvas = null;
        this.backgroundCanvas = null;
        
        // Performance settings
        this.processEveryNthFrame = 2; // Process every 2nd frame for performance
        this.frameCount = 0;
        this.lastProcessedImageData = null;
        this.performanceMode = 'balanced'; // 'performance', 'balanced', 'quality'
        this.maxWidth = 640; // Max processing width for performance
        this.maxHeight = 480; // Max processing height for performance
    }

    async initialize() {
        try {
            console.log('Initializing Virtual Background...');
            
            // Initialize TensorFlow.js backend
            await tf.ready();
            console.log('TensorFlow.js backend ready');

            // Initialize MediaPipe Selfie Segmentation
            this.selfieSegmentation = new SelfieSegmentation({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
                }
            });

            this.selfieSegmentation.setOptions({
                modelSelection: this.segmentationModel,
                selfieMode: true,
            });

            this.selfieSegmentation.onResults(this.onResults.bind(this));

            // Create canvas elements
            this.inputCanvas = document.createElement('canvas');
            this.outputCanvas = document.createElement('canvas');
            this.backgroundCanvas = document.createElement('canvas');

            this.isInitialized = true;
            console.log('Virtual Background initialized successfully');
            
            return true;
        } catch (error) {
            console.error('Failed to initialize Virtual Background:', error);
            return false;
        }
    }

    onResults(results) {
        if (!results.segmentationMask) {
            this.isProcessing = false;
            return;
        }

        const canvas = this.outputCanvas;
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match input
        canvas.width = results.image.width;
        canvas.height = results.image.height;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply background effect based on type
        switch (this.backgroundType) {
            case 'blur':
                this.applyBlurBackground(ctx, results);
                break;
            case 'image':
                this.applyImageBackground(ctx, results);
                break;
            case 'none':
            default:
                // Just draw the original image
                ctx.drawImage(results.image, 0, 0);
                break;
        }

        this.isProcessing = false;
    }

    applyBlurBackground(ctx, results) {
        const { image, segmentationMask } = results;
        const canvas = ctx.canvas;
        
        // Create blurred background
        const backgroundCtx = this.backgroundCanvas.getContext('2d');
        this.backgroundCanvas.width = canvas.width;
        this.backgroundCanvas.height = canvas.height;
        
        // Draw and blur the background
        backgroundCtx.filter = `blur(${this.blurAmount}px)`;
        backgroundCtx.drawImage(image, 0, 0);
        backgroundCtx.filter = 'none';

        // Get image data for pixel manipulation
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const backgroundImageData = backgroundCtx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Create temporary canvas for original image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(image, 0, 0);
        const originalImageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

        // Blend based on segmentation mask
        for (let i = 0; i < segmentationMask.data.length; i++) {
            const maskValue = segmentationMask.data[i] / 255;
            const pixelIndex = i * 4;
            
            // Blend original and blurred background
            imageData.data[pixelIndex] = originalImageData.data[pixelIndex] * maskValue + 
                                       backgroundImageData.data[pixelIndex] * (1 - maskValue);
            imageData.data[pixelIndex + 1] = originalImageData.data[pixelIndex + 1] * maskValue + 
                                           backgroundImageData.data[pixelIndex + 1] * (1 - maskValue);
            imageData.data[pixelIndex + 2] = originalImageData.data[pixelIndex + 2] * maskValue + 
                                           backgroundImageData.data[pixelIndex + 2] * (1 - maskValue);
            imageData.data[pixelIndex + 3] = 255; // Full opacity
        }

        ctx.putImageData(imageData, 0, 0);
    }

    applyImageBackground(ctx, results) {
        const { image, segmentationMask } = results;
        const canvas = ctx.canvas;

        if (!this.backgroundImage) {
            // Fallback to original image if no background is set
            ctx.drawImage(image, 0, 0);
            return;
        }

        // Draw background image scaled to fit
        ctx.drawImage(this.backgroundImage, 0, 0, canvas.width, canvas.height);

        // Get image data for pixel manipulation
        const backgroundImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Create temporary canvas for original image
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(image, 0, 0);
        const originalImageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

        // Create final image data
        const imageData = ctx.createImageData(canvas.width, canvas.height);

        // Blend based on segmentation mask
        for (let i = 0; i < segmentationMask.data.length; i++) {
            const maskValue = segmentationMask.data[i] / 255;
            const pixelIndex = i * 4;
            
            // Use original image for person, background image for background
            imageData.data[pixelIndex] = originalImageData.data[pixelIndex] * maskValue + 
                                       backgroundImageData.data[pixelIndex] * (1 - maskValue);
            imageData.data[pixelIndex + 1] = originalImageData.data[pixelIndex + 1] * maskValue + 
                                           backgroundImageData.data[pixelIndex + 1] * (1 - maskValue);
            imageData.data[pixelIndex + 2] = originalImageData.data[pixelIndex + 2] * maskValue + 
                                           backgroundImageData.data[pixelIndex + 2] * (1 - maskValue);
            imageData.data[pixelIndex + 3] = 255; // Full opacity
        }

        ctx.putImageData(imageData, 0, 0);
    }

    async processFrame(videoElement) {
        if (!this.isInitialized || this.isProcessing || !videoElement) {
            return null;
        }

        // Skip frames for performance
        this.frameCount++;
        if (this.frameCount % this.processEveryNthFrame !== 0) {
            return this.lastProcessedImageData;
        }

        try {
            this.isProcessing = true;

            // Calculate optimal processing size based on performance mode
            const { width, height } = this.getOptimalProcessingSize(
                videoElement.videoWidth,
                videoElement.videoHeight
            );

            // Set input canvas size
            this.inputCanvas.width = width;
            this.inputCanvas.height = height;

            const ctx = this.inputCanvas.getContext('2d');
            ctx.drawImage(videoElement, 0, 0, width, height);

            // Send frame to MediaPipe
            await this.selfieSegmentation.send({ image: this.inputCanvas });

            // Return processed frame data
            if (this.outputCanvas.width > 0 && this.outputCanvas.height > 0) {
                this.lastProcessedImageData = this.outputCanvas.getContext('2d')
                    .getImageData(0, 0, this.outputCanvas.width, this.outputCanvas.height);
                return this.lastProcessedImageData;
            }
        } catch (error) {
            console.error('Error processing frame:', error);
            this.isProcessing = false;
        }

        return null;
    }

    getOptimalProcessingSize(originalWidth, originalHeight) {
        let width = originalWidth;
        let height = originalHeight;

        // Apply performance-based scaling
        switch (this.performanceMode) {
            case 'performance':
                // Prioritize speed over quality
                if (width > this.maxWidth || height > this.maxHeight) {
                    const scale = Math.min(this.maxWidth / width, this.maxHeight / height);
                    width = Math.floor(width * scale);
                    height = Math.floor(height * scale);
                }
                break;
            case 'balanced':
                // Balance between speed and quality
                const maxDimension = Math.max(width, height);
                if (maxDimension > 720) {
                    const scale = 720 / maxDimension;
                    width = Math.floor(width * scale);
                    height = Math.floor(height * scale);
                }
                break;
            case 'quality':
                // Prioritize quality, minimal scaling
                break;
        }

        return { width, height };
    }

    setBackgroundType(type) {
        this.backgroundType = type;
        console.log(`Background type set to: ${type}`);
    }

    setBackgroundImage(imageElement) {
        this.backgroundImage = imageElement;
        console.log('Background image updated');
    }

    setBlurAmount(amount) {
        this.blurAmount = Math.max(1, Math.min(50, amount));
        console.log(`Blur amount set to: ${this.blurAmount}px`);
    }

    setProcessingFrequency(everyNthFrame) {
        this.processEveryNthFrame = Math.max(1, everyNthFrame);
        console.log(`Processing every ${this.processEveryNthFrame} frames`);
    }

    setPerformanceMode(mode) {
        if (['performance', 'balanced', 'quality'].includes(mode)) {
            this.performanceMode = mode;

            // Adjust processing frequency based on performance mode
            switch (mode) {
                case 'performance':
                    this.processEveryNthFrame = 3;
                    this.maxWidth = 480;
                    this.maxHeight = 360;
                    break;
                case 'balanced':
                    this.processEveryNthFrame = 2;
                    this.maxWidth = 640;
                    this.maxHeight = 480;
                    break;
                case 'quality':
                    this.processEveryNthFrame = 1;
                    this.maxWidth = 1280;
                    this.maxHeight = 720;
                    break;
            }

            console.log(`Performance mode set to: ${mode}`);
        }
    }

    getPerformanceMode() {
        return this.performanceMode;
    }

    getOutputCanvas() {
        return this.outputCanvas;
    }

    cleanup() {
        if (this.selfieSegmentation) {
            this.selfieSegmentation.close();
        }
        this.isInitialized = false;
        this.isProcessing = false;
        console.log('Virtual Background cleaned up');
    }
}

export default VirtualBackground;
