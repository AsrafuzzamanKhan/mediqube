'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/store';
import {
  Stethoscope, Bot, Video, CheckCircle, ArrowRight,
  Menu, X, Heart, Brain, Eye, Bone, Baby, Smile, Search, Calendar, FileText, Bell
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features',     href: '#features' },
  { label: 'How It Works', href: '#how' },
  { label: 'Specialties',  href: '#specialties' },
  { label: 'FAQ',          href: '#faq' },
];

const FEATURES = [
  { icon: Search,      color: 'bg-blue-500',   title: 'Search by Specialty',     desc: 'Find the right doctor instantly by specialty, name, or condition. Filter by availability and fee.' },
  { icon: Bot,         color: 'bg-purple-500', title: 'AI Symptom Assistant',     desc: 'Describe your symptoms to our free AI. It suggests the right specialist and shows available doctors instantly.' },
  { icon: FileText,    color: 'bg-teal-500',   title: 'Prescription Analysis',    desc: 'Paste your old prescription — AI reads it, identifies conditions, and finds matching specialists for you.' },
  { icon: Video,       color: 'bg-green-500',  title: 'Video Consultations',      desc: 'Book a video call with your doctor from home. No downloads needed — opens directly in your browser.' },
  { icon: Calendar,    color: 'bg-amber-500',  title: 'Easy Booking',             desc: 'Pick your doctor, choose a time slot, select video or in-person. Done in under 60 seconds.' },
  { icon: Bell,        color: 'bg-red-500',    title: 'Real-time Notifications',  desc: 'Instant updates when your appointment is approved, and your prescription emailed automatically.' },
];

const STEPS = [
  { step: '01', title: 'Create an Account',       desc: 'Register as a patient in 30 seconds — just name, email, and password.' },
  { step: '02', title: 'Describe Your Symptoms',  desc: 'Chat with the AI or search directly by specialty. AI suggests the right type of doctor.' },
  { step: '03', title: 'Book Your Appointment',   desc: 'Choose a doctor, pick a time, and select video or in-person. Confirm in one click.' },
  { step: '04', title: 'Get Your Prescription',   desc: 'After your consultation, the doctor issues a digital prescription emailed directly to you.' },
];

const SPECIALTIES = [
  { icon: Heart,       label: 'Cardiologist',          color: 'text-red-500    bg-red-50' },
  { icon: Brain,       label: 'Neurologist',            color: 'text-purple-500 bg-purple-50' },
  { icon: Eye,         label: 'Ophthalmologist',        color: 'text-blue-500   bg-blue-50' },
  { icon: Bone,        label: 'Orthopedic',             color: 'text-amber-500  bg-amber-50' },
  { icon: Baby,        label: 'Pediatrician',           color: 'text-pink-500   bg-pink-50' },
  { icon: Smile,       label: 'Dermatologist',          color: 'text-teal-500   bg-teal-50' },
  { icon: Stethoscope, label: 'General Practitioner',   color: 'text-green-500  bg-green-50' },
  { icon: Brain,       label: 'Psychiatrist',           color: 'text-indigo-500 bg-indigo-50' },
];

const FAQS = [
  { q: 'Is MediQube free to use?',               a: 'Signing up and browsing doctors is completely free. You only pay the doctor\'s consultation fee when you book.' },
  { q: 'How does the AI assistant work?',         a: 'Type your symptoms in plain English. The AI (powered by Groq — free) analyses your message and recommends the right specialist, then shows available doctors.' },
  { q: 'Can I upload my old prescription?',       a: 'Yes! Paste the text from your old prescription. The AI identifies conditions and medications, then finds matching doctors for you.' },
  { q: 'How do video consultations work?',        a: 'After approval, a "Join Video Call" button appears. It opens in your browser — no app needed. The doctor joins at the scheduled time.' },
  { q: 'How do I receive my prescription?',       a: 'After your consultation, the doctor fills in your prescription on MediQube. It is automatically emailed to you within minutes.' },
  { q: 'Is my health information private?',       a: 'Yes. All data is stored securely with JWT authentication. Only you and your treating doctor can see your information.' },
];

const STATS = [
  { value: '8+',    label: 'Specialist Doctors' },
  { value: '100%',  label: 'Free AI Assistant' },
  { value: '< 60s', label: 'To Book' },
  { value: '24/7',  label: 'Platform Access' },
];

export default function HomePage() {
  const { init } = useAuth();
  const router   = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFAQ, setOpenFAQ]   = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    init();
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur shadow-sm border-b border-gray-100' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-brand to-brand-light rounded-xl flex items-center justify-center shadow">
              <Stethoscope size={17} className="text-white" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-gray-900' : 'text-white'}`}>MediQube</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href}
                className={`text-sm font-medium transition-colors hover:text-brand ${scrolled ? 'text-gray-600' : 'text-white/90 hover:text-white'}`}>
                {l.label}
              </a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login"
              className={`text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/15'}`}>
              Sign In
            </Link>
            <Link href="/register"
              className="text-sm font-semibold px-4 py-2.5 bg-white text-brand rounded-xl hover:bg-green-50 shadow-sm transition-colors">
              Get Started Free
            </Link>
          </div>
          <button onClick={() => setMenuOpen(v => !v)} className={`md:hidden p-2 rounded-lg ${scrolled ? 'text-gray-700' : 'text-white'}`}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-5 py-4 space-y-2 shadow-lg">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-sm font-medium text-gray-700 hover:text-brand">{l.label}</a>
            ))}
            <div className="pt-3 flex flex-col gap-2 border-t border-gray-100">
              <Link href="/login"    className="btn-outline w-full text-center text-sm">Sign In</Link>
              <Link href="/register" className="btn-primary w-full text-center text-sm">Get Started Free</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand to-brand-light" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        <div className="absolute top-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-5 pt-24 pb-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Bot size={13} /> AI-Powered · 100% Free AI Assistant
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-5">
              Your Health,<br />
              <span className="text-green-300">Smarter</span> &<br />
              Simpler.
            </h1>
            <p className="text-green-100 text-lg leading-relaxed mb-8 max-w-md">
              Find the right doctor, chat with AI about your symptoms, analyse your prescription, and book a video or in-person consultation — all in one place.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/register"
                className="flex items-center gap-2 bg-white text-brand px-6 py-3.5 rounded-xl font-bold text-sm hover:bg-green-50 transition-all shadow-lg hover:-translate-y-0.5">
                Get Started Free <ArrowRight size={15} />
              </Link>
              <Link href="/login"
                className="flex items-center gap-2 bg-white/15 backdrop-blur text-white px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-white/25 transition-all border border-white/20">
                Sign In
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-green-200">
              {['No credit card needed', 'Free AI assistant', 'Australian GPs'].map(t => (
                <span key={t} className="flex items-center gap-1.5"><CheckCircle size={12} className="text-green-300" />{t}</span>
              ))}
            </div>
          </div>

          {/* Right panel — AI chat mockup */}
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-6 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center"><Bot size={18} className="text-white" /></div>
                <div><p className="text-white font-semibold text-sm">MediQube AI Assistant</p><p className="text-green-200 text-xs">Powered by Groq · Free</p></div>
                <div className="ml-auto flex gap-1">{[...Array(3)].map((_,i)=><div key={i} className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" style={{animationDelay:`${i*200}ms`}}/>)}</div>
              </div>
              {[
                { role:'user', msg:'I have chest pain and shortness of breath for 3 days' },
                { role:'ai',  msg:'Based on your symptoms, I recommend seeing a 👉 Cardiologist. I found 2 available doctors on MediQube:' },
              ].map((m,i)=>(
                <div key={i} className={`flex gap-3 ${m.role==='user'?'flex-row-reverse':''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${m.role==='ai'?'bg-white/20 text-white':'bg-green-300 text-brand-dark font-bold'}`}>
                    {m.role==='ai'?'🤖':'P'}
                  </div>
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role==='ai'?'bg-white/15 text-white rounded-tl-sm':'bg-green-300 text-brand-dark font-medium rounded-tr-sm'}`}>
                    {m.msg}
                  </div>
                </div>
              ))}
              {[
                { name:'Dr. James Chen', spec:'Cardiologist', fee:'$180', rating:'4.9' },
                { name:'Dr. Sarah Mitchell', spec:'GP', fee:'$80', rating:'4.8' },
              ].map(d=>(
                <div key={d.name} className="flex items-center justify-between bg-white/10 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">{d.name[4]}</div>
                    <div><p className="text-white text-sm font-semibold">{d.name}</p><p className="text-green-200 text-xs">{d.spec}</p></div>
                  </div>
                  <div className="text-right"><p className="text-white text-xs font-bold">{d.fee}</p><p className="text-green-300 text-xs">⭐ {d.rating}</p></div>
                </div>
              ))}
              <Link href="/register"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white text-brand rounded-xl font-bold text-sm hover:bg-green-50 transition-colors">
                Book Appointment <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,30 C480,60 960,0 1440,30 L1440,60 L0,60 Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-4xl font-extrabold text-brand mb-1">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-brand uppercase tracking-widest">Features</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-3">Everything You Need</h2>
            <p className="text-gray-500 max-w-xl mx-auto">MediQube brings AI, booking, video calls, and prescriptions into one seamless platform.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-white rounded-2xl p-6 shadow-card hover:shadow-hover transition-all hover:-translate-y-1 border border-gray-100">
                <div className={`w-11 h-11 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon size={20} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-brand uppercase tracking-widest">How It Works</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-3">From Symptoms to Prescription</h2>
            <p className="text-gray-500">Four simple steps — the whole process takes less than 5 minutes.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {STEPS.map(s => (
              <div key={s.step} className="flex gap-5 p-6 rounded-2xl border border-gray-100 hover:border-brand/30 hover:bg-green-50/30 transition-all">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-brand to-brand-light rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECIALTIES ── */}
      <section id="specialties" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-brand uppercase tracking-widest">Specialties</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mt-2 mb-3">Find the Right Specialist</h2>
            <p className="text-gray-500">Browse across 8+ specialties — all verified doctors.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {SPECIALTIES.map(s => (
              <Link key={s.label} href="/register"
                className="bg-white rounded-2xl p-5 text-center hover:shadow-hover transition-all hover:-translate-y-1 border border-gray-100 group">
                <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <s.icon size={22} />
                </div>
                <p className="text-sm font-semibold text-gray-800">{s.label}</p>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link href="/register" className="inline-flex items-center gap-2 btn-primary px-8 py-3.5">
              Browse All Doctors <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── AI HIGHLIGHT ── */}
      <section className="py-20 bg-gradient-to-br from-brand-dark via-brand to-brand-light relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative max-w-4xl mx-auto px-5 text-center text-white">
          <span className="text-xs font-bold text-green-300 uppercase tracking-widest">AI Assistant</span>
          <h2 className="text-4xl font-extrabold mt-2 mb-4">Not Sure Which Doctor You Need?</h2>
          <p className="text-green-100 leading-relaxed mb-6 max-w-xl mx-auto">
            Just describe what you're feeling in plain English. Our AI listens and recommends the right specialist — then shows you who's available right now on MediQube.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {['Works with any symptoms','Analyses old prescriptions','Completely free','Available 24/7'].map(t=>(
              <div key={t} className="flex items-center gap-2 text-sm text-green-100 bg-white/10 px-4 py-2 rounded-full">
                <CheckCircle size={13} className="text-green-300"/> {t}
              </div>
            ))}
          </div>
          <Link href="/register"
            className="inline-flex items-center gap-2 bg-white text-brand px-8 py-4 rounded-xl font-bold text-sm hover:bg-green-50 transition-all shadow-lg">
            Try AI Assistant Free <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-5">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-brand uppercase tracking-widest">FAQ</span>
            <h2 className="text-4xl font-extrabold text-gray-900 mt-2">Common Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <div key={i} className={`border rounded-2xl overflow-hidden transition-all ${openFAQ===i?'border-brand shadow-sm':'border-gray-200'}`}>
                <button onClick={() => setOpenFAQ(openFAQ===i?null:i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors">
                  <span className="font-semibold text-gray-900 text-sm">{f.q}</span>
                  <span className={`text-xl text-gray-400 transition-transform flex-shrink-0 ml-3 leading-none ${openFAQ===i?'rotate-45':''}`}>+</span>
                </button>
                {openFAQ===i && (
                  <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-5 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-brand to-brand-light rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Stethoscope size={28} className="text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Ready to See a Doctor?</h2>
          <p className="text-gray-500 mb-8 text-lg">Join MediQube today. Find the right specialist and book in under 60 seconds.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="inline-flex items-center gap-2 btn-primary px-8 py-4 text-base shadow-lg hover:-translate-y-0.5 transition-all">
              Create Free Account <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="inline-flex items-center gap-2 btn-outline px-8 py-4 text-base">
              Sign In
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-5">No credit card required · Free to get started</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand to-brand-light rounded-xl flex items-center justify-center">
                <Stethoscope size={15} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg">MediQube</span>
            </div>
            <p className="text-sm text-center">Built with ❤️ for the Australian healthcare system · University Full-Stack Project</p>
            <div className="flex gap-5 text-sm">
              <Link href="/login"    className="hover:text-white transition-colors">Sign In</Link>
              <Link href="/register" className="hover:text-white transition-colors">Register</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-7 pt-6 text-center text-xs text-gray-600">
            MediQube is a university project demonstration. Not for real medical use. In an emergency, call 000.
          </div>
        </div>
      </footer>

    </div>
  );
}
