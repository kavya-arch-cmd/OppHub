document.addEventListener('DOMContentLoaded', () => {
    // ── Navbar scroll effect ────────────────────────────────
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ── Auth-Aware Homepage ─────────────────────────────────
    if (typeof isLoggedIn === 'function' && isLoggedIn()) {
        const user = getCurrentUser();

        const dashboardPath = user && user.role === 'admin'
            ? 'pages/admin/admin-dashboard.html'
            : 'pages/dashboard/dashboard.html';

        // ── Swap navbar buttons ─────────────────────────────
        const loginBtn  = document.getElementById('nav-login-btn');
        const signupBtn = document.getElementById('nav-signup-btn');
        const navLinks  = document.getElementById('nav-links');

        if (loginBtn)  loginBtn.remove();
        if (signupBtn) signupBtn.remove();

        if (navLinks && user) {
            navLinks.insertAdjacentHTML('beforeend', `
                <a href="${dashboardPath}" class="btn btn-secondary nav-link">Dashboard</a>
                <a href="pages/profile/profile.html" class="nav-link" style="font-size:0.95rem;font-weight:500;">Profile</a>
                <button onclick="logout('index.html')" class="btn btn-primary" style="cursor:pointer;">Log Out</button>
            `);
        }

        // ── Swap hero CTA buttons ───────────────────────────
        const heroPrimary   = document.getElementById('hero-cta-primary');
        const heroSecondary = document.getElementById('hero-cta-secondary');

        if (heroPrimary) {
            heroPrimary.textContent = '🚀 Go to Dashboard';
            heroPrimary.href = dashboardPath;
        }
        if (heroSecondary) {
            heroSecondary.textContent = '🔍 Browse Opportunities';
            heroSecondary.href = 'pages/opportunities/opportunities.html';
        }

        // ── Personalise welcome badge ───────────────────────
        if (user) {
            const firstName    = user.name ? user.name.split(' ')[0] : 'back';
            const existingBadge = document.querySelector('.hero-content .badge');
            if (existingBadge) {
                existingBadge.textContent = `👋 Welcome back, ${firstName}!`;
            }
        }
    }

    // ── Intersection Observer for scroll animations ─────────
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach(el => {
        observer.observe(el);
    });

    // ── Mouse tracking effect for feature cards ─────────────
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});
