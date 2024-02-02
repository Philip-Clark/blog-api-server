const express = require('express');
const router = express.Router();
const articles = require('../controllers/articles');
const comments = require('../controllers/comments');
const users = require('../controllers/users');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const secret = process.env.TOKEN_SECRET;

// !AUTHENTICATION
const authenticate = (req, res, next) => {
  passport.authenticate('jwt', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: 'Token expired or invalid', reason: 'expired Token' });
    }
    req.user = user;
    next();
  })(req, res, next);
};

/* GET API test page */
router.get('/test', function (req, res, next) {
  res.send('API is working properly');
});

// !ARTICLES
router.get('/articles', articles.getArticles);

router.get('/articles/:id', articles.getArticle);

router.post('/articles', authenticate, articles.createArticle);

router.put('/articles/:id', authenticate, articles.updateArticle);

router.delete('/articles/:id', authenticate, articles.deleteArticle);

// !COMMENTS
router.get('/articles/:articleID/comments', comments.getComments);

router.get('/comments/:id', comments.getComment);

router.post('/articles/:id/comments', authenticate, comments.createComment);

router.put('/comments/:id', authenticate, comments.updateComment);
router.delete('/comments/:id', authenticate, comments.deleteComment);

// !USERS
router.get('/users', authenticate, users.getUsers);
router.get('/users/:id', authenticate, users.getUser);
router.post('/users', users.createUser);
router.put('/users/:id', authenticate, users.updateUser);
router.delete('/users/:id', authenticate, users.deleteUser);

// router.post('/login', users.login);
// router.post('/logout', users.logout);
// router.post('/signup', users.signup);

module.exports = router;
