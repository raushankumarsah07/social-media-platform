import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Avatar from '../components/Avatar.jsx';
import FollowButton from '../components/FollowButton.jsx';

export default function People() {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState([]);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      api.get('/users', { params: { q } }).then((res) => setUsers(res.data));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const update = (id, data) =>
    setUsers((list) => list.map((u) => (u._id === id ? { ...u, isFollowing: data.isFollowing } : u)));

  return (
    <>
      <h2 className="page-title">Find people</h2>
      <input className="search" placeholder="Search by name or username" value={q} onChange={(e) => setQ(e.target.value)} />
      {users.length === 0 && <div className="card empty">No one found.</div>}
      {users.map((u) => (
        <div className="card row between" key={u._id}>
          <Link to={`/u/${u.username}`} className="row author">
            <Avatar username={u.username} name={u.name} />
            <div>
              <div className="strong">{u.name || u.username}</div>
              <div className="muted small-text">@{u.username}</div>
              {u.bio && <div className="small-text">{u.bio}</div>}
            </div>
          </Link>
          <FollowButton userId={u._id} isFollowing={u.isFollowing} onChange={(d) => update(u._id, d)} />
        </div>
      ))}
    </>
  );
}
