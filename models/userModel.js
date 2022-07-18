// MODULES //
const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// CREATING USERSCHEMA //
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    // maxlength: [
    //   40,
    //   'A user name must be equal to or must have less than 40 characters',
    // ],
    // minlength: [
    //   10,
    //   'A user name must be equal to or must have more than 10 charactersF',
    // ],
  },
  email: {
    type: String,
    required: [true, 'A user must have an email address'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address'],
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A user must confirm a password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords don't match!",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// MIDDLEWARE BETWEEN GETTING DATA AND SAVING TO DB //
/*
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});
*/

// REMOVE NON-ACTIVE USERS FROM THE LIST //
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// CHECKING LOGIN PASSWORDS //
userSchema.methods.isCorrectPassword = function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

// CHECKING IF THE PASSWORD IS CHANGED //
userSchema.methods.changedPassword = function (JWT_Timestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 100,
      10
    );

    return changedTimestamp < JWT_Timestamp;
  }

  return false;
};

// Creating user password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  // console.log({ resetToken }, this.passwordResetToken);

  return resetToken;
};

// PROVIDING USER //
const User = mongoose.model('User', userSchema);

// EXPORT //
module.exports = User;
