'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X, Loader2, CheckCircle, XCircle, MapPin } from 'lucide-react';

interface Props { onClose: () => void; }

type Stage = 'countdown' | 'type' | 'locating' | 'confirm' | 'active' | 'done';

const EMERGENCY_TYPES = [
  { id: 'MEDICAL', label: 'Medical Emergency', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
  { id: 'FIRE', label: 'Fire / Hazard', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  { id: 'ASSAULT', label: 'Assault / Threat', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  { id: 'THEFT', label: 'Theft / Robbery', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  { id: 'OTHER', label: 'Other Emergency', color: 'text-white/60 bg-white/[0.04] border-white/10' },
];

export default function SosButton({ onClose }: Props) {
  const [stage, setStage] = useState<Stage>('countdown');
  const [countdown, setCountdown] = useState(5);
  const [type, setType] = useState('');
  const [lat, setLat] = useState<number | undefined>();
  const [lon, setLon] = useState<number | undefined>();
  const [accuracy, setAccuracy] = useState<number | undefined>();
  const [eventId, setEventId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeEvent, setActiveEvent] = useState<any>(null);

  // Countdown
  useEffect(() => {
    if (stage !== 'countdown') return;
    if (countdown <= 0) { setStage('type'); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, countdown]);

  const handleTypeSelect = (t: string) => {
    setType(t);
    setStage('locating');
    // Try geolocation
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLon(pos.coords.longitude);
          setAccuracy(pos.coords.accuracy);
          setStage('confirm');
        },
        () => { setStage('confirm'); }, // proceed even if denied
        { timeout: 5000 }
      );
    } else {
      setStage('confirm');
    }
  };

  const handleSend = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/safety/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, latitude: lat, longitude: lon, accuracy }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setEventId(data.event.id);
      setActiveEvent(data.event);
      setStage('active');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!eventId) return;
    await fetch(`/api/safety/emergency/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED' }),
    });
    setStage('done');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && stage !== 'active' && onClose()}>
      <div className="w-full max-w-md bg-[#0a0f1c] border border-red-500/30 rounded-2xl shadow-2xl shadow-red-500/20 overflow-hidden">
        {/* Header */}
        <div className="bg-red-500/10 border-b border-red-500/20 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-400 animate-pulse" />
            <span className="text-red-400 font-bold text-sm uppercase tracking-wider">Emergency SOS</span>
          </div>
          {stage !== 'active' && <button onClick={onClose}><X size={18} className="text-white/40 hover:text-white/70" /></button>}
        </div>

        <div className="p-6">
          {/* Countdown */}
          {stage === 'countdown' && (
            <div className="text-center py-8">
              <div className="text-7xl font-black text-red-400 mb-4 tabular-nums">{countdown}</div>
              <p className="text-white/70 text-sm mb-6">SOS sending in {countdown} second{countdown !== 1 ? 's' : ''}...</p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white/10 text-white rounded-xl border border-white/20 hover:bg-white/15 transition-all font-medium"
              >
                Cancel SOS
              </button>
            </div>
          )}

          {/* Type selection */}
          {stage === 'type' && (
            <div>
              <p className="text-white/80 text-sm font-medium mb-4">What is your emergency?</p>
              <div className="space-y-2">
                {EMERGENCY_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTypeSelect(t.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all font-medium text-sm ${t.color} hover:opacity-90`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Locating */}
          {stage === 'locating' && (
            <div className="text-center py-8">
              <Loader2 size={40} className="text-cyan-400 mx-auto mb-4 animate-spin" />
              <p className="text-white/70 text-sm">Getting your location...</p>
              <p className="text-white/30 text-xs mt-2">You can deny — we'll proceed without it</p>
            </div>
          )}

          {/* Confirm */}
          {stage === 'confirm' && (
            <div>
              <p className="text-white/80 text-sm font-medium mb-4">Confirm emergency details:</p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
                  <span className="text-xs text-white/50">Type</span>
                  <span className="text-sm font-medium text-red-400">{type}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl">
                  <span className="text-xs text-white/50">Location</span>
                  <span className="text-sm text-white/70 flex items-center gap-1">
                    <MapPin size={12} />
                    {lat ? `${lat.toFixed(4)}, ${lon?.toFixed(4)}` : 'Location unavailable'}
                  </span>
                </div>
              </div>
              {error && <p className="text-red-400 text-xs mb-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
              <div className="grid grid-cols-2 gap-3">
                <button onClick={onClose} className="py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white/60 text-sm font-medium hover:bg-white/[0.08] transition-all">Cancel</button>
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="py-3 bg-red-500 rounded-xl text-white text-sm font-bold shadow-lg shadow-red-500/30 hover:bg-red-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
                  Send SOS
                </button>
              </div>
            </div>
          )}

          {/* Active */}
          {stage === 'active' && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(239,68,68,0.3)]">
                <AlertTriangle size={36} className="text-red-400 animate-pulse" />
              </div>
              <p className="text-red-400 font-black text-lg uppercase tracking-widest mb-1">EMERGENCY ACTIVE</p>
              <p className="text-white/50 text-xs mb-2">Event ID: <span className="font-mono text-white/70">{eventId.slice(-8)}</span></p>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-400 text-left mb-6">
                DEMO — Emergency recorded internally. No external emergency service was contacted. Call security directly: +91-416-220-2000
              </div>
              <button
                onClick={handleResolve}
                className="w-full py-3 bg-white/10 border border-white/20 rounded-xl text-white/80 text-sm font-medium hover:bg-white/15 transition-all"
              >
                Cancel Emergency / I'm Safe
              </button>
            </div>
          )}

          {/* Done */}
          {stage === 'done' && (
            <div className="text-center py-8">
              <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
              <p className="text-white/80 font-bold mb-2">Emergency Cancelled</p>
              <p className="text-white/40 text-sm mb-6">Your emergency event has been cancelled. Stay safe.</p>
              <button onClick={onClose} className="px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-500/30 transition-all">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
