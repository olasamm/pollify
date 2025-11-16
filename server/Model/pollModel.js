const mongoose = require('mongoose');
const pollSchema = require('../Schemas/pollSchema');

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;


