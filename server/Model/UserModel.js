const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const defaultAvatar = require('../Lib/Lib'); // Make sure this exports a string URL or path

dotenv.config();

const userSchema = new Schema({
  _id: { type: String, default: uuidv4 },
  email: { type: String, unique: true },
  username: { type: String, unique: true, trim: true},
  password: { type: String },
  avatar: { type: String, default: defaultAvatar },

  // OAuth-specific fields
  githubId: { type: String },
  googleId: { type: String },

  // Authentication
  refreshToken: { type: String },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  lastActive: { type: Date, default: Date.now },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  // Gamification
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  dailyStreak: { type: Number, default: 0 },
  lastStreakDate: { type: Date },
  badges: [{ type: String }],
  achievements: [{
    name: String,
    description: String,
    icon: String,
    unlockedAt: { type: Date, default: Date.now },
    xpReward: Number
  }],
  rank: { type: Number, default: 0 },
  eloRating: { type: Number, default: 1000 },

  // Progress Tracking
  completedChallenges: [{
    challenge: { type: Schema.Types.ObjectId, ref: 'Challenge' },
    completionDate: { type: Date, default: Date.now },
    score: Number,
    codeSolution: String,
    timeTaken: Number
  }],
  battleHistory: [{
    opponent: { type: Schema.Types.ObjectId, ref: 'User' },
    result: { type: String, enum: ['win', 'loss', 'draw'] },
    challenge: { type: Schema.Types.ObjectId, ref: 'Challenge' },
    date: { type: Date, default: Date.now },
    scoreEarned: Number
  }],
  activeBattle: { type: Schema.Types.ObjectId, ref: 'Battle' },

  // Social Features
  clan: { type: Schema.Types.ObjectId, ref: 'Clan' },
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  profile: {
    bio: String,
    github: String,
    leetcode: String,
    skills: [{ type: String }]
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      delete ret.password;
      delete ret.refreshToken;
      return ret;
    }
  }
});

// Indexes
userSchema.index({ username: 'text' });
userSchema.index({ eloRating: -1 });
userSchema.index({ xp: -1 });

// Password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT (no role included)
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// Static method to update battle result
userSchema.statics.updateBattleResult = async function (
  userId,
  result,
  opponentId,
  challengeId,
  scoreEarned
) {
  await this.findByIdAndUpdate(userId, {
    $push: {
      battleHistory: {
        opponent: opponentId,
        result,
        challenge: challengeId,
        scoreEarned
      }
    },
    $inc: { xp: scoreEarned }
  });
};

const User = mongoose.model('User', userSchema);
module.exports = User;
