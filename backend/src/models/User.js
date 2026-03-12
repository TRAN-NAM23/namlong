// User model
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    trim: true,
    sparse: true // Allow null values
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      // Password required only if not Google or Facebook user
      return !this.googleId && !this.facebookId;
    }
  },
  fullname: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  googleToken: {
    type: String,
    trim: true
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true
  },
  facebookToken: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  cover: {
    type: String,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  },
  verificationExpires: {
    type: Date
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'shipper'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);