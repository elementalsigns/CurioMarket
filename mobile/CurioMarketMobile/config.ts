// Configuration for Curio Market Mobile App

// For development - your computer's local server
export const DEV_API_URL = 'http://localhost:5000';

// For testing on your phone - replace with your computer's IP address
// Find your IP with: ipconfig (Windows) or ifconfig (Mac/Linux)
export const MOBILE_API_URL = 'http://192.168.1.100:5000'; // Replace with your IP

// For production - replace with your deployed domain
export const PROD_API_URL = 'https://your-curio-market-domain.com';

// Auto-detect which URL to use
export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;