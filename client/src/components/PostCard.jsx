import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { timeAgo } from '../utils';
import Avatar from './Avatar.jsx';
import CommentSection from './CommentSection.jsx';

export default function PostCard({ post: initial, onDeleted }) {
  const { user } = useAuth();
  const [post, setPost] = useState(initial);
  const [open, setOpen] = useState(false);
  const mine = post.author._id === user._id;

  const toggleLike = async () => {
    // optimistic update
    setPost((p) => ({ ...p, liked: !p.liked, likesCount: p.likesCount + (p.liked ? -1 : 1) }));
    try {
      const { data } = await api.post(`/posts/${post._id}/like`);
      setPost((p) => ({ ...p, liked: data.liked, likesCount: data.likesCount }));
    } catch {
      setPost(initial);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this post and its comments?')) return;
    await api.delete(`/posts/${post._id}`);
    onDeleted(post._id);
  };

  return (
    <article className="card post">
      <header className="row between">
        <Link to={`/u/${post.author.username}`} className="row author">
          <Avatar username={post.author.username} name={post.author.name} />
          <div>
            <div className="strong">{post.author.name || post.author.username}</div>
            <div className="muted small-text">@{post.author.username} · {timeAgo(post.createdAt)}</div>
          </div>
        </Link>
        {mine && <button className="link-btn" onClick={remove}>Delete</button>}
      </header>

      <p className="post-text">{post.text}</p>
      {post.image && <img className="post-img" src={post.image} alt="" loading="lazy" onError={(e) => (e.target.style.display = 'none')} />}

      <footer className="row actions">
        <button className={`action ${post.liked ? 'liked' : ''}`} onClick={toggleLike} aria-pressed={post.liked}>
          {post.liked ? '♥' : '♡'} {post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}
        </button>
        <button className="action" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
        </button>
      </footer>

      {open && (
        <CommentSection
          post={post}
          onCountChange={(d) => setPost((p) => ({ ...p, commentsCount: p.commentsCount + d }))}
        />
      )}
    </article>
  );
}
