'use client';
import './globals.css';
import { Toaster } from 'react-hot-toast';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><title>MediQube</title></head>
      <body>{children}<Toaster position="top-right" toastOptions={{ duration:4000, style:{background:'#1e293b',color:'#fff',borderRadius:'12px',fontSize:'14px'} }} /></body>
    </html>
  );
}
