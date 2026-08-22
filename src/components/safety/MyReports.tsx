'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { SafeUser } from '../VitgrowwSafe';

interface Report {
  id: string; reportId: string; category: string; description: string;
  location: string; status: string; createdAt: string; adminNotes?: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  SUBMITTED: { label: 'Submitted', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', icon: Clock },
  UNDER_REVIEW: { label: 'Under Review', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', icon: AlertCircle },
  IN_PROGRESS: { label: 'In Progress', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30', icon: RefreshCw },
  RESOLVED: { label: 'Resolved', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'text-red-400 bg-red-500/10 border-red-500/30', icon: XCircle },
};

interface Props { user: SafeUser; }

export default function MyReports({ user }: Props) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/safety/reports');
      if (res.ok) setReports((await res.json()).reports || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <FileText size={16} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white/90">My Reports</h2>
            <p className="text-xs text-white/40">Only you can see these</p>
          </div>
        </div>
        <button onClick={fetchReports} className="p-2 text-white/40 hover:text-white/70 hover:bg-white/[0.04] rounded-lg transition-all">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-white/30">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <FileText size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/50 text-sm">No reports submitted yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => {
            const s = STATUS_CONFIG[r.status] || STATUS_CONFIG.SUBMITTED;
            const Icon = s.icon;
            const isOpen = expanded === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setExpanded(isOpen ? null : r.id)}
                className="w-full text-left p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/10 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm font-mono font-bold text-cyan-400 flex-shrink-0">{r.reportId}</span>
                    <span className="text-sm text-white/70 truncate">{r.category.replace(/_/g, ' ')}</span>
                  </div>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-bold flex-shrink-0 ${s.color}`}>
                    <Icon size={10} />{s.label}
                  </span>
                </div>
                <p className="text-xs text-white/40 mt-1">{r.location} · {new Date(r.createdAt).toLocaleDateString()}</p>
                {isOpen && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2 text-left">
                    <p className="text-sm text-white/70">{r.description}</p>
                    {r.adminNotes && (
                      <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                        <p className="text-xs text-cyan-400 font-semibold mb-0.5">Admin Note</p>
                        <p className="text-xs text-white/60">{r.adminNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
