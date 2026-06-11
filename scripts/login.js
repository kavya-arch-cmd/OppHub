// OppHub - Login Script

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const loginBtn = document.getElementById('login-btn');

    // If user is already logged in, redirect them
    if (isLoggedIn()) {
        const user = getCurrentUser();
        if (user && user.role === 'admin') {
            window.location.href = '../admin/admin-dashboard.html';
        } else {
            window.location.href = '../dashboard/dashboard.html';
        }
        return;
    }

    if (loginForm) {
        const btnText = loginBtn.querySelector('.btn-text');
        const loader = loginBtn.querySelector('.loader');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Step 1: Get user input
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            // Basic validation
            if (!email || !password) {
                showError('Please fill in all fields.');
                return;
            }

            // Hide previous errors
            errorMessage.style.display = 'none';
            errorMessage.textContent = '';

            // Show loading state
            btnText.style.display = 'none';
            loader.style.display = 'inline-block';
            loginBtn.disabled = true;

            // Step 2: Send login request to backend
            const result = await apiRequest('/api/auth/login', {
                method: 'POST',
                body: { email, password },
                auth: false  // Login doesn't need a token
            });

            // Step 3: Handle response
            if (result.success) {
                // Save token and user data
                setToken(result.data.token);
                setCurrentUser(result.data.user);

                // Redirect based on role
                if (result.data.user.role === 'admin') {
                    window.location.href = '../admin/admin-dashboard.html';
                } else if (result.data.user.preferences && result.data.user.preferences.length > 0) {
                    // User already has preferences, go to dashboard
                    window.location.href = '../dashboard/dashboard.html';
                } else {
                    // First-time user, go to preferences
                    window.location.href = '../preferences/preferences.html';
                }
            } else {
                // Show error from backend
                showError(result.message);
            }
        });
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';

        // Reset button
        const btnText = loginBtn.querySelector('.btn-text');
        const loader = loginBtn.querySelector('.loader');

        btnText.style.display = 'inline-block';
        loader.style.display = 'none';
        loginBtn.disabled = false;

        // Shake animation for error
        const card = document.querySelector('.auth-card');
        card.style.transform = 'translate(5px, 0)';
        setTimeout(() => card.style.transform = 'translate(-5px, 0)', 100);
        setTimeout(() => card.style.transform = 'translate(5px, 0)', 200);
        setTimeout(() => card.style.transform = 'translate(-5px, 0)', 300);
        setTimeout(() => card.style.transform = 'translate(0, 0)', 400);
    }
});
