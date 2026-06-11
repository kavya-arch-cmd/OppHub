// OppHub - Add Opportunity (Admin)
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('admin-logout').addEventListener('click', (e) => {
        e.preventDefault();
        logout('admin-login.html');
    });

    const form = document.getElementById('add-opportunity-form');
    const successBanner = document.getElementById('form-success');
    const errorBanner = document.getElementById('form-error');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = document.getElementById('submit-loader');
    const categorySelect = document.getElementById('opp-category');
    const internshipFields = document.getElementById('internship-fields');
    const scholarshipFields = document.getElementById('scholarship-fields');
    const hackathonFields = document.getElementById('hackathon-fields');
    const freelancingFields = document.getElementById('freelancing-fields');

    // Toggle fields based on category
    categorySelect.addEventListener('change', () => {
        const cat = categorySelect.value;
        internshipFields.style.display = (cat === 'Internship' || cat === 'Job') ? 'block' : 'none';
        scholarshipFields.style.display = (cat === 'Scholarship') ? 'block' : 'none';
        hackathonFields.style.display = (cat === 'Hackathon') ? 'block' : 'none';
        freelancingFields.style.display = (cat === 'Freelancing') ? 'block' : 'none';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        successBanner.style.display = 'none';
        errorBanner.style.display = 'none';

        const opportunity = {
            title: document.getElementById('opp-title').value.trim(),
            category: document.getElementById('opp-category').value,
            description: document.getElementById('opp-description').value.trim(),
            eligibility: document.getElementById('opp-eligibility').value.trim(),
            organization: document.getElementById('opp-organization').value.trim(),
            location: document.getElementById('opp-location').value.trim() || 'Not specified',
            applicationLink: document.getElementById('opp-link').value.trim(),
            deadline: document.getElementById('opp-deadline').value,
            
            // New dynamic fields
            stipend: document.getElementById('opp-stipend').value.trim(),
            experience: document.getElementById('opp-experience').value.trim(),
            skills: document.getElementById('opp-skills').value.split(',').map(s => s.trim()).filter(s => s),
            academicRequirements: document.getElementById('opp-academic').value.trim(),
            incomeCriteria: document.getElementById('opp-income').value.trim(),
            
            // Hackathon specific
            prizePool: document.getElementById('opp-prizepool').value.trim(),
            teamSize: document.getElementById('opp-teamsize').value.trim(),
            mode: document.getElementById('opp-mode').value,
            duration: document.getElementById('opp-duration').value.trim(),

            // Freelancing specific
            budget: document.getElementById('opp-budget').value.trim(),
            projectType: document.getElementById('opp-project-type').value,
            freelanceSkills: document.getElementById('opp-freelance-skills').value.split(',').map(s => s.trim()).filter(s => s),
            freelanceExperience: document.getElementById('opp-freelance-experience').value,

            isPaid: !!document.getElementById('opp-stipend').value.trim(),
            requiredFileLabel: document.getElementById('opp-category').value === 'Scholarship' ? 'Marksheet / Academic Result' : 'Resume'
        };

        // Validate required fields
        if (!opportunity.title || !opportunity.category || !opportunity.description || !opportunity.deadline || !opportunity.eligibility || !opportunity.applicationLink) {
            errorBanner.textContent = 'Please fill in all required fields.';
            errorBanner.style.display = 'block';
            showToast('Please fill in all required fields.', 'error');
            return;
        }

        // Validate deadline is in the future
        if (new Date(opportunity.deadline) < new Date()) {
            errorBanner.textContent = 'Deadline must be a future date.';
            errorBanner.style.display = 'block';
            showToast('Deadline must be a future date.', 'error');
            return;
        }

        // Show loading
        btnText.style.display = 'none';
        loader.style.display = 'inline-block';
        submitBtn.disabled = true;

        const result = await apiRequest('/api/opportunities', {
            method: 'POST',
            body: opportunity
        });

        btnText.style.display = 'inline-block';
        loader.style.display = 'none';
        submitBtn.disabled = false;

        if (result.success) {
            successBanner.style.display = 'block';
            form.reset();
            showToast('Opportunity created successfully!', 'success');

            setTimeout(() => {
                window.location.href = 'manage-opportunities.html';
            }, 1200);
        } else {
            errorBanner.textContent = result.message;
            errorBanner.style.display = 'block';
            showToast(result.message, 'error');
        }
    });
});
