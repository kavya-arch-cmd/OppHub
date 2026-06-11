const Opportunity = require('../models/Opportunity');

// ── Scoring Weights ───────────────────────────────────────
// Higher weight = stronger match signal
const WEIGHTS = {
    typeMatch: 500,         // User's preferred opportunity type matches exactly (Critical)
    exactInterestMatch: 300, // Exact keyword match in title/tags/skills (High Priority)
    relatedInterestMatch: 100, // Related keyword match (Medium Priority)
    partialInterestMatch: 50,  // Keyword match in description (Low Priority)
    locationMatch: 30,      // User's location matches opportunity location
    deadlineSoon: 20,       // Deadline within 30 days
    courseRelevance: 20,     // Keywords from course
    recencyBoost: 10         // Newer opportunities
};


// ── Reason & Tip Templates ────────────────────────────────
// These are template banks — the engine picks the right one
// based on WHY the opportunity scored high for this user.

const reasonTemplates = {
    interestMatch: [
        'Perfect match for your interest in {preference}.',
        'This aligns directly with your {preference} career goals.',
        'Highly relevant to your specific interest in {preference}.'
    ],
    categoryMatch: [
        'This {category} aligns with your general preference for {preference}.',
        'Based on your interest in {preference}, this {category} is a great fit.',
        'Your profile indicates an interest in {preference}, making this relevant.'
    ],
    locationMatch: [
        'Located in {location}, this is conveniently near your area.',
        'This opportunity is based in {location}, matching your preferred region.',
        'Available in {location} — perfect for your current location.'
    ],
    courseRelevance: [
        'Your {course} background gives you a strong advantage for this role.',
        'Students studying {course} are ideal candidates for this opportunity.',
        'This aligns well with skills you are developing in {course}.'
    ],
    deadlineSoon: [
        'The deadline is approaching soon — apply early for the best chance.',
        'This is time-sensitive with an upcoming deadline — act quickly.',
        'With a close deadline, this is a priority recommendation for you.'
    ],
    general: [
        'This is a highly-rated opportunity open to students like you.',
        'Many students with similar profiles have found this opportunity valuable.',
        'This is a popular choice among students in your field.'
    ]
};

const tipTemplates = {
    'Scholarship': [
        'Prepare a strong personal statement highlighting your achievements.',
        'Gather your transcripts and recommendation letters early.',
        'Tailor your application essay to the scholarship\'s mission and values.',
        'Highlight any community involvement or leadership experience.'
    ],
    'Internship': [
        'Update your resume with relevant projects and skills.',
        'Practice common interview questions for this field.',
        'Craft a concise cover letter showing your enthusiasm and fit.',
        'Reach out to past interns on LinkedIn for insider tips.'
    ],
    'Freelancing': [
        'Build a professional portfolio to showcase your skills.',
        'Always set clear expectations and deadlines with clients.',
        'Network with other freelancers to find referral opportunities.',
        'Manage your time effectively to maintain a work-life balance.'
    ],
    'Workshop / Training': [
        'Register early as spots often fill up quickly.',
        'Review the prerequisites and prepare any required materials.',
        'Come ready with questions to maximize your learning.',
        'Connect with other attendees for networking opportunities.'
    ],
    'Job': [
        'Research the company culture and values before your interview.',
        'Tailor your resume specifically to the job description requirements.',
        'Prepare specific examples of your past achievements and skills.',
        'Send a personalized thank-you note after any interview.'
    ],
    'Hackathon': [
        'Focus on building a Minimum Viable Product (MVP) first.',
        'Form a diverse team with both technical and creative skills.',
        'Prepare a compelling pitch to explain your solution.',
        'Don\'t forget to stay hydrated and take short breaks.'
    ]
};


// ── Scoring Engine ────────────────────────────────────────

/**
 * Scores a single opportunity against a user profile.
 * Returns a numeric score and the primary match reason.
 */
function scoreOpportunity(opportunity, userProfile) {
    let score = 0;
    let primaryReason = 'general';
    let matchedPreference = '';

    const { course, category, location, preferences, preferredOpportunityTypes } = userProfile;
    const oppCategory = (opportunity.category || '').toLowerCase();
    const oppLocation = (opportunity.location || '').toLowerCase();
    const oppDesc = (opportunity.description || '').toLowerCase();
    const oppEligibility = (opportunity.eligibility || '').toLowerCase();

    // Related keywords mapping for smarter filtering
    const relatedKeywords = {
        'web development': ['frontend', 'backend', 'full stack', 'react', 'node', 'javascript', 'html', 'css', 'mern', 'mean', 'vue', 'angular', 'ui/ux'],
        'data science': ['python', 'pandas', 'numpy', 'machine learning', 'data analysis', 'sql', 'statistics', 'visualization', 'r', 'tableau'],
        'ai/ml': ['artificial intelligence', 'machine learning', 'deep learning', 'neural networks', 'nlp', 'computer vision', 'pytorch', 'tensorflow'],
        'app development': ['mobile', 'android', 'ios', 'flutter', 'react native', 'swift', 'kotlin', 'mobile development'],
        'cybersecurity': ['security', 'infosec', 'penetration testing', 'ethical hacking', 'network security', 'cryptography', 'firewall'],
        'cloud computing': ['aws', 'azure', 'gcp', 'devops', 'kubernetes', 'docker', 'infrastructure', 'serverless'],
        'ui/ux design': ['product design', 'figma', 'adobe xd', 'user experience', 'user interface', 'prototyping', 'wireframing']
    };

    // 1. Interest & Category match against user preferences
    if (preferences && preferences.length > 0) {
        const title = opportunity.title.toLowerCase();
        const desc = (opportunity.description || '').toLowerCase();
        const tags = (opportunity.tags || []).map(t => t.toLowerCase());
        const skills = (opportunity.skills || []).map(s => s.toLowerCase());
        
        let hasInterestMatch = false;

        for (const pref of preferences) {
            const prefLower = pref.toLowerCase();
            
            // Check for exact interest match (High Relevance)
            if (title.includes(prefLower) || tags.includes(prefLower) || skills.includes(prefLower)) {
                score += WEIGHTS.exactInterestMatch;
                primaryReason = 'interestMatch';
                matchedPreference = pref;
                hasInterestMatch = true;
                continue;
            }

            // Check for related keywords match
            const related = relatedKeywords[prefLower] || [];
            if (related.some(word => title.includes(word) || tags.includes(word) || skills.includes(word))) {
                score += WEIGHTS.relatedInterestMatch;
                if (primaryReason === 'general') {
                    primaryReason = 'interestMatch';
                    matchedPreference = pref;
                }
                hasInterestMatch = true;
                continue;
            }
            
            // Partial match in description
            if (desc.includes(prefLower)) {
                score += WEIGHTS.partialInterestMatch;
                if (primaryReason === 'general') {
                    primaryReason = 'interestMatch';
                    matchedPreference = pref;
                }
                hasInterestMatch = true;
            }
        }

        // Penalize heavily if the user has preferences but this opportunity matches none
        if (!hasInterestMatch) {
            score -= 3000;
        }
    }

    // 1b. Opportunity Type match (STRICT)
    if (preferredOpportunityTypes && preferredOpportunityTypes.length > 0) {
        let hasTypeMatch = false;
        for (const type of preferredOpportunityTypes) {
            if (oppCategory.includes(type.toLowerCase())) {
                score += WEIGHTS.typeMatch;
                hasTypeMatch = true;
                break;
            }
        }
        if (!hasTypeMatch) {
            score -= 5000; // Even heavier penalty for wrong type
        }
    }

    // 2. Location match
    if (location && oppLocation) {
        const userLoc = location.toLowerCase();
        if (oppLocation.includes(userLoc) || userLoc.includes(oppLocation) ||
            oppLocation.includes('remote') || oppLocation.includes('online')) {
            score += WEIGHTS.locationMatch;
            if (primaryReason === 'general') primaryReason = 'locationMatch';
        }
    }

    // 3. Deadline urgency (opportunities closing within 30 days score higher)
    if (opportunity.deadline) {
        const daysLeft = (new Date(opportunity.deadline) - new Date()) / (1000 * 60 * 60 * 24);
        if (daysLeft > 0 && daysLeft <= 30) {
            score += WEIGHTS.deadlineSoon;
            if (primaryReason === 'general') primaryReason = 'deadlineSoon';
        }
        // Exclude expired opportunities
        if (daysLeft < 0) score -= 100;
    }

    // 4. Course keyword relevance
    if (course) {
        const courseWords = course.toLowerCase().split(/[\s,./\-]+/).filter(w => w.length > 2);
        for (const word of courseWords) {
            if (oppDesc.includes(word) || oppEligibility.includes(word)) {
                score += WEIGHTS.courseRelevance;
                if (primaryReason === 'general') primaryReason = 'courseRelevance';
                break;
            }
        }
    }

    // 5. Recency boost (newer opportunities get slight priority)
    if (opportunity.createdAt) {
        const ageInDays = (new Date() - new Date(opportunity.createdAt)) / (1000 * 60 * 60 * 24);
        if (ageInDays < 14) score += WEIGHTS.recencyBoost;
    }

    // 6. Small randomness factor to shuffle results between requests
    score += Math.random() * 3;

    return { score, primaryReason, matchedPreference };
}


// ── Reason & Tip Generator ────────────────────────────────

/**
 * Generates a personalized reason string based on match type.
 */
function generateReason(primaryReason, opportunity, userProfile) {
    const templates = reasonTemplates[primaryReason] || reasonTemplates.general;
    const template = templates[Math.floor(Math.random() * templates.length)];

    return template
        .replace('{category}', opportunity.category || 'opportunity')
        .replace('{preference}', userProfile._matchedPref || opportunity.category || 'your interests')
        .replace('{location}', opportunity.location || userProfile.location || 'your area')
        .replace('{course}', userProfile.course || 'your field');
}

/**
 * Picks a relevant tip for the opportunity type.
 */
function generateTip(category) {
    const tips = tipTemplates[category] || tipTemplates['Scholarship'];
    return tips[Math.floor(Math.random() * tips.length)];
}


// ── Main Export: Generate Local Recommendations ───────────

/**
 * Queries MongoDB for real opportunities, scores them against
 * the user profile, and returns the top 4 as recommendation cards.
 *
 * @param {object} userProfile - { course, category, location, preferences, income }
 * @returns {Promise<{success: boolean, recommendations: array, message: string}>}
 */
async function getLocalRecommendations(userProfile) {
    try {
        // Fetch active opportunities (deadline not passed)
        const query = { deadline: { $gte: new Date() } };

        // STRICT REQUIREMENT: Only fetch categories selected by the user
        if (userProfile.preferredOpportunityTypes && userProfile.preferredOpportunityTypes.length > 0) {
            query.category = { $in: userProfile.preferredOpportunityTypes };
        }

        const opportunities = await Opportunity.find(query).sort({ createdAt: -1 }).limit(50);

        if (opportunities.length === 0) {
            // No opportunities in DB — generate profile-based suggestions
            return generateProfileBasedSuggestions(userProfile);
        }

        // Score every opportunity against the user profile
        const scored = opportunities.map(opp => {
            const { score, primaryReason, matchedPreference } = scoreOpportunity(opp, userProfile);
            return { opportunity: opp, score, primaryReason, matchedPreference };
        });

        // Sort by score (highest first) and pick top 6
        scored.sort((a, b) => b.score - a.score);
        const top6 = scored.slice(0, 6);

        // Transform into recommendation cards
        const recommendations = top6.map(item => {
            userProfile._matchedPref = item.matchedPreference;
            return {
                title: item.opportunity.title,
                type: item.opportunity.category,
                reason: generateReason(item.primaryReason, item.opportunity, userProfile),
                tip: generateTip(item.opportunity.category),
                opportunityId: item.opportunity._id.toString()
            };
        });

        return {
            success: true,
            recommendations,
            message: 'Personalized recommendations based on your profile'
        };

    } catch (error) {
        console.error('❌ Local recommendation error:', error.message);
        return {
            success: false,
            recommendations: [],
            message: 'Unable to generate recommendations at this time.'
        };
    }
}


// ── Profile-Based Suggestions (no DB opportunities) ───────

/**
 * When the database has no active opportunities, generates
 * smart suggestions purely from the user's profile data.
 * These tell the user what TYPES of opportunities to look for.
 */
function generateProfileBasedSuggestions(userProfile) {
    const { course, category, location, preferences } = userProfile;
    const types = ['Scholarship', 'Internship', 'Job', 'Freelancing', 'Workshop / Training', 'Hackathon'];

    // Prioritize types the user is interested in
    let prioritized = [];
    if (preferences && preferences.length > 0) {
        prioritized = preferences.filter(p => types.includes(p));
    }

    // Fill remaining slots with other types
    const remaining = types.filter(t => !prioritized.includes(t));
    const selected = [...prioritized, ...remaining].slice(0, 6);

    const suggestions = selected.map(type => {
        const courseText = course || 'your field';
        const locationText = location || 'your region';

        const reasons = {
            'Scholarship': `${courseText} students are eligible for many scholarships — keep watching for new listings.`,
            'Internship': `Hands-on experience in ${courseText} will strengthen your resume significantly.`,
            'Freelancing': `Freelance gigs in ${locationText} can support your academic projects and build experience.`,
            'Workshop / Training': `Skill-building workshops will give you a competitive edge in ${courseText}.`,
            'Job': `Full-time roles in your field are great for long-term career growth in ${courseText}.`,
            'Hackathon': `Collaborating in Hackathons is a great way to build projects in ${courseText}.`
        };

        return {
            title: `${type} Opportunities for ${courseText} Students`,
            type: type,
            reason: reasons[type],
            tip: generateTip(type),
            opportunityId: null // No specific DB opportunity for these generic suggestions
        };
    });

    return {
        success: true,
        recommendations: suggestions,
        message: 'Suggestions based on your profile — new opportunities are added regularly!'
    };
}


module.exports = { getLocalRecommendations };
