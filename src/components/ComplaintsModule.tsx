'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRBAC } from '@/context/RBACContext';
import { useAuditLog } from '@/context/AuditLogContext';
import { complaints } from '@/data/canonicalData';
import { MessageSquareWarning, PlusCircle, Lock, CheckCircle, Clock, Search, Filter } from 'lucide-react';

export default function ComplaintsModule() {
  const { activeRole, can } = useRBAC();
  const { logAction } = useAuditLog();

  const [view, setView] = useState<'LIST' | 'SUBMIT'>('LIST');
  const [category, setCategory] = useState('MAINTENANCE');
  const [complaintBody, setComplaintBody] = useState('');
  const [filter, setFilter] = useState('ALL');

  const canSubmit = activeRole === 'STUDENT' || activeRole === 'FACULTY';

  const filteredComplaints = filter === 'ALL'
    ? complaints
    : complaints.filter(c => c.status === filter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintBody.trim()) return;

    logAction({
      actorId: 'CURRENT_USER',
      actorRole: activeRole,
      action: 'CREATE',
      resourceType: 'COMPLAINT',
      resourceId: `CMP-NEW-${Date.now()}`,
      newValue: `Filed ${category} complaint`
    });

    setComplaintBody('');
    setView('LIST');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <MessageSquareWarning className="w-8 h-8 text-amber-400" />
            Complaints & Grievances
          </h1>
          <p className="text-zinc-400 mt-1">General campus complaints — maintenance, academic, administrative</p>
        </div>

        {canSubmit && (
          <button
            onClick={() => setView(view === 'LIST' ? 'SUBMIT' : 'LIST')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 ${
              view === 'LIST'
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
            }`}
          >
            {view === 'LIST' ? <><PlusCircle className="w-4 h-4" /> File Complaint</> : 'Back to List'}
          </button>
        )}
      </div>

      {/* Important note about routing */}
      <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300 flex items-start gap-2">
        <MessageSquareWarning className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <span>
          This is for general grievances (wifi issues, room maintenance, admin delays). 
          For safety-critical reports, use <strong>Incident Reporting</strong> or the <strong>Women's Safety Center</strong>.
        </span>
      </div>

      {view === 'SUBMIT' ? (
        <motion.div
          className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="MAINTENANCE">Maintenance (Infrastructure, facilities)</option>
                <option value="ACADEMIC">Academic (Grading, scheduling)</option>
                <option value="ADMINISTRATIVE">Administrative (Documentation, process delays)</option>
                <option value="HOSTEL">Hostel (Room, mess, amenities)</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Describe your grievance</label>
              <textarea
                value={complaintBody}
                onChange={(e) => setComplaintBody(e.target.value)}
                placeholder="Be specific about the issue, location, and any prior follow-ups..."
                rows={4}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 resize-none"
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-colors"
              >
                Submit Complaint
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === f
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-white/5'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Complaints List */}
          <div className="space-y-3">
            {filteredComplaints.map(c => (
              <div key={c.id} className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-zinc-500/20 text-zinc-400">
                        {c.category}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">{c.id}</span>
                    </div>
                    <p className="text-zinc-300 text-sm">{c.body}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                      <span>By: {c.submittedBy}</span>
                      {c.assignedTo && <span>Assigned: {c.assignedTo}</span>}
                    </div>
                  </div>
                  <span className={`text-sm font-medium flex items-center gap-1 whitespace-nowrap ${
                    c.status === 'RESOLVED' ? 'text-emerald-400' :
                    c.status === 'IN_PROGRESS' ? 'text-amber-400' :
                    'text-zinc-400'
                  }`}>
                    {c.status === 'RESOLVED' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}

            {filteredComplaints.length === 0 && (
              <div className="p-8 text-center text-zinc-500 border border-dashed border-white/10 rounded-2xl">
                No complaints matching this filter.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
