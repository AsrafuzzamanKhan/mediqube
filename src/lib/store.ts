import { create } from 'zustand';
import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(cfg => {
  if (typeof window !== 'undefined') {
    const s = localStorage.getItem('mq_user');
    if (s) cfg.headers.Authorization = `Bearer ${JSON.parse(s).token}`;
  }
  return cfg;
});
api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('mq_user');
    window.location.href = '/login';
  }
  return Promise.reject(err);
});

// ── Auth store ─────────────────────────────────────────────
export interface User { _id: string; name: string; email: string; role: 'admin' | 'doctor' | 'patient'; avatar?: string; phone?: string; token: string; }
interface S { user: User | null; setUser: (u: User) => void; logout: () => void; init: () => void; }
export const useAuth = create<S>(set => ({
  user: null,
  setUser: u => { localStorage.setItem('mq_user', JSON.stringify(u)); set({ user: u }); },
  logout: () => { localStorage.removeItem('mq_user'); set({ user: null }); window.location.href = '/login'; },
  init: () => { const s = localStorage.getItem('mq_user'); if (s) set({ user: JSON.parse(s) }); },
}));

// ── API helpers ────────────────────────────────────────────
export const authAPI = {
  login: (d: any) => api.post('/auth/login', d),
  register: (d: any) => api.post('/auth/register', d),
  me: () => api.get('/auth/me'),
  password: (d: any) => api.put('/auth/password', d),
};
export const doctorAPI = {
  getAll: (p?: any) => api.get('/doctors', { params: p }),
  getOne: (id: string) => api.get(`/doctors/${id}`),
  specialties: () => api.get('/doctors/specialties'),
  suggestions: (q: string) => api.get('/doctors/suggestions', { params: { q } }),
  myProfile: () => api.get('/doctors/me'),
  updateMe: (d: any) => api.put('/doctors/me', d),
};
export const apptAPI = {
  book: (d: any) => api.post('/appointments', d),
  getMy: (p?: any) => api.get('/appointments', { params: p }),
  getOne: (id: string) => api.get(`/appointments/${id}`),
  updateStatus: (id: string, d: any) => api.put(`/appointments/${id}/status`, d),
  addPresc: (id: string, d: any) => api.put(`/appointments/${id}/prescription`, d),
  cancel: (id: string) => api.put(`/appointments/${id}/cancel`),
  dashboard: () => api.get('/appointments/doctor/dashboard'),
  adminAll: (p?: any) => api.get('/appointments/admin/all', { params: p }),
  getDoctorDashboard: function () {
    return this.dashboard();
  },
  bookAppointment: function (d: any) {
    return this.book(d);
  },
};
export const adminAPI = {
  stats: () => api.get('/admin/stats'),
  users: (p?: any) => api.get('/admin/users', { params: p }),
  updateUser: (id: string, d: any) => api.put(`/admin/users/${id}`, d),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  doctors: () => api.get('/admin/doctors'),
  approve: (id: string, d: any) => api.put(`/admin/doctors/${id}/approve`, d),
  getStats: function () {
    return this.stats();
  },
  updateUserAdmin: function (id: string, d: any) {
    return this.updateUser(id, d);
  },
  deleteUserAdmin: function (id: string) {
    return this.deleteUser(id);
  },
  approveDoctor: function (id: string, d: any) {
    return this.approve(id, d);
  },
};
export const faqAPI = {
  getAll: (p?: any) => api.get('/faq', { params: p }),
  cats: () => api.get('/faq/categories'),
  create: (d: any) => api.post('/faq', d),
  update: (id: string, d: any) => api.put(`/faq/${id}`, d),
  remove: (id: string) => api.delete(`/faq/${id}`),
};
export const aiAPI = {
  chat: (d: any) => api.post('/ai/chat', d),
  analyse: (d: any) => api.post('/ai/analyse-prescription', d),
};
export const notifAPI = {
  getAll: () => api.get('/notifications'),
  markOne: (id: string) => api.put(`/notifications/${id}/read`),
  markAll: () => api.put('/notifications/read-all'),
  remove: (id: string) => api.delete(`/notifications/${id}`),
};
export const supportAPI = {
  create: (d: any) => api.post('/support', d),
  getMy: () => api.get('/support/my'),
  getAll: (p?: any) => api.get('/support/all', { params: p }),
  getOne: (id: string) => api.get(`/support/${id}`),
  reply: (id: string, d: any) => api.post(`/support/${id}/reply`, d),
  status: (id: string, d: any) => api.put(`/support/${id}/status`, d),
};
export const userAPI = {
  updateProfile: (d: any) => api.put('/users/profile', d),
  getPatient: () => api.get('/users/patient-profile'),
  updatePatient: (d: any) => api.put('/users/patient-profile', d),
};

// Alias for backward compatibility
export const useAuthStore = useAuth;
