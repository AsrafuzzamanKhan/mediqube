'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, authAPI } from '@/lib/store';
import { Stethoscope, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const DASH: Record<string, string> = { admin: '/admin', doctor: '/doctor', patient: '/patient' };

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser, user, init } = useAuth();
  const router = useRouter();

  useEffect(() => { init(); }, []);
  useEffect(() => {
    if (user) router.replace(DASH[user.role] || '/patient');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pass) { toast.error('Please enter email and password'); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password: pass });
      setUser(data.data);
      toast.success(`Welcome, ${data.data.name}!`);
      router.push(DASH[data.data.role] || '/patient');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
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

        {/* Sign in form */}
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
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-xs text-brand hover:underline">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
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
