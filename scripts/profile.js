// OppHub - Profile Page
document.addEventListener('DOMContentLoaded', async () => {
    const profileForm = document.getElementById('profile-form');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');
    const saveBtn = document.getElementById('save-btn');
    const interestsContainer = document.getElementById('interests-container');
    const typesContainer = document.getElementById('types-container');

    const availableInterests = [
        "Web Development", "Frontend Development", "Backend Development", 
        "Full Stack Development", "AI/ML", "Data Science", "UI/UX Design", 
        "App Development", "Cybersecurity", "Cloud Computing", 
        "Software Engineering", "Data Analytics", "Digital Marketing",
        "Finance", "Mechanical Engineering", "Civil Engineering", "Electronics Engineering"
    ];

    const availableTypes = [
        "Scholarship", "Internship", "Job", "Freelancing", "Workshop / Training", "Hackathon"
    ];

    let selectedInterests = [];
    let selectedTypes = [];

    function renderInterests() {
        if (!interestsContainer) return;
        interestsContainer.innerHTML = availableInterests.map(interest => `
            <div class="interest-tag ${selectedInterests.includes(interest) ? 'selected' : ''}" 
                 data-value="${interest}">
                ${interest}
            </div>
        `).join('');

        // Add click listeners
        interestsContainer.querySelectorAll('.interest-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const val = tag.getAttribute('data-value');
                if (selectedInterests.includes(val)) {
                    selectedInterests = selectedInterests.filter(i => i !== val);
                } else {
                    selectedInterests.push(val);
                }
                renderInterests();
            });
        });
    }

    function renderTypes() {
        if (!typesContainer) return;
        typesContainer.innerHTML = availableTypes.map(type => `
            <div class="interest-tag ${selectedTypes.includes(type) ? 'selected' : ''}" 
                 data-value="${type}">
                ${type}
            </div>
        `).join('');

        // Add click listeners
        typesContainer.querySelectorAll('.interest-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const val = tag.getAttribute('data-value');
                if (selectedTypes.includes(val)) {
                    selectedTypes = selectedTypes.filter(i => i !== val);
                } else {
                    selectedTypes.push(val);
                }
                renderTypes();
            });
        });
    }

    renderInterests();
    renderTypes();

    // Fetch fresh user data from backend (not just localStorage)
    const meResult = await apiRequest('/api/auth/me');
    let user;

    if (meResult.success) {
        user = meResult.data.user;
        setCurrentUser(user); // Update local cache
    } else {
        user = getCurrentUser(); // Fallback to cached
    }

    // Pre-fill form with real user data
    if (user) {
        const fields = {
            'fullname': user.name,
            'dob': user.dob,
            'course': user.course,
            'category': user.category,
            'income': user.income,
            'location': user.location
        };

        Object.entries(fields).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el && value) el.value = value;
        });

        // Set selected interests
        if (user.preferences && Array.isArray(user.preferences)) {
            selectedInterests = [...user.preferences];
            renderInterests();
        }

        // Set selected types
        if (user.preferredOpportunityTypes && Array.isArray(user.preferredOpportunityTypes)) {
            selectedTypes = [...user.preferredOpportunityTypes];
            renderTypes();
        }
    }

    if (profileForm) {
        const btnText = saveBtn.querySelector('.btn-text');
        const loader = saveBtn.querySelector('.loader');

        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('fullname').value.trim();
            const dob = document.getElementById('dob').value;
            const course = document.getElementById('course').value;
            const category = document.getElementById('category').value;
            const income = document.getElementById('income').value;
            const location = document.getElementById('location').value;

            // Validation
            if (!name) {
                showError('Name is required.');
                return;
            }

            // Hide previous messages
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';

            // Show loading state
            btnText.style.display = 'none';
            loader.style.display = 'inline-block';
            saveBtn.disabled = true;

            // Send profile update to backend
            const result = await apiRequest('/api/auth/profile', {
                method: 'PUT',
                body: { 
                    name, dob, course, category, income, location, 
                    preferences: selectedInterests,
                    preferredOpportunityTypes: selectedTypes
                }
            });

            btnText.style.display = 'inline-block';
            loader.style.display = 'none';
            saveBtn.disabled = false;

            if (result.success) {
                setCurrentUser(result.data.user);
                successMessage.style.display = 'block';
                showToast('Profile updated successfully!', 'success');

                setTimeout(() => {
                    window.location.href = '../dashboard/dashboard.html';
                }, 1200);
            } else {
                showError(result.message);
            }
        });
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        showToast(message, 'error');

        // Shake animation
        const card = document.querySelector('.dashboard-widget');
        if (card) {
            card.style.transform = 'translate(5px, 0)';
            setTimeout(() => card.style.transform = 'translate(-5px, 0)', 100);
            setTimeout(() => card.style.transform = 'translate(5px, 0)', 200);
            setTimeout(() => card.style.transform = 'translate(-5px, 0)', 300);
            setTimeout(() => card.style.transform = 'translate(0, 0)', 400);
        }
    }
});
