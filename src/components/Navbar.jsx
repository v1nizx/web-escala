import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-green-950/90 border-b border-green-800/50">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg tracking-tight"
        >
          <img src="/logo-pascom.png" alt="PASCOM" className="h-9 w-auto" />
          <span className="bg-gradient-to-r from-green-400 to-amber-400 bg-clip-text text-transparent">
            Escala
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/admin"
                className="text-sm font-medium px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
              >
                Admin
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
