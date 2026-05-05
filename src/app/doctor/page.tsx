'use client';
import { useEffect, useState } from 'react';
import RouteGuard from '@/components/RouteGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { apptAPI, useAuth } from '@/lib/store';
import { Calendar, Clock, CheckCircle, Users, Video, MapPin, FileText, UserCircle, ArrowRight, Activity, Check, X } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const SC: Record<string, string> = {
  pending: 'badge-amber',
  approved: 'badge-blue',
  completed: 'badge-green',
  rejected: 'badge-red',
  cancelled: 'badge-gray',
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    apptAPI.getDoctorDashboard()
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const reason = status === 'rejected' ? (prompt('Reason for rejection (optional):') || '') : '';
    try {
      await apptAPI.updateStatus(id, { status, rejectionReason: reason });
      toast.success(`Appointment ${status}`);
      load();
    } catch { toast.error('Failed to update'); }
  };

  return (
    <RouteGuard allowedRoles={['doctor']}>
      <DashboardLayout role="doctor">
        <div className="space-y-6 max-w-5xl">

          {/* Welcome banner */}
          <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Welcome, Dr. {user?.name?.split(' ').slice(-1)[0]}! 👨‍⚕️</h1>
                <p className="text-blue-200 mt-1 text-sm">
                  {new Date().toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/doctor/appointments"
                  className="flex items-center gap-2 bg-white text-blue-700 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap">
                  <Calendar size={15} /> All Appointments
                </Link>
                <Link href="/doctor/profile"
                  className="flex items-center gap-2 bg-white/20 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/30 transition-colors whitespace-nowrap">
                  <UserCircle size={15} /> My Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Today's", value: data?.stats?.today || 0, icon: Calendar, bg: 'bg-blue-50', ic: 'text-blue-600' },
              { label: 'Pending', value: data?.stats?.pending || 0, icon: Clock, bg: 'bg-amber-50', ic: 'text-amber-600', alert: (data?.stats?.pending || 0) > 0 },
              { label: 'Completed', value: data?.stats?.completed || 0, icon: CheckCircle, bg: 'bg-green-50', ic: 'text-green-600' },
              { label: 'Total', value: data?.stats?.total || 0, icon: Users, bg: 'bg-purple-50', ic: 'text-purple-600' },
            ].map(s => (
              <div key={s.label} className={`card text-center ${s.alert ? 'border-amber-300' : ''}`}>
                <div className={`inline-flex p-2.5 rounded-xl ${s.bg} mb-2`}>
                  <s.icon size={18} className={s.ic} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{loading ? '–' : s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label} Appointments</div>
                {s.alert && <p className="text-xs text-amber-600 font-semibold mt-1">⚠ Needs attention</p>}
              </div>
            ))}
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { href: '/doctor/appointments?status=pending', icon: Clock, label: 'Pending Requests', bg: 'bg-amber-500', count: data?.stats?.pending },
              { href: '/doctor/appointments', icon: Calendar, label: 'All Appointments', bg: 'bg-blue-600' },
              { href: '/doctor/profile', icon: UserCircle, label: 'Update Profile', bg: 'bg-purple-600' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className="card flex flex-col items-center gap-2.5 py-5 hover:shadow-hover hover:-translate-y-0.5 transition-all text-center relative">
                <div className={`w-11 h-11 ${a.bg} rounded-xl flex items-center justify-center`}>
                  <a.icon size={20} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-700 leading-tight">{a.label}</span>
                {a.count > 0 && (
                  <span className="absolute top-3 right-3 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">{a.count}</span>
                )}
              </Link>
            ))}
          </div>

          {/* Today's appointments */}
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Activity size={16} className="text-blue-600" /> Today's Appointments
                {data?.stats?.today > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{data.stats.today}</span>
                )}
              </h2>
              <Link href="/doctor/appointments" className="text-sm text-brand font-medium flex items-center gap-1 hover:underline">
                View all <ArrowRight size={13} />
              </Link>
            </div>

            {loading ? (
              <div className="p-5 space-y-3">
                {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-50 rounded-xl animate-pulse" />)}
              </div>
            ) : !data?.today?.length ? (
              <div className="py-14 text-center">
                <Calendar size={36} className="mx-auto mb-3 text-gray-200" />
                <p className="text-gray-400 text-sm font-medium">No appointments today</p>
                <p className="text-gray-300 text-xs mt-1">Enjoy your day!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {data.today.map((a: any) => (
                  <div key={a._id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    {/* Patient avatar */}
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {a.patient?.name?.[0]?.toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{a.patient?.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <span>{a.appointmentTime}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          {a.type === 'video'
                            ? <><Video size={10} className="text-blue-500" /> Video</>
                            : <><MapPin size={10} className="text-green-500" /> In-Person</>}
                        </span>
                        {a.fee > 0 && <><span>·</span><span>${a.fee}</span></>}
                      </p>
                      {a.symptoms && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">"{a.symptoms}"</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`${SC[a.status] || 'badge-gray'} capitalize`}>{a.status}</span>

                      {a.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(a._id, 'approved')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg font-medium hover:bg-green-700 transition-colors">
                            <Check size={12} /> Approve
                          </button>
                          <button onClick={() => updateStatus(a._id, 'rejected')}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg font-medium hover:bg-red-600 transition-colors">
                            <X size={12} /> Reject
                          </button>
                        </>
                      )}

                      {a.status === 'approved' && a.type === 'video' && (
                        <Link href={`/video/${a.videoRoomId}`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-medium hover:bg-blue-700">
                          <Video size={11} /> Join Call
                        </Link>
                      )}

                      <Link href={`/doctor/appointments/${a._id}`}
                        className="p-2 text-gray-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors">
                        <FileText size={15} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending requests alert */}
          {!loading && (data?.stats?.pending || 0) > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-900">
                    {data.stats.pending} appointment{data.stats.pending > 1 ? 's' : ''} waiting for your approval
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">Patients are waiting — please review and approve or reject</p>
                </div>
              </div>
              <Link href="/doctor/appointments?status=pending"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 whitespace-nowrap">
                Review Now <ArrowRight size={14} />
              </Link>
            </div>
          )}

        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
