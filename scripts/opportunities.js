// OppHub - Opportunities Listing Page
document.addEventListener('DOMContentLoaded', () => {
    const oppGrid = document.getElementById('opportunities-grid');
    const searchInput = document.getElementById('search-input');
    const filterCategory = document.getElementById('filter-category');
    const filterLocation = document.getElementById('filter-location');
    const loader = document.getElementById('loader');

    let opportunities = [];
    let userBookmarks = [];

    // Get user bookmarks if logged in
    if (isLoggedIn()) {
        const user = getCurrentUser();
        userBookmarks = (user && user.bookmarks) ? user.bookmarks : [];
    }

    async function fetchOpportunities() {
        oppGrid.style.display = 'none';
        loader.style.display = 'block';

        const result = await apiRequest('/api/opportunities', { auth: false });

        loader.style.display = 'none';
        oppGrid.style.display = 'grid';

        if (result.success) {
            opportunities = result.data;
            renderOpportunities(opportunities);
        } else {
            oppGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-secondary); background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px dashed var(--surface-border);">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
                    <p>Unable to load opportunities. Please try again.</p>
                    <button onclick="location.reload()" class="btn btn-secondary btn-sm" style="margin-top: 1rem;">🔄 Retry</button>
                </div>
            `;
            showToast('Failed to load opportunities.', 'error');
        }
    }

    function getCategoryColor(category) {
        const colors = {
            'Scholarship': 'rgba(124,58,237,0.15)',
            'Internship': 'rgba(59,130,246,0.15)',
            'Job': 'rgba(239,68,68,0.15)',
            'Freelancing': 'rgba(236,72,153,0.15)',
            'Workshop / Training': 'rgba(20,184,166,0.15)',
            'Hackathon': 'rgba(16,185,129,0.15)'
        };
        return colors[category] || 'rgba(100,100,100,0.15)';
    }

    function renderOpportunities(data) {
        if (data.length === 0) {
            oppGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-secondary); background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px dashed var(--surface-border);">
                    <div style="font-size: 2.5rem; margin-bottom: 1rem;">🔍</div>
                    <h3 style="margin-bottom: 0.5rem; color: var(--text-primary);">No opportunities found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            `;
            return;
        }

        oppGrid.innerHTML = data.map((opp, index) => {
            const deadline = new Date(opp.deadline).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            });
            const location = opp.location || 'Remote';
            const isBookmarked = userBookmarks.includes(opp._id);
            const bookmarkIcon = isBookmarked ? '💜' : '🤍';
            const daysLeft = Math.ceil((new Date(opp.deadline) - new Date()) / (1000*60*60*24));
            const urgency = daysLeft <= 7 && daysLeft > 0 ? `<span style="color:#fbbf24;font-size:0.8rem;">⚡ ${daysLeft} days left</span>` : '';

            return `
            <div class="glass-panel opp-card" style="animation: slideUp 0.5s ease-out ${index * 0.08}s backwards;">
                <div class="opp-header">
                    <div>
                        <span style="display:inline-block;padding:4px 12px;border-radius:50px;font-size:0.78rem;font-weight:500;background:${getCategoryColor(opp.category)};margin-bottom:8px;">${opp.category}</span>
                        <h3 class="opp-title">${opp.title}</h3>
                        <div class="opp-company">${opp.organization} &bull; ${location}</div>
                    </div>
                </div>
                <div class="opp-description">${opp.description}</div>
                
                ${opp.category === 'Hackathon' ? `
                <div class="hackathon-meta" style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin:1rem 0;padding:0.75rem;background:rgba(255,255,255,0.03);border-radius:12px;font-size:0.85rem;">
                    <div style="color:var(--text-secondary);">💰 Prize: <span style="color:var(--accent-primary);font-weight:600;">${opp.prizePool || 'Not specified'}</span></div>
                    <div style="color:var(--text-secondary);">👥 Team: <span style="color:var(--text-primary);">${opp.teamSize || 'Any'}</span></div>
                    <div style="color:var(--text-secondary);">🌐 Mode: <span style="color:var(--text-primary);">${opp.mode || 'Online'}</span></div>
                    <div style="color:var(--text-secondary);">⏱️ Duration: <span style="color:var(--text-primary);">${opp.duration || 'Not specified'}</span></div>
                </div>
                ` : ''}

                <div class="opp-footer">
                    <div>
                        <div class="opp-deadline">⏳ ${deadline}</div>
                        ${urgency}
                    </div>
                    <div style="display:flex;gap:0.5rem;align-items:center;">
                        ${isLoggedIn() ? `<button onclick="toggleBookmark('${opp._id}', this)" class="btn btn-secondary btn-sm" style="padding:6px 10px;min-width:auto;" title="Save">${bookmarkIcon}</button>` : ''}
                        <a href="opportunity-details.html?id=${opp._id}" class="btn btn-secondary btn-sm">View Details</a>
                    </div>
                </div>
            </div>
        `;
        }).join('');
    }

    // Global bookmark toggle
    window.toggleBookmark = async function(oppId, btn) {
        if (!isLoggedIn()) {
            showToast('Please log in to save opportunities.', 'error');
            return;
        }

        const result = await apiRequest('/api/auth/bookmarks', {
            method: 'POST',
            body: { opportunityId: oppId }
        });

        if (result.success) {
            // Update local state
            const user = getCurrentUser();
            if (user) {
                user.bookmarks = result.data.bookmarks;
                setCurrentUser(user);
            }
            userBookmarks = result.data.bookmarks;

            if (result.data.action === 'added') {
                btn.textContent = '💜';
                showToast('Opportunity saved!', 'success');
            } else {
                btn.textContent = '🤍';
                showToast('Bookmark removed.', 'info');
            }
        } else {
            showToast(result.message, 'error');
        }
    };

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const category = filterCategory.value;
        const locationFilter = filterLocation.value;

        const filteredData = opportunities.filter(opp => {
            const matchSearch =
                opp.title.toLowerCase().includes(searchTerm) ||
                opp.organization.toLowerCase().includes(searchTerm) ||
                opp.description.toLowerCase().includes(searchTerm);

            const matchCategory = category === 'all' || opp.category.toLowerCase() === category;

            const oppLocation = (opp.location || '').toLowerCase();
            const matchLocation =
                locationFilter === 'all' ||
                (locationFilter === 'remote' && oppLocation.includes('remote')) ||
                (locationFilter === 'onsite' && !oppLocation.includes('remote'));

            return matchSearch && matchCategory && matchLocation;
        });

        renderOpportunities(filteredData);
    }

    searchInput.addEventListener('input', applyFilters);
    filterCategory.addEventListener('change', applyFilters);
    filterLocation.addEventListener('change', applyFilters);

    fetchOpportunities();
});
