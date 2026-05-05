'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RouteGuard from '@/components/RouteGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { apptAPI } from '@/lib/store';
import { ArrowLeft, Video, MapPin, Calendar, Plus, X, Send } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [appt, setAppt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPresc, setShowPresc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [presc, setPresc] = useState({ medications: [{ name:'', dosage:'', frequency:'', duration:'' }], instructions:'', notes:'' });

  useEffect(() => { apptAPI.getOne(id as string).then(r=>setAppt(r.data.data)).catch(()=>toast.error('Failed')).finally(()=>setLoading(false)); }, [id]);

  const addMed = () => setPresc(p=>({...p, medications:[...p.medications,{name:'',dosage:'',frequency:'',duration:''}]}));
  const removeMed = (i:number) => setPresc(p=>({...p, medications:p.medications.filter((_,j)=>j!==i)}));
  const updateMed = (i:number, k:string, v:string) => setPresc(p=>({...p, medications:p.medications.map((m,j)=>j===i?{...m,[k]:v}:m)}));

  const submit = async () => {
    if (!presc.medications[0].name && !presc.notes) { toast.error('Add at least one medication or notes'); return; }
    setSaving(true);
    try {
      await apptAPI.addPresc(id as string, presc);
      toast.success('Prescription saved and emailed to patient!');
      const r = await apptAPI.getOne(id as string); setAppt(r.data.data);
      setShowPresc(false);
    } catch { toast.error('Failed to save prescription'); }
    finally { setSaving(false); }
  };

  if (loading) return <DashboardLayout role="doctor"><div className="animate-pulse space-y-4">{[...Array(3)].map((_,i)=><div key={i} className="h-32 bg-white rounded-2xl"/>)}</div></DashboardLayout>;

  return (
    <RouteGuard allowedRoles={['doctor']}>
      <DashboardLayout role="doctor">
        <div className="max-w-2xl space-y-5">
          <div className="flex items-center gap-3">
            <Link href="/doctor/appointments" className="p-2 hover:bg-gray-100 rounded-xl"><ArrowLeft size={18}/></Link>
            <div><h1 className="text-xl font-bold text-gray-900">Appointment Details</h1><p className="text-sm text-gray-500">Manage & add prescription</p></div>
          </div>

          {/* Patient info */}
          <div className="card">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-brand/10 flex items-center justify-center font-bold text-brand text-xl">{appt?.patient?.name?.[0]}</div>
              <div><h2 className="font-semibold text-gray-900 text-lg">{appt?.patient?.name}</h2><p className="text-sm text-gray-500">{appt?.patient?.email}</p><p className="text-sm text-gray-500">{appt?.patient?.phone}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs mb-1">Date & Time</p><p className="font-medium">{new Date(appt?.appointmentDate).toLocaleDateString('en-AU')} at {appt?.appointmentTime}</p></div>
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs mb-1">Type</p><p className="font-medium flex items-center gap-1">{appt?.type==='video'?<><Video size={13} className="text-blue-500"/>Video Call</>:<><MapPin size={13} className="text-green-500"/>In-Person</>}</p></div>
              <div className="bg-gray-50 rounded-xl p-3 col-span-2"><p className="text-gray-400 text-xs mb-1">Symptoms</p><p className="font-medium">{appt?.symptoms||'None reported'}</p></div>
            </div>
            <div className="flex gap-3 mt-4 flex-wrap">
              {appt?.type==='video'&&appt?.status==='approved'&&<Link href={`/video/${appt.videoRoomId}`} className="btn-blue text-sm"><Video size={15}/>Start Video Call</Link>}
              {['approved'].includes(appt?.status)&&!appt?.prescription?.issuedAt&&<button onClick={()=>setShowPresc(true)} className="btn-primary text-sm"><Plus size={15}/>Add Prescription</button>}
            </div>
          </div>

          {/* Existing prescription */}
          {appt?.prescription?.issuedAt && (
            <div className="card border-green-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs">✓</span>Prescription Issued</h3>
              {appt.prescription.medications?.map((m:any,i:number)=>(
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5 mb-2 text-sm">
                  <div><strong>{m.name}</strong> — {m.dosage}</div>
                  <div className="text-gray-500">{m.frequency} · {m.duration}</div>
                </div>
              ))}
              {appt.prescription.instructions&&<div className="bg-amber-50 rounded-xl p-3 text-sm mt-2">{appt.prescription.instructions}</div>}
              {appt.emailSent&&<p className="text-xs text-green-600 mt-2 font-medium">✉ Emailed to patient</p>}
            </div>
          )}

          {/* Add prescription form */}
          {showPresc && (
            <div className="card border-brand/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Add Prescription</h3>
                <button onClick={()=>setShowPresc(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={16}/></button>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label mb-0">Medications</label>
                    <button onClick={addMed} className="text-xs text-brand hover:underline flex items-center gap-1"><Plus size={11}/>Add</button>
                  </div>
                  <div className="space-y-2">
                    {presc.medications.map((m,i)=>(
                      <div key={i} className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl">
                        {[{k:'name',p:'Medication name'},{k:'dosage',p:'Dosage (e.g. 10mg)'},{k:'frequency',p:'Frequency (e.g. Twice daily)'},{k:'duration',p:'Duration (e.g. 7 days)'}].map(f=>(
                          <input key={f.k} value={(m as any)[f.k]} onChange={e=>updateMed(i,f.k,e.target.value)} placeholder={f.p} className="input text-xs py-2 bg-white"/>
                        ))}
                        {presc.medications.length>1&&<button onClick={()=>removeMed(i)} className="col-span-2 text-red-400 text-xs hover:underline text-left">Remove medication</button>}
                      </div>
                    ))}
                  </div>
                </div>
                <div><label className="label">Doctor's Instructions</label><textarea value={presc.instructions} onChange={e=>setPresc(p=>({...p,instructions:e.target.value}))} rows={3} placeholder="e.g. Take with food. Avoid alcohol. Return if symptoms worsen." className="input resize-none"/></div>
                <div><label className="label">Additional Notes</label><textarea value={presc.notes} onChange={e=>setPresc(p=>({...p,notes:e.target.value}))} rows={2} placeholder="Any other notes…" className="input resize-none"/></div>
                <button onClick={submit} disabled={saving} className="btn-primary w-full py-3">
                  {saving?<><span className="spin"/>Saving & Emailing…</>:<><Send size={15}/>Save & Email Prescription to Patient</>}
                </button>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
