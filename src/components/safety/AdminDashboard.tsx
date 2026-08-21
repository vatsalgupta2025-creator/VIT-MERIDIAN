'use client';

import { useState, useEffect, useCallback } from 'react';
import { Settings, FileText, Bell, AlertTriangle, Shield, CheckCircle, Loader2, RefreshCw, Plus, X } from 'lucide-react';
import type { SafeUser } from '../VitgrowwSafe';

interface Report { id: string; reportId: string; category: string; description: string; location: string; status: string; createdAt: string; adminNotes?: string; user: { name: string; studentId?: string }; }
interface Alert { id: string; title: string; description: string; severity: string; location?: string; active: boolean; createdAt: string; }
interface Emergency { id: string; type: string; status: string; createdAt: string; user: { name: string; studentId?: string }; }

interface Props { user: SafeUser; }

const STATUS_OPTIONS = ['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'text-red-400', HIGH: 'text-orange-400', MEDIUM: 'text-yellow-400', LOW: 'text-blue-400',
};

export default function AdminDashboard({ user }: Props) {
  const [tab, setTab] = useState<'reports' | 'alerts' | 'emergencies'>('reports');
  const [reports, setReports] = useState<Report[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertForm, setAlertForm] = useState({ title: '', description: '', severity: 'MEDIUM', location: '', expiresAt: '' });
  const [alertSubmitting, setAlertSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/api/safety/admin/reports${statusFilter ? `?status=${statusFilter}` : ''}`;
      const [rRes, aRes, eRes] = await Promise.all([
        fetch(url),
        fetch('/api/safety/admin/alerts'),
        fetch('/api/safety/admin/emergency/all').catch(() => ({ ok: false })),
      ]);
      if (rRes.ok) setReports((await rRes.json()).reports || []);
      if (aRes.ok) setAlerts((await aRes.json()).alerts || []);
    } catch {} finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const updateReportStatus = async (id: string, status: string, notes?: string) => {
    const res = await fetch(`/api/safety/admin/reports/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...(notes ? { adminNotes: notes } : {}) }),
    });
    if (res.ok) fetchAll();
  };

  const toggleAlert = async (id: string, active: boolean) => {
    await fetch(`/api/safety/admin/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    });
    fetchAll();
  };

  const createAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertSubmitting(true);
    try {
      const res = await fetch('/api/safety/admin/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...alertForm,
          ...(alertForm.expiresAt ? { expiresAt: new Date(alertForm.expiresAt).toISOString() } : {}),
        }),
      });
      if (res.ok) { setShowAlertForm(false); setAlertForm({ title: '', description: '', severity: 'MEDIUM', location: '', expiresAt: '' }); fetchAll(); }
    } finally { setAlertSubmitting(false); }
  };

  const STATUS_COLORS: Record<string, string> = {
    SUBMITTED: 'text-blue-400', UNDER_REVIEW: 'text-yellow-400', IN_PROGRESS: 'text-orange-400',
    RESOLVED: 'text-emerald-400', REJECTED: 'text-red-400',
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
          <Settings size={16} className="text-orange-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white/90">Admin Dashboard</h2>
          <p className="text-xs text-white/40">Logged in as admin · All actions are server-authorized</p>
        </div>
        <button onClick={fetchAll} className="ml-auto p-2 text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-lg transition-all">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Sub tabs */}
      <div className="flex gap-2 mb-5">
        {(['reports', 'alerts', 'emergencies'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all ${tab === t ? 'bg-orange-500/15 text-orange-400 border border-orange-500/25' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Reports Tab */}
      {tab === 'reports' && (
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {['', ...STATUS_OPTIONS].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>
          {loading ? <div className="py-12 text-center text-white/30">Loading...</div> : (
            <div className="space-y-3">
              {reports.map(r => (
                <div key={r.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="font-mono text-xs text-cyan-400">{r.reportId}</span>
                      <span className="mx-2 text-white/20">·</span>
                      <span className="text-xs text-white/50">{r.user.name} {r.user.studentId ? `(${r.user.studentId})` : ''}</span>
                    </div>
                    <span className={`text-[10px] font-bold ${STATUS_COLORS[r.status]}`}>{r.status.replace(/_/g, ' ')}</span>
                  </div>
                  <p className="text-sm text-white/70 mb-1">{r.category.replace(/_/g, ' ')} · {r.location}</p>
                  <p className="text-xs text-white/40 mb-3 line-clamp-2">{r.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    {STATUS_OPTIONS.filter(s => s !== r.status).map(s => (
                      <button key={s} onClick={() => updateReportStatus(r.id, s)}
                        className="px-2.5 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 text-[10px] font-medium transition-all">
                        → {s.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {reports.length === 0 && <div className="py-12 text-center text-white/30 text-sm">No reports found</div>}
            </div>
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {tab === 'alerts' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowAlertForm(!showAlertForm)}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-xs font-medium hover:bg-red-500/30 transition-all">
              <Plus size={14} /> New Alert
            </button>
          </div>

          {showAlertForm && (
            <form onSubmit={createAlert} className="mb-5 p-4 rounded-2xl bg-white/[0.03] border border-red-500/20 space-y-3">
              <p className="text-sm font-bold text-red-400">Create Safety Alert</p>
              <input type="text" placeholder="Alert Title" value={alertForm.title} onChange={e => setAlertForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-red-500/50 transition-all" required />
              <textarea placeholder="Description" value={alertForm.description} onChange={e => setAlertForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-red-500/50 transition-all resize-none" required />
              <div className="grid grid-cols-2 gap-3">
                <select value={alertForm.severity} onChange={e => setAlertForm(f => ({ ...f, severity: e.target.value }))} className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-red-500/50 transition-all">
                  {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(s => <option key={s} value={s} className="bg-[#0a0f1c]">{s}</option>)}
                </select>
                <input type="text" placeholder="Location (optional)" value={alertForm.location} onChange={e => setAlertForm(f => ({ ...f, location: e.target.value }))} className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-red-500/50 transition-all" />
              </div>
              <input type="datetime-local" value={alertForm.expiresAt} onChange={e => setAlertForm(f => ({ ...f, expiresAt: e.target.value }))} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-red-500/50 transition-all [color-scheme:dark]" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowAlertForm(false)} className="flex-1 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white/50 text-sm hover:bg-white/[0.08] transition-all">Cancel</button>
                <button type="submit" disabled={alertSubmitting} className="flex-1 py-2.5 bg-red-500/30 border border-red-500/40 text-red-400 rounded-xl text-sm font-bold hover:bg-red-500/40 disabled:opacity-50 transition-all flex items-center justify-center gap-1">
                  {alertSubmitting ? <Loader2 size={14} className="animate-spin" /> : null} Post Alert
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {alerts.map(a => (
              <div key={a.id} className={`p-4 rounded-2xl border ${a.active ? 'bg-white/[0.03] border-white/[0.06]' : 'bg-white/[0.01] border-white/[0.03] opacity-60'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold ${SEVERITY_COLORS[a.severity]}`}>{a.severity}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'}`}>{a.active ? 'ACTIVE' : 'INACTIVE'}</span>
                    </div>
                    <p className="text-sm font-semibold text-white/90">{a.title}</p>
                    <p className="text-xs text-white/50 mt-0.5">{a.description}</p>
                  </div>
                  <button onClick={() => toggleAlert(a.id, !a.active)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${a.active ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30' : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30'}`}>
                    {a.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
            {alerts.length === 0 && <div className="py-12 text-center text-white/30 text-sm">No alerts created</div>}
          </div>
        </div>
      )}

      {/* Emergencies Tab */}
      {tab === 'emergencies' && (
        <div className="py-12 text-center text-white/30 text-sm">
          <AlertTriangle size={32} className="mx-auto mb-3 text-white/20" />
          Emergency events management — use the API endpoint /api/safety/admin/emergency/[id] to resolve events.
        </div>
      )}
    </div>
  );
}
