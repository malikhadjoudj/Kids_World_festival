import { NavLink, Link, useNavigate } from 'react-router-dom';
import { adminLogout } from '../../services/api';
import './AdminSidebar.css';

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__header">
        <Link to="/" className="admin-sidebar__logo">
          <span className="admin-sidebar__logo-icon">🌍</span>
          <div>
            <span className="admin-sidebar__logo-name">KIDS WORLD</span>
            <span className="admin-sidebar__logo-sub">FESTIVAL</span>
          </div>
        </Link>
        <span className="admin-sidebar__role">🛡️ Admin MELEVEN</span>
      </div>

      <nav className="admin-sidebar__nav">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
          }
        >
          <span className="admin-sidebar__link-icon">📊</span>
          Tableau de bord
        </NavLink>
        <NavLink
          to="/admin/plan"
          className={({ isActive }) =>
            `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
          }
        >
          <span className="admin-sidebar__link-icon">🗺️</span>
          Plan de salle
        </NavLink>
        <NavLink
          to="/admin/visites"
          className={({ isActive }) =>
            `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
          }
        >
          <span className="admin-sidebar__link-icon">👀</span>
          Visites
        </NavLink>
      </nav>

      <div className="admin-sidebar__footer">
        <Link to="/" className="admin-sidebar__back">
          ← Retour au site
        </Link>
        <button
          onClick={handleLogout}
          style={{
            marginTop: '0.6rem',
            width: '100%',
            padding: '0.5rem',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '6px',
            color: 'inherit',
            cursor: 'pointer',
          }}
        >
          🔒 Se déconnecter
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
