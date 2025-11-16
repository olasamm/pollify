const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mail: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
}, {
    timestamps: true,
    collection: 'users' // Explicitly set collection name
});

module.exports = userSchema;