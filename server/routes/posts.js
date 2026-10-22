const router = require('express').Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');
const auth = require('../middleware/auth');

const AUTHOR_FIELDS = 'username name';
const PAGE_SIZE = 10;

// Shape posts for the client: like count, liked-by-me, comment count
async function decorate(posts, userId) {
  const ids = posts.map((p) => p._id);
  const counts = await Comment.aggregate([
    { $match: { post: { $in: ids } } },
    { $group: { _id: '$post', n: { $sum: 1 } } },
  ]);
  const byPost = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));

  return posts.map((p) => ({
    _id: p._id,
    text: p.text,
    image: p.image,
    author: p.author,
    createdAt: p.createdAt,
    likesCount: p.likes.length,
    liked: p.likes.some((l) => String(l) === String(userId)),
    commentsCount: byPost[String(p._id)] || 0,
  }));
}

// GET /api/posts?scope=following|all&author=<userId>&page=1
router.get('/', auth, async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const filter = {};

  if (req.query.author) {
    filter.author = req.query.author;
  } else if (req.query.scope !== 'all') {
    const followingIds = await Follow.find({ follower: req.user.id }).distinct('following');
    filter.author = { $in: [...followingIds, req.user.id] };
  }

  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE + 1) // one extra to know if there's another page
    .populate('author', AUTHOR_FIELDS)
    .lean();

  const hasMore = posts.length > PAGE_SIZE;
  const items = await decorate(posts.slice(0, PAGE_SIZE), req.user.id);
  res.json({ posts: items, hasMore });
});

// POST /api/posts
router.post('/', auth, async (req, res) => {
  const text = (req.body.text || '').trim();
  const image = (req.body.image || '').trim();
  if (!text) return res.status(400).json({ message: 'Write something before posting.' });
  if (image && !/^https?:\/\//i.test(image))
    return res.status(400).json({ message: 'Image must be a link starting with http:// or https://' });

  const post = await Post.create({ author: req.user.id, text, image });
  await post.populate('author', AUTHOR_FIELDS);
  const [item] = await decorate([post.toObject()], req.user.id);
  res.status(201).json(item);
});

// DELETE /api/posts/:id  (author only)
router.delete('/:id', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found.' });
  if (String(post.author) !== req.user.id)
    return res.status(403).json({ message: 'You can only delete your own posts.' });

  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();
  res.json({ message: 'Post deleted.' });
});

// POST /api/posts/:id/like  -> toggle like
router.post('/:id/like', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found.' });

  const already = post.likes.some((l) => String(l) === req.user.id);
  if (already) post.likes.pull(req.user.id);
  else post.likes.push(req.user.id);
  await post.save();

  res.json({ liked: !already, likesCount: post.likes.length });
});

// GET /api/posts/:id/comments
router.get('/:id/comments', auth, async (req, res) => {
  const comments = await Comment.find({ post: req.params.id })
    .sort({ createdAt: 1 })
    .populate('author', AUTHOR_FIELDS)
    .lean();
  res.json(comments);
});

// POST /api/posts/:id/comments
router.post('/:id/comments', auth, async (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) return res.status(400).json({ message: 'Write a comment first.' });

  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found.' });

  const comment = await Comment.create({ post: post._id, author: req.user.id, text });
  await comment.populate('author', AUTHOR_FIELDS);
  res.status(201).json(comment);
});

// DELETE /api/posts/:postId/comments/:commentId  (comment author or post author)
router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.status(404).json({ message: 'Comment not found.' });
  const post = await Post.findById(comment.post);
  const allowed = String(comment.author) === req.user.id || (post && String(post.author) === req.user.id);
  if (!allowed) return res.status(403).json({ message: "You can't delete this comment." });

  await comment.deleteOne();
  res.json({ message: 'Comment deleted.' });
});

module.exports = router;
