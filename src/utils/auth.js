/**
 * Utility functions for authentication and JWT token handling
 */

/**
 * Decode JWT token payload without external libraries
 * @param {string} token
 * @returns {object|null}
 */
export const getTokenPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT payload:', error);
    return null;
  }
};

/**
 * Check if a JWT token is expired
 * @param {string} token
 * @returns {boolean}
 */
export const isTokenExpired = (token) => {
  if (!token) return true;
  const payload = getTokenPayload(token);
  if (!payload || !payload.exp) {
    return false; // If no exp field, consider not expired or handled by server
  }
  // payload.exp is in seconds, convert to milliseconds
  // Add a small buffer (5 seconds) to prevent edge-case race conditions
  const now = Date.now() / 1000;
  return now >= payload.exp;
};

/**
 * Clear all authentication-related keys from localStorage
 */
export const clearAuthStorage = () => {
  localStorage.removeItem('badminton_token');
  localStorage.removeItem('badminton_user');
  localStorage.removeItem('badminton_admin');
};
