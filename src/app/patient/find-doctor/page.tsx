'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import RouteGuard from '@/components/RouteGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { doctorAPI, apptAPI } from '@/lib/store';
import { Search, Star, Video, MapPin, Calendar, Clock, X, ChevronRight, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';

const TIMES = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'];

/** Returns true if a slot time has already passed on the given date. */
function isPast(slot: string, date: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  if (date !== today) return false;
  const [time, period] = slot.split(' ');
  const [h, m] = time.split(':').map(Number);
  const hours24 = period === 'PM' && h !== 12 ? h + 12 : period === 'AM' && h === 12 ? 0 : h;
  const slot$ = new Date(); slot$.setHours(hours24, m, 0, 0);
  return slot$ <= new Date();
}

function Content() {
  const params = useSearchParams();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [search, setSearch] = useState(params.get('q') || '');
  const [inputValue, setInputValue] = useState(params.get('q') || '');
  const [specialty, setSpecialty] = useState(params.get('specialty') || '');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [booking, setBooking] = useState({ appointmentDate: '', appointmentTime: '', type: 'video', symptoms: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const bookParam = params.get('book');

  // Fetch already-booked slots whenever doctor or date changes
  useEffect(() => {
    if (!selected || !booking.appointmentDate) { setBookedSlots([]); return; }
    setSlotsLoading(true);
    apptAPI.getSlots(selected.user._id, booking.appointmentDate)
      .then(r => setBookedSlots(r.data.data))
      .catch(() => setBookedSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selected?._id, booking.appointmentDate]);

  // Clear the chosen time if it becomes disabled after a date change
  useEffect(() => {
    if (!booking.appointmentTime) return;
    const disabled = bookedSlots.includes(booking.appointmentTime) || isPast(booking.appointmentTime, booking.appointmentDate);
    if (disabled) setBooking(b => ({ ...b, appointmentTime: '' }));
  }, [bookedSlots, booking.appointmentDate]);

  useEffect(() => { doctorAPI.specialties().then(r => setSpecialties(r.data.data)); }, []);

  // Debounce: fetch suggestions 300ms after typing
  useEffect(() => {
    if (inputValue.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    const t = setTimeout(() => {
      doctorAPI.suggestions(inputValue)
        .then(r => { setSuggestions(r.data.data); setShowSuggestions(true); })
        .catch(() => { });
    }, 300);
    return () => clearTimeout(t);
  }, [inputValue]);

  // Debounce: run actual search 500ms after typing
  useEffect(() => {
    const t = setTimeout(() => setSearch(inputValue), 500);
    return () => clearTimeout(t);
  }, [inputValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setLoading(true);
    doctorAPI.getAll({ specialty, search, limit: 50 })
      .then(r => {
        const list = r.data.data;
        setDoctors(list);
        if (bookParam) {
          const target = list.find((d: any) => d._id === bookParam);
          if (target) setSelected(target);
        }
      })
      .catch(() => toast.error('Failed to load doctors'))
      .finally(() => setLoading(false));
  }, [search, specialty]);

  const pickSuggestion = (s: any) => {
    const name = s.user?.name || '';
    setInputValue(name);
    setSearch(name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const bookAppt = async () => {
    if (!booking.appointmentDate || !booking.appointmentTime) { toast.error('Select date and time'); return; }
    setSubmitting(true);
    try {
      await apptAPI.book({ doctorId: selected.user._id, ...booking });
      toast.success('Appointment request sent! Doctor will confirm shortly.');
      setSelected(null);
      setBooking({ appointmentDate: '', appointmentTime: '', type: 'video', symptoms: '', notes: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Find a Doctor</h1>
        <p className="page-sub">Search by specialty, name, or condition</p>
      </div>

      {/* Search bar */}
      <div className="card flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48" ref={searchRef}>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" />
          <input
            value={inputValue}
            onChange={e => { setInputValue(e.target.value); }}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="input pl-9"
            placeholder="Search by name or specialty…"
            autoComplete="off"
          />
          {/* Autocomplete dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
              {suggestions.map((s, i) => (
                <button key={i} onMouseDown={() => pickSuggestion(s)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 transition-colors text-left">
                  <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-sm flex-shrink-0">
                    {s.user?.name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.user?.name}</p>
                    <p className="text-xs text-gray-400">{s.specialties?.slice(0, 2).join(', ')}</p>
                  </div>
                  <Stethoscope size={13} className="ml-auto text-gray-300" />
                </button>
              ))}
            </div>
          )}
        </div>
        <select value={specialty} onChange={e => setSpecialty(e.target.value)} className="input w-auto min-w-44">
          <option value="">All Specialties</option>
          {specialties.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(inputValue || specialty) && (
          <button onClick={() => { setInputValue(''); setSearch(''); setSpecialty(''); setSuggestions([]); }} className="btn-outline">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Doctor grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-60 bg-white rounded-2xl animate-pulse" />)}</div>
      ) : doctors.length === 0 ? (
        <div className="card text-center py-16 text-gray-400"><Search size={36} className="mx-auto mb-2 opacity-30" /><p>No doctors found</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map(d => (
            <div key={d._id} className="card hover:shadow-hover hover:border-green-200 transition-all flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center font-bold text-brand text-lg flex-shrink-0">{d.user?.name?.[0]}</div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">{d.user?.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5"><Star size={11} className="text-amber-400 fill-amber-400" /><span className="text-xs text-gray-600">{d.rating} · {d.experience} yrs exp</span></div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {d.specialties?.slice(0, 2).map((s: string) => <span key={s} className="badge-green text-xs">{s}</span>)}
              </div>
              {d.bio && <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{d.bio}</p>}
              <div className="flex justify-between text-xs text-gray-400 mb-4 bg-gray-50 rounded-xl px-3 py-2">
                <span className="flex items-center gap-1"><MapPin size={10} /> ${d.consultationFee}</span>
                <span className="flex items-center gap-1"><Video size={10} className="text-blue-400" /> ${d.videoFee}</span>
              </div>
              <button onClick={() => setSelected(d)} className="btn-primary w-full py-2.5 text-sm"><Calendar size={14} /> Book Appointment</button>
            </div>
          ))}
        </div>
      )}

      {/* Booking modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div><h2 className="font-bold text-gray-900">Book Appointment</h2><p className="text-sm text-gray-500"> {selected.user?.name}</p></div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Type */}
              <div>
                <label className="label">Consultation Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[{ v: 'video', l: 'Video Call', icon: Video, fee: selected.videoFee }, { v: 'in-person', l: 'In-Person', icon: MapPin, fee: selected.consultationFee }].map(opt => (
                    <button key={opt.v} onClick={() => setBooking(b => ({ ...b, type: opt.v }))}
                      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${booking.type === opt.v ? 'border-brand bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <opt.icon size={20} className={booking.type === opt.v ? 'text-brand' : 'text-gray-400'} />
                      <span className="font-medium text-sm mt-1.5">{opt.l}</span>
                      <span className="text-xs text-gray-500">${opt.fee} AUD</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Date */}
              <div>
                <label className="label"><Calendar size={13} className="inline mr-1" />Date</label>
                <input type="date" min={new Date().toISOString().split('T')[0]} value={booking.appointmentDate} onChange={e => setBooking(b => ({ ...b, appointmentDate: e.target.value }))} className="input" />
              </div>
              {/* Time */}
              <div>
                <label className="label">
                  <Clock size={13} className="inline mr-1" />Time
                  {slotsLoading && <span className="ml-2 text-xs text-gray-400">Checking availability…</span>}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TIMES.map(t => {
                    const past    = isPast(t, booking.appointmentDate);
                    const booked  = bookedSlots.includes(t);
                    const disabled = !booking.appointmentDate || past || booked;
                    const selected_ = booking.appointmentTime === t;
                    return (
                      <button
                        key={t}
                        disabled={disabled}
                        onClick={() => !disabled && setBooking(b => ({ ...b, appointmentTime: t }))}
                        title={past ? 'Time already passed' : booked ? 'Already booked' : ''}
                        className={`py-2 rounded-xl text-xs font-medium border transition-colors relative
                          ${disabled
                            ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                            : selected_
                              ? 'bg-brand text-white border-brand'
                              : 'border-gray-200 text-gray-600 hover:border-brand hover:text-brand'
                          }`}
                      >
                        {t}
                        {booked && !past && (
                          <span className="block text-[10px] leading-none mt-0.5 text-gray-300">Booked</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {!booking.appointmentDate && (
                  <p className="text-xs text-gray-400 mt-1.5">Select a date to see available slots</p>
                )}
              </div>
              {/* Symptoms */}
              <div>
                <label className="label">Symptoms / Reason</label>
                <textarea value={booking.symptoms} onChange={e => setBooking(b => ({ ...b, symptoms: e.target.value }))} rows={3} placeholder="Describe your symptoms…" className="input resize-none" />
              </div>
              {/* Fee */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 text-sm">
                <span className="text-gray-600">Consultation fee</span>
                <span className="font-bold text-xl text-gray-900">${booking.type === 'video' ? selected.videoFee : selected.consultationFee} AUD</span>
              </div>
              <button onClick={bookAppt} disabled={submitting} className="btn-primary w-full py-3.5">
                {submitting ? <><span className="spin" />Booking…</> : <><ChevronRight size={16} />Confirm Booking</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FindDoctorPage() {
  return (
    <RouteGuard allowedRoles={['patient']}>
      <DashboardLayout role="patient">
        <Suspense fallback={<div className="animate-pulse h-64 bg-white rounded-2xl" />}>
          <Content />
        </Suspense>
      </DashboardLayout>
    </RouteGuard>
  );
}
