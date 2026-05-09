'use client';
import { useEffect, useState } from 'react';
import RouteGuard from '@/components/RouteGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { apptAPI, doctorAPI, adminAPI, faqAPI, supportAPI, userAPI, notifAPI } from '@/lib/store';
import { Search, Trash2, UserCheck, UserX, CheckCircle, XCircle, Plus, X, Send, Save, Star, Calendar, Video, MapPin, FileText, ChevronDown, ChevronUp, Pencil, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const SC: Record<string, string> = { pending: 'badge-amber', approved: 'badge-blue', completed: 'badge-green', rejected: 'badge-red', cancelled: 'badge-gray' };

// ── Shared components ──────────────────────────────────────
function Spinner() { return <div className="flex justify-center py-12"><div className="spin w-8 h-8 border-brand" /></div>; }
function Empty({ text }: { text: string }) { return <div className="text-center py-12 text-gray-400"><p>{text}</p></div>; }

// ══════════════════════════════════════════════════════════
// DOCTOR APPOINTMENTS
// ══════════════════════════════════════════════════════════
export function DoctorAppts() {
  const [appts, setAppts] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); apptAPI.getMy({ status }).then(r => setAppts(r.data.data)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, [status]);
  const updateStatus = async (id: string, s: string, reason?: string) => {
    try { await apptAPI.updateStatus(id, { status: s, rejectionReason: reason }); toast.success(`Appointment ${s}`); load(); } catch { toast.error('Failed'); }
  };
  return (
    <RouteGuard allowedRoles={['doctor']}><DashboardLayout role="doctor">
      <div className="space-y-5">
        <h1 className="page-title">My Appointments</h1>
        <div className="flex gap-2 flex-wrap">
          {['', 'pending', 'approved', 'completed', 'rejected', 'cancelled'].map(s => (
            <button key={s} onClick={() => setStatus(s)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${status === s ? 'bg-brand text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{s || 'All'}</button>
          ))}
        </div>
        {loading ? <Spinner /> : appts.length === 0 ? <Empty text="No appointments found" /> :
          <div className="space-y-3">{appts.map(a => (
            <div key={a._id} className="card flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center font-bold text-brand flex-shrink-0">{a.patient?.name?.[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{a.patient?.name}</p>
                <p className="text-sm text-gray-500">{new Date(a.appointmentDate).toLocaleDateString('en-AU')} · {a.appointmentTime} · {a.type}</p>
                {a.symptoms && <p className="text-xs text-gray-400 truncate">"{a.symptoms}"</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`badge ${SC[a.status]}`}>{a.status}</span>
                {a.status === 'pending' && <>
                  <button onClick={() => updateStatus(a._id, 'approved')} className="btn-green text-xs py-1 px-2">Approve</button>
                  <button onClick={() => { const r = prompt('Rejection reason (optional):'); updateStatus(a._id, 'rejected', r || ''); }} className="btn-red text-xs py-1 px-2">Reject</button>
                </>}
                <Link href={`/doctor/appointments/${a._id}`} className="btn-outline text-xs py-1 px-2"><FileText size={12} /></Link>
              </div>
            </div>
          ))}</div>
        }
      </div>
    </DashboardLayout></RouteGuard>
  );
}

// ══════════════════════════════════════════════════════════
// DOCTOR PROFILE
// ══════════════════════════════════════════════════════════
const SPECS = ['General Practitioner', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Psychiatrist', 'Orthopedic', 'Neurologist', 'Gastroenterologist', 'Endocrinologist', 'Pulmonologist', 'Gynecologist', 'Ophthalmologist', 'ENT Specialist', 'Urologist', 'Rheumatologist', 'Sports Medicine'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function DoctorProfile() {
  const [form, setForm] = useState<any>({ specialties: [], qualifications: [], experience: 0, bio: '', consultationFee: 0, videoFee: 0, availableSlots: [], clinicAddress: { street: '', suburb: '', state: '', postcode: '' } });
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    doctorAPI.myProfile().then(r => { const d = r.data.data; setForm({ ...d }); setName(d.user?.name || ''); }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try { await doctorAPI.updateMe({ ...form, name }); toast.success('Profile updated!'); } catch { toast.error('Failed'); } finally { setSaving(false); }
  };
  const toggleSpec = (s: string) => setForm((p: any) => ({ ...p, specialties: p.specialties.includes(s) ? p.specialties.filter((x: string) => x !== s) : [...p.specialties, s] }));
  const toggleSlot = (day: string) => setForm((p: any) => ({ ...p, availableSlots: p.availableSlots?.find((s: any) => s.day === day) ? p.availableSlots.filter((s: any) => s.day !== day) : [...(p.availableSlots || []), { day, startTime: '09:00', endTime: '17:00' }] }));
  const updateSlot = (day: string, k: string, v: string) => setForm((p: any) => ({ ...p, availableSlots: p.availableSlots.map((s: any) => s.day === day ? { ...s, [k]: v } : s) }));

  if (loading) return <DashboardLayout role="doctor"><Spinner /></DashboardLayout>;
  return (
    <RouteGuard allowedRoles={['doctor']}><DashboardLayout role="doctor">
      <div className="max-w-2xl space-y-5">
        <div className="flex items-center justify-between"><h1 className="page-title">My Profile</h1><button onClick={save} disabled={saving} className="btn-primary"><Save size={15} />{saving ? 'Saving…' : 'Save Changes'}</button></div>
        {[
          {
            title: 'Basic Info', content: (
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="label">Name</label><input value={name} onChange={e => setName(e.target.value)} className="input" /></div>
                <div><label className="label">Experience (years)</label><input type="number" value={form.experience} onChange={e => setForm((p: any) => ({ ...p, experience: +e.target.value }))} className="input" /></div>
                <div><label className="label">In-Person Fee ($)</label><input type="number" value={form.consultationFee} onChange={e => setForm((p: any) => ({ ...p, consultationFee: +e.target.value }))} className="input" /></div>
                <div><label className="label">Video Fee ($)</label><input type="number" value={form.videoFee} onChange={e => setForm((p: any) => ({ ...p, videoFee: +e.target.value }))} className="input" /></div>
                <div className="col-span-2"><label className="label">Bio</label><textarea value={form.bio} onChange={e => setForm((p: any) => ({ ...p, bio: e.target.value }))} rows={3} className="input resize-none" /></div>
              </div>
            )
          },
          {
            title: 'Specialties', content: (
              <div className="flex flex-wrap gap-2">
                {SPECS.map(s => <button key={s} type="button" onClick={() => toggleSpec(s)} className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${form.specialties?.includes(s) ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>)}
              </div>
            )
          },
          {
            title: 'Available Days', content: (
              <div className="space-y-3">
                {DAYS.map(day => {
                  const slot = form.availableSlots?.find((s: any) => s.day === day);
                  return (
                    <div key={day} className="flex items-center gap-4">
                      <label className="flex items-center gap-2 w-32 cursor-pointer"><input type="checkbox" checked={!!slot} onChange={() => toggleSlot(day)} className="w-4 h-4 accent-brand" /><span className="text-sm font-medium">{day}</span></label>
                      {slot && <div className="flex items-center gap-2">
                        <input type="time" value={slot.startTime} onChange={e => updateSlot(day, 'startTime', e.target.value)} className="input py-1.5 w-28 text-sm" />
                        <span className="text-gray-400 text-sm">to</span>
                        <input type="time" value={slot.endTime} onChange={e => updateSlot(day, 'endTime', e.target.value)} className="input py-1.5 w-28 text-sm" />
                      </div>}
                    </div>
                  );
                })}
              </div>
            )
          },
        ].map(s => (
          <div key={s.title} className="card">
            <h2 className="font-semibold text-gray-900 mb-4">{s.title}</h2>
            {s.content}
          </div>
        ))}
      </div>
    </DashboardLayout></RouteGuard>
  );
}

// ══════════════════════════════════════════════════════════
// PATIENT APPOINTMENTS
// ══════════════════════════════════════════════════════════
export function PatientAppts() {
  const [appts, setAppts] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); apptAPI.getMy({ status }).then(r => setAppts(r.data.data)).finally(() => setLoading(false)); };
  useEffect(() => load(), [status]);
  const cancel = async (id: string) => {
    if (!confirm('Cancel this appointment?')) return;
    try { await apptAPI.cancel(id); toast.success('Cancelled'); load(); setSelected(null); } catch { toast.error('Failed'); }
  };
  return (
    <RouteGuard allowedRoles={['patient']}><DashboardLayout role="patient">
      <div className="space-y-5">
        <div className="flex items-center justify-between"><h1 className="page-title">My Appointments</h1><Link href="/patient/find-doctor" className="btn-primary text-sm"><Plus size={14} />Book New</Link></div>
        <div className="flex gap-2 flex-wrap">
          {['', 'pending', 'approved', 'completed', 'rejected', 'cancelled'].map(s => (
            <button key={s} onClick={() => setStatus(s)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${status === s ? 'bg-brand text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{s || 'All'}</button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {loading ? <Spinner /> : appts.length === 0 ? <Empty text="No appointments found" /> :
              appts.map(a => (
                <button key={a._id} onClick={() => setSelected(a)} className={`w-full text-left card hover:border-brand transition-all ${selected?._id === a._id ? 'border-brand' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm flex-shrink-0">{a.doctor?.name?.[0]}</div>
                    <div className="flex-1 min-w-0"><p className="font-medium text-sm text-gray-900">Dr. {a.doctor?.name}</p><p className="text-xs text-gray-500">{new Date(a.appointmentDate).toLocaleDateString('en-AU')} · {a.appointmentTime}</p></div>
                    <span className={`badge ${SC[a.status]}`}>{a.status}</span>
                  </div>
                </button>
              ))
            }
          </div>
          <div className="card">
            {!selected ? <div className="text-center py-12 text-gray-400"><FileText size={32} className="mx-auto mb-2 opacity-30" /><p className="text-sm">Select an appointment to view details</p></div> :
              <div className="space-y-3">
                <div className="flex items-center justify-between"><h3 className="font-semibold text-gray-900">Details</h3><button onClick={() => setSelected(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={14} /></button></div>
                <div className="space-y-2 text-sm">
                  {[['Doctor', `Dr. ${selected.doctor?.name}`], ['Date', new Date(selected.appointmentDate).toLocaleDateString('en-AU', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })], ['Time', selected.appointmentTime], ['Type', selected.type], ['Status', selected.status], ['Fee', `$${selected.fee} AUD`]].map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1.5 border-b border-gray-50"><span className="text-gray-500">{k}</span><span className="font-medium capitalize">{v}</span></div>
                  ))}
                  {selected.symptoms && <div className="py-1.5 border-b border-gray-50"><p className="text-gray-500 text-xs mb-0.5">Symptoms</p><p className="font-medium">{selected.symptoms}</p></div>}
                </div>
                {selected.prescription?.issuedAt && (
                  <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                    <p className="font-semibold text-green-800 text-sm mb-2">💊 Prescription</p>
                    {selected.prescription.medications?.map((m: any, i: number) => <p key={i} className="text-sm text-green-700">• {m.name} {m.dosage} — {m.frequency} ({m.duration})</p>)}
                    {selected.prescription.instructions && <p className="text-xs text-green-600 mt-1 italic">{selected.prescription.instructions}</p>}
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  {selected.type === 'video' && selected.status === 'approved' && <Link href={`/video/${selected.videoRoomId}`} className="btn-blue text-sm"><Video size={14} />Join Video</Link>}
                  {['pending', 'approved'].includes(selected.status) && <button onClick={() => cancel(selected._id)} className="btn-red text-sm"><X size={14} />Cancel</button>}
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </DashboardLayout></RouteGuard>
  );
}

// ══════════════════════════════════════════════════════════
// PATIENT PRESCRIPTIONS
// ══════════════════════════════════════════════════════════
export function PatientPrescriptions() {
  const [appts, setAppts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { apptAPI.getMy({ status: 'completed', limit: 50 }).then(r => setAppts(r.data.data.filter((a: any) => a.prescription?.issuedAt))).finally(() => setLoading(false)); }, []);
  return (
    <RouteGuard allowedRoles={['patient']}><DashboardLayout role="patient">
      <div className="space-y-5">
        <h1 className="page-title">My Prescriptions</h1>
        {loading ? <Spinner /> : appts.length === 0 ? <Empty text="No prescriptions yet — they appear after completed consultations" /> :
          <div className="space-y-4">{appts.map(a => (
            <div key={a._id} className="card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center font-bold text-blue-700">{a.doctor?.name?.[0]}</div>
                <div><p className="font-semibold text-gray-900">Dr. {a.doctor?.name}</p><p className="text-xs text-gray-500">{new Date(a.appointmentDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
                <span className="badge-green ml-auto">✓ Issued</span>
              </div>
              <div className="space-y-2">
                {a.prescription.medications?.map((m: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5 text-sm">
                    <div><strong>{m.name}</strong> — {m.dosage}</div>
                    <div className="text-gray-500">{m.frequency} · {m.duration}</div>
                  </div>
                ))}
              </div>
              {a.prescription.instructions && <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-800"><strong>Instructions:</strong> {a.prescription.instructions}</div>}
              {a.emailSent && <p className="text-xs text-green-600 mt-2">✉ Emailed to you</p>}
            </div>
          ))}</div>
        }
      </div>
    </DashboardLayout></RouteGuard>
  );
}

// ══════════════════════════════════════════════════════════
// PATIENT PROFILE
// ══════════════════════════════════════════════════════════
export function PatientProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [form, setForm] = useState<any>({ dateOfBirth: '', gender: '', medicareNumber: '', bloodType: 'unknown', allergies: '', chronicConditions: '', address: { street: '', suburb: '', state: '', postcode: '' }, emergencyContact: { name: '', phone: '', relationship: '' } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => { userAPI.getPatient().then(r => { const p = r.data.data; setProfile(p); setName(p.user?.name || ''); setPhone(p.user?.phone || ''); setForm({ ...p, allergies: p.allergies?.join(', ') || '', chronicConditions: p.chronicConditions?.join(', ') || '', dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : '' }); }).finally(() => setLoading(false)); }, []);
  const save = async () => {
    setSaving(true);
    try {
      await userAPI.updatePatient({ ...form, allergies: form.allergies.split(',').map((s: string) => s.trim()).filter(Boolean), chronicConditions: form.chronicConditions.split(',').map((s: string) => s.trim()).filter(Boolean) });
      toast.success('Profile updated!');
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };
  if (loading) return <DashboardLayout role="patient"><Spinner /></DashboardLayout>;
  return (
    <RouteGuard allowedRoles={['patient']}><DashboardLayout role="patient">
      <div className="max-w-2xl space-y-5">
        <div className="flex items-center justify-between"><h1 className="page-title">My Profile</h1><button onClick={save} disabled={saving} className="btn-primary"><Save size={15} />{saving ? 'Saving…' : 'Save Changes'}</button></div>
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Personal Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="label">Full Name</label><input value={name} onChange={e => setName(e.target.value)} className="input" /></div>
            <div><label className="label">Phone</label><input value={phone} onChange={e => setPhone(e.target.value)} className="input" /></div>
            <div><label className="label">Date of Birth</label><input type="date" value={form.dateOfBirth} onChange={e => setForm((p: any) => ({ ...p, dateOfBirth: e.target.value }))} className="input" /></div>
            <div><label className="label">Gender</label><select value={form.gender} onChange={e => setForm((p: any) => ({ ...p, gender: e.target.value }))} className="input"><option value="">Select</option>{['male', 'female', 'other', 'prefer-not-to-say'].map(g => <option key={g} value={g}>{g}</option>)}</select></div>
            <div><label className="label">Medicare Number</label><input value={form.medicareNumber || ''} onChange={e => setForm((p: any) => ({ ...p, medicareNumber: e.target.value }))} placeholder="2123 45670 1" className="input" /></div>
            <div><label className="label">Blood Type</label><select value={form.bloodType} onChange={e => setForm((p: any) => ({ ...p, bloodType: e.target.value }))} className="input">{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'].map(b => <option key={b} value={b}>{b}</option>)}</select></div>
            <div className="col-span-2"><label className="label">Allergies (comma-separated)</label><input value={form.allergies} onChange={e => setForm((p: any) => ({ ...p, allergies: e.target.value }))} placeholder="e.g. Penicillin, Aspirin" className="input" /></div>
            <div className="col-span-2"><label className="label">Chronic Conditions</label><input value={form.chronicConditions} onChange={e => setForm((p: any) => ({ ...p, chronicConditions: e.target.value }))} placeholder="e.g. Hypertension, Diabetes" className="input" /></div>
          </div>
        </div>
      </div>
    </DashboardLayout></RouteGuard>
  );
}

// ══════════════════════════════════════════════════════════
// SUPPORT (shared between doctor + patient)
// ══════════════════════════════════════════════════════════
function SupportPage({ role }: { role: 'doctor' | 'patient' }) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', category: 'other', priority: 'medium' });
  const [submitting, setSubmitting] = useState(false);
  const load = () => { supportAPI.getMy().then(r => setTickets(r.data.data)).finally(() => setLoading(false)); };
  useEffect(() => load(), []);
  const create = async () => {
    if (!form.subject || !form.message) { toast.error('Subject and message required'); return; }
    setSubmitting(true);
    try { await supportAPI.create(form); toast.success('Ticket created!'); setShowForm(false); setForm({ subject: '', message: '', category: 'other', priority: 'medium' }); load(); } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };
  const SC2: Record<string, string> = { open: 'badge-red', 'in-progress': 'badge-amber', resolved: 'badge-green', closed: 'badge-gray' };
  return (
    <RouteGuard allowedRoles={[role]}><DashboardLayout role={role}>
      <div className="space-y-5">
        <div className="flex items-center justify-between"><h1 className="page-title">Support</h1><button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={14} />New Ticket</button></div>
        {loading ? <Spinner /> : tickets.length === 0 ? <Empty text="No support tickets yet" /> :
          <div className="space-y-3">{tickets.map(t => (
            <div key={t._id} className="card">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">{t.subject}</p>
                <span className={`badge ${SC2[t.status]}`}>{t.status}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{t.category} · {new Date(t.createdAt).toLocaleDateString('en-AU')}</p>
              {t.replies?.length > 0 && <p className="text-xs text-green-600 mt-1 font-medium">{t.replies.length} reply from support</p>}
            </div>
          ))}</div>
        }
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100"><h2 className="font-bold text-gray-900">New Ticket</h2><button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button></div>
            <div className="p-5 space-y-4">
              <div><label className="label">Subject</label><input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="input" placeholder="Brief description" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Category</label><select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input">{['technical', 'billing', 'appointment', 'account', 'other'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="label">Priority</label><select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="input">{['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}</select></div>
              </div>
              <div><label className="label">Message</label><textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={4} className="input resize-none" placeholder="Describe your issue…" /></div>
              <button onClick={create} disabled={submitting} className="btn-primary w-full py-3"><Send size={14} />{submitting ? 'Submitting…' : 'Submit Ticket'}</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout></RouteGuard>
  );
}
export function DoctorSupport() { return <SupportPage role="doctor" />; }
export function PatientSupport() { return <SupportPage role="patient" />; }

// ══════════════════════════════════════════════════════════
// ADMIN USERS
// ══════════════════════════════════════════════════════════
export function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); adminAPI.users({ search, role }).then(r => setUsers(r.data.data)).finally(() => setLoading(false)); };
  useEffect(() => load(), [search, role]);
  const toggle = async (id: string, isActive: boolean) => { try { await adminAPI.updateUser(id, { isActive: !isActive }); toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`); load(); } catch { toast.error('Failed'); } };
  const del = async (id: string, name: string) => { if (!confirm(`Delete ${name}?`)) return; try { await adminAPI.deleteUser(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); } };
  const RC: Record<string, string> = { admin: 'badge-purple', doctor: 'badge-blue', patient: 'badge-green' };
  return (
    <RouteGuard allowedRoles={['admin']}><DashboardLayout role="admin">
      <div className="space-y-5">
        <h1 className="page-title">User Management</h1>
        <div className="card flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={e => { setSearch(e.target.value); }} className="input pl-9" placeholder="Search name or email…" /></div>
          <select value={role} onChange={e => setRole(e.target.value)} className="input w-auto"><option value="">All Roles</option>{['admin', 'doctor', 'patient'].map(r => <option key={r} value={r}>{r}</option>)}</select>
        </div>
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? <tr><td colSpan={5} className="py-8 text-center text-gray-400">Loading…</td></tr> : users.length === 0 ? <tr><td colSpan={5} className="py-8 text-center text-gray-400">No users found</td></tr> :
                  users.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center font-bold text-brand text-sm">{u.name?.[0]}</div><div><p className="font-medium text-sm text-gray-900">{u.name}</p><p className="text-xs text-gray-500">{u.email}</p></div></div></td>
                      <td className="px-5 py-4"><span className={`badge ${RC[u.role] || 'badge-gray'}`}>{u.role}</span></td>
                      <td className="px-5 py-4"><span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td className="px-5 py-4 text-sm text-gray-600">{new Date(u.createdAt).toLocaleDateString('en-AU')}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => toggle(u._id, u.isActive)} className={`p-1.5 rounded-lg transition-colors ${u.isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`} title={u.isActive ? 'Deactivate' : 'Activate'}>{u.isActive ? <UserX size={14} /> : <UserCheck size={14} />}</button>
                          <button onClick={() => del(u._id, u.name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout></RouteGuard>
  );
}

// ══════════════════════════════════════════════════════════
// ADMIN DOCTORS
// ══════════════════════════════════════════════════════════
export function AdminDoctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const load = () => { setLoading(true); adminAPI.doctors().then(r => setDoctors(r.data.data)).finally(() => setLoading(false)); };
  useEffect(() => load(), []);
  const approve = async (id: string, val: boolean) => { try { await adminAPI.approve(id, { isApproved: val }); toast.success(`Doctor ${val ? 'approved' : 'suspended'}`); load(); } catch { toast.error('Failed'); } };
  const filtered = doctors.filter(d => filter === 'all' ? true : filter === 'pending' ? !d.isApproved : d.isApproved);
  return (
    <RouteGuard allowedRoles={['admin']}><DashboardLayout role="admin">
      <div className="space-y-5">
        <h1 className="page-title">Doctor Management</h1>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-brand text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {f}{f === 'pending' && doctors.filter(d => !d.isApproved).length > 0 && <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{doctors.filter(d => !d.isApproved).length}</span>}
            </button>
          ))}
        </div>
        {loading ? <Spinner /> : filtered.length === 0 ? <Empty text="No doctors found" /> :
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{filtered.map(d => (
            <div key={d._id} className={`card ${!d.isApproved ? 'border-amber-200' : ''}`}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center font-bold text-brand text-lg flex-shrink-0">{d.user?.name?.[0]}</div>
                <div className="flex-1 min-w-0"><p className="font-semibold text-gray-900 text-sm">Dr. {d.user?.name}</p><p className="text-xs text-gray-500 truncate">{d.user?.email}</p></div>
                <span className={`badge flex-shrink-0 ${d.isApproved ? 'badge-green' : 'badge-amber'}`}>{d.isApproved ? 'Approved' : 'Pending'}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">{d.specialties?.slice(0, 2).map((s: string) => <span key={s} className="badge-green text-xs">{s}</span>)}</div>
              <div className="flex justify-between text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2 mb-3">
                <span>In-person: <strong className="text-gray-700">${d.consultationFee}</strong></span>
                <span>Video: <strong className="text-gray-700">${d.videoFee}</strong></span>
              </div>
              {!d.isApproved ? <button onClick={() => approve(d._id, true)} className="btn-green w-full text-sm"><CheckCircle size={14} />Approve</button> : <button onClick={() => approve(d._id, false)} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"><XCircle size={14} />Suspend</button>}
            </div>
          ))}</div>
        }
      </div>
    </DashboardLayout></RouteGuard>
  );
}

// ══════════════════════════════════════════════════════════
// ADMIN APPOINTMENTS
// ══════════════════════════════════════════════════════════
export function AdminAppointments() {
  const [appts, setAppts] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); apptAPI.adminAll({ status }).then(r => setAppts(r.data.data)).finally(() => setLoading(false)); }, [status]);
  return (
    <RouteGuard allowedRoles={['admin']}><DashboardLayout role="admin">
      <div className="space-y-5">
        <h1 className="page-title">All Appointments</h1>
        <div className="flex gap-2 flex-wrap">{['', 'pending', 'approved', 'completed', 'rejected', 'cancelled'].map(s => <button key={s} onClick={() => setStatus(s)} className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${status === s ? 'bg-brand text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{s || 'All'}</button>)}</div>
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto"><table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100"><tr>{['Patient', 'Doctor', 'Date & Time', 'Type', 'Status', 'Fee'].map(h => <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? <tr><td colSpan={6} className="py-8 text-center text-gray-400">Loading…</td></tr> : appts.length === 0 ? <tr><td colSpan={6} className="py-8 text-center text-gray-400">No appointments</td></tr> :
                appts.map(a => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{a.patient?.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">Dr. {a.doctor?.name}</td>
                    <td className="px-5 py-4"><p className="text-sm text-gray-900">{new Date(a.appointmentDate).toLocaleDateString('en-AU')}</p><p className="text-xs text-gray-500">{a.appointmentTime}</p></td>
                    <td className="px-5 py-4 text-sm text-gray-600">{a.type === 'video' ? '📹 Video' : '🏥 In-Person'}</td>
                    <td className="px-5 py-4"><span className={`badge ${SC[a.status]}`}>{a.status}</span></td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">${a.fee}</td>
                  </tr>
                ))
              }
            </tbody>
          </table></div>
        </div>
      </div>
    </DashboardLayout></RouteGuard>
  );
}

// ══════════════════════════════════════════════════════════
// ADMIN FAQ
// ══════════════════════════════════════════════════════════
export function AdminFAQ() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ category: '', disease: '', question: '', answer: '', symptoms: '', relatedSpecialties: '', tags: '' });
  const [saving, setSaving] = useState(false);
  const load = () => { setLoading(true); faqAPI.getAll().then(r => setFaqs(r.data.data)).finally(() => setLoading(false)); };
  useEffect(() => load(), []);
  const openCreate = () => { setEditing(null); setForm({ category: '', disease: '', question: '', answer: '', symptoms: '', relatedSpecialties: '', tags: '' }); setShow(true); };
  const openEdit = (f: any) => { setEditing(f); setForm({ ...f, symptoms: f.symptoms?.join(', ') || '', relatedSpecialties: f.relatedSpecialties?.join(', ') || '', tags: f.tags?.join(', ') || '' }); setShow(true); };
  const save = async () => {
    if (!form.category || !form.question || !form.answer) { toast.error('Category, question and answer required'); return; }
    setSaving(true);
    const payload = { ...form, symptoms: form.symptoms.split(',').map((s: string) => s.trim()).filter(Boolean), relatedSpecialties: form.relatedSpecialties.split(',').map((s: string) => s.trim()).filter(Boolean), tags: form.tags.split(',').map((s: string) => s.trim()).filter(Boolean) };
    try { editing ? await faqAPI.update(editing._id, payload) : await faqAPI.create(payload); toast.success(editing ? 'Updated' : 'Created'); setShow(false); load(); } catch { toast.error('Failed'); } finally { setSaving(false); }
  };
  const del = async (id: string) => { if (!confirm('Delete?')) return; try { await faqAPI.remove(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); } };
  return (
    <RouteGuard allowedRoles={['admin']}><DashboardLayout role="admin">
      <div className="space-y-5">
        <div className="flex items-center justify-between"><h1 className="page-title">FAQ Management</h1><button onClick={openCreate} className="btn-primary"><Plus size={14} />Add FAQ</button></div>
        {loading ? <Spinner /> : faqs.length === 0 ? <Empty text="No FAQs yet" /> :
          <div className="space-y-3">{faqs.map(f => (
            <div key={f._id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className="badge-green text-xs">{f.category}</span>{f.disease && <span className="text-xs text-gray-500">{f.disease}</span>}</div><p className="font-semibold text-sm text-gray-900">{f.question}</p><p className="text-sm text-gray-500 mt-1 line-clamp-2">{f.answer}</p></div>
                <div className="flex gap-2"><button onClick={() => openEdit(f)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil size={14} /></button><button onClick={() => del(f._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button></div>
              </div>
            </div>
          ))}</div>
        }
      </div>
      {show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100"><h2 className="font-bold text-gray-900">{editing ? 'Edit' : 'Add'} FAQ</h2><button onClick={() => setShow(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button></div>
            <div className="p-5 space-y-4">
              {[{ l: 'Category *', k: 'category', p: 'e.g. Heart & Cardiovascular' }, { l: 'Disease', k: 'disease', p: 'e.g. Hypertension' }, { l: 'Question *', k: 'question', p: 'What are the symptoms…?' }, { l: 'Symptoms (comma-separated)', k: 'symptoms', p: 'headache, dizziness' }, { l: 'Related Specialties', k: 'relatedSpecialties', p: 'Cardiologist, GP' }, { l: 'Tags', k: 'tags', p: 'heart, blood pressure' }].map(f => (
                <div key={f.k}><label className="label">{f.l}</label><input value={(form as any)[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.p} className="input" /></div>
              ))}
              <div><label className="label">Answer *</label><textarea value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))} rows={5} className="input resize-none" placeholder="Detailed answer…" /></div>
              <div className="flex justify-end gap-3"><button onClick={() => setShow(false)} className="btn-outline">Cancel</button><button onClick={save} disabled={saving} className="btn-primary"><Save size={14} />{saving ? 'Saving…' : 'Save FAQ'}</button></div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout></RouteGuard>
  );
}

// ══════════════════════════════════════════════════════════
// ADMIN SUPPORT
// ══════════════════════════════════════════════════════════
export function AdminSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  useEffect(() => { supportAPI.getAll().then(r => setTickets(r.data.data)).finally(() => setLoading(false)); }, []);
  const open = async (id: string) => { try { const r = await supportAPI.getOne(id); setSelected(r.data.data); } catch { toast.error('Failed'); } };
  const send = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try { await supportAPI.reply(selected._id, { message: reply }); const r = await supportAPI.getOne(selected._id); setSelected(r.data.data); setReply(''); toast.success('Reply sent'); } catch { toast.error('Failed'); } finally { setSending(false); }
  };
  const resolve = async (id: string) => { try { await supportAPI.status(id, { status: 'resolved' }); toast.success('Resolved'); setSelected(null); const r = await supportAPI.getAll(); setTickets(r.data.data); } catch { toast.error('Failed'); } };
  const SC2: Record<string, string> = { open: 'badge-red', 'in-progress': 'badge-amber', resolved: 'badge-green', closed: 'badge-gray' };
  return (
    <RouteGuard allowedRoles={['admin']}><DashboardLayout role="admin">
      <div className="space-y-5">
        <h1 className="page-title">Support Tickets</h1>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="card overflow-hidden p-0">
            <div className="px-5 py-4 border-b border-gray-100 font-semibold text-sm text-gray-900">All Tickets ({tickets.length})</div>
            <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
              {loading ? <div className="py-8 text-center text-gray-400 text-sm">Loading…</div> : tickets.length === 0 ? <div className="py-8 text-center text-gray-400 text-sm">No tickets</div> :
                tickets.map(t => (
                  <button key={t._id} onClick={() => open(t._id)} className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors ${selected?._id === t._id ? 'bg-green-50' : ''}`}>
                    <div className="flex items-start justify-between gap-2"><span className="font-medium text-sm text-gray-900 line-clamp-1">{t.subject}</span><span className={`badge flex-shrink-0 ${SC2[t.status]}`}>{t.status}</span></div>
                    <p className="text-xs text-gray-500 mt-1">{t.user?.name} · {t.category}</p>
                  </button>
                ))
              }
            </div>
          </div>
          <div className="card flex flex-col min-h-64">
            {!selected ? <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Select a ticket</div> :
              <>
                <div className="flex items-start justify-between mb-3">
                  <div><p className="font-semibold text-gray-900">{selected.subject}</p><p className="text-xs text-gray-500">{selected.user?.name} · {selected.user?.email}</p></div>
                  {selected.status !== 'resolved' && <button onClick={() => resolve(selected._id)} className="text-xs text-green-600 hover:underline font-medium flex items-center gap-1"><CheckCircle size={12} />Resolve</button>}
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 mb-3">{selected.message}</div>
                <div className="flex-1 space-y-2 overflow-y-auto max-h-40">
                  {selected.replies?.map((r: any, i: number) => (
                    <div key={i} className={`flex gap-2 ${r.sender?.role === 'admin' ? 'flex-row-reverse' : ''}`}>
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs flex-shrink-0">{r.sender?.name?.[0]}</div>
                      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs ${r.sender?.role === 'admin' ? 'bg-brand text-white' : 'bg-gray-100 text-gray-800'}`}>{r.message}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <input value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type a reply…" className="flex-1 input text-sm" />
                  <button onClick={send} disabled={sending || !reply.trim()} className="btn-primary px-3"><Send size={15} /></button>
                </div>
              </>
            }
          </div>
        </div>
      </div>
    </DashboardLayout></RouteGuard>
  );
}
