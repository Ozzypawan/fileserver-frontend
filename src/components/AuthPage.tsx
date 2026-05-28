import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { HardDrive, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { register, login, googleLogin, forgotPassword } from '../api/auth';
import type { AuthResponse } from '../api/auth';

interface Props {
  onAuth: (res: AuthResponse) => void;
}

type View = 'login' | 'register' | 'forgot' | 'forgot-sent';

export default function AuthPage({ onAuth }: Props) {
  const [view, setView]         = useState<View>('login');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const reset = () => { setError(''); setName(''); setEmail(''); setPassword(''); };
  const switchTab = (t: 'login' | 'register') => { setView(t); reset(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = view === 'login'
        ? await login(email, password)
        : await register(email, password, name);
      onAuth(res);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credential: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await googleLogin(credential);
      onAuth(res);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Google login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setView('forgot-sent');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot sent confirmation ─────────────────────────────────
  if (view === 'forgot-sent') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={24} className="text-emerald-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Check your email</h2>
          <p className="text-sm text-slate-500 mb-6">
            If <span className="font-medium text-slate-700">{email}</span> is registered, you'll receive a reset link shortly.
          </p>
          <button
            onClick={() => { setView('login'); reset(); }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  // ── Forgot password form ─────────────────────────────────────
  if (view === 'forgot') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-3">
              <HardDrive size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Filesewa</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <button
              onClick={() => { setView('login'); reset(); }}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to sign in
            </button>

            <h2 className="text-base font-semibold text-slate-900 mb-1">Forgot your password?</h2>
            <p className="text-sm text-slate-500 mb-5">Enter your email and we'll send you a reset link.</p>

            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                Send reset link
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Login / Register ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-3">
            <HardDrive size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Filesewa</h1>
          <p className="text-sm text-slate-500 mt-1">Your personal file storage</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-100">
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className={`flex-1 py-3.5 text-sm font-medium transition-colors ${
                  view === t
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={cr => cr.credential && handleGoogle(cr.credential)}
                onError={() => setError('Google login failed')}
                size="large"
                width="320"
                text={view === 'login' ? 'signin_with' : 'signup_with'}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {view === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Full name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={view === 'register' ? 'Min. 8 characters' : '••••••••'}
                    required
                    className="w-full px-3 py-2.5 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {view === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); setError(''); }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {view === 'login' ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
