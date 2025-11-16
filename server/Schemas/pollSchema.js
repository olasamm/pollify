const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: { 
        type: String, 
        enum: ['General', 'Sports', 'Politics', 'Entertainment', 'Technology', 'Business', 'Education', 'Health', 'Food', 'Travel', 'Other'],
        default: 'General'
    },
    options: [{
        text: { type: String, required: true },
        votes: { type: Number, default: 0 }
    }],
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    createdByName: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['open', 'closed'], 
        default: 'open' 
    },
    voters: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        votedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }
}, {
    timestamps: true,
    collection: 'polls' // Explicitly set collection name
});

module.exports = pollSchema;


