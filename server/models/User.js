const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    name: { type: String, trim: true, maxlength: 50, default: '' },
    bio: { type: String, trim: true, maxlength: 160, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
