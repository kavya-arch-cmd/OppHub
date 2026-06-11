const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    preferences: {
        type: [String],
        default: []
    },
    preferredOpportunityTypes: {
        type: [String],
        default: []
    },
    // Profile fields for user profile page
    course: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: ''
    },
    income: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    dob: {
        type: String,
        default: ''
    },
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Opportunity'
    }],
    profileComplete: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
