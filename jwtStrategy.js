const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

const opts = {};

const mongoDB = process.env.MONGODB_URI;
mongoose
  .connect(mongoDB)
  .then(() => console.log('MongoDB connected...'))
  .catch((err) => console.log(err));
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.TOKEN_SECRET;

module.exports = new JwtStrategy(opts, async (jwt_payload, done) => {
  const emailMatch = await User.findOne({ email: jwt_payload.email });
  return done(null, emailMatch);
});
