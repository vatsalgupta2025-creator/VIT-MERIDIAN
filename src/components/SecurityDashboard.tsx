'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRBAC } from '@/context/RBACContext';
import { safetyReports, incidents, emergencyAlerts, visitors } from '@/data/canonicalData';
import { ShieldAlert, MapPin, Activity, UserX, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SecurityDashboard() {
  const { can } = useRBAC();
  const [activeTab, setActiveTab] = useState<'INCIDENTS' | 'VISITORS' | 'EMERGENCIES'>('INCIDENTS');

  const canViewSecurity = can('read', 'incident') && can('read', 'visitor');

  if (!canViewSecurity) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-zinc-500">
        <ShieldAlert className="w-12 h-12 mb-4 opacity-50" />
        <p>Access Restricted. Security Officer clearance required.</p>
      </div>
    );
  }

  // Active items
  const activeEmergencies = emergencyAlerts.filter(e => e.status === 'ACTIVE');
  const openIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  const overdueVisitors = visitors.filter(v => !v.checkOutTime);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-indigo-400" />
            Security Operations
          </h1>
          <p className="text-zinc-400 mt-1">Unified campus safety and incident monitoring</p>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-5 rounded-2xl border ${activeEmergencies.length > 0 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-zinc-900/50 border-white/5'}`}>
          <div className="flex items-center gap-2 text-rose-400 mb-2">
            <Activity className="w-5 h-5" />
            <h3 className="font-medium">Active Emergencies</h3>
          </div>
          <p className={`text-3xl font-bold ${activeEmergencies.length > 0 ? 'text-rose-400' : 'text-zinc-300'}`}>
            {activeEmergencies.length}
          </p>
        </div>
        
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-medium">Open Incidents</h3>
          </div>
          <p className="text-3xl font-bold text-amber-400">{openIncidents.length}</p>
        </div>

        <div className={`p-5 rounded-2xl border ${overdueVisitors.length > 0 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-zinc-900/50 border-white/5'}`}>
          <div className="flex items-center gap-2 text-orange-400 mb-2">
            <UserX className="w-5 h-5" />
            <h3 className="font-medium">Overdue Visitors</h3>
          </div>
          <p className={`text-3xl font-bold ${overdueVisitors.length > 0 ? 'text-orange-400' : 'text-zinc-300'}`}>
            {overdueVisitors.length}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-medium">Zone Status</h3>
          </div>
          <p className="text-3xl font-bold text-emerald-400">SECURE</p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="flex border-b border-white/5">
          {['INCIDENTS', 'VISITORS', 'EMERGENCIES'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 py-4 text-sm font-medium transition-colors ${
                activeTab === tab 
                  ? 'text-indigo-400 border-b-2 border-indigo-400 bg-white/5' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'INCIDENTS' && (
            <div className="space-y-4">
              {incidents.map(inc => (
                <div key={inc.id} className="p-4 rounded-xl border border-white/10 bg-zinc-950/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded uppercase ${
                        inc.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                        inc.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                        inc.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-zinc-500/20 text-zinc-400'
                      }`}>
                        {inc.severity}
                      </span>
                      <span className="text-sm text-zinc-500 font-mono">{inc.id}</span>
                      <span className="text-sm font-medium text-white">{inc.type}</span>
                    </div>
                    <p className="text-zinc-400 text-sm mt-2">{inc.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {inc.location}</span>
                      <span className="flex items-center gap-1"><UserX className="w-3 h-3"/> Reporter: {inc.reportedBy}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium ${inc.status === 'RESOLVED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {inc.status.replace('_', ' ')}
                    </span>
                    {inc.status !== 'RESOLVED' && (
                      <button className="px-3 py-1.5 bg-indigo-500/20 text-indigo-300 rounded hover:bg-indigo-500/30 transition-colors text-sm">
                        Update
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'VISITORS' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-400">
                <thead className="text-xs uppercase bg-zinc-950/50 text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Visitor Name</th>
                    <th className="px-4 py-3">Purpose</th>
                    <th className="px-4 py-3">Host ID</th>
                    <th className="px-4 py-3">Check In</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map(v => (
                    <tr key={v.id} className="border-b border-white/5">
                      <td className="px-4 py-3 font-medium text-white">{v.name}</td>
                      <td className="px-4 py-3">{v.purpose}</td>
                      <td className="px-4 py-3 font-mono">{v.hostId}</td>
                      <td className="px-4 py-3">{new Date(v.checkInTime).toLocaleTimeString()}</td>
                      <td className="px-4 py-3">
                        {!v.checkOutTime ? (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-orange-500/20 text-orange-400 flex items-center gap-1 w-max">
                            <Clock className="w-3 h-3" /> OVERDUE
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400 flex items-center gap-1 w-max">
                            <CheckCircle className="w-3 h-3" /> CHECKED OUT
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'EMERGENCIES' && (
            <div className="space-y-4">
              {emergencyAlerts.map(alert => (
                <div key={alert.id} className={`p-4 rounded-xl border flex items-center justify-between ${
                  alert.status === 'ACTIVE' ? 'bg-rose-500/10 border-rose-500/30' :
                  alert.status === 'FALSE_ALARM' ? 'bg-zinc-900 border-white/10' :
                  'bg-emerald-500/10 border-emerald-500/20'
                }`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{alert.type} Alert</span>
                      <span className="text-xs text-zinc-500 font-mono px-2 bg-zinc-950 rounded">{alert.id}</span>
                    </div>
                    <p className="text-sm text-zinc-400">Triggered by: {alert.triggeredBy} in {alert.scope}</p>
                  </div>
                  <div>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      alert.status === 'ACTIVE' ? 'bg-rose-500 text-white' :
                      alert.status === 'FALSE_ALARM' ? 'bg-zinc-800 text-zinc-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {alert.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
