import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare, Settings, LogOut, Hexagon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const getInitials = (name) => name ? name.substring(0, 2).toUpperCase() : 'U';

  return (
    <nav className="sidebar">
      <Link to="/" className="sidebar-logo">
        <Hexagon size={24} color="var(--accent-color)" fill="var(--accent-color)" fillOpacity={0.2} />
        <span>Nexus</span>
      </Link>
      
      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          Dashboard
        </Link>
        <Link to="/projects" className={`nav-link ${location.pathname.startsWith('/project') ? 'active' : ''}`}>
          <FolderKanban size={18} />
          Projects
        </Link>
        <Link to="/assessments" className={`nav-link ${location.pathname.startsWith('/assessment') ? 'active' : ''}`}>
          <CheckSquare size={18} />
          Assessments
        </Link>
      </div>

      <div className="user-profile">
        <div className="user-profile-info">
          <div className="avatar">{getInitials(user.name)}</div>
          <div className="user-details">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.role}</span>
          </div>
        </div>
        <button className="logout-btn d-flex align-center justify-center gap-1 mt-1" onClick={logout}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
