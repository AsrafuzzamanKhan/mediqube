'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, authAPI } from '@/lib/store';
import { Stethoscope, Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO = [
  { label: 'Admin', email: 'admin@mediqube.com.au', pass: 'Admin@1234', cls: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  { label: 'Doctor', email: 'sarah.mitchell@gpclinic.com.au', pass: 'Doctor@1234', cls: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  { label: 'Patient', email: 'patient@mediqube.com.au', pass: 'Patient@1234', cls: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' },
];

const DASH: Record<string, string> = { admin: '/admin', doctor: '/doctor', patient: '/patient' };

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState('');
  const { setUser, user, init } = useAuth();
  const router = useRouter();

  useEffect(() => { init(); }, []);
  useEffect(() => {
    if (user) router.replace(DASH[user.role] || '/patient');
  }, [user]);

  // Core login function
  const doLogin = async (emailVal: string, passVal: string) => {
    try {
      const { data } = await authAPI.login({ email: emailVal, password: passVal });
      setUser(data.data);
      toast.success(`Welcome, ${data.data.name}! 👋`);
      router.push(DASH[data.data.role] || '/patient');
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      toast.error(msg);
      return false;
    }
  };

  // Manual form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pass) { toast.error('Please enter email and password'); return; }
    setLoading(true);
    await doLogin(email, pass);
    setLoading(false);
  };

  // Demo login — ONE CLICK, no need to press Sign In
  const demoLogin = async (d: typeof DEMO[0]) => {
    setDemoLoading(d.label);
    setEmail(d.email);
    setPass(d.pass);
    await doLogin(d.email, d.pass);
    setDemoLoading('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center shadow-lg">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-brand">MediQube</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to access your dashboard</p>
        </div>

        {/* Demo quick login */}
        <div className="card shadow-lg mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-amber-500" />
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">One-Click Demo Login</p>
          </div>
          <div className="space-y-2">
            {DEMO.map(d => (
              <button key={d.label} onClick={() => demoLogin(d)} disabled={!!demoLoading}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${d.cls} disabled:opacity-60`}>
                <div className="flex items-center gap-2">
                  <span className="font-bold">{d.label}</span>
                  {demoLoading === d.label && <span className="spin w-3 h-3 border-current" />}
                </div>
                <span className="text-xs opacity-60 truncate ml-2">{d.email}</span>
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">Click once — logs you in instantly ⚡</p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">or sign in manually</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Manual form */}
        <div className="card shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input pl-9" placeholder="you@example.com" autoComplete="email" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type={show ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)}
                  className="input pl-9 pr-10" placeholder="••••••••" autoComplete="current-password" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading || !!demoLoading} className="btn-primary w-full py-3">
              {loading ? <><span className="spin" /> Signing in…</> : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          No account?{' '}
          <Link href="/register" className="text-brand font-semibold hover:underline">Register here</Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          <Link href="/" className="text-gray-400 hover:text-brand text-xs">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
