const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Scholarship', 'Internship', 'Job', 'Freelancing', 'Workshop / Training', 'Hackathon'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    eligibility: {
        type: String,
        required: [true, 'Eligibility is required']
    },
    organization: {
        type: String,
        required: [true, 'Organization name is required'],
        trim: true
    },
    location: {
        type: String,
        default: 'Not specified'
    },
    applicationLink: {
        type: String,
        required: [true, 'Application link is required']
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline is required']
    },
    tags: {
        type: [String],
        default: []
    },
    skills: {
        type: [String],
        default: []
    },
    // Category-specific fields
    isPaid: {
        type: Boolean,
        default: false
    },
    stipend: {
        type: String,
        trim: true
    },
    experience: {
        type: String,
        trim: true
    },
    academicRequirements: {
        type: String,
        trim: true
    },
    incomeCriteria: {
        type: String,
        trim: true
    },
    // Hackathon specific
    prizePool: {
        type: String,
        trim: true
    },
    teamSize: {
        type: String,
        trim: true
    },
    mode: {
        type: String,
        enum: ['Online', 'Offline', 'Hybrid', ''],
        default: ''
    },
    duration: {
        type: String,
        trim: true
    },
    // Freelancing specific
    budget: {
        type: String,
        trim: true
    },
    projectType: {
        type: String,
        enum: ['One-time', 'Ongoing', 'Part-time', ''],
        default: ''
    },
    freelanceSkills: {
        type: [String],
        default: []
    },
    freelanceExperience: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Expert', ''],
        default: ''
    },
    requiredFileLabel: {
        type: String,
        default: 'Resume' // Default label for the required upload
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Opportunity', opportunitySchema);
