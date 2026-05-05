'use client';
import { useEffect, useState } from 'react';
import RouteGuard from '@/components/RouteGuard';
import DashboardLayout from '@/components/DashboardLayout';
import { adminAPI } from '@/lib/store';
import { Search, UserX, UserCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users,setUsers]=useState<any[]>([]);
  const [search,setSearch]=useState('');
  const [role,setRole]=useState('');
  const [loading,setLoading]=useState(true);
  const load=()=>{setLoading(true);adminAPI.users({search,role,limit:50}).then(r=>setUsers(r.data.data)).catch(()=>toast.error('Failed')).finally(()=>setLoading(false));};
  useEffect(()=>{load();},[search,role]);
  const toggle=(id:string,active:boolean)=>adminAPI.updateUser(id,{isActive:!active}).then(()=>{toast.success(`User ${!active?'activated':'deactivated'}`);load();}).catch(()=>toast.error('Failed'));
  const del=(id:string,name:string)=>{if(!confirm(`Delete "${name}"?`))return;adminAPI.deleteUser(id).then(()=>{toast.success('Deleted');load();}).catch(()=>toast.error('Failed'));};
  const RC:Record<string,string>={admin:'badge-purple',doctor:'badge-blue',patient:'badge-green'};
  return (
    <RouteGuard allowedRoles={['admin']}><DashboardLayout role="admin">
      <div className="space-y-5">
        <div><h1 className="text-2xl font-bold text-gray-900">Users</h1><p className="text-gray-500 text-sm mt-1">{users.length} total</p></div>
        <div className="card flex flex-wrap gap-3 p-4">
          <div className="relative flex-1 min-w-48"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" className="input pl-9"/></div>
          <select value={role} onChange={e=>setRole(e.target.value)} className="input w-40"><option value="">All Roles</option><option value="admin">Admin</option><option value="doctor">Doctor</option><option value="patient">Patient</option></select>
        </div>
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full">
            <thead className="bg-gray-50 border-b"><tr>{['User','Role','Status','Joined','Actions'].map(h=><th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {loading?[...Array(5)].map((_,i)=><tr key={i}><td colSpan={5}><div className="h-10 bg-gray-50 m-2 rounded animate-pulse"/></td></tr>):
              users.length===0?<tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">No users found</td></tr>:
              users.map(u=>(
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm">{u.name?.[0]?.toUpperCase()}</div><div><p className="font-medium text-gray-900 text-sm">{u.name}</p><p className="text-xs text-gray-500">{u.email}</p></div></div></td>
                  <td className="px-5 py-3"><span className={`${RC[u.role]||'badge-gray'} capitalize`}>{u.role}</span></td>
                  <td className="px-5 py-3"><span className={u.isActive?'badge-green':'badge-red'}>{u.isActive?'Active':'Inactive'}</span></td>
                  <td className="px-5 py-3 text-sm text-gray-600">{new Date(u.createdAt).toLocaleDateString('en-AU')}</td>
                  <td className="px-5 py-3"><div className="flex gap-2"><button onClick={()=>toggle(u._id,u.isActive)} className={`p-1.5 rounded-lg ${u.isActive?'text-amber-500 hover:bg-amber-50':'text-green-600 hover:bg-green-50'}`}>{u.isActive?<UserX size={14}/>:<UserCheck size={14}/>}</button><button onClick={()=>del(u._id,u.name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button></div></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      </div>
    </DashboardLayout></RouteGuard>
  );
}
