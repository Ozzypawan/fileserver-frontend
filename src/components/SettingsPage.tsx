import { useState } from 'react';
import { User, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { updateProfile, changePassword } from '../api/auth';
import { useAuthStore } from '../store/useAuthStore';

type Status = { type: 'success' | 'error'; message: string } | null;

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{description}</p>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function StatusBanner({ status }: { status: Status }) {
  if (!status) return null;
  const isSuccess = status.type === 'success';
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
      {isSuccess ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {status.message}
    </div>
  );
}

export default function SettingsPage() {
  const { user, login } = useAuthStore();

  // Profile
  const [name, setName]   = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [profileStatus, setProfileStatus] = useState<Status>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [pwStatus, setPwStatus]     = useState<Status>(null);
  const [savingPw, setSavingPw]     = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileStatus(null);
    try {
      const updated = await updateProfile({ name, email });
      const stored = JSON.parse(localStorage.getItem('fs_user') ?? 'null');
      if (stored) {
        const newUser = { ...stored, name: updated.name, email: updated.email };
        localStorage.setItem('fs_user', JSON.stringify(newUser));
        // Re-login to sync auth store
        const access = localStorage.getItem('fs_access') ?? '';
        const refresh = localStorage.getItem('fs_refresh') ?? '';
        login(access, refresh, newUser);
      }
      setProfileStatus({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to update profile.';
      setProfileStatus({ type: 'error', message: msg });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) { setPwStatus({ type: 'error', message: 'New passwords do not match.' }); return; }
    setSavingPw(true);
    setPwStatus(null);
    try {
      await changePassword(currentPw, newPw);
      setPwStatus({ type: 'success', message: 'Password changed successfully.' });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to change password.';
      setPwStatus({ type: 'error', message: msg });
    } finally {
      setSavingPw(false);
    }
  };

  const inputClass = 'w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-20 md:pt-8 pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account and security preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <Section title="Profile" description="Update your display name and email address.">
          {/* Avatar */}
          <div className="flex items-center gap-4 pb-2">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-blue-600">
                {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{user?.name || user?.email}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <Field label="Full name">
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your name" className={`${inputClass} pl-8`} />
              </div>
            </Field>
            <Field label="Email address">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required className={inputClass} />
            </Field>
            <StatusBanner status={profileStatus} />
            <div className="flex justify-end">
              <button type="submit" disabled={savingProfile}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">
                {savingProfile && <Loader2 size={14} className="animate-spin" />}
                Save changes
              </button>
            </div>
          </form>
        </Section>

        {/* Security */}
        <Section title="Password" description="Change your password. Minimum 8 characters.">
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <Field label="Current password">
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)} placeholder="••••••••" required
                  className={`${inputClass} pr-10`} />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </Field>
            <Field label="New password">
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPw ? 'text' : 'password'} value={newPw}
                  onChange={e => setNewPw(e.target.value)} placeholder="Min. 8 characters" required
                  className={`${inputClass} pl-8`} />
              </div>
            </Field>
            <Field label="Confirm new password">
              <input type={showPw ? 'text' : 'password'} value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat new password" required
                className={inputClass} />
            </Field>
            <StatusBanner status={pwStatus} />
            <div className="flex justify-end">
              <button type="submit" disabled={savingPw}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">
                {savingPw && <Loader2 size={14} className="animate-spin" />}
                Update password
              </button>
            </div>
          </form>
        </Section>
      </div>
    </div>
  );
}
