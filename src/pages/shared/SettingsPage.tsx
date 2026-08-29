import React, { useState } from 'react';
import { Bell, CheckCircle2, CreditCard, Download, Globe2, KeyRound, LockKeyhole, LogOut, Monitor, Settings as SettingsIcon, ShieldCheck, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { Button } from '../../components/ui/Button';

export const SettingsPage: React.FC = () => {
  const { currentUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [payoutMethod, setPayoutMethod] = useState('bank');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [currency, setCurrency] = useState('INR');
  const [twoFactor, setTwoFactor] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [privacy, setPrivacy] = useState(true);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const handlePasswordChange = (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length >= 8 && password === confirmPassword) {
      setPassword('');
      setConfirmPassword('');
      setPasswordSaved(true);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Workspace preferences</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-white sm:text-3xl"><SettingsIcon className="h-7 w-7 text-blue-400" /> Settings</h1>
        <p className="mt-1 text-xs text-slate-400">Manage notifications, payment preferences, and account security.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl sm:p-8"><SectionTitle icon={<Bell className="h-5 w-5 text-amber-400" />} title="Notifications" description="Choose which activity should appear in your notification center." /><div className="mt-6 space-y-3"><Toggle label="Project updates" description="New invitations, applications, and checkpoint activity." checked={projectUpdates} onChange={setProjectUpdates} /><Toggle label="Payment alerts" description="Deposits, releases, payouts, and refunds." checked={paymentAlerts} onChange={setPaymentAlerts} /><Toggle label="Security alerts" description="Sign-ins, account changes, and governance notices." checked={securityAlerts} onChange={setSecurityAlerts} /></div></section>
          <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl sm:p-8"><SectionTitle icon={<Globe2 className="h-5 w-5 text-blue-400" />} title="Regional preferences" description="Set how dates, times, and amounts are displayed across your workspace." /><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-300">Timezone<select value={timezone} onChange={(event) => setTimezone(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm font-normal text-white"><option>Asia/Kolkata</option><option>UTC</option><option>America/New_York</option><option>Europe/London</option></select></label><label className="text-xs font-semibold text-slate-300">Currency<select value={currency} onChange={(event) => setCurrency(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm font-normal text-white"><option>INR</option><option>USD</option><option>EUR</option><option>GBP</option></select></label></div></section>
        </div>

        <div className="space-y-6"><section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl"><SectionTitle icon={<CreditCard className="h-5 w-5 text-emerald-400" />} title="Payment preferences" description={currentUser.role === 'freelancer' ? 'Choose the default destination for future payouts.' : 'Review how payment activity is communicated.'} />{currentUser.role === 'freelancer' ? <select value={payoutMethod} onChange={(event) => setPayoutMethod(event.target.value)} className="mt-5 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white"><option value="bank">HDFC Bank •••• 8821</option><option value="upi">UPI: ananya@upi</option></select> : <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-xs leading-relaxed text-blue-100">All project deposits are secured in KEYStone custody before work begins.</div>}</section><section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl"><SectionTitle icon={<KeyRound className="h-5 w-5 text-purple-400" />} title="Password & authentication" description="Protect your account with a new password and optional two-factor authentication." /><form onSubmit={handlePasswordChange} className="mt-5 space-y-3"><input type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white" /><input type="password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm new password" className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white" /><div className="flex items-center gap-3"><Button type="submit" size="sm">Update password</Button>{passwordSaved && <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Password updated</span>}</div></form><Toggle label="Two-factor authentication" description="Require a verification code on new sign-ins." checked={twoFactor} onChange={setTwoFactor} /></section><section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl"><SectionTitle icon={<Monitor className="h-5 w-5 text-blue-400" />} title="Sessions & privacy" description="Control where your account data is visible and revoke other sessions." /><div className="mt-5 space-y-3"><Toggle label="Profile visibility" description="Allow your profile and activity to be discovered by relevant users." checked={privacy} onChange={setPrivacy} /><div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 p-4"><div><p className="text-xs font-semibold text-white">Current session</p><p className="mt-1 text-[11px] text-slate-400">This browser · Active now</p></div><span className="text-[10px] font-bold uppercase text-emerald-400">Active</span></div><Button type="button" variant="outline" size="sm" onClick={handleSignOut} leftIcon={<LogOut className="h-4 w-4" />}>Sign out all other devices</Button></div></section>{currentUser.role === 'admin' && <section className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 shadow-xl"><SectionTitle icon={<ShieldCheck className="h-5 w-5 text-amber-400" />} title="Platform controls" description="Administrative defaults for governance operations." /><div className="mt-5 space-y-3"><Toggle label="Require report review notes" description="Keep an explanation attached to every report resolution." checked={securityAlerts} onChange={setSecurityAlerts} /><Toggle label="Pause new project intake" description="Temporarily stop new public project submissions." checked={projectUpdates} onChange={setProjectUpdates} /></div></section>}<div className="flex flex-wrap gap-3"><Button type="button" variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={() => window.alert('Your account export is being prepared.')}>Export my data</Button><Button type="button" variant="danger" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => window.alert('Account deletion requires support confirmation.')}>Delete account</Button></div></div>
      </div>
    </div>
  );
};

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => <div><h2 className="flex items-center gap-2 text-lg font-bold text-white">{icon}{title}</h2><p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p></div>;
const Toggle: React.FC<{ label: string; description: string; checked: boolean; onChange: (value: boolean) => void }> = ({ label, description, checked, onChange }) => <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4"><span><span className="block text-xs font-semibold text-white">{label}</span><span className="mt-1 block text-[11px] text-slate-400">{description}</span></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 shrink-0 accent-blue-500" /></label>;
