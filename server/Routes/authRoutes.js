const express = require('express');
const passport = require('passport');
const authController = require('../Controllers/authControllers');
const authenticate = require('../Middleware/authenticate'); // JWT authentication middleware
const router = express.Router();

// Sign-up via email/password
router.post('/signup/email', authController.signupWithEmail);

// Email verification
router.get('/verify-email/:token', authController.verifyEmail); 

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { session: false }), authController.signupWithGithub);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), authController.signupWithGoogle);

// Login via email/password
router.post('/login', authController.login);

// Logout (JWT-based authentication)
router.post('/logout', authenticate, authController.logout);

// Forgot password
router.post('/forgot-password', authController.forgotPassword);

// Reset password
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
