'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Navigation, Clock, CheckCircle, AlertTriangle, Loader2, X } from 'lucide-react';
import type { SafeUser } from '../VitgrowwSafe';

interface SafeWalk {
  id: string; startLocation: string; destination: string;
  expectedArrival: string; status: string; startedAt: string;
}

interface Props { user: SafeUser; }

export default function SafeWalkPanel({ user }: Props) {
  const [walk, setWalk] = useState<SafeWalk | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ startLocation: '', destination: '', expectedArrival: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showOverdue, setShowOverdue] = useState(false);

  const fetchWalk = useCallback(async () => {
    try {
      const res = await fetch('/api/safety/safewalk');
      if (res.ok) setWalk((await res.json()).session || null);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchWalk(); }, [fetchWalk]);

  // Poll & check overdue
  useEffect(() => {
    if (!walk || walk.status !== 'ACTIVE') return;
    const check = setInterval(() => {
      const eta = new Date(walk.expectedArrival);
      if (new Date() > eta && walk.status === 'ACTIVE') {
        setShowOverdue(true);
        // Mark overdue server-side
        fetch(`/api/safety/safewalk/${walk.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'OVERDUE' }),
        }).then(() => fetchWalk());
        clearInterval(check);
      }
    }, 15000);
    return () => clearInterval(check);
  }, [walk, fetchWalk]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/safety/safewalk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startLocation: form.startLocation,
          destination: form.destination,
          expectedArrival: new Date(form.expectedArrival).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setWalk(data.session);
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  const handleEnd = async (status: 'COMPLETED' | 'ESCALATED') => {
    if (!walk) return;
    setSubmitting(true);
    try {
      await fetch(`/api/safety/safewalk/${walk.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setWalk(null); setShowOverdue(false);
    } finally { setSubmitting(false); }
  };

  const STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    OVERDUE: 'text-orange-400 bg-orange-500/10 border-orange-500/30 animate-pulse',
    COMPLETED: 'text-white/40 bg-white/[0.04] border-white/10',
    ESCALATED: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
          <Navigation size={16} className="text-cyan-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white/90">SafeWalk</h2>
          <p className="text-xs text-white/40">Track your journey safely</p>
        </div>
      </div>

      {/* Overdue Dialog */}
      {showOverdue && walk?.status === 'OVERDUE' && (
        <div className="mb-6 p-5 rounded-2xl bg-orange-500/10 border-2 border-orange-500/40">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-orange-400 animate-bounce" />
            <p className="text-orange-400 font-bold">SafeWalk Overdue</p>
          </div>
          <p className="text-white/70 text-sm mb-4">Your SafeWalk appears to be overdue. Are you okay?</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleEnd('COMPLETED')} className="py-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-500/30 transition-all">
              ✓ I'm OK
            </button>
            <button onClick={() => handleEnd('ESCALATED')} className="py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/30 transition-all">
              🆘 Need Help
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-white/30">Loading...</div>
      ) : walk ? (
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-white/80">Active SafeWalk</p>
            <span className={`px-2 py-1 rounded-full border text-[10px] font-bold ${STATUS_COLORS[walk.status]}`}>{walk.status}</span>
          </div>
          <div className="space-y-3 mb-5">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5"><div className="w-2 h-2 rounded-full bg-emerald-400" /></div>
              <div><p className="text-xs text-white/40">From</p><p className="text-sm text-white/80">{walk.startLocation}</p></div>
            </div>
            <div className="ml-3 border-l-2 border-dashed border-white/10 h-4" />
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 mt-0.5"><MapPin size={12} className="text-cyan-400" /></div>
              <div><p className="text-xs text-white/40">To</p><p className="text-sm text-white/80">{walk.destination}</p></div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white/[0.03] rounded-lg mb-4">
            <Clock size={12} className="text-white/40" />
            <span className="text-xs text-white/50">ETA: {new Date(walk.expectedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <button
            onClick={() => handleEnd('COMPLETED')}
            disabled={submitting}
            className="w-full py-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-semibold hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            Arrived Safely
          </button>
        </div>
      ) : (
        <form onSubmit={handleStart} className="space-y-4">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wider font-medium">Starting Location *</label>
            <input type="text" value={form.startLocation} onChange={e => setForm(f => ({ ...f, startLocation: e.target.value }))} placeholder="e.g. Men's Hostel Block A" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-500/50 transition-all" required />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wider font-medium">Destination *</label>
            <input type="text" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="e.g. Academic Block A" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-500/50 transition-all" required />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block uppercase tracking-wider font-medium">Expected Arrival *</label>
            <input type="datetime-local" value={form.expectedArrival} onChange={e => setForm(f => ({ ...f, expectedArrival: e.target.value }))} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-all [color-scheme:dark]" required />
          </div>
          {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/20 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
            Start SafeWalk
          </button>
        </form>
      )}
    </div>
  );
}
