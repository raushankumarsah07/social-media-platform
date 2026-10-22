import { useState } from 'react';
import api from '../api';

export default function FollowButton({ userId, isFollowing, onChange }) {
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      const { data } = await api.post(`/users/${userId}/follow`);
      onChange(data);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button className={`btn small ${isFollowing ? 'ghost' : ''}`} onClick={toggle} disabled={busy}>
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}
