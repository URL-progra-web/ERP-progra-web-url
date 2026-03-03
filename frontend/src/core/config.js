/**
 * Global application settings and configuration
 */

// Base URL for the backend API from environment variables
const ENV_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const API_URL = `${ENV_API_BASE_URL}/api/v1`;

// Future global settings can go here
export const settings = {
    apiUrl: API_URL,
    appName: 'ERP Micro',
};
