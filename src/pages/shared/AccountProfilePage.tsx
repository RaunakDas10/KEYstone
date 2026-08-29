import React, { useEffect, useState } from 'react';
import { Award, BriefcaseBusiness, CheckCircle2, Mail, MapPin, Save, UserRound } from 'lucide-react';
import { useAuthStore, useProjectStore } from '../../store';
import { Button } from '../../components/ui/Button';
import type { User } from '../../types';

const FREELANCER_ROLE_OPTIONS = [
  'Frontend Developer', 'Backend Developer', 'Full-stack Developer', 'Mobile Developer',
  'UI/UX Designer', 'Product Designer', 'Graphic Designer', 'Data Analyst',
  'Data Scientist', 'AI/ML Engineer', 'DevOps Engineer', 'QA Engineer',
  'Content Writer', 'Digital Marketer', 'Project Manager',
];

type ProfileForm = {
  name: string; email: string; avatar: string; title: string; bio: string; company: string;
  location: string; skills: string; showLocalTime: boolean; freelancerRoles: string[];
  role: 'client' | 'freelancer' | 'admin';
  roles: ('client' | 'freelancer' | 'admin')[];
};

const formFromUser = (user: User): ProfileForm => ({
  name: user.name,
  email: user.email,
  avatar: user.avatar || '',
  title: user.title || '',
  bio: user.bio || '',
  company: user.company || '',
  location: user.location || '',
  skills: user.skills?.join(', ') || '',
  showLocalTime: user.showLocalTime || false,
  freelancerRoles: user.freelancerRoles || [],
  role: user.role || 'client',
  roles: user.roles && user.roles.length > 0 ? user.roles : [user.role || 'client'],
});

export const AccountProfilePage: React.FC = () => {
  const { currentUser, updateProfile } = useAuthStore();
  const { projects } = useProjectStore();
  const [form, setForm] = useState<ProfileForm>(() => formFromUser(currentUser));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(formFromUser(currentUser));
    setSaved(false);
    setError('');
  }, [currentUser]);

  const isFreelancer = currentUser.role === 'freelancer';
  const userProjects = projects.filter((project) =>
    isFreelancer ? project.freelancerId === currentUser.id : project.clientId === currentUser.id
  );
  const projectLabel = isFreelancer ? 'Projects taken' : 'Projects posted';
  const completed = userProjects.filter((project) => project.status === 'completed').length;

  const updateField = <K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
  };

  const toggleAccountRole = (role: 'client' | 'freelancer' | 'admin') => {
    const nextRoles = form.roles.includes(role)
      ? form.roles.filter((r) => r !== role)
      : [...form.roles, role];
    const finalRoles = nextRoles.length > 0 ? nextRoles : [role];
    updateField('roles', finalRoles);
    if (!finalRoles.includes(form.role)) {
      updateField('role', finalRoles[0]);
    }
  };

  const toggleFreelancerRole = (role: string) => {
    updateField('freelancerRoles', form.freelancerRoles.includes(role)
      ? form.freelancerRoles.filter((item) => item !== role)
      : [...form.freelancerRoles, role]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await updateProfile({
        name: form.name.trim(),
        role: form.role,
        roles: form.roles,
        avatar: form.avatar.trim() || undefined,
        title: form.title.trim(),
        bio: form.bio.trim(),
        company: form.company.trim(),
        location: form.location.trim(),
        skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
        showLocalTime: form.showLocalTime,
        ...(form.roles.includes('freelancer') || form.role === 'freelancer' ? { freelancerRoles: form.freelancerRoles } : {}),
      });
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Your profile could not be saved.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-2">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4"><img src={currentUser.avatar} alt="" className="h-20 w-20 rounded-3xl border-2 border-blue-500/40 object-cover" /><div><div className="flex gap-2"><h1 className="text-2xl font-black text-white sm:text-3xl">{currentUser.name}</h1>{currentUser.verified && <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-300">VERIFIED</span>}</div><div className="mt-1 flex items-center gap-2"><span className="text-sm font-semibold text-blue-400">{currentUser.title || `${currentUser.role} account`}</span><span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-300 border border-blue-500/20">{currentUser.role}</span></div></div></div>
          <div className="grid grid-cols-3 gap-3"><Metric label={projectLabel} value={userProjects.length} /><Metric label="Completed" value={completed || currentUser.projectsCompleted || 0} /><Metric label="Trust score" value={currentUser.trustScore || '—'} accent /></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl sm:p-8">
            <SectionTitle icon={<UserRound className="h-5 w-5 text-blue-400" />} title="Profile details" description="This information is shown with your account and applications." />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Display name" value={form.name} onChange={(value) => updateField('name', value)} required />
              <Field label="Email address" type="email" value={form.email} onChange={() => {}} disabled helper="Email changes require a new verification." />
              <Field label="Headline" value={form.title} onChange={(value) => updateField('title', value)} placeholder="e.g. Product Designer" />
              <Field label="Company or studio" value={form.company} onChange={(value) => updateField('company', value)} />
              <Field label="Location" value={form.location} onChange={(value) => updateField('location', value)} />
            </div>
            <label className="mt-4 block text-xs font-semibold text-slate-300">Bio<textarea rows={5} value={form.bio} onChange={(event) => updateField('bio', event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm font-normal text-white outline-none focus:border-blue-500" /></label>
            <Field label="Profile image URL" type="url" value={form.avatar} onChange={(value) => updateField('avatar', value)} placeholder="https://..." />
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl sm:p-8">
            <SectionTitle icon={<Award className="h-5 w-5 text-emerald-400" />} title="Skills & Specialties" description="Keep these current so the right opportunities can find you." />
            <Field label="Skills or specialties (comma separated)" value={form.skills} onChange={(value) => updateField('skills', value)} placeholder="React, UI/UX, Product strategy" />
          </section>
        </div>

        <div className="space-y-6">
          {/* Account Roles Management */}
          <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <SectionTitle icon={<BriefcaseBusiness className="h-5 w-5 text-blue-400" />} title="Account Roles" description="Select your primary workspace view and multiple active platform roles." />
            
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Active Role (Default Workspace)</label>
                <select
                  value={form.role}
                  onChange={(e) => {
                    const newRole = e.target.value as 'client' | 'freelancer' | 'admin';
                    updateField('role', newRole);
                    if (!form.roles.includes(newRole)) {
                      updateField('roles', [...form.roles, newRole]);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="client">Client (Hire & Post Projects)</option>
                  <option value="freelancer">Freelancer (Build & Earn)</option>
                  <option value="admin">Admin (Platform Governance)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Enabled Roles (Multi-Role Support)</label>
                <p className="text-[11px] text-slate-400 mb-2">Check all roles that apply to your account:</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {(['client', 'freelancer', 'admin'] as const).map((r) => (
                    <label
                      key={r}
                      className={`flex cursor-pointer items-center justify-between gap-2 rounded-xl border p-3 text-xs transition-all ${
                        form.roles.includes(r)
                          ? 'border-blue-500/40 bg-blue-500/10 text-white font-semibold'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400'
                      }`}
                    >
                      <span className="capitalize">{r}</span>
                      <input
                        type="checkbox"
                        checked={form.roles.includes(r)}
                        onChange={() => toggleAccountRole(r)}
                        className="h-4 w-4 accent-blue-500"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {(form.roles.includes('freelancer') || form.role === 'freelancer') && (
            <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
              <SectionTitle icon={<BriefcaseBusiness className="h-5 w-5 text-purple-400" />} title="Freelancer specializations" description="Select all professional disciplines you offer." />
              <details className="mt-5 rounded-xl border border-slate-800 bg-slate-950">
                <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-white">{form.freelancerRoles.length ? form.freelancerRoles.join(', ') : 'Choose freelancer roles'}</summary>
                <div className="max-h-64 space-y-1 overflow-y-auto border-t border-slate-800 p-2">
                  {FREELANCER_ROLE_OPTIONS.map((role) => (
                    <label key={role} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">
                      <input type="checkbox" checked={form.freelancerRoles.includes(role)} onChange={() => toggleFreelancerRole(role)} className="h-4 w-4 accent-blue-500" />
                      {role}
                    </label>
                  ))}
                </div>
              </details>
            </section>
          )}

          <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <SectionTitle icon={<MapPin className="h-5 w-5 text-amber-400" />} title="Visibility" description="Choose what appears alongside your profile." />
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <input type="checkbox" checked={form.showLocalTime} onChange={(event) => updateField('showLocalTime', event.target.checked)} className="mt-0.5 h-4 w-4 accent-blue-500" />
              <span>
                <span className="block text-xs font-semibold text-white">Display local time</span>
                <span className="mt-1 block text-[11px] leading-relaxed text-slate-400">Show your location-based availability on your profile when supplied.</span>
              </span>
            </label>
          </section>

          <div className="sticky top-20 rounded-3xl border border-blue-500/30 bg-blue-500/10 p-5">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 text-blue-400" />
              <p className="text-xs leading-relaxed text-blue-100">Your profile details and selected roles are saved to the database.</p>
            </div>
            {error && <p className="mt-3 text-xs text-red-200">{error}</p>}
            <Button type="submit" variant="primary" size="md" className="mt-4 w-full" leftIcon={<Save className="h-4 w-4" />}>
              {saved ? 'Profile saved' : 'Save profile'}
            </Button>
            {saved && <p className="mt-3 flex items-center justify-center gap-1 text-[11px] text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> Changes saved</p>}
          </div>
        </div>
      </form>
    </div>
  );
};

const Field: React.FC<{ label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean; disabled?: boolean; helper?: string }> = ({ label, value, onChange, type = 'text', placeholder, required, disabled, helper }) => <label className="mt-4 block text-xs font-semibold text-slate-300">{label}<input required={required} disabled={disabled} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm font-normal text-white outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60" />{helper && <span className="mt-1 block text-[10px] font-normal text-slate-500">{helper}</span>}</label>;
const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => <div><h2 className="flex items-center gap-2 text-lg font-bold text-white">{icon}{title}</h2><p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p></div>;
const Metric: React.FC<{ label: string; value: string | number; accent?: boolean }> = ({ label, value, accent }) => <div className={`rounded-xl border p-3 text-center ${accent ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-slate-800 bg-slate-950'}`}><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span><span className={`mt-1 block font-mono text-lg font-black ${accent ? 'text-emerald-300' : 'text-white'}`}>{value}</span></div>;
