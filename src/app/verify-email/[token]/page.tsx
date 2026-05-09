'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { HeartPulse } from 'lucide-react';
import axios from 'axios';

export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email/${token}`)
      .then(res => { setStatus('success'); setMessage(res.data.message); })
      .catch(err => { setStatus('error'); setMessage(err.response?.data?.message || 'Verification failed.'); });
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="card shadow-lg w-full max-w-sm text-center p-8">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-brand flex items-center justify-center shadow">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-brand">MediQube</span>
        </div>

        {status === 'loading' && (
          <>
            <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Verifying your email…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <Link href="/login" className="btn-primary w-full py-3 block text-center">Go to Login</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-3xl">✕</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Link Invalid</h2>
            <p className="text-gray-500 text-sm mb-6">{message}</p>
            <Link href="/register" className="btn-primary w-full py-3 block text-center">Register Again</Link>
          </>
        )}
      </div>
    </div>
  );
}
