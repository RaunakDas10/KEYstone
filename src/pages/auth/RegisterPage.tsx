import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, UserCheck, Briefcase, Sparkles, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store';
import { Button } from '../../components/ui/Button';
import { UserRole } from '../../types';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = (searchParams.get('role') as UserRole) || 'client';
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    login(role);
    if (role === 'client') navigate('/client/dashboard');
    else if (role === 'freelancer') navigate('/freelancer/dashboard');
    else navigate('/admin/dashboard');
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Join KEYStone Protocol</h2>
          <p className="text-xs text-slate-400">Choose your role to get started with payment protection</p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => setRole('client')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              role === 'client'
                ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg glow-blue'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
              <Briefcase className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white">CLIENT</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Find trusted talent and build projects securely with escrow protection.
            </p>
          </div>

          <div
            onClick={() => setRole('freelancer')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              role === 'freelancer'
                ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg glow-blue'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
              <UserCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-white">FREELANCER</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Find work with guaranteed upfront payment protection and transparent payouts.
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Vikram Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
            <input
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <Button variant="primary" size="lg" className="w-full" type="submit" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Create {role.toUpperCase()} Account
          </Button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
