'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, AlertTriangle, Bell, MapPin, Activity, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import type { SafeUser } from '../VitgrowwSafe';
import SosButton from './SosButton';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: string;
  location?: string;
  createdAt: string;
}

interface Stats {
  totalReportsWeek: number;
  activeAlerts: number;
  activeEmergencies: number;
  totalSafeWalks: number;
  resolutionRate: number;
}

interface Props {
  user: SafeUser;
  onNavigate: (tab: string) => void;
  autoOpenSOS?: boolean;
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/30',
  HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  MEDIUM: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  LOW: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
};

export default function SafetyOverview({ user, onNavigate, autoOpenSOS }: Props) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSOS, setShowSOS] = useState(autoOpenSOS || false);

  const fetchData = useCallback(async () => {
    try {
      const [alertRes, statRes] = await Promise.all([
        fetch('/api/safety/alerts'),
        fetch('/api/safety/statistics'),
      ]);
      if (alertRes.ok) setAlerts((await alertRes.json()).alerts || []);
      if (statRes.ok) setStats(await statRes.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const i = setInterval(fetchData, 10000);
    return () => clearInterval(i);
  }, [fetchData]);

  const statCards = [
    { label: 'Active Alerts', value: stats?.activeAlerts ?? '—', color: 'text-red-400', icon: Bell },
    { label: 'Reports This Week', value: stats?.totalReportsWeek ?? '—', color: 'text-orange-400', icon: AlertTriangle },
    { label: 'Active Emergencies', value: stats?.activeEmergencies ?? '—', color: 'text-yellow-400', icon: Activity },
    { label: 'Resolution Rate', value: stats ? `${stats.resolutionRate}%` : '—', color: 'text-emerald-400', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <s.icon size={18} className={`${s.color} mb-2`} />
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-white/40 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Active Alerts */}
      <div>
        <h3 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">Active Campus Alerts</h3>
        {loading ? (
          <div className="py-8 text-center text-white/30 text-sm">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="py-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center">
            <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
            <p className="text-white/60 text-sm font-medium">No active alerts</p>
            <p className="text-white/30 text-xs mt-1">Campus is clear</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-2xl border ${SEVERITY_COLORS[alert.severity] || SEVERITY_COLORS.LOW}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[alert.severity]}`}>
                        {alert.severity}
                      </span>
                      {alert.location && <span className="text-[10px] text-white/40 flex items-center gap-1"><MapPin size={10} />{alert.location}</span>}
                    </div>
                    <p className="text-sm font-semibold text-white/90">{alert.title}</p>
                    <p className="text-xs text-white/50 mt-1">{alert.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setShowSOS(true)}
            className="group p-5 rounded-2xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 transition-all text-left"
          >
            <AlertTriangle size={24} className="text-red-400 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-bold text-red-400">Emergency SOS</p>
            <p className="text-xs text-red-400/60 mt-0.5">Trigger emergency alert</p>
          </button>
          <button
            onClick={() => onNavigate('safewalk')}
            className="group p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/15 hover:border-cyan-500/40 transition-all text-left"
          >
            <MapPin size={24} className="text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-bold text-cyan-400">Start SafeWalk</p>
            <p className="text-xs text-cyan-400/60 mt-0.5">Track your journey</p>
          </button>
          <button
            onClick={() => onNavigate('report')}
            className="group p-5 rounded-2xl bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/15 hover:border-violet-500/40 transition-all text-left"
          >
            <Shield size={24} className="text-violet-400 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-bold text-violet-400">Report Incident</p>
            <p className="text-xs text-violet-400/60 mt-0.5">Submit a safety report</p>
          </button>
        </div>
      </div>

      {/* Emergency Numbers */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
        <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Emergency Numbers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {[
            { name: 'VIT Security', number: '+91-416-220-2000' },
            { name: 'VIT Medical Centre', number: '+91-416-220-2020' },
            { name: 'Police (National)', number: '100' },
            { name: 'Ambulance', number: '108' },
          ].map((e) => (
            <div key={e.name} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03]">
              <span className="text-white/60 text-xs">{e.name}</span>
              <a href={`tel:${e.number}`} className="text-cyan-400 text-xs font-mono hover:text-cyan-300">{e.number}</a>
            </div>
          ))}
        </div>
      </div>

      {/* SOS Modal */}
      {showSOS && <SosButton onClose={() => setShowSOS(false)} />}
    </div>
  );
}
