const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const apiRouter = require('./routes/api');
const passport = require('passport');
const jwtStrategy = require('./jwtStrategy');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const cors = require('cors');

//! DATABASE SETUP
dotenv.config();
const mongoDB = process.env.MONGODB_URI;
mongoose
  .connect(mongoDB)
  .then(() => console.log('MongoDB connected...'))
  .catch((err) => console.log(err));
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

passport.use(jwtStrategy);

const app = express();

//! CORS SETUP
app.use(cors());
app.options('*', cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//! JWT LOGIN SETUP
app.post('/login', async (req, res) => {
  if (!req.body) return res.status(400).json({ error: 'Request body is missing' });
  if (!req.body.email || !req.body.password)
    return res.status(400).json({ error: 'Missing email or password' });
  const password = req.body.password;
  const email = req.body.email.toLowerCase();

  const emailMatch = await User.findOne({ email: email });
  // If the email doesn't exist, or the password is incorrect, send an error. Don't tell the user which one was incorrect as a security measure
  const passwordMatch = emailMatch ? await bcrypt.compare(password, emailMatch.password) : false;
  if (!passwordMatch)
    return res.status(401).json({ error: 'Incorrect email/password combination' });

  const options = { expiresIn: '12hours' };
  const token = jwt.sign({ email }, process.env.TOKEN_SECRET, options);
  return res.status(200).json({
    message: 'Auth successful',
    token: token,
    userID: emailMatch._id,
  });
});

app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
