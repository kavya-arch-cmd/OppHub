// OppHub - Applications Tracker
document.addEventListener('DOMContentLoaded', async () => {
    const loader = document.getElementById('loader');
    const trackerContainer = document.getElementById('tracker-container');

    // Fetch real applications from backend
    const result = await apiRequest('/api/applications');

    loader.style.display = 'none';
    trackerContainer.style.display = 'flex';

    if (!result.success) {
        trackerContainer.innerHTML = `
            <div style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">⚠️</div>
                Failed to load applications. <button onclick="location.reload()" style="color: var(--accent-primary); background:none; border:none; cursor:pointer; text-decoration:underline;">Retry</button>
            </div>`;
        showToast('Failed to load applications.', 'error');
        return;
    }

    if (result.data.length === 0) {
        trackerContainer.innerHTML = `
            <div style="text-align: center; color: var(--text-secondary); padding: 3rem; background: var(--surface-color-light); border-radius: 8px; border: 1px dashed var(--surface-border);">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
                <p>No applications yet.</p>
                <a href="../opportunities/opportunities.html" class="btn btn-secondary btn-sm" style="margin-top: 1rem;">Browse Opportunities</a>
            </div>`;
        return;
    }

    const applications = result.data;

    trackerContainer.innerHTML = applications.map((app, index) => {
        const opp = app.opportunityId;
        const date = new Date(app.appliedDate).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
        const statusClass = getStatusClass(app.status);
        const type = opp ? opp.category : 'N/A';
        const title = opp ? opp.title : 'Unknown Opportunity';
        const org = opp ? opp.organization : '';

        const statusHistory = app.statusHistory || [];
        const lastUpdate = statusHistory.length > 0 
            ? new Date(statusHistory[statusHistory.length - 1].date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : date;

        return `
            <div class="glass-panel" style="padding: 1.5rem; animation: slideUp 0.5s ease-out ${index * 0.08}s backwards;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h4 style="font-size: 1.25rem; font-family: var(--font-heading); margin-bottom: 0.25rem;">${title}</h4>
                        <div style="color: var(--text-secondary); font-size: 0.9rem; display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                            <span>🏢 ${org}</span>
                            <span>🏷️ ${type}</span>
                            <span>📅 Applied: ${date}</span>
                            <span style="color: var(--accent-primary);">🔄 Updated: ${lastUpdate}</span>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
                        <span class="status-badge ${statusClass}" style="font-size: 0.85rem; padding: 0.35rem 0.75rem;">${app.status}</span>
                        ${opp ? `<a href="../opportunities/opportunity-details.html?id=${opp._id}" class="text-link text-sm">View Opportunity</a>` : ''}
                    </div>
                </div>

                <div class="timeline-container" style="position: relative; padding-top: 1rem; border-top: 1px solid var(--surface-border); margin-bottom: 1.5rem;">
                    <h5 style="margin-bottom: 1.25rem; color: var(--text-secondary); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">Application Progress</h5>
                    <div style="display: flex; justify-content: space-between; position: relative; padding: 0 10px;">
                        <!-- Progress Line -->
                        <div style="position: absolute; top: 12px; left: 0; right: 0; height: 2px; background: var(--surface-border); z-index: 0;"></div>
                        ${renderTimelineSteps(app.status)}
                    </div>
                </div>

                ${app.reviewNotes ? `
                <div style="margin-top: 1rem; padding: 1.25rem; background: rgba(255, 255, 255, 0.02); border-radius: 12px; border: 1px solid var(--surface-border); border-left: 4px solid var(--accent-primary);">
                    <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
                        <span style="font-size:1.1rem;">📝</span>
                        <h6 style="margin:0; font-size:0.9rem; color:var(--text-primary);">Feedback from Reviewer</h6>
                    </div>
                    <p style="font-size: 0.92rem; line-height: 1.5; color: var(--text-secondary);">${app.reviewNotes}</p>
                </div>
                ` : ''}

                <!-- Status History Detail -->
                <details style="margin-top: 1rem; cursor: pointer;">
                    <summary style="font-size: 0.82rem; color: var(--text-secondary); list-style: none; display: flex; align-items: center; gap: 0.4rem;">
                        <span style="font-size: 0.7rem;">▶</span> View Status History
                    </summary>
                    <div style="margin-top: 0.75rem; padding-left: 1rem; border-left: 1px dashed var(--surface-border);">
                        ${statusHistory.reverse().map(h => `
                            <div style="margin-bottom: 0.6rem; font-size: 0.85rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.1rem;">
                                    <span style="color: var(--text-primary); font-weight: 500;">${h.status}</span>
                                    <span style="color: var(--text-secondary); font-size: 0.75rem;">${new Date(h.date).toLocaleString()}</span>
                                </div>
                                ${h.note ? `<p style="color: var(--text-secondary); font-size: 0.8rem; font-style: italic;">"${h.note}"</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </details>
            </div>
        `;
    }).join('');
});

function getStatusClass(status) {
    const s = status.toLowerCase();
    if (s.includes('reject')) return 'status-rejected';
    if (s.includes('accept') || s.includes('offer')) return 'status-interview'; // green
    if (s.includes('interview')) return 'status-review'; // orange
    if (s.includes('shortlist') || s.includes('review') || s.includes('process')) return 'status-review'; // yellowish
    return 'status-review'; // default
}

function renderTimelineSteps(currentStatus) {
    const standardFlow = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Decision'];
    
    // Map current status to one of the 5 standard steps
    let activeIndex = 0;
    const s = currentStatus.toLowerCase();
    
    if (s.includes('applied') || s.includes('sent')) activeIndex = 0;
    if (s.includes('review') || s.includes('process')) activeIndex = 1;
    if (s.includes('shortlist')) activeIndex = 2;
    if (s.includes('interview')) activeIndex = 3;
    if (s.includes('offer') || s.includes('accept') || s.includes('reject')) activeIndex = 4;

    return standardFlow.map((step, idx) => {
        const isActive = idx <= activeIndex;
        const isCurrent = idx === activeIndex;
        const isReject = s.includes('reject');
        
        let circleColor = isActive ? 'var(--accent-primary)' : 'var(--surface-color-light)';
        let textColor = isActive ? 'var(--text-primary)' : 'var(--text-secondary)';
        let checkmark = '✓';
        
        if (isReject && idx === 4) {
            circleColor = '#ef4444'; // red
            textColor = '#ef4444';
            checkmark = '✕';
        } else if (isActive && idx === 4 && (s.includes('accept') || s.includes('offer'))) {
            circleColor = '#10b981'; // green
            textColor = '#10b981';
        }

        return `
            <div style="display: flex; flex-direction: column; align-items: center; z-index: 1; flex: 1;">
                <div style="width: 24px; height: 24px; border-radius: 50%; background: ${circleColor}; border: 2px solid ${isActive ? circleColor : 'var(--surface-border)'}; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; transition: all 0.3s ease; box-shadow: ${isCurrent ? '0 0 10px ' + circleColor : 'none'};">
                    ${isActive ? `<span style="color: #0A0A0A; font-size: 11px; font-weight: bold;">${idx === 4 && isReject ? '✕' : '✓'}</span>` : ''}
                </div>
                <span style="font-size: 0.7rem; font-weight: ${isActive ? '600' : '400'}; color: ${textColor}; text-align: center; white-space: nowrap;">${isCurrent ? currentStatus : step}</span>
            </div>
        `;
    }).join('');
}
