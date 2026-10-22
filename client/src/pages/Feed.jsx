import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Command,
  Compass,
  Heart,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import PostForm from "../components/PostForm.jsx";
import PostList from "../components/PostList.jsx";
import SocialOrbit from "../components/SocialOrbit.jsx";

export default function Feed() {
  const { user } = useAuth();
  const [scope, setScope] = useState("following");
  const [posts, setPosts] = useState([]);
  const [people, setPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [networkLoading, setNetworkLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (pg, sc) => {
    setLoading(true);
    const { data } = await api.get("/posts", {
      params: { page: pg, scope: sc },
    });
    setPosts((prev) => (pg === 1 ? data.posts : [...prev, ...data.posts]));
    setHasMore(data.hasMore);
    setPage(pg);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(1, scope);
  }, [scope, load]);

  useEffect(() => {
    api
      .get("/users")
      .then(({ data }) => setPeople(data))
      .catch(() => setPeople([]))
      .finally(() => setNetworkLoading(false));
  }, []);

  const latestPosts = posts.slice(0, 3);
  const likes = posts.reduce((sum, post) => sum + post.likesCount, 0);
  const comments = posts.reduce((sum, post) => sum + post.commentsCount, 0);
  const engagement = likes + comments;

  return (
    <div className="dashboard">
      <section className="dashboard-hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="pulse-dot" /> LIVE NETWORK{" "}
            <span className="eyebrow-rule" /> OCT 22, 2026
          </div>
          <h1>
            Your social
            <br />
            <em>orbit.</em>
          </h1>
          <p>
            See what is moving through your circle, then jump into the
            conversation.
          </p>
          <div className="hero-actions">
            <a className="hero-link" href="#compose">
              <Sparkles size={16} /> Share an update <ArrowUpRight size={15} />
            </a>
            <span className="hero-note">
              <Command size={14} /> Powered by your network
            </span>
          </div>
        </div>
        <div className="hero-orbit-wrap">
          <SocialOrbit people={people} onSelect={setSelectedPerson} />
          <div className="orbit-caption">
            <span>01</span> drag to explore <span className="caption-line" />
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        <main className="dashboard-main">
          <div className="section-heading">
            <div>
              <span className="section-kicker">THE PULSE</span>
              <h2>Latest from your circle</h2>
            </div>
            <div className="scope-switch" role="tablist">
              <button
                role="tab"
                aria-selected={scope === "following"}
                className={scope === "following" ? "active" : ""}
                onClick={() => setScope("following")}
              >
                Following
              </button>
              <button
                role="tab"
                aria-selected={scope === "all"}
                className={scope === "all" ? "active" : ""}
                onClick={() => setScope("all")}
              >
                Everyone
              </button>
            </div>
          </div>
          <div id="compose">
            <PostForm onCreated={(p) => setPosts((list) => [p, ...list])} />
          </div>
          <PostList
            posts={posts}
            setPosts={setPosts}
            hasMore={hasMore}
            loading={loading}
            onLoadMore={() => load(page + 1, scope)}
            empty={
              scope === "following"
                ? "Your feed is empty. Follow people to bring your orbit to life."
                : "No posts yet. Be the first to post."
            }
          />
        </main>

        <aside className="dashboard-rail">
          <div className="rail-heading">
            <span>NETWORK SIGNAL</span>
            <Activity size={17} />
          </div>
          <div className="metric-card coral">
            <div className="metric-icon">
              <Heart size={17} />
            </div>
            <div>
              <strong>{likes}</strong>
              <span>likes in view</span>
            </div>
            <b>+18%</b>
          </div>
          <div className="metric-card mint">
            <div className="metric-icon">
              <MessageCircle size={17} />
            </div>
            <div>
              <strong>{comments}</strong>
              <span>conversations</span>
            </div>
            <b>+{comments ? 12 : 0}%</b>
          </div>
          <div className="metric-card gold">
            <div className="metric-icon">
              <Users size={17} />
            </div>
            <div>
              <strong>{people.length}</strong>
              <span>people discoverable</span>
            </div>
            <b>LIVE</b>
          </div>

          <div className="rail-panel">
            <div className="rail-heading">
              <span>QUICK READ</span>
              <Compass size={16} />
            </div>
            {selectedPerson ? (
              <div className="selected-person">
                <div className="selected-avatar">
                  {(selectedPerson.name ||
                    selectedPerson.username ||
                    "?")[0].toUpperCase()}
                </div>
                <div>
                  <strong>
                    {selectedPerson.name || selectedPerson.username}
                  </strong>
                  <span>@{selectedPerson.username}</span>
                </div>
                <a
                  href={`/u/${selectedPerson.username}`}
                  aria-label="Open profile"
                >
                  <ArrowUpRight size={16} />
                </a>
              </div>
            ) : (
              <div className="empty-signal">
                <span className="signal-bars">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <p>Select a node in the orbit to inspect a person.</p>
              </div>
            )}
            <div className="rail-divider" />
            <div className="mini-label">ENGAGEMENT INDEX</div>
            <div className="engagement-row">
              <strong>{engagement}</strong>
              <span>total reactions</span>
              <div className="engagement-bar">
                <i style={{ width: `${Math.min(100, engagement * 8 + 8)}%` }} />
              </div>
            </div>
          </div>

          <div className="rail-panel activity-panel">
            <div className="rail-heading">
              <span>RECENT SIGNALS</span>
              <span className="live-label">LIVE</span>
            </div>
            {networkLoading ? (
              <p className="rail-muted">Mapping your network…</p>
            ) : latestPosts.length ? (
              latestPosts.map((post) => (
                <div className="activity-item" key={post._id}>
                  <span className="activity-avatar">
                    {(post.author.name ||
                      post.author.username)[0].toUpperCase()}
                  </span>
                  <p>
                    <strong>{post.author.name || post.author.username}</strong>{" "}
                    shared a thought{" "}
                    <span>
                      {post.likesCount} likes · {post.commentsCount} replies
                    </span>
                  </p>
                </div>
              ))
            ) : (
              <p className="rail-muted">Your next signal starts the story.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
