// Single source of truth for the backend base URL.
// In production, set REACT_APP_API_URL at build time (CRA inlines it into the bundle);
// locally it falls back to the dev server.
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5010';
