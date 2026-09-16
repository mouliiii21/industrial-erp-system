import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">Industrial ERP</div>
        <nav className="tabs">
          <NavLink to="/enquiries" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
            Enquiries
          </NavLink>
          <NavLink to="/quotations" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
            Quotations
          </NavLink>
          <NavLink to="/sales-orders" className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
            Sales Orders
          </NavLink>
        </nav>
        <div className="user-info">
          <span className={`role-badge role-${user?.role?.toLowerCase()}`}>{user?.role}</span>
          <span className="user-name">{user?.name}</span>
          <button className="btn btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
