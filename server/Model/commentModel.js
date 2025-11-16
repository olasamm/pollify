const mongoose = require('mongoose');
const commentSchema = require('../Schemas/commentSchema');

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;

