const https = require('https');
const { getLocalRecommendations } = require('./localRecommendationEngine');
const Opportunity = require('../models/Opportunity');

// ── Gemini REST API Config ────────────────────────────────

const GEMINI_BASE_URL = 'generativelanguage.googleapis.com';
const GEMINI_MODEL = 'gemini-2.5-flash';
let geminiApiKey = null;

/**
 * Validates and stores the Gemini API key from .env.
 * Called once and reused for all subsequent requests.
 */
function initializeGemini() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
        console.warn('⚠️  GEMINI_API_KEY is not configured. Will use local recommendation engine.');
        return false;
    }

    geminiApiKey = apiKey;
    console.log('✅ Gemini AI Engine Initialized (Direct REST)');
    return true;
}

/**
 * Calls Gemini REST API directly using Node's built-in https module.
 * @param {string} prompt - The prompt to send
 * @returns {Promise<string>} The text response from Gemini
 */
function callGeminiAPI(prompt) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        });

        const options = {
            hostname: GEMINI_BASE_URL,
            path: `/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`Gemini API ${res.statusCode}: ${data}`));
                    return;
                }
                try {
                    const json = JSON.parse(data);
                    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (!text) {
                        reject(new Error('Gemini returned empty response'));
                        return;
                    }
                    resolve(text);
                } catch (e) {
                    reject(new Error('Failed to parse Gemini response: ' + e.message));
                }
            });
        });

        req.on('error', (e) => reject(new Error('Gemini request failed: ' + e.message)));
        req.setTimeout(30000, () => { req.destroy(); reject(new Error('Gemini request timed out')); });
        req.write(payload);
        req.end();
    });
}
// ── Build the Prompt ──────────────────────────────────────

/**
 * Constructs a focused prompt from user profile data and available opportunities.
 * @param {object} userProfile - The user's profile information
 * @param {array} availableOpps - Array of real opportunities from DB
 * @returns {string} The formatted prompt for Gemini
 */
function buildPrompt(userProfile, availableOpps) {
    const { course, category, location, preferences } = userProfile;

    // Build context from whatever profile data is available
    const profileParts = [];
    if (course) profileParts.push(`Course: ${course}`);
    if (category) profileParts.push(`Category: ${category}`);
    if (location) profileParts.push(`Location: ${location}`);
    if (preferences && preferences.length > 0) {
        profileParts.push(`Career Interests: ${preferences.join(', ')}`);
    }
    if (userProfile.preferredOpportunityTypes && userProfile.preferredOpportunityTypes.length > 0) {
        profileParts.push(`Desired Opportunity Types: ${userProfile.preferredOpportunityTypes.join(', ')}`);
    }

    const profileContext = profileParts.length > 0
        ? profileParts.join('\n')
        : 'No specific profile data available.';

    // Format available opportunities for Gemini
    const oppsContext = availableOpps.map((opp, index) =>
        `[${index}] TITLE: "${opp.title}" | TYPE: "${opp.category}" | ORG: "${opp.organization}" | DESCRIPTION: "${opp.description.substring(0, 100)}..."`
    ).join('\n');

    return `You are a highly personalized AI recommendation engine for students.
    
STUDENT PROFILE:
${profileContext}

AVAILABLE OPPORTUNITIES (REAL DATA):
${oppsContext}

TASK:
1. Select EXACTLY 6 unique opportunities from the "REAL DATA" list that are HIGHLY RELEVANT to the student's "Career Interests" AND "Desired Opportunity Types". Never return fewer than 6 unless fewer than 6 opportunities exist in the "REAL DATA" list.
2. You MUST EXPLAIN in the "reason" field exactly why this opportunity is a match for their specific interests. If it's a "Web Development" role and they interested in "Web Development", mention the tech stack if available.
3. Be EXTREMELY strict. Do NOT recommend an opportunity if it is only tangentially related.
4. For each selected opportunity, generate:
   - index: the [number] from the list
   - reason: a specific, personalized reason (1-2 sentences) explaining the match.
   - tip: a specific, actionable application tip (1 sentence) for this exact role.

IMPORTANT RULES: 
- NEVER recommend "AI/ML" to someone only interested in "Web Development" unless it specifically mentions web integration.
- NEVER recommend unrelated scholarships or engineering roles to tech students.
- PRIORITIZE "Desired Opportunity Types". If they want "Internships", focus heavily on those.
- Use ONLY the provided REAL DATA. 
- Respond ONLY with a valid JSON array of objects with keys: "index", "reason", "tip".

Example format:
[{"index": 0, "reason": "Since you are interested in Web Development, this Frontend Intern role at Google using React is a perfect match.", "tip": "Highlight your React projects in your portfolio."}]`;
}


// ── Generate Recommendations ──────────────────────────────

/**
 * Generates personalized recommendations using a Retrieval-Augmented approach.
 * Strategy:
 *   1. Fetch real opportunities from MongoDB first.
 *   2. Pass them to Gemini to rank and personalize.
 *   3. Re-map Gemini's selection to original DB objects.
 *
 * @param {object} userProfile - The user's profile data
 * @returns {Promise<{success: boolean, recommendations: array, message: string}>}
 */
async function getRecommendations(userProfile) {
    // ── Attempt 1: Gemini API ─────────────────────────────
    if (!geminiApiKey) {
        initializeGemini();
    }

    if (geminiApiKey) {
        try {
            // 1. Retrieve: Fetch candidates
            // We fetch all active opportunities and perform a smart pre-rank 
            // to send the most promising candidates to Gemini for final selection.

            const query = { deadline: { $gte: new Date() } };

            // STRICT REQUIREMENT: Only fetch categories selected by the user
            if (userProfile.preferredOpportunityTypes && userProfile.preferredOpportunityTypes.length > 0) {
                query.category = { $in: userProfile.preferredOpportunityTypes };
            }

            const allActive = await Opportunity.find(query).lean();

            if (allActive.length === 0) {
                console.log('ℹ️ No active opportunities found matching categories. Using local suggestions.');
                return await getLocalRecommendations(userProfile);
            }

            console.log(`🤖 Gemini Engine: Processing ${allActive.length} opportunities for ${userProfile.name}...`);

            // Smart Pre-Rank based on interests, types, and course
            const hasPreferences = userProfile.preferences && userProfile.preferences.length > 0;
            const hasTypes = userProfile.preferredOpportunityTypes && userProfile.preferredOpportunityTypes.length > 0;

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

            let scoredOpps = allActive.map(opp => {
                let score = 0;
                const title = opp.title.toLowerCase();
                const desc = opp.description.toLowerCase();
                const cat = opp.category.toLowerCase();
                const tags = (opp.tags || []).map(t => t.toLowerCase());
                const skills = (opp.skills || []).map(s => s.toLowerCase());

                const fullText = `${title} ${desc} ${cat} ${tags.join(' ')} ${skills.join(' ')}`;

                let matchedInterest = false;
                let matchedType = false;

                // 1. Interest match (Aggressive Scoring)
                if (hasPreferences) {
                    userProfile.preferences.forEach(pref => {
                        const prefLower = pref.toLowerCase();

                        // Exact match bonus
                        if (fullText.includes(prefLower)) {
                            score += 150;
                            matchedInterest = true;
                        }

                        // Related keywords match
                        const related = relatedKeywords[prefLower] || [];
                        related.forEach(word => {
                            if (fullText.includes(word)) {
                                score += 40;
                                matchedInterest = true;
                            }
                        });

                        // Tag/Skill match
                        if (tags.includes(prefLower) || skills.includes(prefLower)) {
                            score += 100;
                            matchedInterest = true;
                        }
                    });
                } else {
                    matchedInterest = true;
                }

                // 2. Type match (STRICT)
                if (hasTypes) {
                    userProfile.preferredOpportunityTypes.forEach(type => {
                        if (cat.includes(type.toLowerCase())) {
                            score += 200;
                            matchedType = true;
                        }
                    });
                } else {
                    matchedType = true;
                }

                // RELEVANCE THRESHOLD: Heavier penalty for no match
                if (!matchedInterest || !matchedType) {
                    score -= 5000;
                }

                // 3. Course match (Minor Bonus)
                if (userProfile.course) {
                    const courseLower = userProfile.course.toLowerCase();
                    if (fullText.includes(courseLower)) score += 20;
                }

                return { ...opp, searchScore: score };
            });

            // Loosen filtering: Keep top 15 by score even if they don't pass the 50 threshold
            // BUT prioritized items > 50 if they exist.
            const candidates = scoredOpps
                .sort((a, b) => b.searchScore - a.searchScore)
                .slice(0, 25);

            if (candidates.length === 0) {
                console.log('ℹ️ No candidates passed pre-ranking. Falling back to local engine.');
                return await getLocalRecommendations(userProfile);
            }

            console.log(`✨ Sending ${candidates.length} candidates to Gemini for personalization...`);

            // 2. Augment: Build prompt with filtered real DB data
            const prompt = buildPrompt(userProfile, candidates);

            // 3. Generate: Call Gemini REST API directly
            const text = await callGeminiAPI(prompt);

            // Parse the JSON response - handle possible preamble/postamble
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                console.warn('⚠️ Gemini response did not contain a JSON array:', text);
                throw new Error('Invalid Gemini response format');
            }

            const selections = JSON.parse(jsonMatch[0]);

            if (!Array.isArray(selections)) {
                throw new Error('Gemini response is not an array');
            }

            // 4. Validate & Map: Convert selections back to full opportunity objects
            const finalRecommendations = [];
            const seenIds = new Set();

            for (const selection of selections) {
                const index = parseInt(selection.index);
                if (!isNaN(index) && candidates[index]) {
                    const opp = candidates[index];

                    // Prevent duplicates
                    if (seenIds.has(opp._id.toString())) continue;
                    seenIds.add(opp._id.toString());

                    finalRecommendations.push({
                        title: opp.title,
                        type: opp.category,
                        reason: selection.reason,
                        tip: selection.tip,
                        opportunityId: opp._id.toString()
                    });
                }
                if (finalRecommendations.length >= 6) break;
            }

            console.log(`✅ Successfully generated ${finalRecommendations.length} AI recommendations`);

            return {
                success: true,
                recommendations: finalRecommendations,
                message: 'AI-powered personalized recommendations'
            };

        } catch (error) {
            console.warn('⚠️ Gemini RAG flow failed:', error.message);
            // Fall through to local engine below
        }
    }

    // ── Attempt 2: Local Recommendation Engine ────────────
    return await getLocalRecommendations(userProfile);
}


module.exports = { initializeGemini, getRecommendations };
