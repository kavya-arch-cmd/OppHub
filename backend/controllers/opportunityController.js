const Opportunity = require('../models/Opportunity');

// @desc    Get all opportunities
// @route   GET /api/opportunities
const getOpportunities = async (req, res) => {
    try {
        const opportunities = await Opportunity.find().sort({ createdAt: -1 });
        res.json(opportunities);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single opportunity by ID
// @route   GET /api/opportunities/:id
const getOpportunityById = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);

        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found.' });
        }

        res.json(opportunity);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a new opportunity (Admin)
// @route   POST /api/opportunities
const createOpportunity = async (req, res) => {
    try {
        const opportunity = await Opportunity.create(req.body);
        res.status(201).json({ message: 'Opportunity created successfully', opportunity });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update an opportunity (Admin)
// @route   PUT /api/opportunities/:id
const updateOpportunity = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);

        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found.' });
        }

        const updated = await Opportunity.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ message: 'Opportunity updated successfully', opportunity: updated });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete an opportunity (Admin)
// @route   DELETE /api/opportunities/:id
const deleteOpportunity = async (req, res) => {
    try {
        const opportunity = await Opportunity.findById(req.params.id);

        if (!opportunity) {
            return res.status(404).json({ message: 'Opportunity not found.' });
        }

        await Opportunity.findByIdAndDelete(req.params.id);

        res.json({ message: 'Opportunity deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getOpportunities,
    getOpportunityById,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity
};
