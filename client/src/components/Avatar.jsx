const COLORS = ['#3446E0', '#E5484D', '#12A594', '#D6409F', '#E58A00', '#6E56CF', '#0091FF'];

export default function Avatar({ username = '?', name, size = 40 }) {
  const hash = [...username].reduce((a, c) => a + c.charCodeAt(0), 0);
  const letter = (name || username)[0]?.toUpperCase();
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.42, background: COLORS[hash % COLORS.length] }}
      aria-hidden="true"
    >
      {letter}
    </span>
  );
}
