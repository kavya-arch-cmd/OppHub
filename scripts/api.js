// Centralized API configuration and token management

// ── Configuration ─────────────────────────────────────────
// Change this if your backend runs on a different URL
const API_BASE_URL = 'http://localhost:5000';

// localStorage keys (used consistently across the app)
const TOKEN_KEY = 'opphub_token';
const USER_KEY = 'opphub_user';


// ── Token Management ──────────────────────────────────────

/** Get the JWT token from localStorage */
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/** Save the JWT token to localStorage */
function setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

/** Remove the JWT token from localStorage */
function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}


// ── User Data Management ──────────────────────────────────

/** Get the stored user object from localStorage */
function getCurrentUser() {
    const userData = localStorage.getItem(USER_KEY);
    if (!userData) return null;
    try {
        return JSON.parse(userData);
    } catch {
        return null;
    }
}

/** Save the user object to localStorage */
function setCurrentUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** Remove the user object from localStorage */
function removeCurrentUser() {
    localStorage.removeItem(USER_KEY);
}


// ── Auth State Helpers ────────────────────────────────────

/** Check if a user is currently logged in (has a token) */
function isLoggedIn() {
    return !!getToken();
}

/** Check if the current user has admin role */
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}


// ── Centralized API Request Function ──────────────────────

/**
 * Makes an API request to the backend.
 * Automatically handles:
 * - Prepending the base URL
 * - Attaching JWT token if available
 * - Setting Content-Type for JSON
 * - Parsing the response
 * - Returning a standardized result
 *
 * @param {string} endpoint - API path (e.g. '/api/auth/login')
 * @param {object} options - Fetch options
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} options.body - Request body (will be JSON.stringify'd)
 * @param {boolean} options.auth - Whether to attach the JWT token (default: true)
 * @returns {Promise<{success: boolean, data: object, message: string, status: number}>}
 */
async function apiRequest(endpoint, options = {}) {
    const { method = 'GET', body = null, auth = true } = options;

    // Build headers
    const headers = {};

    // Only set Content-Type to JSON if it's not FormData
    if (!(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    // Attach JWT token if auth is required and token exists
    if (auth) {
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    // Build fetch config
    const fetchConfig = {
        method,
        headers
    };

    // Attach body for non-GET requests
    if (body && method !== 'GET') {
        fetchConfig.body = body instanceof FormData ? body : JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchConfig);
        const data = await response.json();

        if (response.ok) {
            return {
                success: true,
                data,
                message: data.message || 'Success',
                status: response.status
            };
        } else {
            return {
                success: false,
                data: null,
                message: data.message || 'Something went wrong. Please try again.',
                status: response.status
            };
        }
    } catch (error) {
        // Network error (backend not reachable)
        return {
            success: false,
            data: null,
            message: 'Unable to connect to the server. Please check your connection.',
            status: 0
        };
    }
}


// ── Logout Function ───────────────────────────────────────

/**
 * Logs the user out by clearing all auth data from localStorage
 * and redirecting to the homepage.
 * @param {string} redirectTo - URL to redirect after logout
 */
function logout(redirectTo) {
    removeToken();
    removeCurrentUser();
    // Clear any legacy localStorage keys from the old mock system
    localStorage.removeItem('opphub_admin_logged_in');
    localStorage.removeItem('opphub_admin_email');
    localStorage.removeItem('opphub_user_name');
    localStorage.removeItem('opphub_profile_complete');
    localStorage.removeItem('opphub_course');
    localStorage.removeItem('opphub_onboarded');
    localStorage.removeItem('opphub_preferences');
    localStorage.removeItem('opphub_opportunities');

    if (redirectTo) {
        window.location.href = redirectTo;
    }
}


// ── Toast Notification System ─────────────────────────────

/**
 * Shows a floating toast notification.
 * @param {string} message - Text to display
 * @param {'success'|'error'|'info'} type - Toast type
 * @param {number} duration - Auto-dismiss time in ms (default 3500)
 */
function showToast(message, type = 'info', duration = 3500) {
    // Create container if it doesn't exist
    let container = document.getElementById('opphub-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'opphub-toast-container';
        container.style.cssText = 'position:fixed;top:1.5rem;right:1.5rem;z-index:99999;display:flex;flex-direction:column;gap:0.75rem;pointer-events:none;';
        document.body.appendChild(container);
    }

    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const colors = {
        success: 'rgba(16,185,129,0.15)',
        error: 'rgba(239,68,68,0.15)',
        info: 'rgba(59,130,246,0.15)'
    };
    const borders = {
        success: 'rgba(16,185,129,0.4)',
        error: 'rgba(239,68,68,0.4)',
        info: 'rgba(59,130,246,0.4)'
    };
    const textColors = {
        success: '#6ee7b7',
        error: '#fca5a5',
        info: '#93c5fd'
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
        pointer-events:auto;background:${colors[type]};border:1px solid ${borders[type]};
        color:${textColors[type]};padding:1rem 1.5rem;border-radius:12px;font-size:0.95rem;
        font-family:'Inter',sans-serif;backdrop-filter:blur(20px);box-shadow:0 8px 32px rgba(0,0,0,0.3);
        display:flex;align-items:center;gap:0.75rem;min-width:280px;max-width:420px;
        animation:slideInRight 0.4s ease-out;
    `;
    toast.innerHTML = `<span style="font-size:1.2rem">${icons[type]}</span><span>${message}</span>`;

    // Add animation keyframes if not already added
    if (!document.getElementById('opphub-toast-styles')) {
        const style = document.createElement('style');
        style.id = 'opphub-toast-styles';
        style.textContent = `
            @keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
            @keyframes slideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}
        `;
        document.head.appendChild(style);
    }

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}
