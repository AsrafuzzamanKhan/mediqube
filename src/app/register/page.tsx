'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authAPI } from '@/lib/store';
import { HeartPulse, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'patient' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Name, email and password required'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await authAPI.register(form);
      setDone(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  if (done) return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="card shadow-lg w-full max-w-sm text-center p-8">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-brand" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Account created!</h2>
        <p className="text-gray-500 text-sm mb-6">Your account has been created successfully. You can now sign in.</p>
        <Link href="/login" className="btn-primary w-full py-3 block text-center">Go to Login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-brand flex items-center justify-center shadow-lg">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-brand">MediQube</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Create your account</h1>
        </div>

        <div className="card shadow-lg">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Full Name *</label>
              <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input value={form.name} onChange={f('name')} className="input pl-9" placeholder="John Smith" /></div>
            </div>
            <div>
              <label className="label">Email Address *</label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="email" value={form.email} onChange={f('email')} className="input pl-9" placeholder="you@example.com" /></div>
            </div>
            <div>
              <label className="label">Password *</label>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type={show ? 'text' : 'password'} value={form.password} onChange={f('password')} className="input pl-9 pr-10" placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <div>
              <label className="label">Phone (optional)</label>
              <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input value={form.phone} onChange={f('phone')} className="input pl-9" placeholder="04XX XXX XXX" /></div>
            </div>
            <div>
              <label className="label">I am registering as…</label>
              <div className="grid grid-cols-2 gap-2">
                {[['patient', 'Patient'], ['doctor', 'Doctor']].map(([v, l]) => (
                  <button key={v} type="button" onClick={() => setForm(p => ({ ...p, role: v }))}
                    className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${form.role === v ? 'border-brand bg-green-50 text-brand' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <><span className="spin" /> Creating account…</> : 'Create Account'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-gray-500 mt-5">Already have an account? <Link href="/login" className="text-brand font-semibold hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}
