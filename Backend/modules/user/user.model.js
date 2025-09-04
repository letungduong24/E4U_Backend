const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Họ không được để trống'],
    trim: true,
    maxlength: [50, 'Họ không được dài hơn 50 ký tự']
  },
  lastName: {
    type: String,
    required: [true, 'Tên không được để trống'],
    trim: true,
    maxlength: [50, 'Tên không được dài hơn 50 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Email không được để trống'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu không được để trống'],
    minlength: [8, 'Mật khẩu phải có tối thiểu 8 ký tự'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'teacher'],
    default: 'student'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  profile: {
    avatar: {
      type: String,
      default: null
    },
    phone: {
      type: String,
      trim: true
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['Nam', 'Nữ'],
      default: 'Nam'
    },
    address: {
      type: String,
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
      },
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});


// Index for better query performance
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update lastLogin
userSchema.pre('save', function(next) {
  if (this.isModified('lastLogin')) {
    this.lastLogin = new Date();
  }
  next();
});

// Instance method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

module.exports = mongoose.model('User', userSchema);
