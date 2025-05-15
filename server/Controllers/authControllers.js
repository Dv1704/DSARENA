const bcrypt = require('bcrypt');
const User = require('../Model/UserModel');
const crypto = require('crypto');
const sendEmail = require('../Utils/sendEmail');
const validator = require('validator');
const rateLimit = require('express-rate-limit');

// Rate limiters
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many signup attempts. Please try again later.',
  keyGenerator: (req) => `${req.ip}-${req.body.email}`
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  message: 'Too many password reset attempts. Please try again later.',
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `${req.ip}-${req.body.email}`
});

// Email Signup Controller
exports.signupWithEmail = [
  signupLimiter,
  async (req, res) => {
    const { email, username, password } = req.body;

    try {
      // Validation
      if (!email || !username || !password) {
        return res.status(400).json({ 
          success: false,
          message: 'All fields are required' 
        });
      }

      if (!validator.isEmail(email)) {
        return res.status(400).json({ 
          success: false,
          message: 'Please provide a valid email address' 
        });
      }

      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        return res.status(400).json({ 
          success: false,
          message: 'Username must be 3-20 characters (alphanumeric + underscores)' 
        });
      }

      if (password.length < 8) {
        return res.status(400).json({ 
          success: false,
          message: 'Password must be at least 8 characters' 
        });
      }

      // Check existing users
      const [existingEmail, existingUsername] = await Promise.all([
        User.findOne({ email }),
        User.findOne({ username })
      ]);

      if (existingEmail) {
        return res.status(409).json({ 
          success: false,
          message: 'Email already registered' 
        });
      }

      if (existingUsername) {
        return res.status(409).json({ 
          success: false,
          message: 'Username not available' 
        });
      }

      // Generate verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256')
        .update(emailVerificationToken)
        .digest('hex');

      // Create user - password will be hashed by pre-save hook
      const user = new User({
        email: validator.normalizeEmail(email),
        username: validator.escape(username),
        password: password, // Will be hashed automatically
        avatar: '/default-avatar.png',
        emailVerificationToken: hashedToken,
        emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000,
        lastActive: new Date()
      });

      await user.save();

      // Send verification email
      const verifyURL = `${process.env.FRONTEND_URL}/verify-email/${emailVerificationToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email Address',
        html: generateVerificationEmail(verifyURL)
      });

      res.status(201).json({ 
        success: true,
        message: 'Registration successful! Please check your email.',
        data: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });

    } catch (err) {
      console.error('Signup error:', err);
      res.status(500).json({ 
        success: false,
        message: 'Registration failed. Please try again later.' 
      });
    }
  }
];

// Email Verification


exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  
  try {
    if (!token) {
      return res.status(400).json({ 
        success: false,
        message: 'Verification token is required' 
      });
    }

    const hashedToken = crypto.createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired verification link' 
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    
    await user.save();

    res.status(200).json({ 
      success: true,
      message: 'Email successfully verified!',
      data: {
        email: user.email,
        verified: user.emailVerified
      }
    });

  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error verifying email'
    });
  }
};
// Login Controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const token = user.generateAuthToken();

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    res.status(200).json({ 
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Login failed. Please try again.' 
    });
  }
};

// Password Reset Controllers
exports.forgotPassword = [
  passwordResetLimiter,
  async (req, res) => {
    const { email } = req.body;

    try {
      if (!validator.isEmail(email)) {
        return res.status(400).json({ 
          success: false,
          message: 'Please provide a valid email address' 
        });
      }

      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal whether email exists
        return res.status(200).json({ 
          success: true,
          message: 'If this email exists, a reset link will be sent.' 
        });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256')
        .update(resetToken)
        .digest('hex');

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
      await user.save();

      const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: generatePasswordResetEmail(resetURL)
      });

      res.status(200).json({ 
        success: true,
        message: 'Password reset link sent if email exists in our system.'
      });

    } catch (err) {
      console.error('Forgot password error:', err);
      res.status(500).json({ 
        success: false,
        message: 'Error sending reset email' 
      });
    }
  }
];

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  try {
    // Validation
    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Both password fields are required" 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Passwords do not match" 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 8 characters" 
      });
    }

    // Find user by token
    const hashedToken = crypto.createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid or expired reset link" 
      });
    }

    // Check if new password is different
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({ 
        success: false,
        message: "New password must be different from current" 
      });
    }

    // Update user - password will be hashed by pre-save hook
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.passwordChangedAt = Date.now();
    
    await user.save(); // Triggers the pre-save hook for hashing

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'Password Changed Successfully',
      html: generatePasswordChangedConfirmation()
    });

    res.status(200).json({ 
      success: true,
      message: "Password updated successfully" 
    });

  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ 
      success: false,
      message: "Error resetting password" 
    });
  }
};

// OAuth Controllers
exports.signupWithGithub = async (req, res) => {
  try {
    const { user: githubUser } = req;

    let user = await User.findOne({ githubId: githubUser.githubId });
    if (user) {
      const token = user.generateAuthToken();
      return res.status(200).json({ 
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    }

    // Create new user
    user = new User({
      githubId: githubUser.githubId,
      email: githubUser.email,
      username: githubUser.username || `github-${Math.random().toString(36).substring(2, 9)}`,
      avatar: githubUser.avatar || '/default-avatar.png',
      emailVerified: true
    });

    await user.save();

    const token = user.generateAuthToken();
    res.status(201).json({ 
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error('GitHub OAuth error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Authentication failed' 
    });
  }
};

exports.signupWithGoogle = async (req, res) => {
  try {
    const { user: googleUser } = req;

    let user = await User.findOne({ googleId: googleUser.googleId });
    if (user) {
      const token = user.generateAuthToken();
      return res.status(200).json({ 
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    }

    // Create new user
    user = new User({
      googleId: googleUser.googleId,
      email: googleUser.email,
      username: googleUser.username || `google-${Math.random().toString(36).substring(2, 9)}`,
      avatar: googleUser.avatar || '/default-avatar.png',
      emailVerified: true
    });

    await user.save();

    const token = user.generateAuthToken();
    res.status(201).json({ 
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Google OAuth error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Authentication failed' 
    });
  }
};

// Logout Controller
exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict'
  });

  res.status(200).json({ 
    success: true,
    message: 'Logged out successfully' 
  });
};

// Email Template Helpers
function generateVerificationEmail(verifyURL) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to DSARENA!</h2>
      <p>Please verify your email address:</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${verifyURL}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Verify Email
        </a>
      </div>
      <p>Or copy this link to your browser:</p>
      <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
        ${verifyURL}
      </p>
      <p style="margin-top: 20px; color: #666;">
        <strong>Note:</strong> This link expires in 24 hours.
      </p>
    </div>
  `;
}

function generatePasswordResetEmail(resetURL) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Password Reset Request</h2>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${resetURL}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Reset Password
        </a>
      </div>
      <p>Or copy this link to your browser:</p>
      <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
        ${resetURL}
      </p>
      <p style="margin-top: 20px; color: #666;">
        <strong>Note:</strong> This link expires in 15 minutes.
      </p>
    </div>
  `;
}

function generatePasswordChangedConfirmation() {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Password Updated</h2>
      <p>Your password was successfully changed on ${new Date().toLocaleString()}.</p>
      <p>If you didn't make this change, please secure your account immediately.</p>
    </div>
  `;
}