// OppHub - Admin Login Script

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('admin-login-form');
    const errorBanner = document.getElementById('admin-error');
    const loginBtn = document.getElementById('admin-login-btn');
    const btnText = loginBtn.querySelector('.btn-text');
    const loader = document.getElementById('login-loader');

    // If admin is already logged in, redirect to dashboard
    if (isLoggedIn() && isAdmin()) {
        window.location.href = 'admin-dashboard.html';
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('admin-email').value.trim();
        const password = document.getElementById('admin-password').value;

        // Basic validation
        if (!email || !password) {
            showError('Please fill in all fields.');
            return;
        }

        // Hide previous errors
        errorBanner.style.display = 'none';

        // Show loading state
        btnText.style.display = 'none';
        loader.style.display = 'inline-block';
        loginBtn.disabled = true;

        // Send login request to backend (same endpoint as user login)
        const result = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: { email, password },
            auth: false
        });

        if (result.success) {
            // Check if the user has admin role
            if (result.data.user.role === 'admin') {
                // Save token and user data
                setToken(result.data.token);
                setCurrentUser(result.data.user);

                // Redirect to admin dashboard
                window.location.href = 'admin-dashboard.html';
            } else {
                // User exists but is NOT an admin
                showError('Access denied. This account does not have admin privileges.');
            }
        } else {
            // Invalid credentials
            showError(result.message);
        }
    });

    function showError(message) {
        errorBanner.textContent = message;
        errorBanner.style.display = 'block';

        btnText.style.display = 'inline-block';
        loader.style.display = 'none';
        loginBtn.disabled = false;

        // Shake animation
        const card = document.querySelector('.admin-login-card');
        card.style.transform = 'translateX(8px)';
        setTimeout(() => card.style.transform = 'translateX(-8px)', 80);
        setTimeout(() => card.style.transform = 'translateX(6px)', 160);
        setTimeout(() => card.style.transform = 'translateX(-6px)', 240);
        setTimeout(() => card.style.transform = 'translateX(0)', 320);
    }
});
