import React, { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Lock, Mail, Sparkles, Landmark, Cpu, Briefcase } from 'lucide-react';
import { useAuthStore } from '../../store';
import { Button } from '../../components/ui/Button';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle, loginAsDemoUser } = useAuthStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectToDashboard = useCallback((role: string) => {
    if (role === 'client') navigate('/client/dashboard');
    else if (role === 'freelancer') navigate('/freelancer/dashboard');
    else navigate('/admin/dashboard');
  }, [navigate]);

  const handleGoogleCredential = useCallback(async (credential: string) => {
    setError('');
    setIsSubmitting(true);
    try {
      const user = await loginWithGoogle(credential);
      redirectToDashboard(user.role);
    } finally {
      setIsSubmitting(false);
    }
  }, [loginWithGoogle, redirectToDashboard]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = await login({ email, password });
      redirectToDashboard(user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    const user = loginAsDemoUser(role);
    redirectToDashboard(user.role);
  };

  const demoAccounts = [
    {
      role: 'admin' as UserRole,
      name: 'Amit Roy',
      subtitle: 'Platform custody, audit & dispute governance',
      badge: 'ADMIN',
      badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      icon: Landmark,
    },
    {
      role: 'client' as UserRole,
      name: 'Vikram Sharma',
      subtitle: 'Founder at Nexus Labs • Project escrow funding',
      badge: 'CLIENT',
      badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      icon: Briefcase,
    },
    {
      role: 'freelancer' as UserRole,
      name: 'Ananya Roy',
      subtitle: 'Senior Full-Stack UI/UX & React Engineer',
      badge: 'DEV',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: Cpu,
    },
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 py-8">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Sign In to KEYStone</h2>
          <p className="text-xs text-slate-400">Use your work email, continue with Google, or try 1-click demo.</p>
        </div>

        {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">EMAIL ADDRESS</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 pl-9 focus:outline-none focus:border-blue-500"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">PASSWORD</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 pl-9 focus:outline-none focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <Button variant="primary" size="lg" className="w-full" type="submit" rightIcon={<ArrowRight className="w-4 h-4" />} disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In Securely'}
          </Button>
        </form>

        <div className="relative flex items-center justify-center text-xs text-slate-500">
          <div className="absolute inset-x-0 h-px bg-slate-800" />
          <span className="relative bg-slate-900 px-2">OR</span>
        </div>

        <GoogleSignInButton
          onCredential={handleGoogleCredential}
          onError={setError}
          disabled={isSubmitting}
        />

        <div className="text-center text-xs text-slate-400 pt-1">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-blue-400 font-bold hover:underline">
            Register now
          </Link>
          <span className="mx-2 text-slate-600">|</span>
          <Link to={`/verify-email${email ? `?email=${encodeURIComponent(email)}` : ''}`} className="text-blue-400 font-bold hover:underline">
            Verify email
          </Link>
        </div>

        {/* Demo Fast Ingress Login Section */}
        <div className="pt-3 border-t border-slate-800 space-y-2.5">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-amber-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Demo Fast Ingress Login</span>
          </div>

          <div className="space-y-2">
            {demoAccounts.map((acc) => {
              const IconComponent = acc.icon;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleDemoLogin(acc.role)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 transition-all text-left group shadow-sm hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${acc.iconBg}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-white group-hover:text-blue-400 transition-colors truncate">
                        {acc.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {acc.subtitle}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border ml-2 shrink-0 ${acc.badgeClass}`}>
                    {acc.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
