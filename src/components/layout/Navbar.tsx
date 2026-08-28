import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Bell, User as UserIcon, LogOut, ChevronDown, Menu, X, Sparkles, LayoutDashboard } from 'lucide-react';
import { useAuthStore, useNotificationStore } from '../../store';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { currentUser, isAuthenticated, logout } = useAuthStore();
  const { notifications } = useNotificationStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardRoute = () => {
    if (currentUser.role === 'client') return '/client/dashboard';
    if (currentUser.role === 'freelancer') return '/freelancer/dashboard';
    return '/admin/dashboard';
  };

  return (
    <nav className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                KEY<span className="text-blue-400">Stone</span>
              </span>
              <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase -mt-1">
                Trust Protocol
              </span>
            </div>
          </Link>

          {/* Public Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link to="/marketplace" className="hover:text-blue-400 transition-colors">
              Marketplace
            </Link>
            <Link to="/how-it-works" className="hover:text-blue-400 transition-colors">
              How It Works
            </Link>
            <Link to="/security" className="hover:text-blue-400 transition-colors">
              Security
            </Link>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardRoute()}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3.5 py-1.5 rounded-xl transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                {/* Notifications */}
                <Link
                  to={`${getDashboardRoute().replace('/dashboard', '/notifications')}`}
                  className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 transition-colors"
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
                    <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2 border-b border-slate-800 mb-1">
                        <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{currentUser.role} Account</p>
                      </div>

                      <Link
                        to={getDashboardRoute()}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-400" />
                        Go to Dashboard
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
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" rightIcon={<Sparkles className="w-3.5 h-3.5" />}>
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-3">
          <Link
            to="/marketplace"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-white"
          >
            Marketplace
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-white"
          >
            How It Works
          </Link>
          <Link
            to="/security"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-300 hover:text-white"
          >
            Security
          </Link>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <Link
                to={getDashboardRoute()}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-sm font-bold text-blue-400"
              >
                Go to Dashboard
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
