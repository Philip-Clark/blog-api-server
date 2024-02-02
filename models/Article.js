const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: { type: Date, required: true, default: Date.now },
  likes: { type: Number, required: true, default: 0 },
  status: { type: String, required: true, default: 'draft' },
});

module.exports = mongoose.model('Article', articleSchema);
