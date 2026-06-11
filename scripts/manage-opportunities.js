// OppHub - Manage Opportunities (Admin)
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('admin-logout').addEventListener('click', (e) => {
        e.preventDefault();
        logout('admin-login.html');
    });

    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const tableBody = document.getElementById('manage-table-body');
    const emptyState = document.getElementById('manage-empty');

    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const editCategorySelect = document.getElementById('edit-category');
    const editInternshipFields = document.getElementById('edit-internship-fields');
    const editScholarshipFields = document.getElementById('edit-scholarship-fields');
    const editHackathonFields = document.getElementById('edit-hackathon-fields');

    // Toggle fields in edit modal
    editCategorySelect.addEventListener('change', () => {
        const cat = editCategorySelect.value;
        editInternshipFields.style.display = (cat === 'Internship' || cat === 'Job') ? 'block' : 'none';
        editScholarshipFields.style.display = (cat === 'Scholarship') ? 'block' : 'none';
        editHackathonFields.style.display = (cat === 'Hackathon') ? 'block' : 'none';
    });

    let allOpportunities = [];

    loadOpportunities();

    searchInput.addEventListener('input', renderTable);
    categoryFilter.addEventListener('change', renderTable);

    cancelEditBtn.addEventListener('click', () => {
        editModal.classList.remove('show');
    });

    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) editModal.classList.remove('show');
    });

    // Save edit - sends PUT to backend
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-id').value;
        const submitBtn = editForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        const updatedData = {
            title: document.getElementById('edit-title').value.trim(),
            category: document.getElementById('edit-category').value,
            description: document.getElementById('edit-description').value.trim(),
            eligibility: document.getElementById('edit-eligibility').value.trim(),
            organization: document.getElementById('edit-organization').value.trim(),
            location: document.getElementById('edit-location').value.trim(),
            applicationLink: document.getElementById('edit-link').value.trim(),
            deadline: document.getElementById('edit-deadline').value,
            
            // Dynamic fields
            stipend: document.getElementById('edit-stipend').value.trim(),
            experience: document.getElementById('edit-experience').value.trim(),
            academicRequirements: document.getElementById('edit-academic').value.trim(),
            incomeCriteria: document.getElementById('edit-income').value.trim(),

            // Hackathon specific
            prizePool: document.getElementById('edit-prizepool').value.trim(),
            teamSize: document.getElementById('edit-teamsize').value.trim(),
            mode: document.getElementById('edit-mode').value,
            duration: document.getElementById('edit-duration').value.trim(),

            isPaid: !!document.getElementById('edit-stipend').value.trim(),
            requiredFileLabel: document.getElementById('edit-category').value === 'Scholarship' ? 'Marksheet / Academic Result' : 'Resume'
        };

        const result = await apiRequest(`/api/opportunities/${id}`, {
            method: 'PUT',
            body: updatedData
        });

        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Changes';

        if (result.success) {
            editModal.classList.remove('show');
            showToast('Opportunity updated successfully!', 'success');
            await loadOpportunities();
        } else {
            showToast('Failed to update: ' + result.message, 'error');
        }
    });

    async function loadOpportunities() {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:2rem;"><span class="loader" style="width:30px;height:30px;border-width:2px;display:inline-block;"></span></td></tr>';
        emptyState.style.display = 'none';

        const result = await apiRequest('/api/opportunities', { auth: false });
        allOpportunities = result.success ? result.data : [];

        if (!result.success) {
            showToast('Failed to load opportunities.', 'error');
        }

        renderTable();
    }

    function renderTable() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const categoryValue = categoryFilter.value;

        let filtered = allOpportunities;

        if (searchTerm) {
            filtered = filtered.filter(o =>
                o.title.toLowerCase().includes(searchTerm) ||
                o.organization.toLowerCase().includes(searchTerm)
            );
        }

        if (categoryValue) {
            filtered = filtered.filter(o => o.category === categoryValue);
        }

        if (filtered.length === 0) {
            tableBody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        tableBody.innerHTML = filtered.map(opp => {
            const status = getStatus(opp.deadline);
            return `
                <tr>
                    <td>
                        <strong>${escapeHtml(opp.title)}</strong><br>
                        <span style="color: var(--text-secondary); font-size: 0.82rem;">${escapeHtml(opp.organization)}</span>
                    </td>
                    <td><span class="category-badge">${escapeHtml(opp.category)}</span></td>
                    <td>${formatDate(opp.deadline)}</td>
                    <td><span class="status-badge ${status.class}">${status.icon} ${status.label}</span></td>
                    <td>
                        <div class="table-actions">
                            <button class="action-btn" onclick="viewApplications('${opp._id}')" title="View Applications">👥</button>
                            <button class="action-btn edit" onclick="openEdit('${opp._id}')">✏️ Edit</button>
                            <button class="action-btn delete" onclick="deleteOpp('${opp._id}')">🗑️ Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Modal elements
    const appsModal = document.getElementById('applications-modal');
    const closeAppsBtn = document.getElementById('close-apps-modal');
    
    closeAppsBtn.addEventListener('click', () => {
        appsModal.classList.remove('show');
    });

    appsModal.addEventListener('click', (e) => {
        if (e.target === appsModal) appsModal.classList.remove('show');
    });

    window.viewApplications = async function(id) {
        const opp = allOpportunities.find(o => o._id === id);
        if (!opp) return;

        document.getElementById('apps-opp-title').textContent = opp.title;
        const tbody = document.getElementById('applications-table-body');
        const loader = document.getElementById('apps-loader');
        const empty = document.getElementById('apps-empty');

        tbody.innerHTML = '';
        empty.style.display = 'none';
        loader.style.display = 'block';
        appsModal.classList.add('show');

        const result = await apiRequest(`/api/applications/opportunity/${id}`);
        loader.style.display = 'none';

        if (result.success && result.data.length > 0) {
            tbody.innerHTML = result.data.map(app => {
                const user = app.userId || {};
                const date = formatDate(app.appliedDate);
                const fileLabel = opp.requiredFileLabel || 'Resume';
                const resumeLink = app.resumeUrl 
                    ? `<a href="${API_BASE_URL}${app.resumeUrl}" target="_blank" class="text-link">📄 Download ${fileLabel}</a>` 
                    : `<span style="color:var(--text-secondary)">No ${fileLabel}</span>`;

                const currentStatus = app.status || 'Applied';
                const statuses = ['Applied', 'Resume Sent', 'Under Review', 'Shortlisted', 'Interview', 'Interview Scheduled', 'Interview Completed', 'In Process', 'Offer Received', 'Accepted', 'Rejected', 'Decision'];
                
                const statusOptions = statuses.map(s => `<option value="${s}" ${s === currentStatus ? 'selected' : ''}>${s}</option>`).join('');

                return `
                    <tr>
                        <td><strong>${escapeHtml(user.name || 'Unknown User')}</strong></td>
                        <td>${escapeHtml(user.email || 'N/A')}</td>
                        <td>${date}</td>
                        <td>${resumeLink}</td>
                        <td>
                            <select id="status-${app._id}" class="admin-input" onchange="updateAppStatus('${app._id}')" style="padding: 0.25rem; font-size: 0.85rem; width: 130px;">
                                ${statusOptions}
                            </select>
                        </td>
                        <td>
                            <input type="text" id="notes-${app._id}" class="admin-input" style="padding: 0.25rem; font-size: 0.85rem; width: 150px;" placeholder="Add notes..." value="${escapeHtml(app.reviewNotes || '')}">
                        </td>
                        <td>
                            <button class="action-btn edit" id="btn-${app._id}" onclick="updateAppStatus('${app._id}')" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">💾 Save</button>
                        </td>
                    </tr>
                `;
            }).join('');
        } else {
            empty.style.display = 'block';
        }
    };

    window.updateAppStatus = async function(appId) {
        const status = document.getElementById(`status-${appId}`).value;
        const notes = document.getElementById(`notes-${appId}`).value;
        const btn = document.getElementById(`btn-${appId}`);
        const select = document.getElementById(`status-${appId}`);

        // Visual loading state
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⏳...';
        }
        if (select) select.disabled = true;

        const result = await apiRequest(`/api/applications/${appId}/status`, {
            method: 'PUT',
            body: { status, reviewNotes: notes }
        });

        if (btn) {
            btn.disabled = false;
            btn.textContent = '💾 Save';
        }
        if (select) select.disabled = false;

        if (result.success) {
            showToast('Application updated successfully.', 'success');
        } else {
            console.error('❌ Backend update failed:', result.message);
            showToast('Failed to update: ' + result.message, 'error');
        }
    };

    window.openEdit = function(id) {
        const opp = allOpportunities.find(o => o._id === id);
        if (!opp) return;

        document.getElementById('edit-id').value = opp._id;
        document.getElementById('edit-title').value = opp.title;
        document.getElementById('edit-category').value = opp.category;
        document.getElementById('edit-description').value = opp.description || '';
        document.getElementById('edit-eligibility').value = opp.eligibility || '';
        document.getElementById('edit-organization').value = opp.organization || '';
        document.getElementById('edit-location').value = opp.location || '';
        document.getElementById('edit-link').value = opp.applicationLink || '';
        document.getElementById('edit-deadline').value = opp.deadline ? opp.deadline.split('T')[0] : '';

        // Populate and toggle dynamic fields
        document.getElementById('edit-stipend').value = opp.stipend || '';
        document.getElementById('edit-experience').value = opp.experience || '';
        document.getElementById('edit-academic').value = opp.academicRequirements || '';
        document.getElementById('edit-income').value = opp.incomeCriteria || '';
        
        // Hackathon Specific
        document.getElementById('edit-prizepool').value = opp.prizePool || '';
        document.getElementById('edit-teamsize').value = opp.teamSize || '';
        document.getElementById('edit-mode').value = opp.mode || '';
        document.getElementById('edit-duration').value = opp.duration || '';

        const cat = opp.category;
        editInternshipFields.style.display = (cat === 'Internship' || cat === 'Job') ? 'block' : 'none';
        editScholarshipFields.style.display = (cat === 'Scholarship') ? 'block' : 'none';
        editHackathonFields.style.display = (cat === 'Hackathon') ? 'block' : 'none';

        editModal.classList.add('show');
    };

    window.deleteOpp = async function(id) {
        if (!confirm('Are you sure you want to delete this opportunity?')) return;

        const result = await apiRequest(`/api/opportunities/${id}`, {
            method: 'DELETE'
        });

        if (result.success) {
            showToast('Opportunity deleted.', 'success');
            await loadOpportunities();
        } else {
            showToast('Failed to delete: ' + result.message, 'error');
        }
    };
});

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

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
