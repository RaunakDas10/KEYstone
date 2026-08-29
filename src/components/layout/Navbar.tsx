import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, ChevronDown, Menu, X, Home, UserRound } from 'lucide-react';
import { useAuthStore, useNotificationStore } from '../../store';
import { Button } from '../ui/Button';
import keystoneLogo from '../../assets/keystone-logo.jpg';

export const Navbar: React.FC = () => {
  const { currentUser, isAuthenticated, logout } = useAuthStore();
  const { notifications } = useNotificationStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const guestOnlyView = ['/standin', '/register', '/login', '/marketplace', '/security', '/how-it-works'].includes(location.pathname);
  const showAccount = isAuthenticated && !guestOnlyView;

  const unreadCount = notifications.filter((n) => (n.userId === currentUser.id || n.userId === 'all') && !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardRoute = () => {
    if (currentUser.role === 'client') return '/client/dashboard';
    if (currentUser.role === 'freelancer') return '/freelancer/dashboard';
    return '/admin/dashboard';
  };

  const getNotificationsRoute = () => {
    if (currentUser.role === 'client') return '/client/notifications';
    if (currentUser.role === 'freelancer') return '/freelancer/notifications';
    return '/admin/notifications';
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with micro-animation */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src={keystoneLogo}
              alt="KEYStone logo"
              className="h-9 w-9 rounded-xl object-cover shadow-lg shadow-cyan-500/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
            />
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1 group-hover:text-blue-100 transition-colors">
                KEY<span className="text-blue-400 group-hover:text-blue-300 transition-colors">Stone</span>
              </span>
              <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase -mt-1 group-hover:text-slate-300 transition-colors">
                Trust Protocol
              </span>
            </div>
          </Link>

          {/* Public Nav Links in exact sequence: Home -> How It Works -> Security -> Reach Us */}
          {!showAccount && (
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              {/* 1. Home */}
              <Link
                to="/"
                className={`relative py-1 transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-gradient-to-r after:from-blue-500 after:to-indigo-500 after:transition-all after:duration-300 ${
                  isActive('/')
                    ? 'text-white font-bold after:w-full'
                    : 'text-slate-300 hover:text-white after:w-0 hover:after:w-full'
                }`}
              >
                Home
              </Link>

              {/* 2. How It Works */}
              <Link
                to="/how-it-works"
                className={`relative py-1 transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-gradient-to-r after:from-blue-500 after:to-indigo-500 after:transition-all after:duration-300 ${
                  isActive('/how-it-works')
                    ? 'text-white font-bold after:w-full'
                    : 'text-slate-300 hover:text-white after:w-0 hover:after:w-full'
                }`}
              >
                How It Works
              </Link>

              {/* 3. Security */}
              <Link
                to="/security"
                className={`relative py-1 transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-gradient-to-r after:from-blue-500 after:to-indigo-500 after:transition-all after:duration-300 ${
                  isActive('/security')
                    ? 'text-white font-bold after:w-full'
                    : 'text-slate-300 hover:text-white after:w-0 hover:after:w-full'
                }`}
              >
                Security
              </Link>

              {/* 4. Reach Us */}
              <a
                href="mailto:support@keystone.demo"
                className="relative py-1 text-slate-300 hover:text-white transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-blue-500 after:to-indigo-500 hover:after:w-full after:transition-all after:duration-300"
              >
                Reach Us
              </a>
            </div>
          )}

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-3">
            {showAccount ? (
              <>
                {/* Home / Dashboard Icon Button */}
                <Link
                  to={getDashboardRoute()}
                  title="Go to Dashboard"
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 hover:border-slate-700 border border-slate-800 rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center"
                >
                  <Home className="w-5 h-5" />
                </Link>

                {/* Notifications */}
                <Link
                  to={getNotificationsRoute()}
                  className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-900 hover:border-slate-700 border border-slate-800 rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all duration-200 hover:scale-105"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                    <span className="text-xs font-semibold text-white max-w-[100px] truncate">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 border-b border-slate-800 mb-1">
                        <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{currentUser.role} Account</p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <UserRound className="w-4 h-4 text-blue-400" />
                        My Profile
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="hover:scale-105 transition-transform duration-200">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="shadow-lg shadow-blue-600/20 hover:scale-105 transition-transform duration-200">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg transition-transform duration-200 active:scale-95"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer with smooth slide-down animation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800 p-4 space-y-3 animate-in slide-in-from-top-3 fade-in duration-200">
          {!showAccount && (
            <div className="space-y-2">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block text-sm font-medium py-1.5 px-2 rounded-lg transition-colors ${
                  isActive('/') ? 'text-white font-bold bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/how-it-works"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block text-sm font-medium py-1.5 px-2 rounded-lg transition-colors ${
                  isActive('/how-it-works') ? 'text-white font-bold bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                How It Works
              </Link>
              <Link
                to="/security"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block text-sm font-medium py-1.5 px-2 rounded-lg transition-colors ${
                  isActive('/security') ? 'text-white font-bold bg-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                Security
              </Link>
              <a
                href="mailto:support@keystone.demo"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-sm font-medium py-1.5 px-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-900/50 transition-colors"
              >
                Reach Us
              </a>
            </div>
          )}

          {showAccount ? (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <Link
                to={getDashboardRoute()}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-sm font-bold text-blue-400"
              >
                Dashboard
              </Link>
              <button onClick={handleLogout} className="block text-sm font-medium text-rose-400">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-800 flex gap-2">
              <Link to="/login" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Log In
                </Button>
              </Link>
              <Link to="/register" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
