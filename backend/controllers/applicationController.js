const Application = require('../models/Application');
const { sendStatusEmail } = require('../services/emailService');

// @desc    Get all applications for the current user
// @route   GET /api/applications
const getUserApplications = async (req, res) => {
    try {
        const applications = await Application.find({ userId: req.user._id })
            .populate('opportunityId', 'title organization category deadline isPaid stipend experience academicRequirements incomeCriteria requiredFileLabel')
            .sort({ appliedDate: -1 });

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Submit a new application
// @route   POST /api/applications
const createApplication = async (req, res) => {
    try {
        const { opportunityId } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Resume file is required.' });
        }

        // Check if user already applied
        const existingApp = await Application.findOne({
            userId: req.user._id,
            opportunityId
        });

        if (existingApp) {
            return res.status(400).json({ message: 'You have already applied for this opportunity.' });
        }

        // Store relative path to resume
        const resumeUrl = `/uploads/resumes/${req.file.filename}`;

        const application = await Application.create({
            userId: req.user._id,
            opportunityId,
            resumeUrl
        });

        // Trigger 'Applied' Email (Non-blocking)
        Application.findById(application._id)
            .populate('userId', 'name email')
            .populate('opportunityId', 'title organization')
            .then(populatedApp => {
                if (populatedApp && populatedApp.userId && populatedApp.opportunityId) {
                    sendStatusEmail({
                        to: populatedApp.userId.email,
                        applicantName: populatedApp.userId.name,
                        opportunityTitle: populatedApp.opportunityId.title,
                        organizationName: populatedApp.opportunityId.organization,
                        status: 'Applied'
                    });
                }
            })
            .catch(err => console.error('📧 Applied email prep error:', err.message));

        res.status(201).json({
            message: 'Application submitted successfully',
            application
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get applications for a specific opportunity (Admin only)
// @route   GET /api/applications/opportunity/:id
const getOpportunityApplications = async (req, res) => {
    try {
        const applications = await Application.find({ opportunityId: req.params.id })
            .populate('userId', 'name email course category location')
            .sort({ appliedDate: -1 });

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update application status (Admin only)
// @route   PUT /api/applications/:id/status
const updateApplicationStatus = async (req, res) => {
    try {
        const { status, reviewNotes, interviewDate } = req.body;

        const application = await Application.findById(req.params.id);
        
        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        // Track old status for email comparison
        const oldStatus = application.status;

        // Update fields explicitly
        if (status) {
            application.status = status;
            
            // Only add to history if status actually changed or it's a first-time update
            if (oldStatus !== status) {
                application.statusHistory.push({
                    status: status,
                    date: new Date(),
                    note: reviewNotes || 'Status updated by administrator.'
                });
            }
        }
        
        if (reviewNotes !== undefined) {
            application.reviewNotes = reviewNotes;
        }
        
        if (interviewDate) {
            application.interviewDate = interviewDate;
        }
        
        // Ensure updatedAt is refreshed
        application.updatedAt = new Date();
        
        // Save and wait for MongoDB confirmation
        const updatedApplication = await application.save();
        
        // Trigger Email Notification (Non-blocking)
        if (oldStatus !== status) {
            Application.findById(updatedApplication._id)
                .populate('userId', 'name email')
                .populate('opportunityId', 'title organization')
                .then(fullApp => {
                    if (fullApp && fullApp.userId && fullApp.opportunityId) {
                        sendStatusEmail({
                            to: fullApp.userId.email,
                            applicantName: fullApp.userId.name,
                            opportunityTitle: fullApp.opportunityId.title,
                            organizationName: fullApp.opportunityId.organization,
                            status: status
                        });
                    }
                })
                .catch(err => console.error('📧 Status email prep error:', err.message));
        }
        
        res.json({
            message: 'Application status updated successfully',
            application: updatedApplication
        });
    } catch (error) {
        console.error('❌ Application update error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getUserApplications, createApplication, getOpportunityApplications, updateApplicationStatus };
