// OppHub - Admin Dashboard
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('admin-logout').addEventListener('click', (e) => {
        e.preventDefault();
        logout('admin-login.html');
    });
    loadDashboard();
});

async function loadDashboard() {
    const result = await apiRequest('/api/opportunities', { auth: false });

    if (!result.success) {
        showToast('Failed to load dashboard data.', 'error');
    }

    const opportunities = result.success ? result.data : [];
    const today = new Date();
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const total = opportunities.length;
    const active = opportunities.filter(o => new Date(o.deadline) >= today).length;
    const expiring = opportunities.filter(o => {
        const d = new Date(o.deadline);
        return d >= today && d <= sevenDaysFromNow;
    }).length;

    animateCounter('stat-total', total);
    animateCounter('stat-active', active);
    animateCounter('stat-expiring', expiring);

    const recentBody = document.getElementById('recent-table-body');
    const emptyState = document.getElementById('dashboard-empty');

    if (opportunities.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    const recent = opportunities.slice(0, 5);
    recentBody.innerHTML = recent.map(opp => {
        const status = getStatus(opp.deadline);
        return `
            <tr>
                <td><strong>${opp.title}</strong><br><span style="color: var(--text-secondary); font-size: 0.82rem;">${opp.organization}</span></td>
                <td><span class="category-badge">${opp.category}</span></td>
                <td>${formatDate(opp.deadline)}</td>
                <td><span class="status-badge ${status.class}">${status.icon} ${status.label}</span></td>
            </tr>
        `;
    }).join('');
}

function getStatus(deadline) {
    const today = new Date();
    const d = new Date(deadline);
    const diff = (d - today) / (1000 * 60 * 60 * 24);
    if (diff < 0) return { label: 'Expired', class: 'status-expired', icon: '✕' };
    if (diff <= 7) return { label: 'Expiring', class: 'status-expiring', icon: '⚠' };
    return { label: 'Active', class: 'status-active', icon: '●' };
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

function animateCounter(elementId, target) {
    const el = document.getElementById(elementId);
    if (!el) return;
    let current = 0;
    if (target === 0) { el.textContent = '0'; return; }
    const duration = 800;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = Math.floor(current);
    }, 16);
}
