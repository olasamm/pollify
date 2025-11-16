const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    pollId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Poll', 
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    userName: { type: String, required: true },
    userAvatar: { type: String, default: '' },
    text: { type: String, required: true, maxlength: 1000 },
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: String }, // 'user' or 'admin'
    likes: [{ 
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        likedAt: { type: Date, default: Date.now }
    }],
    replies: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: { type: String, required: true },
        userAvatar: { type: String, default: '' },
        text: { type: String, required: true, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
        isEdited: { type: Boolean, default: false },
        editedAt: { type: Date },
        isDeleted: { type: Boolean, default: false }
    }]
}, {
    timestamps: true,
    collection: 'comments'
});

module.exports = commentSchema;

