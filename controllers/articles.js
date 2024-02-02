const { body, header } = require('express-validator');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Article = require('../models/Article');
const he = require('he');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.getArticles = async (req, res) => {
  const articles = (await Article.find().populate('author', 'userName')).map((article) => {
    article.content = he.decode(article.content);
    article.title = he.decode(article.title);
    return article;
  });

  res.status(200).send({ articles: articles, message: 'Articles' });
};

exports.getArticle = async (req, res) => {
  const article = await Article.findById(req.params.id).populate('author', 'userName').exec();
  if (!article) return res.status(404).send('Article not found');
  article.content = he.decode(article.content);
  article.title = he.decode(article.title);
  res.status(200).send({ article: article, message: 'Article' });
};

exports.createArticle = [
  body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('content', 'Content must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: errors.array() });
    }

    if (req.body.status) {
      const validStatuses = ['draft', 'published', 'archived', 'unpublished'];
      const statusValid = validStatuses.includes(req.body.status);
      if (!statusValid) return res.status(422).send({ message: 'Invalid status' });
    }

    const article = await Article.create(req.body);
    res.status(200).send({ article: article, message: 'Article created' });
  }),
];

exports.updateArticle = [
  body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('content', 'Content must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: errors.array() });
    }

    const decoded = jwt.decode(req.headers.authorization.split(' ')[1], {
      complete: true,
      json: true,
    });

    if (!decoded) return res.status(401).send({ message: 'Unauthorized' });
    if (!decoded.payload.email) return res.status(401).send({ message: 'Unauthorized' });

    const author = await User.findById(req.body.author);
    if (decoded.payload.email != author.email)
      return res.status(401).send({ message: 'Unauthorized' });

    if (req.body.status) {
      const validStatuses = ['draft', 'published', 'archived', 'unpublished'];
      const statusValid = validStatuses.includes(req.body.status);
      if (!statusValid) return res.status(422).send({ message: 'Invalid status' });
    }
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).send({ article: article, message: 'Article updated' });
  }),
];

exports.deleteArticle = async (req, res) => {
  const article = await Article.findByIdAndDelete(req.params.id);
  res.status(200).send({ article: article, message: 'Article deleted' });
};
