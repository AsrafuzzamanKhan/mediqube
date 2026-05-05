'use client';
import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { ArrowLeft } from 'lucide-react';

export default function VideoCallPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const { user, init } = useAuth();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    init();
    const stored = localStorage.getItem('mb_user');
    if (!stored || !roomId) return;
    const u = JSON.parse(stored);
    const appId = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || '0');
    const secret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || '';
    if (!appId || !secret) {
      if (ref.current) ref.current.innerHTML = '<div style="color:white;text-align:center;padding:40px"><h2>⚙️ ZegoCloud not configured</h2><p style="opacity:.7;margin-top:8px">Add ZEGO_APP_ID and ZEGO_SERVER_SECRET to frontend/.env.local</p></div>';
      return;
    }
    import('@zegocloud/zego-uikit-prebuilt').then(({ ZegoUIKitPrebuilt }) => {
      const token = ZegoUIKitPrebuilt.generateKitTokenForTest(appId, secret, roomId as string, u._id, u.name);
      const zp = ZegoUIKitPrebuilt.create(token);
      zp.joinRoom({ container: ref.current!, scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall }, onLeaveRoom: () => router.back() });
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex items-center gap-3 px-5 py-3 bg-gray-800">
        <button onClick={() => router.back()} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"><ArrowLeft size={18}/></button>
        <div><p className="text-white font-semibold text-sm">Video Consultation</p><p className="text-gray-400 text-xs">Room: {roomId}</p></div>
        <div className="ml-auto flex items-center gap-2"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/><span className="text-green-400 text-xs font-medium">Live</span></div>
      </div>
      <div ref={ref} className="flex-1" style={{ minHeight: 'calc(100vh - 56px)' }} />
    </div>
  );
}
