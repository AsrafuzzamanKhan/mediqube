'use client';
import { useState, useRef } from 'react';
import RouteGuard from '@/components/RouteGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { aiAPI, doctorAPI } from '@/lib/store';
import { Bot, User, Send, FileText, Stethoscope, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

type Msg = { role: 'user' | 'assistant'; content: string };

export default function AIChatPage() {
  const [tab, setTab] = useState<'chat' | 'upload'>('chat');

  // ── Chat state ─────────────────────────────────────────
  const [messages, setMessages] = useState<Msg[]>([{
    role: 'assistant',
    content: "👋 Hi! I'm your MediQube AI assistant. Tell me your symptoms and I'll help you find the right doctor. What's bothering you today?",
  }]);
  const [input, setInput]     = useState('');
  const [sending, setSending] = useState(false);
  const chatEnd = useRef<HTMLDivElement>(null);
  const scrollDown = () => setTimeout(() => chatEnd.current?.scrollIntoView({ behavior: 'smooth' }), 100);

  const sendMsg = async () => {
    if (!input.trim() || sending) return;
    const userMsg: Msg = { role: 'user', content: input };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setSending(true);
    scrollDown();
    try {
      const res = await aiAPI.chat({ messages: history.slice(-10), message: userMsg.content });
      setMessages([...history, { role: 'assistant', content: res.data.data.reply }]);
      const specialty = res.data.data.suggestedSpecialty;
      if (specialty) {
        setSuggestedSpecialty(specialty);
        doctorAPI.getAll({ specialty, limit: 3 }).then(r => setSuggestedDoctors(r.data.data)).catch(() => {});
      }
      scrollDown();
    } catch {
      toast.error('AI unavailable. Check your GROQ_API_KEY in backend/.env');
      setMessages([...history, { role: 'assistant', content: '⚠️ AI service is currently unavailable. Please check your Groq API key setup.' }]);
    } finally { setSending(false); }
  };

  const [suggestedSpecialty, setSuggestedSpecialty] = useState('');
  const [suggestedDoctors, setSuggestedDoctors] = useState<any[]>([]);

  // ── Upload state ───────────────────────────────────────
  const [text, setText]       = useState('');
  const [analysing, setAnalysing] = useState(false);
  const [result, setResult]   = useState<any>(null);

  const analyse = async () => {
    if (!text.trim()) { toast.error('Please paste some prescription text first'); return; }
    setAnalysing(true);
    try {
      const res = await aiAPI.analyse({ text });
      setResult(res.data.data);
      toast.success('Prescription analysed!');
    } catch { toast.error('Analysis failed. Check your Groq API key.'); }
    finally { setAnalysing(false); }
  };

  const urgencyConfig: Record<string, { badge: string; icon: any; text: string }> = {
    routine: { badge: 'badge-green', icon: CheckCircle, text: 'Routine — book when convenient' },
    soon:    { badge: 'badge-amber', icon: AlertCircle, text: 'See a doctor within a week' },
    urgent:  { badge: 'badge-red',   icon: AlertCircle, text: 'Urgent — see a doctor soon' },
  };

  return (
    <RouteGuard allowedRoles={['patient']}>
      <DashboardLayout role="patient">
        <div className="space-y-6">
          <div className="page-header">
            <h1 className="page-title flex items-center gap-2"><Bot className="text-brand" size={24} /> AI Health Assistant</h1>
            <p className="page-sub">Describe your symptoms or paste a prescription to find the right specialist</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
            {([['chat','💬 Symptom Chat'], ['upload','📋 Analyse Prescription']] as const).map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* ── CHAT TAB ─────────────────────────────────── */}
          {tab === 'chat' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-gray-100 flex flex-col" style={{ height: 520 }}>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'assistant' ? 'bg-brand text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {m.role === 'assistant' ? <Bot size={15} /> : <User size={15} />}
                      </div>
                      <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'assistant' ? 'bg-gray-50 text-gray-800 rounded-tl-sm' : 'bg-brand text-white rounded-tr-sm'}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {sending && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center"><Bot size={15} className="text-white" /></div>
                      <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                        {[0, 150, 300].map(d => <span key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                      </div>
                    </div>
                  )}
                  <div ref={chatEnd} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100 flex gap-2">
                  <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMsg()}
                    placeholder="Describe your symptoms e.g. chest pain, shortness of breath…"
                    className="flex-1 input" disabled={sending} />
                  <button onClick={sendMsg} disabled={sending || !input.trim()} className="btn-primary px-4">
                    <Send size={16} />
                  </button>
                </div>
              </div>

              {/* Suggested doctors panel */}
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Stethoscope size={16} className="text-brand" /> Suggested Doctors</h3>
                {!suggestedSpecialty ? (
                  <div className="text-center py-8 text-gray-400">
                    <Stethoscope size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Describe your symptoms and AI will suggest doctors here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="badge-blue mb-3">Recommended: {suggestedSpecialty}</div>
                    {suggestedDoctors.length === 0 ? (
                      <p className="text-sm text-gray-400">No {suggestedSpecialty} doctors available right now.</p>
                    ) : suggestedDoctors.map(d => (
                      <div key={d._id} className="border border-gray-100 rounded-xl p-3 hover:border-brand transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-sm flex-shrink-0">{d.user?.name?.[0]}</div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">Dr. {d.user?.name}</p>
                            <p className="text-xs text-gray-500">{d.specialties?.slice(0,2).join(', ')} · ⭐ {d.rating}</p>
                          </div>
                        </div>
                        <Link href={`/patient/find-doctor?book=${d._id}`}
                          className="flex items-center justify-center gap-1 w-full py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand/90 transition-colors">
                          Book Now <ArrowRight size={11} />
                        </Link>
                      </div>
                    ))}
                    <Link href={`/patient/find-doctor?specialty=${encodeURIComponent(suggestedSpecialty)}`}
                      className="btn-primary w-full text-xs py-2 mt-2">
                      See All {suggestedSpecialty} Doctors
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── UPLOAD TAB ───────────────────────────────── */}
          {tab === 'upload' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                <h2 className="font-semibold text-gray-900 mb-1">Paste Prescription Text</h2>
                <p className="text-sm text-gray-500 mb-4">Copy text from your prescription or type your diagnosis notes — AI will identify the right specialist for you</p>
                <textarea value={text} onChange={e => setText(e.target.value)} rows={10}
                  placeholder="e.g. Patient presents with recurring chest pain and shortness of breath on exertion. ECG shows ST changes. Referred for cardiology review. Medications: Aspirin 100mg daily, Metoprolol 25mg BD..."
                  className="input resize-none" />
                <button onClick={analyse} disabled={analysing || !text.trim()} className="btn-primary w-full mt-4 py-3">
                  {analysing ? <><span className="spin" /> Analysing with AI…</> : <><Bot size={16} /> Analyse & Find Specialist</>}
                </button>
              </div>

              {/* Result */}
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
                {!result ? (
                  <div className="h-full flex items-center justify-center text-center text-gray-400 py-12">
                    <div><FileText size={40} className="mx-auto mb-3 opacity-30" /><p className="font-medium">Analysis results will appear here</p><p className="text-sm mt-1">Paste prescription text and click Analyse</p></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">AI Analysis Results</h3>

                    {/* Urgency */}
                    {result.urgency && (() => {
                      const cfg = urgencyConfig[result.urgency] || urgencyConfig.routine;
                      return (
                        <div className={`flex items-center gap-2 ${cfg.badge} px-3 py-2 rounded-xl w-fit`}>
                          <cfg.icon size={14} /> <span className="text-sm font-semibold">{cfg.text}</span>
                        </div>
                      );
                    })()}

                    {/* Summary */}
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">{result.summary}</div>

                    {/* Recommended specialty */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recommended Specialist</p>
                      <span className="badge-blue text-sm px-3 py-1">{result.recommendedSpecialty}</span>
                    </div>

                    {/* Conditions */}
                    {result.conditions?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Identified Conditions</p>
                        <div className="flex flex-wrap gap-1.5">{result.conditions.map((c: string, i: number) => <span key={i} className="badge-red">{c}</span>)}</div>
                      </div>
                    )}

                    {/* Medications */}
                    {result.medications?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Medications Mentioned</p>
                        <div className="flex flex-wrap gap-1.5">{result.medications.map((m: string, i: number) => <span key={i} className="badge-gray">{m}</span>)}</div>
                      </div>
                    )}

                    {/* Matching doctors from DB */}
                    {result.matchingDoctors?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Available Doctors</p>
                        <div className="space-y-2">
                          {result.matchingDoctors.map((d: any) => (
                            <div key={d._id} className="flex items-center justify-between border border-gray-100 rounded-xl p-3">
                              <div>
                                <p className="font-medium text-sm text-gray-900">Dr. {d.user?.name}</p>
                                <p className="text-xs text-gray-500">{d.specialties?.slice(0, 2).join(', ')}</p>
                              </div>
                              <Link href={`/patient/find-doctor?specialty=${encodeURIComponent(result.recommendedSpecialty)}`}
                                className="btn-primary text-xs py-1.5 px-3">Book</Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Link href={`/patient/find-doctor?specialty=${encodeURIComponent(result.recommendedSpecialty)}`}
                      className="btn-primary w-full mt-2">
                      <Stethoscope size={15} /> Find All {result.recommendedSpecialty} Doctors
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </RouteGuard>
  );
}
