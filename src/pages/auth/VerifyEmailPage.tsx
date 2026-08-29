import React, { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, MailCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState<string>(location.state?.message || 'Enter the 6-digit code sent to your email.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resendOtp = async () => {
    setError('');
    setInfo('');
    setIsSubmitting(true);
    try {
      const response = await api.sendOtp(email);
      setInfo(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send a verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setInfo('');
    setIsSubmitting(true);
    try {
      const response = await api.verifyOtp(email, otp);
      setInfo(response.message);
      window.setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 mx-auto flex items-center justify-center">
            <MailCheck className="w-6 h-6 text-emerald-300" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Verify your email</h1>
          <p className="text-xs text-slate-400">Your account stays locked until the emailed code is verified.</p>
        </div>

        {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">{error}</div>}
        {info && <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">{info}</div>}

        <form onSubmit={verifyEmail} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">EMAIL ADDRESS</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@company.com"
              required
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">6-DIGIT OTP</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              required
              className="w-full bg-slate-950 border border-slate-800 text-white text-center text-sm tracking-[0.5em] rounded-xl p-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          <Button variant="primary" size="lg" className="w-full" type="submit" rightIcon={<ArrowRight className="w-4 h-4" />} disabled={isSubmitting || otp.length !== 6}>
            {isSubmitting ? 'Verifying...' : 'Verify email'}
          </Button>
        </form>

        <Button type="button" variant="secondary" className="w-full" onClick={resendOtp} disabled={isSubmitting || !email}>
          Resend verification code
        </Button>

        <p className="text-center text-xs text-slate-400">
          Already verified? <Link to="/login" className="text-blue-400 font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
