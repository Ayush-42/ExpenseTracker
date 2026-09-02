import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../context/ProfileContext';
import Avatar from './Avatar';
import logo from '../assets/logo.svg';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { currentUser, signOut } = useAuth();
  const { photoURL, displayName } = useProfile();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/dashboard/expenses', label: 'Expenses', icon: '💰' },
    { path: '/dashboard/categories', label: 'Categories', icon: '📁' },
    { path: '/dashboard/reports', label: 'Reports', icon: '📈' },
    { path: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      
      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={logo} alt="Expense Tracker" className="sidebar-logo-img" />
            <span className="sidebar-title">Expense Tracker</span>
          </div>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`sidebar-menu-item ${
                    location.pathname === item.path ? 'active' : ''
                  }`}
                  onClick={onClose}
                >
                  <span className="sidebar-menu-icon">{item.icon}</span>
                  <span className="sidebar-menu-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          {currentUser && (
            <div className="sidebar-user">
              <Link to="/dashboard/settings" className="sidebar-user-avatar" onClick={onClose}>
                <Avatar src={photoURL} name={displayName} email={currentUser.email} size={40} />
              </Link>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{displayName || 'User'}</div>
                <div className="sidebar-user-email">{currentUser.email}</div>
              </div>
            </div>
          )}
          <button className="sidebar-signout-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

