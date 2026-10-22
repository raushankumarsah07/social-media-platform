const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const publicUser = (u) => ({
  _id: u._id,
  username: u.username,
  email: u.email,
  name: u.name,
  bio: u.bio,
  createdAt: u.createdAt,
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { username = '', email = '', password = '', name = '' } = req.body;
  const uname = username.trim().toLowerCase();

  if (!/^[a-z0-9_]{3,20}$/.test(uname))
    return res.status(400).json({ message: 'Username must be 3–20 characters: letters, numbers or underscores.' });
  if (!/^\S+@\S+\.\S+$/.test(email))
    return res.status(400).json({ message: 'Enter a valid email address.' });
  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });

  const exists = await User.findOne({ $or: [{ username: uname }, { email: email.toLowerCase() }] });
  if (exists) return res.status(409).json({ message: 'That username or email is already taken.' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ username: uname, email, password: hashed, name: name.trim() || uname });
  res.status(201).json({ token: sign(user._id), user: publicUser(user) });
});

// POST /api/auth/login  (identifier = username or email)
router.post('/login', async (req, res) => {
  const { identifier = '', password = '' } = req.body;
  const id = identifier.trim().toLowerCase();

  const user = await User.findOne({ $or: [{ username: id }, { email: id }] }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: 'Incorrect username/email or password.' });

  res.json({ token: sign(user._id), user: publicUser(user) });
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ message: 'Account not found.' });
  res.json(publicUser(user));
});

module.exports = router;
