import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Feed from './pages/Feed.jsx';
import Profile from './pages/Profile.jsx';
import People from './pages/People.jsx';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="center muted">Loading…</p>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <main className="container">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <AuthPage mode="login" />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <AuthPage mode="register" />} />
          <Route path="/" element={<Protected><Feed /></Protected>} />
          <Route path="/people" element={<Protected><People /></Protected>} />
          <Route path="/u/:username" element={<Protected><Profile /></Protected>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}
