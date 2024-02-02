const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content: { type: String, required: true },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: { type: Date, required: true, default: Date.now },
  likes: { type: Number, required: true, default: 0 },
  article: {
    type: Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
  },
});

module.exports = mongoose.model('Comment', commentSchema);
