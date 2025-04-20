import express from 'express';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github';
import User from '../models/User.js';
import dotenv from 'dotenv';
import { generateToken } from '../utils/jwt.js';
import { authenticateJWT } from '../middlewares/auth.js';
import cookieParser from 'cookie-parser';

dotenv.config();
const router = express.Router();

// Use cookie parser
router.use(cookieParser());

// GitHub OAuth settings
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const CALLBACK_URL = `${process.env.DOMAIN}/api/auth/github/callback`;
const FRONTEND_URL = process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000';

// Set up GitHub strategy
passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: CALLBACK_URL,
  scope: ['user:email', 'repo'] // Scope to access user repositories
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Find or create user
    let user = await User.findOne({ githubId: profile.id });
    
    if (user) {
      // Update user with new access token and login time
      user.accessToken = accessToken;
      user.refreshToken = refreshToken || user.refreshToken;
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        githubId: profile.id,
        displayName: profile.displayName,
        username: profile.username,
        profileUrl: profile.profileUrl,
        photos: profile.photos?.map(photo => photo.value) || [],
        email: profile.emails?.[0]?.value,
        accessToken,
        refreshToken
      });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// GitHub auth routes
router.get('/github', passport.authenticate('github'));

// GitHub callback route
router.get('/github/callback',
  passport.authenticate('github', { 
    failureRedirect: `${FRONTEND_URL}/login`,
    session: false
  }),
  (req, res) => {
    // Generate JWT Token
    const token = generateToken(req.user);
    
    // Set token in cookie (httpOnly for security)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    
    // Also return token in response for storing in localStorage
    res.redirect(`${FRONTEND_URL}/callback?token=${token}`);
  }
);

// Logout route
router.get('/logout', (req, res) => {
  // Clear the JWT cookie
  res.clearCookie('token');
  
  // Also logout from Passport session
  req.logout((err) => {
    if (err) { return next(err); }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Check if user is authenticated
router.get('/status', authenticateJWT, (req, res) => {
  res.json({ 
    authenticated: true, 
    user: {
      id: req.user._id,
      githubId: req.user.githubId,
      displayName: req.user.displayName,
      username: req.user.username,
      avatar: req.user.photos?.[0]
    } 
  });
});

// Fallback route for unauthenticated requests
router.get('/status/public', (req, res) => {
  res.json({ authenticated: false });
});

export default router; 