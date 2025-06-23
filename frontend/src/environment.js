// Environment configuration for FusionMeet
const IS_PROD = process.env.NODE_ENV === 'production';

const config = {
    // Backend server URL
    SERVER_URL: IS_PROD
        ? "https://fusionmeet-backend.onrender.com" // Update this when you deploy
        : "http://localhost:6004", // Match the backend port

    // API base URL
    API_BASE_URL: IS_PROD
        ? "https://fusionmeet-backend.onrender.com/api/v1"
        : "http://localhost:6004/api/v1",

    // Socket.IO configuration
    SOCKET_CONFIG: {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
        forceNew: false
    },

    // App configuration
    APP_NAME: "FusionMeet",
    APP_VERSION: "1.0.0"
};

export default config.SERVER_URL;
export { config };