'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { ArrowLeft, Loader2 } from 'lucide-react';

const HEADER_H = 56;

export default function VideoCallPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const { user, init } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const joined = useRef(false);

  useEffect(() => { init(); }, []);

  useEffect(() => {
    if (!user || !roomId || joined.current) return;

    const appId = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || '0');
    const secret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || '';

    if (!appId || !secret) {
      setErrorMsg('ZegoCloud credentials missing — add NEXT_PUBLIC_ZEGO_APP_ID and NEXT_PUBLIC_ZEGO_SERVER_SECRET to .env.local');
      setStatus('error');
      return;
    }

    joined.current = true;

    import('@zegocloud/zego-uikit-prebuilt')
      .then(({ ZegoUIKitPrebuilt }) => {
        const token = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appId, secret, roomId as string, user._id, user.name
        );
        const zp = ZegoUIKitPrebuilt.create(token);
        zp.joinRoom({
          container: ref.current!,
          scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
          onJoinRoom: () => setStatus('ready'),
          onLeaveRoom: () => router.back(),
        });
      })
      .catch(err => {
        console.error('ZegoCloud error:', err);
        setErrorMsg(err?.message || 'Failed to load ZegoCloud');
        setStatus('error');
        joined.current = false;
      });
  }, [user, roomId]);

  const bodyH = `calc(100vh - ${HEADER_H}px)`;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#111827' }}>
      {/* Header */}
      <div style={{ height: HEADER_H, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', background: '#1f2937' }}>
        <button onClick={() => router.back()} style={{ padding: 8, color: '#9ca3af', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <p style={{ color: 'white', fontWeight: 600, fontSize: 14, margin: 0 }}>Video Consultation</p>
          <p style={{ color: '#9ca3af', fontSize: 12, margin: 0 }}>Room: {roomId}</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {status === 'ready' && <>
            <span style={{ width: 8, height: 8, background: '#4ade80', borderRadius: '50%' }} />
            <span style={{ color: '#4ade80', fontSize: 12, fontWeight: 500 }}>Live</span>
          </>}
          {status === 'loading' && <span style={{ color: '#9ca3af', fontSize: 12 }}>Connecting…</span>}
        </div>
      </div>

      {/* Body */}
      <div style={{ height: bodyH, position: 'relative', flexShrink: 0 }}>
        {/* ZegoCloud container — always visible with explicit dimensions */}
        <div ref={ref} style={{ width: '100%', height: '100%' }} />

        {/* Loading overlay */}
        {status === 'loading' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111827', zIndex: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <Loader2 size={40} color="#4ade80" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>
                {!user ? 'Authenticating…' : 'Connecting to video call…'}
              </p>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {status === 'error' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111827', zIndex: 10 }}>
            <div style={{ textAlign: 'center', maxWidth: 360, padding: '0 24px' }}>
              <p style={{ fontSize: 48, margin: '0 0 16px' }}>⚠️</p>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>Video call failed</h2>
              <p style={{ color: '#9ca3af', fontSize: 14, margin: '0 0 20px' }}>{errorMsg}</p>
              <button onClick={() => router.back()} style={{ padding: '8px 20px', border: '1px solid #4b5563', color: 'white', borderRadius: 10, background: 'transparent', cursor: 'pointer', fontSize: 14 }}>
                Go back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
