import { NavLink, Link } from 'react-router-dom';
import './AdminSidebar.css';

function AdminSidebar() {
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
      </nav>

      <div className="admin-sidebar__footer">
        <Link to="/" className="admin-sidebar__back">
          ← Retour au site
        </Link>
      </div>
    </aside>
  );
}

export default AdminSidebar;
