import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Lock, UserCheck, Briefcase } from 'lucide-react';
import { useAuthStore } from '../../store';
import { Button } from '../../components/ui/Button';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<UserRole>('client');
  const [email, setEmail] = useState('client@keystone.demo');
  const [password, setPassword] = useState('password123');

  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'client') setEmail('client@keystone.demo');
    else if (role === 'freelancer') setEmail('freelancer@keystone.demo');
    else if (role === 'admin') setEmail('admin@keystone.demo');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole);

    if (selectedRole === 'client') navigate('/client/overview');
    else if (selectedRole === 'freelancer') navigate('/freelancer/overview');
    else navigate('/admin/dashboard');
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Sign In to KEYStone</h2>
          <p className="text-xs text-slate-400">Access your private workspace and payment-protected project vault</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleRoleTabChange('client')}
            className={`py-2 rounded-xl transition-all ${
              selectedRole === 'client' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Client
          </button>
          <button
            type="button"
            onClick={() => handleRoleTabChange('freelancer')}
            className={`py-2 rounded-xl transition-all ${
              selectedRole === 'freelancer' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Freelancer
          </button>
          <button
            type="button"
            onClick={() => handleRoleTabChange('admin')}
            className={`py-2 rounded-xl transition-all ${
              selectedRole === 'admin' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {selectedRole.toUpperCase()} EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">PASSWORD</label>
              <Link to="/forgot-password" className="text-xs text-blue-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Logging in will route you directly to your private {selectedRole} portal.</span>
          </div>

          <Button variant="primary" size="lg" className="w-full" type="submit" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Sign In to {selectedRole.toUpperCase()} Portal
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-blue-400 font-bold hover:underline">
            Register New Account
          </Link>
        </div>
      </div>
    </div>
  );
};
