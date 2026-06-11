const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, updatePreferences, toggleBookmark, getBookmarks, getDashboardStats } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me (protected)
router.get('/me', protect, getMe);

// PUT /api/auth/profile (protected)
router.put('/profile', protect, updateProfile);

// PUT /api/auth/preferences (protected)
router.put('/preferences', protect, updatePreferences);

// POST /api/auth/bookmarks (protected) - toggle bookmark
router.post('/bookmarks', protect, toggleBookmark);

// GET /api/auth/bookmarks (protected) - get bookmarked opportunities
router.get('/bookmarks', protect, getBookmarks);

// GET /api/auth/dashboard-stats (protected) - dashboard statistics
router.get('/dashboard-stats', protect, getDashboardStats);

module.exports = router;
