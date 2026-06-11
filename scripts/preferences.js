// OppHub - Preferences Page
document.addEventListener('DOMContentLoaded', () => {
    // Selectors
    const step1Container = document.getElementById('step-1-container');
    const step2Container = document.getElementById('step-2-container');
    const stepBadge = document.getElementById('step-badge');
    const backBtn = document.getElementById('back-btn');
    const continueBtn = document.getElementById('continue-btn');
    const countDisplay = document.querySelector('.count-number');
    const btnText = continueBtn.querySelector('.btn-text');
    
    // State
    let currentStep = 1;
    const selectedTypes = new Set(); // Step 1
    const selectedInterests = new Set(); // Step 2

    // Toggle card selection
    function setupCardListeners() {
        const cards = document.querySelectorAll('.pref-card');
        cards.forEach(card => {
            // Remove existing listeners by cloning (if re-running setup)
            const newCard = card.cloneNode(true);
            card.parentNode.replaceChild(newCard, card);
            
            newCard.addEventListener('click', () => {
                const value = newCard.dataset.value;
                const set = currentStep === 1 ? selectedTypes : selectedInterests;

                if (set.has(value)) {
                    set.delete(value);
                    newCard.classList.remove('selected');
                } else {
                    set.add(value);
                    newCard.classList.add('selected');
                }
                updateUI();
            });
        });
    }

    function updateUI() {
        const set = currentStep === 1 ? selectedTypes : selectedInterests;
        countDisplay.textContent = set.size;
        
        if (currentStep === 1) {
            continueBtn.disabled = set.size === 0;
            
            // Context-aware button text
            const skipStep2Types = ['Scholarship', 'Hackathon'];
            const onlySkipTypes = selectedTypes.size > 0 && Array.from(selectedTypes).every(t => skipStep2Types.includes(t));

            if (onlySkipTypes) {
                btnText.textContent = 'Finish Setup';
                stepBadge.innerHTML = '<span class="step-dot"></span> Setup 1 of 1';
            } else {
                btnText.textContent = 'Next Step';
                stepBadge.innerHTML = '<span class="step-dot"></span> Step 1 of 2';
            }
            
            backBtn.style.display = 'none';
        } else {
            continueBtn.disabled = set.size === 0;
            btnText.textContent = 'Finish Setup';
            backBtn.style.display = 'block';
            stepBadge.innerHTML = '<span class="step-dot"></span> Step 2 of 2';
        }
    }

    // Handle transitions
    continueBtn.addEventListener('click', async () => {
        if (currentStep === 1) {
            // Skip Step 2 if ONLY 'Scholarship' and/or 'Hackathon' are selected
            const skipStep2Types = ['Scholarship', 'Hackathon'];
            const onlySkipTypes = Array.from(selectedTypes).every(t => skipStep2Types.includes(t));

            if (onlySkipTypes) {
                selectedInterests.clear();
                await savePreferences();
                return;
            }

            // Otherwise, transition to step 2
            currentStep = 2;
            step1Container.style.display = 'none';
            step2Container.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setupCardListeners(); // Setup listeners for step 2 cards
            updateUI();
        } else {
            // Final submission
            await savePreferences();
        }
    });

    backBtn.addEventListener('click', () => {
        if (currentStep === 2) {
            currentStep = 1;
            step1Container.style.display = 'block';
            step2Container.style.display = 'none';
            setupCardListeners(); // Setup listeners for step 1 cards
            updateUI();
        }
    });

    async function savePreferences() {
        const preferences = Array.from(selectedInterests);
        const preferredOpportunityTypes = Array.from(selectedTypes);

        btnText.textContent = 'Completing...';
        continueBtn.disabled = true;

        if (isLoggedIn()) {
            const result = await apiRequest('/api/auth/preferences', {
                method: 'PUT',
                body: { preferences, preferredOpportunityTypes }
            });

            if (result.success) {
                setCurrentUser(result.data.user);
                showToast('Setup complete!', 'success');
                window.location.href = '../dashboard/dashboard.html';
            } else {
                showToast(result.message || 'Failed to save preferences.', 'error');
                btnText.textContent = 'Finish Setup';
                continueBtn.disabled = false;
            }
        } else {
            window.location.href = '../auth/login.html';
        }
    }

    // Initialize
    setupCardListeners();
    updateUI();
});
