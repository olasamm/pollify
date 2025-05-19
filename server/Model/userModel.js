const mongoose = require('mongoose');
const userSchema = require('../Schemas/userSchemas');

const user = mongoose.model('polls', userSchema)


module.exports = user;