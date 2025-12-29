/**
 * Global configuration for the application.
 * Update API_BASE_URL to point to your backend.
 */
export const config = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api",
};
