import { useState } from 'react';
import api, { errorMessage } from '../api';

export default function PostForm({ onCreated }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [showImage, setShowImage] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post('/posts', { text, image });
      onCreated(data);
      setText('');
      setImage('');
      setShowImage(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card composer" onSubmit={submit}>
      <textarea
        placeholder="What's on your mind?"
        value={text}
        maxLength={500}
        rows={3}
        onChange={(e) => setText(e.target.value)}
      />
      {showImage && (
        <input
          type="url"
          placeholder="Paste an image link (https://…)"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />
      )}
      {error && <p className="error">{error}</p>}
      <div className="row between">
        <div className="row">
          <button type="button" className="btn ghost small" onClick={() => setShowImage((v) => !v)}>
            {showImage ? 'Remove image' : 'Add image'}
          </button>
          <span className="muted small-text">{text.length}/500</span>
        </div>
        <button className="btn" disabled={busy || !text.trim()}>
          {busy ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  );
}
