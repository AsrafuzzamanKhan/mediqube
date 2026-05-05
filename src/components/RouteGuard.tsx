'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { Stethoscope } from 'lucide-react';

export default function RouteGuard({ allowedRoles, children }: { allowedRoles: string[]; children: React.ReactNode }) {
  const { user, init } = useAuth();
  const router = useRouter();

  useEffect(() => {
    init();
    const s = localStorage.getItem('mq_user');
    if (!s) { router.replace('/login'); return; }   // not logged in → login page
    const u = JSON.parse(s);
    if (!allowedRoles.includes(u.role)) router.replace(`/${u.role}`); // wrong role → their dashboard
  }, []);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-light rounded-2xl flex items-center justify-center mx-auto mb-4 shadow">
          <Stethoscope size={22} className="text-white" />
        </div>
        <div className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500 font-medium">Loading MediQube…</p>
      </div>
    </div>
  );
  return <>{children}</>;
}
