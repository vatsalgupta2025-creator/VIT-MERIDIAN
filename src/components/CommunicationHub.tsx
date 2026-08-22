'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRBAC } from '@/context/RBACContext';
import { useEventBus } from '@/context/EventBusContext';
import { announcements } from '@/data/canonicalData';
import { Megaphone, Send, Inbox, Bell, CheckCheck, Lock, Filter } from 'lucide-react';

export default function CommunicationHub() {
  const { activeRole, can } = useRBAC();
  const { emitEvent } = useEventBus();

  const [view, setView] = useState<'INBOX' | 'COMPOSE'>('INBOX');
  const [targetScope, setTargetScope] = useState('ALL_STUDENTS');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [filter, setFilter] = useState('ALL');

  const canCompose = can('write', 'communication');
  const canRead = can('read', 'communication');

  if (!canRead) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-zinc-500">
        <Lock className="w-12 h-12 mb-4 opacity-50" />
        <p>Communication access not available for your role.</p>
      </div>
    );
  }

  const filteredAnnouncements = filter === 'ALL'
    ? announcements
    : announcements.filter(a => a.priority === filter);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;

    emitEvent({
      type: 'ANNOUNCEMENT_SENT',
      sourceModule: 'CommunicationHub',
      targetScope: targetScope,
      payload: { subject, body, priority }
    });

    setSubject('');
    setBody('');
    setView('INBOX');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Megaphone className="w-8 h-8 text-indigo-400" />
            Communication Hub
          </h1>
          <p className="text-zinc-400 mt-1">Institutional announcements and targeted messaging</p>
        </div>

        {canCompose && (
          <button
            onClick={() => setView(view === 'INBOX' ? 'COMPOSE' : 'INBOX')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 ${
              view === 'INBOX'
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
            }`}
          >
            {view === 'INBOX' ? <><Send className="w-4 h-4" /> Compose</> : <><Inbox className="w-4 h-4" /> Inbox</>}
          </button>
        )}
      </div>

      {view === 'COMPOSE' ? (
        <motion.div
          className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-lg font-semibold text-white mb-6">New Announcement</h2>
          <form onSubmit={handleSend} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Target Audience</label>
                <select
                  value={targetScope}
                  onChange={(e) => setTargetScope(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL_STUDENTS">All Students</option>
                  <option value="ALL_FACULTY">All Faculty</option>
                  <option value="CSE_DEPT">CSE Department</option>
                  <option value="ECE_DEPT">ECE Department</option>
                  <option value="HOSTEL_ALL">All Hostels</option>
                  <option value="PARENTS">Parents / Guardians</option>
                  <option value="CAMPUS_WIDE">Campus Wide (Everyone)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High (Push notification)</option>
                  <option value="URGENT">Urgent (Bypass DND)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Announcement subject line"
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Message Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your announcement..."
                rows={5}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 resize-none"
                required
              />
            </div>

            {priority === 'URGENT' && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-300 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Urgent messages bypass Do-Not-Disturb and trigger push notifications to all devices.
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                Broadcast <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            {['ALL', 'NORMAL', 'HIGH', 'URGENT'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === f
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Announcement Feed */}
          <div className="space-y-3">
            {filteredAnnouncements.map(ann => (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-5 rounded-2xl border backdrop-blur-sm ${
                  ann.priority === 'URGENT'
                    ? 'bg-rose-500/5 border-rose-500/20'
                    : ann.priority === 'HIGH'
                    ? 'bg-amber-500/5 border-amber-500/20'
                    : 'bg-zinc-900/50 border-white/5'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                        ann.priority === 'URGENT' ? 'bg-rose-500/20 text-rose-400' :
                        ann.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-zinc-500/20 text-zinc-400'
                      }`}>
                        {ann.priority}
                      </span>
                      <span className="text-xs text-zinc-500">{ann.targetScope}</span>
                    </div>
                    <p className="text-white">{ann.body}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                      <span>From: {ann.senderId}</span>
                      <span>{new Date(ann.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <CheckCheck className="w-4 h-4 text-zinc-600 flex-shrink-0" />
                </div>
              </motion.div>
            ))}

            {filteredAnnouncements.length === 0 && (
              <div className="p-8 text-center text-zinc-500 border border-dashed border-white/10 rounded-2xl">
                No announcements matching this filter.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
