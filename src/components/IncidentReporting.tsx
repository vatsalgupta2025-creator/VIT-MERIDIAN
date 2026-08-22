'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRBAC } from '@/context/RBACContext';
import { useAuditLog } from '@/context/AuditLogContext';
import { AlertTriangle, MapPin, Search, PlusCircle, CheckCircle } from 'lucide-react';
import { incidents } from '@/data/canonicalData';
import { Incident } from '@/types/canonical';

export default function IncidentReporting() {
  const { activeRole, can } = useRBAC();
  const { logAction } = useAuditLog();

  const [view, setView] = useState<'LIST' | 'REPORT'>('LIST');
  const [reportType, setReportType] = useState('THEFT');
  const [severity, setSeverity] = useState('LOW');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canReport = can('write', 'incident');
  const canViewOthers = can('read', 'incident') && (activeRole !== 'STUDENT');

  const visibleIncidents = canViewOthers 
    ? incidents 
    : incidents.filter(i => i.reportedBy === (activeRole === 'STUDENT' ? '21BCE0001' : 'CURRENT_USER'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !location.trim()) return;

    setIsSubmitting(true);
    
    // Simulate auto-routing logic based on severity
    let assignedTo = 'DEPT_ADMIN';
    if (severity === 'HIGH' || severity === 'CRITICAL') assignedTo = 'SECURITY_OFFICER';

    setTimeout(() => {
      setIsSubmitting(false);
      setView('LIST');
      
      logAction({
        actorId: 'CURRENT_USER',
        actorRole: activeRole,
        action: 'CREATE',
        resourceType: 'INCIDENT',
        resourceId: `INC-NEW-${Date.now()}`,
        newValue: `Reported ${severity} severity ${reportType} incident (Auto-routed to ${assignedTo})`
      });
      
      setDescription('');
      setLocation('');
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            Incident Reporting
          </h1>
          <p className="text-zinc-400 mt-1">General campus incidents and hazard reporting</p>
        </div>
        
        {canReport && (
          <button 
            onClick={() => setView(view === 'LIST' ? 'REPORT' : 'LIST')}
            className={`px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 ${
              view === 'LIST' 
                ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                : 'bg-zinc-800 hover:bg-zinc-700 text-white'
            }`}
          >
            {view === 'LIST' ? (
              <><PlusCircle className="w-4 h-4" /> New Report</>
            ) : (
              'Cancel Reporting'
            )}
          </button>
        )}
      </div>

      {view === 'REPORT' ? (
        <motion.div 
          className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Incident Type</label>
                <select 
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="THEFT">Theft / Lost Property</option>
                  <option value="MAINTENANCE_HAZARD">Maintenance Hazard (e.g. broken glass)</option>
                  <option value="MEDICAL">Medical Situation</option>
                  <option value="ALTERCATION">Verbal/Physical Altercation</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Severity Assessment</label>
                <select 
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="LOW">Low (No immediate danger)</option>
                  <option value="MEDIUM">Medium (Requires attention soon)</option>
                  <option value="HIGH">High (Immediate risk of injury/loss)</option>
                  <option value="CRITICAL">Critical (Life-threatening)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Exact Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input 
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="E.g., Ground floor, SJT outside Room 102"
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Detailed Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened, who is involved, and current status..."
                rows={4}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 resize-none"
                required
              />
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>
                {severity === 'HIGH' || severity === 'CRITICAL' 
                  ? "This report will be automatically escalated to Campus Security due to its severity level." 
                  : "This report will be routed to the relevant department administration."}
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting || !description.trim() || !location.trim()}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Incident Report'}
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {visibleIncidents.map(inc => (
            <motion.div 
              key={inc.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm flex flex-col md:flex-row justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded uppercase ${
                    inc.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                    inc.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                    inc.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-zinc-500/20 text-zinc-400'
                  }`}>
                    {inc.severity}
                  </span>
                  <span className="text-white font-medium">{inc.type}</span>
                  <span className="text-zinc-500 text-sm font-mono">{inc.id}</span>
                </div>
                <p className="text-zinc-400 text-sm mb-3">{inc.description}</p>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {inc.location}</span>
                  <span>Assigned to: {inc.assignedTo || 'Unassigned'}</span>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <span className={`text-sm font-medium flex items-center gap-1 ${
                  inc.status === 'RESOLVED' ? 'text-emerald-400' : 
                  inc.status === 'IN_PROGRESS' ? 'text-amber-400' : 'text-zinc-400'
                }`}>
                  {inc.status === 'RESOLVED' && <CheckCircle className="w-4 h-4" />}
                  {inc.status.replace('_', ' ')}
                </span>
                {canViewOthers && inc.status !== 'RESOLVED' && (
                  <button className="text-xs text-indigo-400 hover:text-indigo-300">
                    Update Status
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          
          {visibleIncidents.length === 0 && (
            <div className="p-8 text-center text-zinc-500 border border-dashed border-white/10 rounded-2xl">
              No incident reports found in your scope.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
