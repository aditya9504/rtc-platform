import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  LayoutDashboard, Code2, GitPullRequest, MessageSquareCode,
  Users, Settings, LogOut, ChevronLeft, ChevronRight, Zap, User
} from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';
import { toggleSidebar } from '../../redux/slices/uiSlice';
import { disconnectSocket } from '../../services/socket';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/editor', icon: Code2, label: 'Editor' },
  { to: '/sessions', icon: Users, label: 'Sessions' },
  { to: '/reviews', icon: MessageSquareCode, label: 'Reviews' },
  { to: '/pull-requests', icon: GitPullRequest, label: 'Pull Requests' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { sidebarOpen } = useSelector(s => s.ui);
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    disconnectSocket();
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className={`${sidebarOpen ? 'w-60' : 'w-16'} flex-shrink-0 h-screen flex flex-col transition-all duration-300 border-r border-border bg-bg-secondary relative`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-border min-h-[64px]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center flex-shrink-0 shadow-glow-sm">
          <Zap size={16} className="text-white" />
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-text-primary leading-tight whitespace-nowrap">RTC Platform</p>
            <p className="text-xs text-text-muted whitespace-nowrap">Code Review</p>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="absolute -right-3 top-16 w-6 h-6 bg-bg-tertiary border border-border rounded-full flex items-center justify-center z-10 hover:bg-accent-purple/20 hover:border-accent-purple/30 transition-all duration-200"
      >
        {sidebarOpen ? <ChevronLeft size={12} className="text-text-muted" /> : <ChevronRight size={12} className="text-text-muted" />}
      </button>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''} ${!sidebarOpen ? 'justify-center' : ''}`
            }
            title={!sidebarOpen ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className={`p-3 border-t border-border ${!sidebarOpen ? 'flex justify-center' : ''}`}>
        {sidebarOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-text-primary truncate">{user?.username}</p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-text-muted hover:text-accent-red transition-colors p-1 rounded"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="text-text-muted hover:text-accent-red transition-colors p-2 rounded-lg hover:bg-accent-red/10"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
