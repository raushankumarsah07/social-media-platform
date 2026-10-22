import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from '../components/Avatar.jsx';
import FollowButton from '../components/FollowButton.jsx';
import PostList from '../components/PostList.jsx';

export default function Profile() {
  const { username } = useParams();
  const { user: me, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [notFound, setNotFound] = useState('');
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '' });

  const loadPosts = async (authorId, pg) => {
    setLoading(true);
    const { data } = await api.get('/posts', { params: { author: authorId, page: pg } });
    setPosts((prev) => (pg === 1 ? data.posts : [...prev, ...data.posts]));
    setHasMore(data.hasMore);
    setPage(pg);
    setLoading(false);
  };

  useEffect(() => {
    setProfile(null);
    setNotFound('');
    setEditing(false);
    api
      .get(`/users/${username}`)
      .then(({ data }) => {
        setProfile(data);
        setForm({ name: data.name, bio: data.bio });
        loadPosts(data._id, 1);
      })
      .catch((err) => setNotFound(errorMessage(err)));
  }, [username]);

  if (notFound) return <div className="card empty">{notFound}</div>;
  if (!profile) return <p className="center muted">Loading…</p>;

  const isMe = profile._id === me._id;

  const saveProfile = async (e) => {
    e.preventDefault();
    const { data } = await api.put('/users/me', form);
    setProfile((p) => ({ ...p, name: data.name, bio: data.bio }));
    setUser((u) => ({ ...u, name: data.name, bio: data.bio }));
    setEditing(false);
  };

  return (
    <>
      <section className="card profile">
        <div className="row between top">
          <Avatar username={profile.username} name={profile.name} size={72} />
          {isMe ? (
            <button className="btn ghost small" onClick={() => setEditing((v) => !v)}>
              {editing ? 'Cancel' : 'Edit profile'}
            </button>
          ) : (
            <FollowButton
              userId={profile._id}
              isFollowing={profile.isFollowing}
              onChange={(d) => setProfile((p) => ({ ...p, isFollowing: d.isFollowing, followersCount: d.followersCount }))}
            />
          )}
        </div>

        {editing ? (
          <form onSubmit={saveProfile}>
            <label>Display name
              <input value={form.name} maxLength={50} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>Bio
              <textarea rows={3} value={form.bio} maxLength={160} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </label>
            <button className="btn">Save changes</button>
          </form>
        ) : (
          <>
            <h2 className="profile-name">{profile.name || profile.username}</h2>
            <div className="muted">@{profile.username}</div>
            {profile.bio && <p>{profile.bio}</p>}
          </>
        )}

        <dl className="stats">
          <div><dt>Posts</dt><dd>{profile.postsCount}</dd></div>
          <div><dt>Followers</dt><dd>{profile.followersCount}</dd></div>
          <div><dt>Following</dt><dd>{profile.followingCount}</dd></div>
        </dl>
      </section>

      <PostList
        posts={posts}
        setPosts={setPosts}
        hasMore={hasMore}
        loading={loading}
        onLoadMore={() => loadPosts(profile._id, page + 1)}
        empty={isMe ? "You haven't posted yet." : `${profile.name || profile.username} hasn't posted yet.`}
      />
    </>
  );
}
