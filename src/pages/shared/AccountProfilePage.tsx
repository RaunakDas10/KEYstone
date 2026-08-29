import React, { useEffect, useState } from 'react';
import { Award, BriefcaseBusiness, CheckCircle2, Link as LinkIcon, Mail, MapPin, Save, UserRound } from 'lucide-react';
import { useAuthStore, useProjectStore } from '../../store';
import { Button } from '../../components/ui/Button';

type ProfileForm = {
  name: string;
  email: string;
  avatar: string;
  title: string;
  bio: string;
  pronouns: string;
  company: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  instagram: string;
  xHandle: string;
  skills: string;
  showLocalTime: boolean;
};

const formFromUser = (user: ReturnType<typeof useAuthStore.getState>['currentUser']): ProfileForm => ({
  name: user.name,
  email: user.email,
  avatar: user.avatar || '',
  title: user.title || '',
  bio: user.bio || '',
  pronouns: user.pronouns || '',
  company: user.company || '',
  location: user.location || '',
  website: user.website || '',
  linkedin: user.linkedin || '',
  github: user.github || '',
  instagram: user.instagram || '',
  xHandle: user.xHandle || '',
  skills: user.skills?.join(', ') || '',
  showLocalTime: user.showLocalTime || false,
});

export const AccountProfilePage: React.FC = () => {
  const { currentUser, updateProfile } = useAuthStore();
  const { projects } = useProjectStore();
  const [form, setForm] = useState<ProfileForm>(() => formFromUser(currentUser));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(formFromUser(currentUser));
    setSaved(false);
  }, [currentUser.id]);

  const userProjects = projects.filter((project) =>
    currentUser.role === 'client' ? project.clientId === currentUser.id : project.freelancerId === currentUser.id
  );
  const completedProjects = userProjects.filter((project) => project.status === 'completed').length;
  const projectLabel = currentUser.role === 'client' ? 'Projects posted' : 'Projects taken';
  const completedLabel = currentUser.role === 'client' ? 'Projects completed' : 'Work completed';

  const updateField = <K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    updateProfile({
      name: form.name.trim(),
      email: form.email.trim(),
      avatar: form.avatar.trim() || undefined,
      title: form.title.trim(),
      bio: form.bio.trim(),
      pronouns: form.pronouns.trim(),
      company: form.company.trim(),
      location: form.location.trim(),
      website: form.website.trim(),
      linkedin: form.linkedin.trim(),
      github: form.github.trim(),
      instagram: form.instagram.trim(),
      xHandle: form.xHandle.trim(),
      skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
      showLocalTime: form.showLocalTime,
    });
    setSaved(true);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 py-2">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4"><img src={currentUser.avatar} alt="" className="h-20 w-20 rounded-3xl border-2 border-blue-500/40 object-cover" /><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-black text-white sm:text-3xl">{currentUser.name}</h1>{currentUser.verified && <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-300">VERIFIED</span>}</div><p className="mt-1 text-sm font-semibold text-blue-400">{currentUser.title || `${currentUser.role} account`}</p><p className="mt-2 text-xs text-slate-400">Manage the profile that clients, freelancers, and your project applications see.</p></div></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label={projectLabel} value={userProjects.length} /><Metric label={completedLabel} value={completedProjects || currentUser.projectsCompleted || 0} /><Metric label="Trust score" value={currentUser.trustScore || '—'} accent /><Metric label="On-time rate" value={currentUser.onTimeRate ? `${currentUser.onTimeRate}%` : '—'} /></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl sm:p-8"><SectionTitle icon={<UserRound className="h-5 w-5 text-blue-400" />} title="Profile details" description="This is the information shown with your account and applications." /><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Display name" value={form.name} onChange={(value) => updateField('name', value)} required /><Field label="Email address" type="email" value={form.email} onChange={(value) => updateField('email', value)} required /><Field label="Headline / role" value={form.title} onChange={(value) => updateField('title', value)} placeholder="e.g. Product Designer" /><Field label="Pronouns" value={form.pronouns} onChange={(value) => updateField('pronouns', value)} placeholder="e.g. she/her" /><Field label="Company or studio" value={form.company} onChange={(value) => updateField('company', value)} /><Field label="Location" value={form.location} onChange={(value) => updateField('location', value)} /></div><label className="mt-4 block text-xs font-semibold text-slate-300">Bio<textarea rows={5} value={form.bio} onChange={(event) => updateField('bio', event.target.value)} placeholder="Tell people what you build, do, or look for..." className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm font-normal text-white outline-none focus:border-blue-500" /></label><label className="mt-4 block text-xs font-semibold text-slate-300">Profile image URL<input type="url" value={form.avatar} onChange={(event) => updateField('avatar', event.target.value)} placeholder="https://..." className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm font-normal text-white outline-none focus:border-blue-500" /></label></section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl sm:p-8"><SectionTitle icon={<Award className="h-5 w-5 text-emerald-400" />} title="Skills and links" description="Keep this current so the right project opportunities can find you." /><label className="mt-6 block text-xs font-semibold text-slate-300">Skills or specialties <span className="font-normal text-slate-500">(comma separated)</span><input value={form.skills} onChange={(event) => updateField('skills', event.target.value)} placeholder="React, UI/UX, Product strategy" className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm font-normal text-white outline-none focus:border-blue-500" /></label><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Website" type="url" value={form.website} onChange={(value) => updateField('website', value)} placeholder="https://..." /><Field label="LinkedIn" type="url" value={form.linkedin} onChange={(value) => updateField('linkedin', value)} placeholder="https://linkedin.com/in/..." /><Field label="GitHub" type="url" value={form.github} onChange={(value) => updateField('github', value)} placeholder="https://github.com/..." /><Field label="Instagram" type="url" value={form.instagram} onChange={(value) => updateField('instagram', value)} placeholder="https://instagram.com/..." /><Field label="X / Twitter" value={form.xHandle} onChange={(value) => updateField('xHandle', value)} placeholder="@username" /></div></section>
        </div>

        <div className="space-y-6"><section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl"><SectionTitle icon={<BriefcaseBusiness className="h-5 w-5 text-purple-400" />} title="KEYStone track record" description="These metrics are calculated by the platform and cannot be edited." /><div className="mt-6 space-y-3"><ReadOnlyRow label="Account role" value={currentUser.role} /><ReadOnlyRow label={projectLabel} value={String(userProjects.length)} /><ReadOnlyRow label={completedLabel} value={String(completedProjects || currentUser.projectsCompleted || 0)} /><ReadOnlyRow label="Trust score" value={currentUser.trustScore ? `${currentUser.trustScore} / 100` : 'Not scored yet'} /><ReadOnlyRow label="Completion rate" value={currentUser.completionRate ? `${currentUser.completionRate}%` : 'Not scored yet'} /><ReadOnlyRow label="Member since" value={currentUser.joinedDate} /></div></section><section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl"><SectionTitle icon={<MapPin className="h-5 w-5 text-amber-400" />} title="Visibility" description="Choose what appears alongside your profile." /><label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-4"><input type="checkbox" checked={form.showLocalTime} onChange={(event) => updateField('showLocalTime', event.target.checked)} className="mt-0.5 h-4 w-4 accent-blue-500" /><span><span className="block text-xs font-semibold text-white">Display local time</span><span className="mt-1 block text-[11px] leading-relaxed text-slate-400">Show your location-based availability on your profile when a location is supplied.</span></span></label></section><div className="sticky top-20 rounded-3xl border border-blue-500/30 bg-blue-500/10 p-5"><div className="flex items-start gap-3"><Mail className="mt-0.5 h-5 w-5 text-blue-400" /><p className="text-xs leading-relaxed text-blue-100">Your updated profile is used for future freelancer applications and account views. Trust and project metrics remain platform-controlled.</p></div><Button type="submit" variant="primary" size="md" className="mt-4 w-full" leftIcon={<Save className="h-4 w-4" />}>{saved ? 'Profile saved' : 'Save profile'}</Button>{saved && <p className="mt-3 flex items-center justify-center gap-1 text-[11px] text-emerald-300"><CheckCircle2 className="h-3.5 w-3.5" /> Changes saved</p>}</div></div>
      </form>
    </div>
  );
};

const Field: React.FC<{ label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; required?: boolean }> = ({ label, value, onChange, type = 'text', placeholder, required }) => <label className="block text-xs font-semibold text-slate-300">{label}<input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm font-normal text-white outline-none focus:border-blue-500" /></label>;
const SectionTitle: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => <div><h2 className="flex items-center gap-2 text-lg font-bold text-white">{icon}{title}</h2><p className="mt-1 text-xs leading-relaxed text-slate-400">{description}</p></div>;
const ReadOnlyRow: React.FC<{ label: string; value: string }> = ({ label, value }) => <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs"><span className="text-slate-400">{label}</span><span className="text-right font-semibold capitalize text-white">{value}</span></div>;
const Metric: React.FC<{ label: string; value: string | number; accent?: boolean }> = ({ label, value, accent }) => <div className={`rounded-xl border p-3 text-center ${accent ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-slate-800 bg-slate-950'}`}><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span><span className={`mt-1 block font-mono text-lg font-black ${accent ? 'text-emerald-300' : 'text-white'}`}>{value}</span></div>;
