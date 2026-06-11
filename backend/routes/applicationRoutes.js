const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { uploadResume } = require('../middleware/uploadMiddleware');
const { getUserApplications, createApplication, getOpportunityApplications, updateApplicationStatus } = require('../controllers/applicationController');

// GET /api/applications (protected)
router.get('/', protect, getUserApplications);

// POST /api/applications (protected)
router.post('/', protect, uploadResume.single('resume'), createApplication);

// GET /api/applications/opportunity/:id (admin only)
router.get('/opportunity/:id', protect, adminOnly, getOpportunityApplications);

// PUT /api/applications/:id/status (admin only)
router.put('/:id/status', protect, adminOnly, updateApplicationStatus);

module.exports = router;
