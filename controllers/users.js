const { body } = require('express-validator');
const asyncHandler = require('express-async-handler');
const { validationResult } = require('express-validator');
const Article = require('../models/Article');
const Comment = require('../models/Comment');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('userName');
  res.send({ users, message: 'Users' });
});

exports.getUser = asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) return res.status(401).send('Unauthorized');
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send('User not found');
  res.status(200).send({ user, message: 'User' });
});

exports.createUser = [
  body('email', 'Email must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('email', 'email must be valid').isEmail().escape(),
  body('password', 'Password must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('userName', 'user name must not be empty.').trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: errors.array() });
    }

    const hashed = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      email: req.body.email.toLowerCase(),
      password: hashed,
      userName: req.body.userName,
    });
    res.status(200).send({ user, message: 'User created' });
  }),
];

exports.updateUser = [
  body('email', 'Email must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('password', 'Password must not be empty.').trim().isLength({ min: 1 }).escape(),
  body('userName', 'user name must not be empty.').trim().isLength({ min: 1 }).escape(),

  asyncHandler(async (req, res) => {
    if (req.user.id !== req.params.id) return res.status(401).send('Unauthorized');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).send({ errors: errors.array() });
    }
    const hashed = await bcrypt.hash(req.body.password, 10);
    const oldUser = await User.findById(req.params.id);
    const user = new User({
      email: req.body.email.toLowerCase(),
      password: hashed,
      userName: req.body.userName,
      date: oldUser.date,
      _id: oldUser._id,
    });

    const newUser = await User.findByIdAndUpdate(req.params.id, user);
    res.status(200).send({ newUser, message: 'User updated' });
  }),
];

exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id) return res.status(401).send('Unauthorized');
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).send('User not found');
  res.status(200).send({ user, message: 'User deleted' });
});
