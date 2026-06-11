const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                preferences: user.preferences,
                preferredOpportunityTypes: user.preferredOpportunityTypes,
                profileComplete: user.profileComplete
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                preferences: user.preferences,
                preferredOpportunityTypes: user.preferredOpportunityTypes,
                profileComplete: user.profileComplete,
                course: user.course
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
    try {
        // req.user is set by the protect middleware
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                preferences: user.preferences,
                preferredOpportunityTypes: user.preferredOpportunityTypes,
                profileComplete: user.profileComplete,
                course: user.course,
                category: user.category,
                income: user.income,
                location: user.location,
                dob: user.dob
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
    try {
        const { name, course, category, income, location, dob, preferences, preferredOpportunityTypes } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (course !== undefined) updateData.course = course;
        if (category !== undefined) updateData.category = category;
        if (income !== undefined) updateData.income = income;
        if (location !== undefined) updateData.location = location;
        if (dob !== undefined) updateData.dob = dob;
        if (preferences !== undefined) updateData.preferences = preferences;
        if (preferredOpportunityTypes !== undefined) updateData.preferredOpportunityTypes = preferredOpportunityTypes;
        updateData.profileComplete = true;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                preferences: user.preferences,
                preferredOpportunityTypes: user.preferredOpportunityTypes,
                profileComplete: user.profileComplete,
                course: user.course,
                category: user.category,
                income: user.income,
                location: user.location,
                dob: user.dob
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user preferences
// @route   PUT /api/auth/preferences
const updatePreferences = async (req, res) => {
    try {
        const { preferences, preferredOpportunityTypes } = req.body;

        const updateData = {};
        if (preferences !== undefined) updateData.preferences = preferences;
        if (preferredOpportunityTypes !== undefined) updateData.preferredOpportunityTypes = preferredOpportunityTypes;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            message: 'Preferences updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                preferences: user.preferences,
                preferredOpportunityTypes: user.preferredOpportunityTypes,
                profileComplete: user.profileComplete,
                bookmarks: user.bookmarks
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Toggle bookmark (save/unsave an opportunity)
// @route   POST /api/auth/bookmarks
const toggleBookmark = async (req, res) => {
    try {
        const { opportunityId } = req.body;
        const user = await User.findById(req.user._id);

        const index = user.bookmarks.indexOf(opportunityId);
        let action;

        if (index > -1) {
            // Remove bookmark
            user.bookmarks.splice(index, 1);
            action = 'removed';
        } else {
            // Add bookmark
            user.bookmarks.push(opportunityId);
            action = 'added';
        }

        await user.save();

        res.json({
            message: `Bookmark ${action} successfully`,
            action,
            bookmarks: user.bookmarks
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user's bookmarked opportunities
// @route   GET /api/auth/bookmarks
const getBookmarks = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('bookmarks', 'title organization category location deadline description applicationLink');

        res.json(user.bookmarks || []);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get dashboard statistics for the current user
// @route   GET /api/auth/dashboard-stats
const getDashboardStats = async (req, res) => {
    try {
        const Application = require('../models/Application');
        const Opportunity = require('../models/Opportunity');

        const [totalOpportunities, userApplications, user] = await Promise.all([
            Opportunity.countDocuments(),
            Application.countDocuments({ userId: req.user._id }),
            User.findById(req.user._id).select('bookmarks profileComplete')
        ]);

        res.json({
            totalOpportunities,
            totalApplications: userApplications,
            totalBookmarks: user.bookmarks ? user.bookmarks.length : 0,
            profileComplete: user.profileComplete
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { register, login, getMe, updateProfile, updatePreferences, toggleBookmark, getBookmarks, getDashboardStats };

