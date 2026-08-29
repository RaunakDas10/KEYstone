import React, { useCallback, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, UserCheck, Briefcase, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { UserRole } from '../../types';
import { api } from '../../services/api';
import { useAuthStore } from '../../store';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultRole: UserRole = searchParams.get('role') === 'freelancer' ? 'freelancer' : 'client';
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { loginWithGoogle } = useAuthStore();

  const redirectToDashboard = useCallback((userRole: UserRole) => {
    navigate(userRole === 'freelancer' ? '/freelancer/dashboard' : '/client/dashboard');
  }, [navigate]);

  const handleGoogleCredential = useCallback(async (credential: string) => {
    setError('');
    setIsSubmitting(true);
    try {
      const user = await loginWithGoogle(credential, role);
      redirectToDashboard(user.role);
    } finally {
      setIsSubmitting(false);
    }
  }, [loginWithGoogle, redirectToDashboard, role]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setIsSubmitting(true);

    try {
      const result = await api.register({ name, email, password, role });
      navigate(`/verify-email?email=${encodeURIComponent(result.email)}`, { state: { message: result.message } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Join KEYStone Protocol</h2>
          <p className="text-xs text-slate-400">Choose your role and verify your email before accessing the platform.</p>
        </div>

        {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</div>}
        {info && <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">{info}</div>}

        <>
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

              <Button variant="primary" size="lg" className="w-full" type="submit" rightIcon={<ArrowRight className="w-4 h-4" />} disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : `Create ${role.toUpperCase()} Account`}
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
              text="signup_with"
            />
        </>

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
