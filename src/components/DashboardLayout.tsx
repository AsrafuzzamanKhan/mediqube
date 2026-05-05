'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, notifAPI } from '@/lib/store';
import { LayoutDashboard, Calendar, Users, UserCheck, MessageSquare, HelpCircle, Bell, Menu, X, LogOut, Stethoscope, FileText, UserCircle, Bot, ShieldCheck, Activity } from 'lucide-react';

const NAV: Record<string, { label:string; href:string; icon:any }[]> = {
  admin: [
    { label:'Dashboard',    href:'/admin',              icon:LayoutDashboard },
    { label:'Users',        href:'/admin/users',        icon:Users },
    { label:'Doctors',      href:'/admin/doctors',      icon:UserCheck },
    { label:'Appointments', href:'/admin/appointments', icon:Calendar },
    { label:'FAQs',         href:'/admin/faq',          icon:HelpCircle },
    { label:'Support',      href:'/admin/support',      icon:MessageSquare },
  ],
  doctor: [
    { label:'Dashboard',    href:'/doctor',              icon:LayoutDashboard },
    { label:'Appointments', href:'/doctor/appointments', icon:Calendar },
    { label:'My Profile',   href:'/doctor/profile',      icon:UserCircle },
    { label:'Support',      href:'/doctor/support',      icon:MessageSquare },
  ],
  patient: [
    { label:'Dashboard',    href:'/patient',                 icon:LayoutDashboard },
    { label:'Find Doctor',  href:'/patient/find-doctor',     icon:Stethoscope },
    { label:'AI Assistant', href:'/patient/ai-chat',         icon:Bot },
    { label:'Appointments', href:'/patient/appointments',    icon:Calendar },
    { label:'Prescriptions',href:'/patient/prescriptions',   icon:FileText },
    { label:'Health FAQs',  href:'/faq',                     icon:HelpCircle },
    { label:'My Profile',   href:'/patient/profile',         icon:UserCircle },
    { label:'Support',      href:'/patient/support',         icon:MessageSquare },
  ],
};

const GRAD: Record<string,string> = { admin:'from-purple-700 to-purple-900', doctor:'from-blue-700 to-blue-900', patient:'from-brand to-brand-dark' };

function NotifPanel({ onClose }: { onClose:()=>void }) {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { notifAPI.getAll().then(r=>setItems(r.data.data)).catch(()=>{}); }, []);
  const icons: Record<string,string> = { appointment_request:'📅', appointment_approved:'✅', appointment_rejected:'❌', prescription_added:'💊', appointment_completed:'🏥' };
  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="font-semibold text-sm">Notifications</span>
        <div className="flex gap-2 items-center">
          <button onClick={()=>notifAPI.markAll().then(()=>setItems(i=>i.map(n=>({...n,isRead:true}))))} className="text-xs text-brand hover:underline">Mark all read</button>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={14}/></button>
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
        {items.length===0 ? <div className="py-10 text-center text-sm text-gray-400">No notifications</div> :
          items.map(n=>(
            <div key={n._id} onClick={()=>notifAPI.markOne(n._id).then(()=>setItems(i=>i.map(x=>x._id===n._id?{...x,isRead:true}:x)))}
              className={`flex gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer ${!n.isRead?'bg-green-50/40':''}`}>
              <span className="text-lg">{icons[n.type]||'🔔'}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 leading-tight">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('en-AU',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</p>
              </div>
              {!n.isRead && <div className="w-2 h-2 bg-brand rounded-full flex-shrink-0 mt-1"/>}
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default function DashboardLayout({ role, children }: { role:'admin'|'doctor'|'patient'; children:React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => { notifAPI.getAll().then(r=>setUnread(r.data.unread||0)).catch(()=>{}); }, [pathname]);

  const SideContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center"><ShieldCheck size={15} className="text-white"/></div>
          <div><p className="text-white font-bold text-sm leading-none">MediQube</p><p className="text-white/50 text-xs mt-0.5 capitalize">{role} Portal</p></div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV[role]?.map(item => {
          const active = pathname===item.href || (pathname.startsWith(item.href) && item.href!==`/${role}`);
          return (
            <Link key={item.href} href={item.href} onClick={()=>setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active?'bg-white/20 text-white':'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <item.icon size={16}/>{item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="min-w-0"><p className="text-white text-sm font-medium truncate">{user?.name}</p><p className="text-white/50 text-xs capitalize">{user?.role}</p></div>
        </div>
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white w-full text-sm">
          <LogOut size={15}/>Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className={`hidden md:flex w-56 flex-shrink-0 bg-gradient-to-b ${GRAD[role]} flex-col`}><SideContent/></div>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setOpen(false)}/>
          <div className={`absolute left-0 top-0 bottom-0 w-56 bg-gradient-to-b ${GRAD[role]}`}><SideContent/></div>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center">
          <button onClick={()=>setOpen(true)} className="md:hidden p-2 hover:bg-gray-100 rounded-xl mr-2"><Menu size={18}/></button>
          <div className="flex-1"/>
          <div className="relative">
            <button onClick={()=>{setNotifOpen(!notifOpen);setUnread(0);}} className="relative p-2.5 hover:bg-gray-100 rounded-xl">
              <Bell size={18} className="text-gray-600"/>
              {unread>0 && <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">{unread>9?'9+':unread}</span>}
            </button>
            {notifOpen && <NotifPanel onClose={()=>setNotifOpen(false)}/>}
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-5 md:p-7">{children}</main>
      </div>
    </div>
  );
}
