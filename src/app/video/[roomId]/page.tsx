'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, apptAPI } from '@/lib/store';
import { ArrowLeft, Loader2, Star, X } from 'lucide-react';

const HEADER_H = 56;

interface AppointmentInfo {
  _id: string;
  doctor: { _id: string; name: string; avatar?: string };
  rating?: number;
}

function RatingModal({
  appt,
  onSubmit,
  onSkip,
}: {
  appt: AppointmentInfo;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onSkip: () => void;
}) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    await onSubmit(selected, comment);
    setSubmitting(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#1f2937', borderRadius: 16, padding: 32,
        width: '100%', maxWidth: 440,
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        position: 'relative',
      }}>
        {/* Close / skip */}
        <button
          onClick={onSkip}
          style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4 }}
        >
          <X size={20} />
        </button>

        {/* Doctor avatar + name */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          {appt.doctor.avatar ? (
            <img
              src={appt.doctor.avatar}
              alt={appt.doctor.name}
              style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', display: 'block', border: '3px solid #374151' }}
            />
          ) : (
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: '#374151',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px', fontSize: 28, color: '#9ca3af',
            }}>
              {appt.doctor.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>
            Rate your consultation
          </h2>
          <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>
            with Dr. {appt.doctor.name}
          </p>
        </div>

        {/* Stars */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setSelected(n)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, transition: 'transform 0.1s' }}
            >
              <Star
                size={36}
                fill={(hovered || selected) >= n ? '#f59e0b' : 'none'}
                color={(hovered || selected) >= n ? '#f59e0b' : '#4b5563'}
                style={{ transition: 'color 0.15s, fill 0.15s' }}
              />
            </button>
          ))}
        </div>

        {/* Label */}
        <p style={{ textAlign: 'center', color: '#f59e0b', fontSize: 14, fontWeight: 500, minHeight: 20, marginBottom: 20 }}>
          {labels[hovered || selected] || ''}
        </p>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Leave a comment (optional)…"
          rows={3}
          style={{
            width: '100%', background: '#111827', border: '1px solid #374151',
            borderRadius: 10, padding: '10px 14px', color: 'white',
            fontSize: 14, resize: 'none', outline: 'none',
            boxSizing: 'border-box', marginBottom: 20,
          }}
        />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onSkip}
            style={{
              flex: 1, padding: '10px 0', border: '1px solid #374151',
              borderRadius: 10, background: 'transparent', color: '#9ca3af',
              fontSize: 14, cursor: 'pointer',
            }}
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selected || submitting}
            style={{
              flex: 2, padding: '10px 0', border: 'none',
              borderRadius: 10,
              background: selected ? '#10b981' : '#374151',
              color: selected ? 'white' : '#6b7280',
              fontSize: 14, fontWeight: 600,
              cursor: selected ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {submitting && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
            Submit Rating
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VideoCallPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const { user, init } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const zpRef = useRef<any>(null);
  const [phase, setPhase] = useState<'init' | 'joined' | 'error'>('init');
  const [errorMsg, setErrorMsg] = useState('');
  const [appt, setAppt] = useState<AppointmentInfo | null>(null);
  const [showRating, setShowRating] = useState(false);

  useEffect(() => { init(); }, []);

  // Fetch appointment info so we have doctor name + appt ID for rating
  useEffect(() => {
    if (!user || !roomId) return;
    apptAPI.getByRoom(roomId as string)
      .then(r => setAppt(r.data.data))
      .catch(() => {}); // non-fatal — rating just won't show
  }, [user?._id, roomId]);

  const handleLeave = useCallback(() => {
    // Only patients rate; skip if already rated or no appt info
    if (user?.role === 'patient' && appt && !appt.rating) {
      setShowRating(true);
    } else {
      router.back();
    }
  }, [user, appt, router]);

  useEffect(() => {
    if (!user || !roomId) return;
    if (zpRef.current) return;

    const appId = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || '0');
    const secret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || '';

    if (!appId || !secret) {
      setErrorMsg('ZegoCloud credentials missing — add NEXT_PUBLIC_ZEGO_APP_ID and NEXT_PUBLIC_ZEGO_SERVER_SECRET to .env.local');
      setPhase('error');
      return;
    }

    const sentinel = Symbol();
    zpRef.current = sentinel as any;

    import('@zegocloud/zego-uikit-prebuilt')
      .then(({ ZegoUIKitPrebuilt }) => {
        if (zpRef.current !== sentinel) return;

        const token = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appId, secret, roomId as string, user._id, user.name
        );
        const zp = ZegoUIKitPrebuilt.create(token);
        zpRef.current = zp;

        setPhase('joined');

        zp.joinRoom({
          container: ref.current!,
          scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
          showPreJoinView: false,
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: false,
          showTextChat: false,
          showUserList: false,
          maxUsers: 2,
          onLeaveRoom: handleLeave,
        });
      })
      .catch(err => {
        if (zpRef.current !== sentinel) return;
        console.error('ZegoCloud error:', err);
        setErrorMsg(err?.message || 'Failed to load ZegoCloud');
        setPhase('error');
        zpRef.current = null;
      });

    return () => {
      const current = zpRef.current;
      zpRef.current = null;
      if (current && current !== sentinel) {
        try { (current as any).leaveRoom?.(); } catch {}
      }
    };
  }, [user?._id, roomId]);

  // Keep handleLeave in sync inside the zego instance without re-running the join effect
  const handleLeaveRef = useRef(handleLeave);
  useEffect(() => { handleLeaveRef.current = handleLeave; }, [handleLeave]);

  const submitRating = async (rating: number, comment: string) => {
    if (!appt) return;
    try {
      await apptAPI.rate(appt._id, { rating, comment: comment.trim() || undefined });
    } catch (e) {
      console.error('Rating failed:', e);
    }
    router.back();
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#111827' }}>
      {/* Header */}
      <div style={{
        height: HEADER_H, flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 20px', background: '#1f2937',
        borderBottom: '1px solid #374151',
      }}>
        <button
          onClick={() => router.back()}
          style={{ padding: 8, color: '#9ca3af', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <p style={{ color: 'white', fontWeight: 600, fontSize: 14, margin: 0 }}>Video Consultation</p>
          <p style={{ color: '#9ca3af', fontSize: 12, margin: 0 }}>Room: {roomId}</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {phase === 'joined' && (
            <>
              <span style={{ width: 8, height: 8, background: '#4ade80', borderRadius: '50%' }} />
              <span style={{ color: '#4ade80', fontSize: 12, fontWeight: 500 }}>Live</span>
            </>
          )}
          {phase === 'init' && <span style={{ color: '#9ca3af', fontSize: 12 }}>Connecting…</span>}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Zego renders both participants' video into this div */}
        <div
          ref={ref}
          style={{ width: '100%', height: '100%', display: phase === 'joined' ? 'block' : 'none' }}
        />

        {phase === 'init' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111827' }}>
            <div style={{ textAlign: 'center' }}>
              <Loader2 size={40} color="#4ade80" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>
                {!user ? 'Authenticating…' : 'Loading video call…'}
              </p>
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111827' }}>
            <div style={{ textAlign: 'center', maxWidth: 360, padding: '0 24px' }}>
              <p style={{ fontSize: 48, margin: '0 0 16px' }}>⚠️</p>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>Video call failed</h2>
              <p style={{ color: '#9ca3af', fontSize: 14, margin: '0 0 20px' }}>{errorMsg}</p>
              <button
                onClick={() => router.back()}
                style={{ padding: '8px 20px', border: '1px solid #4b5563', color: 'white', borderRadius: 10, background: 'transparent', cursor: 'pointer', fontSize: 14 }}
              >
                Go back
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Post-call rating modal — patients only */}
      {showRating && appt && (
        <RatingModal
          appt={appt}
          onSubmit={submitRating}
          onSkip={() => router.back()}
        />
      )}
    </div>
  );
}
