// OppHub - Auth Guard System
// Protects pages requiring authentication

(function () {
    // This runs immediately when the script loads
    const authLevel = document.body.getAttribute('data-auth');

    // If no data-auth attribute, page is public — do nothing
    if (!authLevel) return;

    // Determine the correct login page redirect path
    // We need to figure out how deep we are in the directory structure
    const path = window.location.pathname;
    let loginPath = 'pages/auth/login.html';
    let adminLoginPath = 'pages/admin/admin-login.html';
    let homePath = '../../index.html';

    // Adjust paths based on current page depth
    if (path.includes('/pages/')) {
        loginPath = '../auth/login.html';
        adminLoginPath = '../admin/admin-login.html';
        homePath = '../../index.html';
    }

    if (authLevel === 'required') {
        // Page requires any authenticated user
        if (!isLoggedIn()) {
            window.location.href = loginPath;
            return;
        }
    }

    if (authLevel === 'admin') {
        // Page requires admin role
        if (!isLoggedIn()) {
            window.location.href = adminLoginPath;
            return;
        }
        if (!isAdmin()) {
            // User is logged in but not an admin
            alert('Access denied. Admin privileges required.');
            window.location.href = homePath;
            return;
        }
    }
})();
