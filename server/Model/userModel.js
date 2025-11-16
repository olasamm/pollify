const mongoose = require('mongoose');
const userSchema = require('../Schemas/userSchemas');

const User = mongoose.model('User', userSchema);

module.exports = User;