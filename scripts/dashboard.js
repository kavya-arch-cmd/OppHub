// OppHub - User Dashboard Script
document.addEventListener('DOMContentLoaded', async () => {

    // ── Logout Handler ────────────────────────────────────
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout('../../index.html');
        });
    }

    // ── 0. Refresh user data from backend ─────────────────
    const meResult = await apiRequest('/api/auth/me');
    if (meResult.success) {
        setCurrentUser(meResult.data.user);
    }

    // ── 1. Load User Profile Data ─────────────────────────
    const user = getCurrentUser();
    const userName = user ? user.name : 'User';
    const firstName = userName.split(' ')[0];
    const initial = userName.charAt(0).toUpperCase();

    const isComplete = user ? user.profileComplete : false;
    const userCourse = user ? (user.course || 'Student') : 'Student';
    const actionBtnText = isComplete ? 'Edit Profile' : 'Complete Profile';

    // Calculate profile completion percentage
    let filledFields = 0;
    const profileFields = ['name', 'dob', 'course', 'category', 'income', 'location'];
    profileFields.forEach(field => { if (user && user[field]) filledFields++; });
    const progressPercent = Math.round((filledFields / profileFields.length) * 100);
    const progressWidth = progressPercent + '%';

    const welcomeMessage = document.getElementById('welcome-message');
    welcomeMessage.textContent = `Welcome back, ${firstName}!`;
    welcomeMessage.style.opacity = 0;
    welcomeMessage.style.animation = 'fadeIn 0.5s forwards';

    // Show onboarding banner if interests are missing
    const onboardingBanner = document.getElementById('onboarding-banner');
    if (onboardingBanner && (!user || !user.preferences || user.preferences.length === 0)) {
        onboardingBanner.style.display = 'block';
    }

    const profileSummary = document.getElementById('profile-summary');
    profileSummary.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold;">
                ${initial}
            </div>
            <div>
                <h4 style="font-size: 1.1rem;">${userName}</h4>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">${userCourse} | ${progressPercent}% Profile Complete</p>
            </div>
        </div>
        <div style="margin-top: 1.5rem; background: rgba(255,255,255,0.05); height: 8px; border-radius: 4px; overflow: hidden;">
            <div style="background: var(--accent-primary); width: ${progressWidth}; height: 100%; border-radius: 4px; box-shadow: 0 0 10px var(--accent-primary); transition: width 1s ease-in-out;"></div>
        </div>
        <a href="../profile/profile.html" class="btn btn-secondary btn-sm" style="margin-top: 1.5rem; width: 100%;">${actionBtnText}</a>
    `;

    // ── 2. Fetch Dashboard Stats ──────────────────────────
    const statsResult = await apiRequest('/api/auth/dashboard-stats');
    if (statsResult.success) {
        const stats = statsResult.data;
        // Update stat cards if elements exist
        const statElements = {
            'stat-opportunities': stats.totalOpportunities,
            'stat-applications': stats.totalApplications,
            'stat-bookmarks': stats.totalBookmarks
        };
        Object.entries(statElements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el) animateCounter(el, value);
        });
    }

    // ── 3. Fetch Recent Opportunities from Backend ────────
    const recentOpp = document.getElementById('recent-opportunities');
    const oppResult = await apiRequest('/api/opportunities', { auth: false });

    if (oppResult.success && oppResult.data.length > 0) {
        const latestOpps = oppResult.data.slice(0, 5);
        recentOpp.innerHTML = latestOpps.map(opp => `
            <a href="../opportunities/opportunity-details.html?id=${opp._id}" class="list-item">
                <div class="item-info">
                    <h4>${opp.title}</h4>
                    <p>${opp.organization} &bull; ${opp.location || 'Remote'}</p>
                </div>
                <span class="item-badge badge-new">${opp.category}</span>
            </a>
        `).join('');
    } else {
        recentOpp.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                No opportunities available yet. Check back soon!
            </div>
        `;
    }

    // ── 4. Fetch Saved/Bookmarked Opportunities ───────────
    const savedOpp = document.getElementById('saved-opportunities');
    const bookmarksResult = await apiRequest('/api/auth/bookmarks');

    if (bookmarksResult.success && bookmarksResult.data.length > 0) {
        savedOpp.innerHTML = bookmarksResult.data.slice(0, 3).map(opp => `
            <a href="../opportunities/opportunity-details.html?id=${opp._id}" class="list-item">
                <div class="item-info">
                    <h4>${opp.title}</h4>
                    <p>${opp.organization}</p>
                </div>
                <span class="item-badge badge-hot">${opp.category}</span>
            </a>
        `).join('');
    } else {
        savedOpp.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                Save opportunities to see them here!
            </div>
        `;
    }

    // ── 5. Fetch Application Status from Backend ──────────
    const appStatus = document.getElementById('application-status');
    const tableLoader = document.getElementById('table-loader');
    const appResult = await apiRequest('/api/applications');

    if (tableLoader) tableLoader.style.display = 'none';

    if (appResult.success && appResult.data.length > 0) {
        appStatus.innerHTML = appResult.data.slice(0, 3).map((app, idx) => {
            const opp = app.opportunityId;
            const statusClass = getStatusClass(app.status);
            const date = new Date(app.appliedDate).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });

            return `
                <tr style="animation: fadeIn 0.5s ease-out ${idx * 0.1}s forwards; opacity: 0;">
                    <td style="font-weight: 500;">${opp ? opp.title : 'Unknown'}</td>
                    <td style="color: var(--text-secondary);">${opp ? opp.organization : 'N/A'}</td>
                    <td style="color: var(--text-secondary);">${date}</td>
                    <td><span class="status-badge ${statusClass}">${app.status}</span></td>
                </tr>
            `;
        }).join('');
    } else {
        appStatus.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                    No applications yet. Start applying to opportunities!
                </td>
            </tr>
        `;
    }

    // ── 6. AI-Powered Recommendations ─────────────────────
    loadAIRecommendations(user);

    const refreshBtn = document.getElementById('refresh-ai-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadAIRecommendations(user);
        });
    }

    // ── 7. Global Recommendation Click Handler ───────────
    window.handleRecommendationClick = (oppId) => {
        if (oppId && oppId !== 'null' && oppId !== 'undefined') {
            const url = `../opportunities/opportunity-details.html?id=${oppId}`;
            window.location.href = url;
        }
    };
});

/** Animate a counter from 0 to target */
function animateCounter(el, target) {
    let current = 0;
    const duration = 800;
    const step = target / (duration / 16);
    if (target === 0) { el.textContent = '0'; return; }
    const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = Math.floor(current);
    }, 16);
}

/** Map application status to CSS class */
function getStatusClass(status) {
    const s = status.toLowerCase();
    if (s.includes('reject')) return 'status-rejected';
    if (s.includes('accept') || s.includes('offer')) return 'status-interview'; // green
    if (s.includes('interview')) return 'status-review'; // orange
    if (s.includes('shortlist') || s.includes('review') || s.includes('process')) return 'status-review'; // yellowish
    return 'status-review'; // default
}


// ── AI Recommendations Logic ──────────────────────────────

/**
 * Fetches AI recommendations from the backend and renders them.
 * Shows loading skeletons while waiting, error fallback on failure.
 */
async function loadAIRecommendations(user) {
    const loader = document.getElementById('ai-loader');
    const container = document.getElementById('ai-recommendations');
    const errorDiv = document.getElementById('ai-error');
    const refreshBtn = document.getElementById('refresh-ai-btn');

    // Show loading, hide others
    loader.style.display = 'grid';
    container.style.display = 'none';
    errorDiv.style.display = 'none';
    if (refreshBtn) refreshBtn.disabled = true;

    // Build profile payload from user data
    const profilePayload = {
        course: user ? user.course : '',
        category: user ? user.category : '',
        location: user ? user.location : '',
        preferences: user ? user.preferences : []
    };

    const result = await apiRequest('/api/ai/recommendations', {
        method: 'POST',
        body: profilePayload
    });

    loader.style.display = 'none';
    if (refreshBtn) refreshBtn.disabled = false;

    if (result.success && result.data.recommendations && result.data.recommendations.length > 0) {
        
        // Update heading based on interests
        const heading = document.getElementById('ai-title');
        if (heading) {
            if (user && user.preferences && user.preferences.length > 0) {
                const primaryInterest = user.preferences[0];
                heading.innerHTML = `🤖 Recommended for your ${primaryInterest} interests`;
            } else {
                heading.innerHTML = `🤖 Recommended For You`;
            }
        }

        container.style.display = 'grid';
        container.innerHTML = result.data.recommendations.map((rec, i) =>
            renderRecommendationCard(rec, i)
        ).join('');
    } else {
        // Show friendly error/fallback
        errorDiv.style.display = 'block';
        errorDiv.innerHTML = `
            <div style="font-size:2rem;margin-bottom:0.5rem;">🤖</div>
            <p>${result.data?.message || result.message || 'AI recommendations are currently unavailable.'}</p>
            <p style="font-size:0.85rem;margin-top:0.5rem;">Complete your profile for better results, or click Refresh to try again.</p>
        `;
    }
}

/**
 * Renders a single recommendation card with type-specific styling.
 */
function renderRecommendationCard(rec, index) {
    const typeConfig = {
        'Scholarship':  { icon: '🎓', color: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.3)', accent: '#a78bfa' },
        'Internship':   { icon: '💼', color: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', accent: '#93c5fd' },
        'Job':          { icon: '🏢', color: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', accent: '#fca5a5' },
        'Freelancing':  { icon: '💻', color: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.3)', accent: '#f9a8d4' },
        'Workshop / Training': { icon: '🔧', color: 'rgba(20,184,166,0.12)', border: 'rgba(20,184,166,0.3)', accent: '#5eead4' },
        'Hackathon':    { icon: '🚀', color: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', accent: '#6ee7b7' }
    };

    const config = typeConfig[rec.type] || typeConfig['Scholarship'];
    const clickableStyle = rec.opportunityId ? 'cursor:pointer;' : '';
    
    return `
        <div 
            class="recommendation-card"
            onclick="handleRecommendationClick('${rec.opportunityId}')"
            style="
                background:${config.color};
                border:1px solid ${config.border};
                border-radius:14px;
                padding:1.25rem;
                height: 100%;
                animation:slideUp 0.4s ease-out ${index * 0.1}s backwards;
                transition: all 0.3s ease;
                ${clickableStyle}
                position: relative;
                z-index: 100;
            "
        >
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.6rem;pointer-events:none;">
                <span style="font-size:1.4rem;">${config.icon}</span>
                <span style="font-size:0.75rem;padding:3px 10px;border-radius:50px;background:${config.border};color:#0A0A0A;font-weight:500;">${rec.type}</span>
            </div>
            <h4 style="font-size:1rem;margin-bottom:0.4rem;color:var(--text-primary);line-height:1.3;pointer-events:none;">${rec.title}</h4>
            <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5;margin-bottom:0.5rem;pointer-events:none;">${rec.reason}</p>
            <p style="font-size:0.8rem;color:${config.accent};font-style:italic;pointer-events:none;">💡 ${rec.tip}</p>
        </div>
    `;
}
