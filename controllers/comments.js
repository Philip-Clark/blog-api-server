const { body } = require('express-validator');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Article = require('../models/Article');
const Comment = require('../models/Comment');
const he = require('he');

exports.getComments = async (req, res) => {
  const comments = (
    await Comment.find({ article: req.params.articleID }).populate('author', 'userName')
  ).map((comment) => {
    comment.content = he.decode(comment.content);
    return comment;
  });

  res.status(200).send({ comments, message: 'Comments' });
};

exports.getComment = async (req, res) => {
  const comment = await Comment.findById(req.params.id).populate('author', 'userName').exec();
  if (!comment) return res.status(404).send('Comment not found');
  res.status(200).send({ comment, message: 'Comment' });
};

exports.createComment = [
  body('content', 'Content is required').trim().isLength({ min: 1 }).escape(),
  body('author', 'Author is required').trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.params.id) return res.status(400).send('Article ID is required');
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).send('Article not found');

    const comment = new Comment({
      content: req.body.content,
      author: req.body.author,
      article: article._id,
    });
    comment.populate('author', 'userName');
    await comment.save();
    res.status(201).send({ comment, message: 'Comment successfully created' });
  }),
];

exports.updateComment = [
  body('content', 'Content is required').trim().isLength({ min: 1 }).escape(),
  body('author', 'Author is required').trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!comment) return res.status(404).send('Comment not found');

    res.status(200).send({ comment, message: 'Comment successfully updated' });
  }),
];

exports.deleteComment = async (req, res) => {
  const comment = await Comment.findByIdAndDelete(req.params.id);
  if (!comment) return res.status(404).send('Comment not found');

  res.status(200).send({ comment, message: 'Comment successfully deleted' });
};
