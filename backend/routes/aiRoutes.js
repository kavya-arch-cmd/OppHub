// OppHub - AI Recommendation Route

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getRecommendations } = require('../services/aiService');

// @desc    Get AI-powered opportunity recommendations
// @route   POST /api/ai/recommendations
// @access  Protected (requires JWT)
router.post('/recommendations', protect, async (req, res) => {
    try {
        // Build the user profile from the authenticated user + any extras from body
        const userProfile = {
            name: req.user.name,
            course: req.user.course || req.body.course || '',
            category: req.user.category || req.body.category || '',
            location: req.user.location || req.body.location || '',
            income: req.user.income || '',
            preferences: req.user.preferences || req.body.preferences || [],
            preferredOpportunityTypes: req.user.preferredOpportunityTypes || req.body.preferredOpportunityTypes || []
        };

        const result = await getRecommendations(userProfile);

        // Always return the result — both Gemini and local engine
        // use the same response shape { success, recommendations, message }
        res.status(result.success ? 200 : 503).json({
            success: result.success,
            recommendations: result.recommendations,
            message: result.message
        });

    } catch (error) {
        console.error('AI Route Error:', error.message);
        res.status(500).json({
            success: false,
            recommendations: [],
            message: 'An unexpected error occurred while generating recommendations.'
        });
    }
});

module.exports = router;
