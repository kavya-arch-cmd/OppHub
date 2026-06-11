// OppHub - Signup Script

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const errorMessage = document.getElementById('error-message');
    const signupBtn = document.getElementById('signup-btn');

    // If user is already logged in, redirect them
    if (isLoggedIn()) {
        window.location.href = '../dashboard/dashboard.html';
        return;
    }

    if (signupForm) {
        const btnText = signupBtn.querySelector('.btn-text');
        const loader = signupBtn.querySelector('.loader');

        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Step 1: Get user input
            const name = document.getElementById('fullname').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // Client-side validation
            if (!name || !email || !password || !confirmPassword) {
                showError('Please fill in all fields.');
                return;
            }

            if (password.length < 6) {
                showError('Password must be at least 6 characters.');
                return;
            }

            if (password !== confirmPassword) {
                showError('Passwords do not match. Please try again.');
                return;
            }

            // Hide previous errors
            errorMessage.style.display = 'none';
            errorMessage.textContent = '';

            // Show loading state
            btnText.style.display = 'none';
            loader.style.display = 'inline-block';
            signupBtn.disabled = true;

            // Step 2: Send registration request to backend
            // NOTE: Backend expects 'name', not 'fullname'
            const result = await apiRequest('/api/auth/register', {
                method: 'POST',
                body: { name, email, password },
                auth: false  // Registration doesn't need a token
            });

            // Step 3: Handle response
            if (result.success) {
                // Auto-login: save token and user data
                setToken(result.data.token);
                setCurrentUser(result.data.user);

                // Redirect to preferences (first-time user flow)
                window.location.href = '../preferences/preferences.html';
            } else {
                // Show error from backend (e.g. "User already exists")
                showError(result.message);
            }
        });
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';

        // Reset button
        const btnText = signupBtn.querySelector('.btn-text');
        const loader = signupBtn.querySelector('.loader');

        btnText.style.display = 'inline-block';
        loader.style.display = 'none';
        signupBtn.disabled = false;

        // Shake animation for error
        const card = document.querySelector('.auth-card');
        card.style.transform = 'translate(5px, 0)';
        setTimeout(() => card.style.transform = 'translate(-5px, 0)', 100);
        setTimeout(() => card.style.transform = 'translate(5px, 0)', 200);
        setTimeout(() => card.style.transform = 'translate(-5px, 0)', 300);
        setTimeout(() => card.style.transform = 'translate(0, 0)', 400);
    }
});
