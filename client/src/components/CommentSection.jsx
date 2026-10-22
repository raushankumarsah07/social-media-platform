import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { timeAgo } from '../utils';
import Avatar from './Avatar.jsx';

export default function CommentSection({ post, onCountChange }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/posts/${post._id}/comments`).then((res) => setComments(res.data));
  }, [post._id]);

  const add = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post(`/posts/${post._id}/comments`, { text });
      setComments((c) => [...c, data]);
      onCountChange(1);
      setText('');
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const remove = async (id) => {
    await api.delete(`/posts/${post._id}/comments/${id}`);
    setComments((c) => c.filter((x) => x._id !== id));
    onCountChange(-1);
  };

  return (
    <div className="comments">
      {comments === null && <p className="muted small-text">Loading comments…</p>}
      {comments?.length === 0 && <p className="muted small-text">No comments yet. Start the conversation.</p>}
      {comments?.map((c) => (
        <div className="comment" key={c._id}>
          <Avatar username={c.author.username} name={c.author.name} size={28} />
          <div className="comment-body">
            <div>
              <Link to={`/u/${c.author.username}`} className="strong">{c.author.name || c.author.username}</Link>{' '}
              <span className="muted small-text">{timeAgo(c.createdAt)}</span>
            </div>
            <p>{c.text}</p>
          </div>
          {(c.author._id === user._id || post.author._id === user._id) && (
            <button className="link-btn" onClick={() => remove(c._id)}>Delete</button>
          )}
        </div>
      ))}
      <form className="row" onSubmit={add}>
        <input
          placeholder="Add a comment"
          value={text}
          maxLength={300}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn small" disabled={!text.trim()}>Reply</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
