import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="logo">
          SMF
        </Link>
        <nav>
          <NavLink to="/" end>
            Feed
          </NavLink>
          <NavLink to="/people">People</NavLink>
          <NavLink to={`/u/${user.username}`}>Profile</NavLink>
        </nav>
        <button className="btn ghost small" onClick={logout}>
          Log out
        </button>
      </div>
    </header>
  );
}
