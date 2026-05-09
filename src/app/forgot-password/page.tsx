'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authAPI } from '@/lib/store';
import { HeartPulse, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-brand flex items-center justify-center shadow-lg">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-brand">MediQube</span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Forgot your password?</h1>
          <p className="text-gray-400 text-sm mt-1">Enter your email and we'll send a reset link</p>
        </div>

        {sent ? (
          <div className="card shadow-lg text-center p-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-brand" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Check your inbox</h2>
            <p className="text-gray-500 text-sm mb-6">
              We sent a password reset link to <b>{email}</b>. It expires in 1 hour.
            </p>
            <Link href="/login" className="btn-primary w-full py-3 block text-center">Back to Login</Link>
          </div>
        ) : (
          <div className="card shadow-lg">
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="input pl-9" placeholder="you@example.com" autoFocus />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? <><span className="spin" /> Sending…</> : 'Send Reset Link'}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-5">
          Remember your password?{' '}
          <Link href="/login" className="text-brand font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
