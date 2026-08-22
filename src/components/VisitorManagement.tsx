'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRBAC } from '@/context/RBACContext';
import { useAuditLog } from '@/context/AuditLogContext';
import { visitors } from '@/data/canonicalData';
import { UserCheck, Clock, Camera, PlusCircle, Lock, AlertTriangle, CheckCircle, Search } from 'lucide-react';

export default function VisitorManagement() {
  const { activeRole, can } = useRBAC();
  const { logAction } = useAuditLog();

  const [view, setView] = useState<'LOG' | 'REGISTER'>('LOG');
  const [visitorName, setVisitorName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [hostId, setHostId] = useState('');
  const [idReference, setIdReference] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const canManage = can('read', 'visitor');

  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-zinc-500">
        <Lock className="w-12 h-12 mb-4 opacity-50" />
        <p>Security Officer clearance required.</p>
      </div>
    );
  }

  const overdueVisitors = visitors.filter(v => !v.checkOutTime);
  const checkedOutVisitors = visitors.filter(v => v.checkOutTime);

  const filteredVisitors = visitors.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !purpose.trim() || !hostId.trim()) return;

    logAction({
      actorId: 'CURRENT_USER',
      actorRole: activeRole,
      action: 'CREATE',
      resourceType: 'VISITOR',
      resourceId: `VIS-NEW-${Date.now()}`,
      newValue: `Registered visitor: ${visitorName}, Purpose: ${purpose}, Host: ${hostId}`
    });

    setVisitorName('');
    setPurpose('');
    setHostId('');
    setIdReference('');
    setView('LOG');
  };

  const handleCheckout = (visitorId: string, visitorNameStr: string) => {
    logAction({
      actorId: 'CURRENT_USER',
      actorRole: activeRole,
      action: 'UPDATE',
      resourceType: 'VISITOR',
      resourceId: visitorId,
      newValue: `Checked out visitor: ${visitorNameStr}`
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-8 h-8 text-indigo-400" />
            Visitor Management
          </h1>
          <p className="text-zinc-400 mt-1">Campus entry and exit tracking</p>
        </div>
        <button
          onClick={() => setView(view === 'LOG' ? 'REGISTER' : 'LOG')}
          className={`px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 ${
            view === 'LOG'
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
              : 'bg-zinc-800 hover:bg-zinc-700 text-white'
          }`}
        >
          {view === 'LOG' ? <><PlusCircle className="w-4 h-4" /> Register Visitor</> : 'Back to Log'}
        </button>
      </div>

      {/* Overdue Alert Banner */}
      {overdueVisitors.length > 0 && view === 'LOG' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
          <p className="text-orange-300 text-sm">
            <strong>{overdueVisitors.length} visitor(s)</strong> have not checked out and may still be on campus.
          </p>
        </motion.div>
      )}

      {view === 'REGISTER' ? (
        <motion.div
          className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-lg font-semibold text-white mb-6">New Visitor Check-In</h2>
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Full Name</label>
                <input
                  type="text"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="Visitor's full name"
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">ID Reference</label>
                <input
                  type="text"
                  value={idReference}
                  onChange={(e) => setIdReference(e.target.value)}
                  placeholder="e.g., DL-12345 or Aadhaar last 4"
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Purpose of Visit</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g., Parent Visit, Vendor Delivery, Interview"
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Host ID (Person Being Visited)</label>
              <input
                type="text"
                value={hostId}
                onChange={(e) => setHostId(e.target.value)}
                placeholder="e.g., 21BCE0002 or FAC001"
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300 flex items-center gap-2">
              <Camera className="w-4 h-4 flex-shrink-0" />
              Photo ID capture would be integrated here in production.
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors"
              >
                Check In Visitor
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search visitors..."
              className="w-full bg-zinc-900/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Visitor Table */}
          <div className="rounded-2xl bg-zinc-900/50 border border-white/5 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase bg-zinc-950/50 text-zinc-500">
                  <tr>
                    <th className="px-5 py-4">Visitor</th>
                    <th className="px-5 py-4">Purpose</th>
                    <th className="px-5 py-4">Host</th>
                    <th className="px-5 py-4">ID Ref</th>
                    <th className="px-5 py-4">Check In</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisitors.map(v => (
                    <tr key={v.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                            {v.name.charAt(0)}
                          </div>
                          <span className="text-white font-medium">{v.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-zinc-400">{v.purpose}</td>
                      <td className="px-5 py-4 text-zinc-400 font-mono text-xs">{v.hostId}</td>
                      <td className="px-5 py-4 text-zinc-500 font-mono text-xs">{v.idReference || '—'}</td>
                      <td className="px-5 py-4 text-zinc-400 text-xs">{new Date(v.checkInTime).toLocaleString()}</td>
                      <td className="px-5 py-4">
                        {v.checkOutTime ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 flex items-center gap-1 w-max">
                            <CheckCircle className="w-3 h-3" /> Out
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 flex items-center gap-1 w-max">
                            <Clock className="w-3 h-3" /> On Campus
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {!v.checkOutTime && (
                          <button
                            onClick={() => handleCheckout(v.id, v.name)}
                            className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg text-xs font-medium transition-colors"
                          >
                            Check Out
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
