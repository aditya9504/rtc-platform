import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Bell, Search, Plus, Wifi } from 'lucide-react';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/editor': 'Code Editor',
  '/sessions': 'Sessions',
  '/reviews': 'Code Reviews',
  '/pull-requests': 'Pull Requests',
  '/profile': 'Profile',
  '/settings': 'Settings',
};

export default function Navbar() {
  const location = useLocation();
  const { user } = useSelector(s => s.auth);
  const title = pageTitles[location.pathname] || 'RTC Platform';

  return (
    <header className="h-16 bg-bg-secondary border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      {/* Left: Page title */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
        <div className="flex items-center gap-1.5 text-xs text-accent-green">
          <Wifi size={12} />
          <span className="font-mono">connected</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search size={14} className="absolute left-3 text-text-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-bg-tertiary border border-border text-text-secondary text-sm rounded-xl pl-8 pr-4 py-2 w-48 focus:outline-none focus:border-accent-purple/50 focus:w-64 transition-all duration-200"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-text-muted hover:text-text-primary hover:bg-bg-hover rounded-xl transition-all">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-purple rounded-full"></span>
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-purple to-accent-blue flex items-center justify-center cursor-pointer hover:shadow-glow-sm transition-all">
          <span className="text-white text-xs font-bold">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
      </div>
    </header>
  );
}
