const User = require('./models/User');
const bcrypt = require('bcryptjs');

const mongoose = require('mongoose');
const Article = require('./models/Article');
const Comment = require('./models/Comment');
const mongoDB =
  'mongodb+srv://contactphilipclark:ZSsRP9jFoWGNITZP@cluster0.yqv9q4z.mongodb.net/?retryWrites=true&w=majority';
mongoose
  .connect(mongoDB)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB', err);
  });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const users = [];
const articles = [];
const comments = [];
const createUser = async () => {
  try {
    const hashedPassword = await bcrypt.hash('password', 10);
    const user = new User({
      email: 'email@domain.com',
      password: hashedPassword,
      userName: 'username',
    });
    await user.save();
    users.push(user);
    console.log('User created successfully');
  } catch (error) {
    console.log('Error creating user');
  }
};

const dropUsers = async () => {
  try {
    await User.deleteMany({});
    console.log('Users dropped successfully');
  } catch (error) {
    console.log('Error dropping users');
  }
};

const createArticle = async () => {
  try {
    const article = new Article({
      title: 'Article Title',
      content: 'Article content',
      author: users[0]._id,
    });
    await article.save();
    articles.push(article);
    console.log('Article created successfully');
  } catch (error) {
    console.log('Error creating article');
  }
};

const dropArticles = async () => {
  try {
    await Article.deleteMany({});
    console.log('Articles dropped successfully');
  } catch (error) {
    console.log('Error dropping articles');
  }
};

const createComment = async () => {
  try {
    const comment = new Comment({
      content: 'Comment content',
      author: users[0]._id,
      article: articles[0]._id,
    });
    await comment.save();
    console.log('Comment created successfully');
  } catch (error) {
    console.log('Error creating comment');
  }
};

const dropComments = async () => {
  try {
    await Comment.deleteMany({});
    console.log('Comments dropped successfully');
  } catch (error) {
    console.log('Error dropping comments');
  }
};

const run = async () => {
  await dropUsers();
  await dropArticles();
  await dropComments();
  await createUser();
  await createArticle();
  await createComment();

  db.close();
  console.log('MongoDB connection closed');
};

run();
