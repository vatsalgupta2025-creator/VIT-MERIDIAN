'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, AlertTriangle, Phone, MapPin, FileText, Users, BarChart3, Settings, LogIn, Bell, Zap } from 'lucide-react';
import SafetyLoginGate from './safety/SafetyLoginGate';
import SafetyOverview from './safety/SafetyOverview';
import IncidentReportForm from './safety/IncidentReportForm';
import MyReports from './safety/MyReports';
import SafeWalkPanel from './safety/SafeWalkPanel';
import EmergencyContacts from './safety/EmergencyContacts';
import SafetyMapView from './safety/SafetyMapView';
import AdminDashboard from './safety/AdminDashboard';
import SafetyAIChat from './safety/SafetyAIChat';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  studentId?: string | null;
}

const TABS_STUDENT = [
  { id: 'overview', label: 'Overview', icon: Shield },
  { id: 'sos', label: 'SOS', icon: AlertTriangle },
  { id: 'report', label: 'Report', icon: FileText },
  { id: 'my-reports', label: 'My Reports', icon: FileText },
  { id: 'safewalk', label: 'SafeWalk', icon: MapPin },
  { id: 'contacts', label: 'Contacts', icon: Phone },
  { id: 'map', label: 'Map', icon: MapPin },
  { id: 'ai', label: 'AI Assistant', icon: Zap },
];

const TABS_ADMIN = [
  { id: 'overview', label: 'Overview', icon: Shield },
  { id: 'admin', label: 'Admin Dashboard', icon: Settings },
  { id: 'map', label: 'Map', icon: MapPin },
  { id: 'ai', label: 'AI Assistant', icon: Zap },
];

export default function VitgrowwSafe() {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [alertCount, setAlertCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  // Poll for alerts & notifications
  useEffect(() => {
    if (!user) return;
    const poll = async () => {
      try {
        const [alertRes, notifRes] = await Promise.all([
          fetch('/api/safety/alerts'),
          fetch('/api/safety/notifications'),
        ]);
        if (alertRes.ok) {
          const d = await alertRes.json();
          setAlertCount(d.alerts?.length ?? 0);
        }
        if (notifRes.ok) {
          const d = await notifRes.json();
          setNotifCount(d.notifications?.filter((n: any) => !n.read).length ?? 0);
        }
      } catch {}
    };
    poll();
    const interval = setInterval(poll, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setActiveTab('overview');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-red-500/40 border-t-red-500 rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading SAFE...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <SafetyLoginGate onLogin={fetchMe} />;
  }

  const tabs = user.role === 'ADMIN' ? TABS_ADMIN : TABS_STUDENT;

  const renderContent = () => {
    if (activeTab === 'overview') return <SafetyOverview user={user} onNavigate={setActiveTab} />;
    if (activeTab === 'report') return <IncidentReportForm user={user} onSuccess={() => setActiveTab('my-reports')} />;
    if (activeTab === 'my-reports') return <MyReports user={user} />;
    if (activeTab === 'sos') return <SafetyOverview user={user} onNavigate={setActiveTab} autoOpenSOS />;
    if (activeTab === 'safewalk') return <SafeWalkPanel user={user} />;
    if (activeTab === 'contacts') return <EmergencyContacts user={user} />;
    if (activeTab === 'map') return <SafetyMapView user={user} />;
    if (activeTab === 'admin') return <AdminDashboard user={user} />;
    if (activeTab === 'ai') return <SafetyAIChat user={user} />;
    return <SafetyOverview user={user} onNavigate={setActiveTab} />;
  };

  return (
    <div className="flex flex-col h-full min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-white/[0.02] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/25">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">VITGROWW SAFE</h1>
            <p className="text-[10px] text-white/30 -mt-0.5 uppercase tracking-widest">Campus Safety System</p>
          </div>
          {alertCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] font-bold rounded-full animate-pulse">
              {alertCount} ACTIVE ALERT{alertCount > 1 ? 'S' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {notifCount > 0 && (
            <div className="relative">
              <Bell size={18} className="text-white/40" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                {notifCount}
              </span>
            </div>
          )}
          <div className="text-right">
            <p className="text-sm font-medium text-white/80">{user.name}</p>
            <p className="text-[10px] text-white/30">{user.role} {user.studentId ? `· ${user.studentId}` : ''}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 rounded-lg transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-6 py-3 border-b border-white/[0.06] overflow-x-auto flex-shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isAlert = tab.id === 'sos';
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isAlert
                  ? isActive
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                    : 'text-red-400 border border-red-500/30 hover:bg-red-500/10'
                  : isActive
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
              {tab.id === 'overview' && alertCount > 0 && (
                <span className="ml-1 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center text-white">{alertCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Demo Mode Banner */}
      <div className="mx-6 mt-3 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2 flex-shrink-0">
        <AlertTriangle size={12} className="text-amber-400 flex-shrink-0" />
        <p className="text-[10px] text-amber-400">
          DEMO MODE — Emergency actions are recorded internally. No external emergency services are contacted.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderContent()}
      </div>
    </div>
  );
}
