const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const authorizeBearerToken = require('../middlewares/jsonwebtoken');
const User = require('../models/User');

// Configure Passport to use Google OAuth strategy with hardcoded clientID and clientSecret
passport.use(new GoogleStrategy({
  clientID: '61948979522-f9fj3gh4045d4s7sec8aee3u7pm4098o.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Find or create a user in the database
    let user = await User.findOne({ googleId: profile.id });
    
    if (!user) {
      user = new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        displayName: profile.displayName
      });
      await user.save();
    }

    return done(null, user);
  } catch (err) {
    console.error("Error finding or creating user:", err);
    return done(err, false);
  }
}));

const router = express.Router();

// Google OAuth login route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  function (req, res) {
    if (req.isAuthenticated()) {
      // Generate JWT 
      const token = jwt.sign({ _id: req.user._id, email: req.user.email }, 'your_jwt_secret_here', {
        expiresIn: '1h' 
      });
      // Redirect with token in query string
      res.redirect(`/dashboard?token=${token}`);
    } else {
      res.redirect('/');
    }
  }
);

// Additional routes
router.post('/register', [], require('../controllers/auth/register'));
router.post('/login', [], require('../controllers/auth/login'));
router.get('/login', [authorizeBearerToken], require('../controllers/auth/login-with-token'));

module.exports = router;


