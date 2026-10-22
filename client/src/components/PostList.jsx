import PostCard from './PostCard.jsx';

export default function PostList({ posts, setPosts, hasMore, onLoadMore, loading, empty }) {
  if (!loading && posts.length === 0) return <div className="card empty">{empty}</div>;
  return (
    <>
      {posts.map((p) => (
        <PostCard key={p._id} post={p} onDeleted={(id) => setPosts((list) => list.filter((x) => x._id !== id))} />
      ))}
      {loading && <p className="center muted">Loading…</p>}
      {hasMore && !loading && (
        <button className="btn ghost wide" onClick={onLoadMore}>Load more</button>
      )}
    </>
  );
}
