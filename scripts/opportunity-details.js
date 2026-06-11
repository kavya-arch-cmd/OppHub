// OppHub - Opportunity Details Page
document.addEventListener('DOMContentLoaded', async () => {
    const loader = document.getElementById('loader');
    const detailsContainer = document.getElementById('details-container');
    const applyBtn = document.getElementById('apply-btn');
    const saveBtn = document.getElementById('save-btn');
    const feedbackMsg = document.getElementById('feedback-msg');

    // Get opportunity ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const oppId = urlParams.get('id');

    if (!oppId) {
        loader.style.display = 'none';
        detailsContainer.style.display = 'block';
        showToast('No opportunity ID provided.', 'error');
        return;
    }

    // Fetch opportunity details from backend
    const result = await apiRequest(`/api/opportunities/${oppId}`, { auth: false });

    loader.style.display = 'none';
    detailsContainer.style.display = 'block';

    if (!result.success) {
        showToast('Failed to load opportunity details.', 'error');
        return;
    }

    // Populate ALL detail fields from API response
    const opp = result.data;

    // Title
    const titleEl = document.getElementById('opp-title');
    if (titleEl) titleEl.textContent = opp.title;

    // Category badge
    const categoryEl = document.getElementById('opp-category');
    if (categoryEl) categoryEl.textContent = opp.category;

    // Company & location
    const compLocEl = document.getElementById('opp-company-loc');
    if (compLocEl) compLocEl.innerHTML = `${opp.organization} &bull; ${opp.location || 'Remote'}`;

    // Deadline text
    const deadlineEl = document.getElementById('opp-deadline-text');
    if (deadlineEl) deadlineEl.textContent = new Date(opp.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Description
    const descEl = document.getElementById('opp-desc');
    if (descEl) descEl.textContent = opp.description;

    // Eligibility
    const eligEl = document.getElementById('opp-eligibility');
    if (eligEl) eligEl.textContent = opp.eligibility;

    // Dynamic Fields Population
    const stipendBadge = document.getElementById('stipend-badge');
    if (stipendBadge && opp.stipend) {
        stipendBadge.style.display = 'inline-block';
        document.getElementById('stipend-text').textContent = opp.stipend;
    }

    const expBadge = document.getElementById('exp-badge');
    if (expBadge && opp.experience) {
        expBadge.style.display = 'inline-block';
        document.getElementById('exp-text').textContent = opp.experience;
    }

    const academicBadge = document.getElementById('academic-badge');
    if (academicBadge && opp.academicRequirements) {
        academicBadge.style.display = 'inline-block';
        document.getElementById('academic-text').textContent = opp.academicRequirements;
    }

    const incomeInfo = document.getElementById('income-info');
    if (incomeInfo && opp.incomeCriteria) {
        incomeInfo.style.display = 'block';
        document.getElementById('income-text').textContent = opp.incomeCriteria;
    }

    // Hackathon specific population
    const prizeBadge = document.getElementById('prize-badge');
    if (prizeBadge && opp.prizePool) {
        prizeBadge.style.display = 'inline-block';
        document.getElementById('prize-text').textContent = opp.prizePool;
    }

    const teamBadge = document.getElementById('team-badge');
    if (teamBadge && opp.teamSize) {
        teamBadge.style.display = 'inline-block';
        document.getElementById('team-text').textContent = opp.teamSize;
    }

    const modeBadge = document.getElementById('mode-badge');
    if (modeBadge && opp.mode) {
        modeBadge.style.display = 'inline-block';
        document.getElementById('mode-text').textContent = opp.mode;
    }

    const durationBadge = document.getElementById('duration-badge');
    if (durationBadge && opp.duration) {
        durationBadge.style.display = 'inline-block';
        document.getElementById('duration-text').textContent = opp.duration;
    }

    // Freelancing specific population
    if (opp.category === 'Freelancing') {
        const freelanceCard = document.getElementById('freelancing-details-card');
        if (freelanceCard) {
            let hasFreelanceData = false;
            
            if (opp.budget) {
                document.getElementById('budget-block').style.display = 'block';
                document.getElementById('card-budget-text').textContent = opp.budget;
                hasFreelanceData = true;
            }
            if (opp.projectType) {
                document.getElementById('project-type-block').style.display = 'block';
                document.getElementById('card-project-type-text').textContent = opp.projectType;
                hasFreelanceData = true;
            }
            if (opp.freelanceExperience) {
                document.getElementById('freelance-exp-block').style.display = 'block';
                document.getElementById('card-freelance-exp-text').textContent = opp.freelanceExperience;
                hasFreelanceData = true;
            }
            if (opp.freelanceSkills && opp.freelanceSkills.length > 0) {
                const fSkillsContainer = document.getElementById('freelance-skills-container');
                const fSkillsTags = document.getElementById('freelance-skills-tags');
                fSkillsContainer.style.display = 'block';
                fSkillsTags.innerHTML = opp.freelanceSkills.map(skill => `
                    <span class="category-badge" style="background: rgba(245, 158, 11, 0.1); color: #fbbf24; font-size: 0.8rem; border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 6px; padding: 0.3rem 0.7rem;">${skill}</span>
                `).join('');
                hasFreelanceData = true;
            }
            
            if (hasFreelanceData) {
                freelanceCard.style.display = 'block';
            }
        }
    }

    // Skills Tags
    const skillsSection = document.getElementById('skills-section');
    const skillsTags = document.getElementById('skills-tags');
    if (skillsSection && opp.skills && opp.skills.length > 0) {
        skillsSection.style.display = 'block';
        skillsTags.innerHTML = opp.skills.map(skill => `
            <span class="category-badge" style="background: rgba(124, 58, 237, 0.1); color: #a78bfa; font-size: 0.8rem; border: 1px solid rgba(124, 58, 237, 0.2);">${skill}</span>
        `).join('');
    }

    // Upload Labels & Logic
    const uploadLabel = document.getElementById('upload-label');
    const uploadHelp = document.getElementById('upload-help');
    const applyBtnText = applyBtn.querySelector('.btn-text');

    const resumeInputEl = document.getElementById('resume-upload');
    if (resumeInputEl) {
        resumeInputEl.accept = opp.category === 'Scholarship' ? '.pdf,.jpg,.jpeg,.png' : '.pdf,.doc,.docx';
    }

    if (opp.category === 'Scholarship') {
        if (uploadLabel) uploadLabel.textContent = 'Upload Latest Academic Marksheet';
        if (uploadHelp) uploadHelp.textContent = 'Accepted formats: PDF, JPG, PNG (Max 5MB)';
        if (applyBtnText && !applyBtn.disabled) applyBtnText.textContent = '🚀 Apply for Scholarship';
    } else {
        const fileLabel = opp.requiredFileLabel || 'Resume';
        if (uploadLabel) uploadLabel.textContent = `Submit Your ${fileLabel}`;
        if (applyBtnText && !applyBtn.disabled) applyBtnText.textContent = `🚀 Apply with ${fileLabel}`;
    }

    // Check if user is logged in for bookmark state
    let isBookmarked = false;
    if (isLoggedIn()) {
        const user = getCurrentUser();
        if (user && user.bookmarks && user.bookmarks.includes(oppId)) {
            isBookmarked = true;
            const saveBtnText = saveBtn.querySelector('.btn-text');
            saveBtnText.textContent = '✅ Saved';
            saveBtn.style.color = '#93c5fd';
            saveBtn.style.borderColor = 'rgba(59, 130, 246, 0.4)';
            saveBtn.style.background = 'rgba(59, 130, 246, 0.1)';
        }

        // Check if user has already applied
        const appsResult = await apiRequest('/api/applications');
        if (appsResult.success && appsResult.data) {
            const hasApplied = appsResult.data.some(app => {
                // Handle populated vs unpopulated opportunityId
                const id = app.opportunityId && app.opportunityId._id ? app.opportunityId._id : app.opportunityId;
                return id === oppId;
            });
            
            if (hasApplied) {
                const btnText = applyBtn.querySelector('.btn-text');
                btnText.textContent = '✅ Applied';
                applyBtn.style.background = 'rgba(39, 201, 63, 0.2)';
                applyBtn.style.color = '#86efac';
                applyBtn.style.boxShadow = 'none';
                applyBtn.disabled = true;
                
                const resumeInput = document.getElementById('resume-upload');
                if (resumeInput) resumeInput.disabled = true;
            }
        }
    }

    // ── Apply Logic ───────────────────────────────────────
    applyBtn.addEventListener('click', async () => {
        if (!isLoggedIn()) {
            showToast('Please log in to apply.', 'error');
            showFeedback('Please log in to apply.', 'rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.3)', '#fca5a5');
            return;
        }

        const resumeInput = document.getElementById('resume-upload');
        const isScholarship = opp.category === 'Scholarship';
        const fileLabel = isScholarship ? 'Marksheet / Result' : (opp.requiredFileLabel || 'Resume');

        if (!resumeInput.files || resumeInput.files.length === 0) {
            showToast(`Please select your ${fileLabel.toLowerCase()} file to upload.`, 'error');
            return;
        }

        const file = resumeInput.files[0];
        
        // Basic frontend validation for file type and size
        const validTypes = isScholarship 
            ? ['application/pdf', 'image/jpeg', 'image/png']
            : ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            
        if (!validTypes.includes(file.type)) {
            const allowed = isScholarship ? 'PDF, JPG, or PNG' : 'PDF, DOC, or DOCX';
            showToast(`Only ${allowed} files are allowed.`, 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            showToast('File size must be less than 5MB.', 'error');
            return;
        }

        const btnText = applyBtn.querySelector('.btn-text');
        const btnLoader = applyBtn.querySelector('.loader');

        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        applyBtn.disabled = true;

        const formData = new FormData();
        formData.append('opportunityId', oppId);
        formData.append('resume', file);

        const applyResult = await apiRequest('/api/applications', {
            method: 'POST',
            body: formData
        });

        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';

        if (applyResult.success) {
            btnText.textContent = '✅ Applied';
            applyBtn.style.background = 'rgba(39, 201, 63, 0.2)';
            applyBtn.style.color = '#86efac';
            applyBtn.style.boxShadow = 'none';
            applyBtn.disabled = true;
            resumeInput.disabled = true;
            showToast('Application submitted successfully!', 'success');
            showFeedback('Application sent! Track it in your Dashboard.', 'rgba(39, 201, 63, 0.1)', 'rgba(39, 201, 63, 0.3)', '#86efac');
        } else {
            applyBtn.disabled = false;
            showToast(applyResult.message, 'error');
            showFeedback(applyResult.message, 'rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.3)', '#fca5a5');
        }
    });

    // ── Bookmark Logic (REAL backend) ─────────────────────
    saveBtn.addEventListener('click', async () => {
        if (!isLoggedIn()) {
            showToast('Please log in to save opportunities.', 'error');
            return;
        }

        const saveBtnText = saveBtn.querySelector('.btn-text');
        const saveBtnLoader = saveBtn.querySelector('.loader');

        saveBtnText.style.display = 'none';
        saveBtnLoader.style.display = 'inline-block';
        saveBtn.disabled = true;

        const bmResult = await apiRequest('/api/auth/bookmarks', {
            method: 'POST',
            body: { opportunityId: oppId }
        });

        saveBtnText.style.display = 'inline-block';
        saveBtnLoader.style.display = 'none';
        saveBtn.disabled = false;

        if (bmResult.success) {
            // Update local user bookmarks
            const user = getCurrentUser();
            if (user) {
                user.bookmarks = bmResult.data.bookmarks;
                setCurrentUser(user);
            }

            if (bmResult.data.action === 'added') {
                saveBtnText.textContent = '✅ Saved';
                saveBtn.style.color = '#93c5fd';
                saveBtn.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                saveBtn.style.background = 'rgba(59, 130, 246, 0.1)';
                showToast('Opportunity saved!', 'success');
            } else {
                saveBtnText.textContent = '🔖 Save Opportunity';
                saveBtn.style = '';
                showToast('Bookmark removed.', 'info');
            }
        } else {
            showToast(bmResult.message, 'error');
        }
    });

    function showFeedback(msg, bg, border, color) {
        feedbackMsg.textContent = msg;
        feedbackMsg.style.display = 'block';
        feedbackMsg.style.background = bg;
        feedbackMsg.style.borderColor = border;
        feedbackMsg.style.color = color;
    }
});
