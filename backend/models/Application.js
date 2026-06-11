const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    opportunityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Opportunity',
        required: [true, 'Opportunity ID is required']
    },
    status: {
        type: String,
        enum: ['Applied', 'Resume Sent', 'Under Review', 'Shortlisted', 'Interview', 'Interview Scheduled', 'Interview Completed', 'In Process', 'Offer Received', 'Accepted', 'Rejected', 'Decision'],
        default: 'Applied'
    },
    statusHistory: [{
        status: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        note: String
    }],
    resumeUrl: {
        type: String,
        required: [true, 'Resume is required to apply']
    },
    appliedDate: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    reviewNotes: {
        type: String,
        default: ''
    },
    interviewDate: {
        type: Date
    }
});

// Middleware to update updatedAt on save
applicationSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    
    // If it's a new application, ensure initial status is in history
    if (this.isNew && (!this.statusHistory || this.statusHistory.length === 0)) {
        this.statusHistory.push({
            status: this.status,
            date: new Date(),
            note: 'Application submitted.'
        });
    }
    next();
});

module.exports = mongoose.model('Application', applicationSchema);
