const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'viewer'], default: 'viewer' },
});

// Hash the password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Only hash if the password is modified
  this.password = await bcrypt.hash(this.password, 10); // Hash the password with 10 salt rounds
  next();
});

// Compare the provided password with the hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password); // Compare plain text with hashed password
};

const User = mongoose.model('User', userSchema);
module.exports = User;