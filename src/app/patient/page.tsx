'use client';
import { useEffect, useState } from 'react';
import RouteGuard from '@/components/RouteGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { apptAPI, useAuth } from '@/lib/store';
import { Calendar, Clock, CheckCircle, Video, MapPin, Bot, Stethoscope, ArrowRight, FileText, Plus, Activity } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const SC: Record<string, string> = {
  pending: 'badge-amber',
  approved: 'badge-blue',
  completed: 'badge-green',
  rejected: 'badge-red',
  cancelled: 'badge-gray',
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appts, setAppts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apptAPI.getMy({ limit: 10 })
      .then(r => setAppts(r.data.data || []))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appts.filter(a => ['pending', 'approved'].includes(a.status));
  const completed = appts.filter(a => a.status === 'completed').length;
  const pending = appts.filter(a => a.status === 'pending').length;

  return (
    <RouteGuard allowedRoles={['patient']}>
      <DashboardLayout role="patient">
        <div className="space-y-6 max-w-5xl">

          {/* Welcome banner */}
          <div className="bg-gradient-to-br from-brand to-brand-light rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                <p className="text-green-100 mt-1 text-sm">How are you feeling today? Let us help you find the right doctor.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/patient/find-doctor"
                  className="flex items-center gap-2 bg-white text-brand px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-50 transition-colors shadow-sm whitespace-nowrap">
                  <Stethoscope size={15} /> Find Doctor
                </Link>
                <Link href="/patient/ai-chat"
                  className="flex items-center gap-2 bg-white/20 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/30 transition-colors whitespace-nowrap">
                  <Bot size={15} /> Ask AI
                </Link>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Bookings', value: appts.length, icon: Calendar, bg: 'bg-blue-50', ic: 'text-blue-600' },
              { label: 'Upcoming', value: upcoming.length, icon: Clock, bg: 'bg-amber-50', ic: 'text-amber-600' },
              { label: 'Pending Approval', value: pending, icon: Activity, bg: 'bg-orange-50', ic: 'text-orange-600' },
              { label: 'Completed', value: completed, icon: CheckCircle, bg: 'bg-green-50', ic: 'text-green-600' },
            ].map(s => (
              <div key={s.label} className="card text-center">
                <div className={`inline-flex p-2.5 rounded-xl ${s.bg} mb-2`}>
                  <s.icon size={18} className={s.ic} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{loading ? '–' : s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: '/patient/find-doctor', icon: Stethoscope, label: 'Search Doctors', bg: 'bg-blue-500' },
              { href: '/patient/ai-chat', icon: Bot, label: 'AI Symptom Chat', bg: 'bg-purple-500' },
              { href: '/patient/ai-chat?tab=prescription', icon: FileText, label: 'Analyse Prescription', bg: 'bg-teal-500' },
              { href: '/patient/appointments', icon: Calendar, label: 'My Appointments', bg: 'bg-brand' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className="card flex flex-col items-center gap-2.5 py-5 hover:shadow-hover hover:-translate-y-0.5 transition-all text-center">
                <div className={`w-11 h-11 ${a.bg} rounded-xl flex items-center justify-center`}>
                  <a.icon size={20} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-700 leading-tight">{a.label}</span>
              </Link>
            ))}
          </div>

          {/* Upcoming appointments */}
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar size={16} className="text-brand" /> Upcoming Appointments
              </h2>
              <Link href="/patient/appointments"
                className="text-sm text-brand font-medium flex items-center gap-1 hover:underline">
                View all <ArrowRight size={13} />
              </Link>
            </div>

            {loading ? (
              <div className="p-5 space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}
              </div>
            ) : upcoming.length === 0 ? (
              <div className="py-14 text-center">
                <Calendar size={36} className="mx-auto mb-3 text-gray-200" />
                <p className="text-gray-400 text-sm font-medium">No upcoming appointments</p>
                <Link href="/patient/find-doctor"
                  className="inline-flex items-center gap-1.5 mt-3 text-brand text-sm font-semibold hover:underline">
                  <Plus size={14} /> Book your first appointment
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {upcoming.map(a => (
                  <div key={a._id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {a.doctor?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">Dr. {a.doctor?.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <span>{new Date(a.appointmentDate).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                        <span>·</span>
                        <span>{a.appointmentTime}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          {a.type === 'video' ? <Video size={10} className="text-blue-500" /> : <MapPin size={10} className="text-green-500" />}
                          {a.type}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`${SC[a.status] || 'badge-gray'} capitalize`}>{a.status}</span>
                      {a.type === 'video' && a.status === 'approved' && (
                        <Link href={`/video/${a.videoRoomId}`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-medium hover:bg-blue-700">
                          <Video size={11} /> Join
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent prescriptions */}
          {appts.filter(a => a.prescription?.issuedAt).length > 0 && (
            <div className="card p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText size={16} className="text-brand" /> Recent Prescriptions
                </h2>
                <Link href="/patient/prescriptions" className="text-sm text-brand font-medium hover:underline flex items-center gap-1">
                  View all <ArrowRight size={13} />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {appts.filter(a => a.prescription?.issuedAt).slice(0, 3).map(a => (
                  <div key={a._id} className="px-5 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">Dr. {a.doctor?.name}</p>
                      <p className="text-xs text-gray-500">
                        {a.prescription.medications?.length || 0} medication(s) · {new Date(a.prescription.issuedAt).toLocaleDateString('en-AU')}
                      </p>
                    </div>
                    <span className="badge-green">Received</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
