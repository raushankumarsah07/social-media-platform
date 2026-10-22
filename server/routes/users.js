const router = require('express').Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const auth = require('../middleware/auth');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/users?q=  -> search people (excludes me), with follow state
router.get('/', auth, async (req, res) => {
  const q = (req.query.q || '').trim();
  const filter = { _id: { $ne: req.user.id } };
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ username: rx }, { name: rx }];
  }
  const users = await User.find(filter).select('-email').sort({ createdAt: -1 }).limit(20).lean();
  const followed = await Follow.find({
    follower: req.user.id,
    following: { $in: users.map((u) => u._id) },
  }).distinct('following');
  const set = new Set(followed.map(String));
  res.json(users.map((u) => ({ ...u, isFollowing: set.has(String(u._id)) })));
});

// PUT /api/users/me  -> edit own profile
router.put('/me', auth, async (req, res) => {
  const { name, bio } = req.body;
  const user = await User.findById(req.user.id);
  if (typeof name === 'string') user.name = name.trim().slice(0, 50) || user.username;
  if (typeof bio === 'string') user.bio = bio.trim().slice(0, 160);
  await user.save();
  res.json({ _id: user._id, username: user.username, email: user.email, name: user.name, bio: user.bio });
});

// GET /api/users/:username  -> profile + counts
router.get('/:username', auth, async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() }).select('-email').lean();
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const [postsCount, followersCount, followingCount, isFollowing] = await Promise.all([
    Post.countDocuments({ author: user._id }),
    Follow.countDocuments({ following: user._id }),
    Follow.countDocuments({ follower: user._id }),
    Follow.exists({ follower: req.user.id, following: user._id }),
  ]);

  res.json({ ...user, postsCount, followersCount, followingCount, isFollowing: !!isFollowing });
});

// POST /api/users/:id/follow  -> toggle follow / unfollow
router.post('/:id/follow', auth, async (req, res) => {
  if (req.params.id === req.user.id)
    return res.status(400).json({ message: "You can't follow yourself." });

  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'User not found.' });

  const removed = await Follow.findOneAndDelete({ follower: req.user.id, following: target._id });
  if (!removed) await Follow.create({ follower: req.user.id, following: target._id });

  const followersCount = await Follow.countDocuments({ following: target._id });
  res.json({ isFollowing: !removed, followersCount });
});

module.exports = router;
