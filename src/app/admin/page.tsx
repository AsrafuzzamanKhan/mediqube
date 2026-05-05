'use client';
import { useEffect, useState } from 'react';
import RouteGuard from '@/components/RouteGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { adminAPI } from '@/lib/store';
import { Users, Calendar, CheckCircle, UserCheck, AlertCircle, MessageSquare, Clock, ArrowRight, Activity, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then(r => setStats(r.data.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Users', value: stats?.users, icon: Users, bg: 'bg-blue-50', ic: 'text-blue-600', href: '/admin/users' },
    { label: 'Doctors', value: stats?.doctors, icon: UserCheck, bg: 'bg-teal-50', ic: 'text-teal-600', href: '/admin/doctors' },
    { label: 'Patients', value: stats?.patients, icon: Users, bg: 'bg-purple-50', ic: 'text-purple-600', href: '/admin/users' },
    { label: 'All Appointments', value: stats?.totalAppts, icon: Calendar, bg: 'bg-amber-50', ic: 'text-amber-600', href: '/admin/appointments' },
    { label: 'Pending Appts', value: stats?.pending, icon: Clock, bg: 'bg-orange-50', ic: 'text-orange-600', href: '/admin/appointments', alert: stats?.pending > 0 },
    { label: 'Completed Appts', value: stats?.completed, icon: CheckCircle, bg: 'bg-green-50', ic: 'text-green-600', href: '/admin/appointments' },
    { label: 'Doctors Pending', value: stats?.pendingDoctors, icon: AlertCircle, bg: 'bg-red-50', ic: 'text-red-500', href: '/admin/doctors', alert: stats?.pendingDoctors > 0 },
    { label: 'Open Tickets', value: stats?.openSupport, icon: MessageSquare, bg: 'bg-indigo-50', ic: 'text-indigo-600', href: '/admin/support', alert: stats?.openSupport > 0 },
  ];

  return (
    <RouteGuard allowedRoles={['admin']}>
      <DashboardLayout role="admin">
        <div className="space-y-6 max-w-5xl">

          {/* Welcome banner */}
          <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard 🛡️</h1>
                <p className="text-purple-200 mt-1 text-sm">Full system overview — MediQube</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/admin/doctors"
                  className="flex items-center gap-2 bg-white text-purple-700 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-purple-50 transition-colors shadow-sm whitespace-nowrap">
                  <UserCheck size={15} /> Doctor Approvals
                </Link>
                <Link href="/admin/support"
                  className="flex items-center gap-2 bg-white/20 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/30 transition-colors whitespace-nowrap">
                  <MessageSquare size={15} /> Support Tickets
                </Link>
              </div>
            </div>
          </div>

          {/* Alert banners */}
          {!loading && (
            <div className="space-y-3">
              {(stats?.pendingDoctors || 0) > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                    <p className="text-sm font-semibold text-red-800">
                      {stats.pendingDoctors} doctor{stats.pendingDoctors > 1 ? 's' : ''} waiting for approval
                    </p>
                  </div>
                  <Link href="/admin/doctors"
                    className="px-4 py-2 bg-red-600 text-white text-xs rounded-xl font-semibold hover:bg-red-700 whitespace-nowrap flex items-center gap-1">
                    Review <ArrowRight size={12} />
                  </Link>
                </div>
              )}
              {(stats?.openSupport || 0) > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={20} className="text-amber-500 flex-shrink-0" />
                    <p className="text-sm font-semibold text-amber-800">
                      {stats.openSupport} open support ticket{stats.openSupport > 1 ? 's' : ''} need attention
                    </p>
                  </div>
                  <Link href="/admin/support"
                    className="px-4 py-2 bg-amber-600 text-white text-xs rounded-xl font-semibold hover:bg-amber-700 whitespace-nowrap flex items-center gap-1">
                    Handle <ArrowRight size={12} />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map(c => (
              <Link key={c.label} href={c.href}
                className={`card hover:shadow-hover transition-all hover:-translate-y-0.5 ${c.alert ? 'border-red-200' : ''}`}>
                <div className={`inline-flex p-2.5 rounded-xl ${c.bg} mb-2`}>
                  <c.icon size={18} className={c.ic} />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {loading ? <div className="h-7 w-10 bg-gray-100 rounded animate-pulse" /> : (c.value ?? 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
                {c.alert && !loading && (c.value || 0) > 0 && (
                  <p className="text-xs text-red-500 font-semibold mt-1">⚠ Needs attention</p>
                )}
              </Link>
            ))}
          </div>

          {/* Quick action tiles */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Activity size={16} className="text-purple-600" /> Quick Actions
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { href: '/admin/users', label: 'Manage Users', desc: 'View, activate or deactivate user accounts', icon: Users, grad: 'from-blue-500 to-blue-600' },
                { href: '/admin/doctors', label: 'Doctor Approvals', desc: 'Approve or suspend doctor registrations', icon: UserCheck, grad: 'from-teal-500 to-teal-600' },
                { href: '/admin/appointments', label: 'All Appointments', desc: 'Monitor every booking across the platform', icon: Calendar, grad: 'from-amber-500 to-amber-600' },
                { href: '/admin/faq', label: 'Health FAQs', desc: 'Add and manage health information articles', icon: AlertCircle, grad: 'from-green-500 to-green-600' },
                { href: '/admin/support', label: 'Support Tickets', desc: 'Reply to patient and doctor support requests', icon: MessageSquare, grad: 'from-purple-500 to-purple-600' },
                { href: '/admin/appointments', label: 'View Analytics', desc: 'Appointment trends over the last 7 days', icon: TrendingUp, grad: 'from-indigo-500 to-indigo-600' },
              ].map(a => (
                <Link key={a.href} href={a.href}
                  className="card flex items-center gap-4 hover:shadow-hover transition-all hover:-translate-y-0.5">
                  <div className={`bg-gradient-to-br ${a.grad} p-3 rounded-xl text-white flex-shrink-0`}>
                    <a.icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{a.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">{a.desc}</p>
                  </div>
                  <ArrowRight size={14} className="text-gray-300 flex-shrink-0 ml-auto" />
                </Link>
              ))}
            </div>
          </div>

          {/* Appointments chart (last 7 days) */}
          {!loading && stats?.chart?.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-purple-600" /> Appointments This Week
              </h2>
              <div className="flex items-end gap-2 h-28">
                {stats.chart.map((d: any) => {
                  const max = Math.max(...stats.chart.map((x: any) => x.count), 1);
                  const pct = Math.max((d.count / max) * 100, 8);
                  return (
                    <div key={d._id} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-semibold text-gray-700">{d.count}</span>
                      <div className="w-full bg-purple-100 rounded-t-lg transition-all" style={{ height: `${pct}%` }}>
                        <div className="w-full h-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg" />
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {new Date(d._id).toLocaleDateString('en-AU', { weekday: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
