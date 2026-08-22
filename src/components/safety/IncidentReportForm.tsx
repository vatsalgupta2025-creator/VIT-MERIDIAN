'use client';

import { useState } from 'react';
import { FileText, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import type { SafeUser } from '../VitgrowwSafe';

const CATEGORIES = [
  { id: 'HARASSMENT', label: 'Harassment' },
  { id: 'SUSPICIOUS_ACTIVITY', label: 'Suspicious Activity' },
  { id: 'ACCIDENT', label: 'Accident' },
  { id: 'MEDICAL', label: 'Medical' },
  { id: 'THEFT', label: 'Theft' },
  { id: 'INFRASTRUCTURE_HAZARD', label: 'Infrastructure / Safety Hazard' },
  { id: 'OTHER', label: 'Other' },
];

interface Props { user: SafeUser; onSuccess: () => void; }

export default function IncidentReportForm({ user, onSuccess }: Props) {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [incidentAt, setIncidentAt] = useState(new Date().toISOString().slice(0, 16));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) { setError('Please select a category'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch('/api/safety/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          description,
          location,
          incidentAt: new Date(incidentAt).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      setSuccess(`Report ${data.report.reportId} submitted successfully!`);
      setTimeout(() => onSuccess(), 1500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
          <FileText size={16} className="text-violet-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white/90">Report Incident</h2>
          <p className="text-xs text-white/40">Your report is confidential and associated with your account</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category */}
        <div>
          <label className="text-xs text-white/50 mb-2 block font-medium uppercase tracking-wider">Category *</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`p-3 rounded-xl border text-xs text-left font-medium transition-all ${
                  category === c.id
                    ? 'bg-violet-500/20 border-violet-500/50 text-violet-400'
                    : 'bg-white/[0.02] border-white/[0.06] text-white/50 hover:border-white/20 hover:text-white/70'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="text-xs text-white/50 mb-1.5 block font-medium uppercase tracking-wider">Location *</label>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Academic Block A, 2nd Floor"
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/50 transition-all"
            required minLength={3}
          />
        </div>

        {/* Date/Time */}
        <div>
          <label className="text-xs text-white/50 mb-1.5 block font-medium uppercase tracking-wider">Date & Time of Incident *</label>
          <input
            type="datetime-local"
            value={incidentAt}
            onChange={e => setIncidentAt(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 transition-all [color-scheme:dark]"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-white/50 mb-1.5 block font-medium uppercase tracking-wider">Description *</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe what happened in detail..."
            rows={5}
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-violet-500/50 transition-all resize-none"
            required minLength={10}
          />
          <p className="text-[10px] text-white/25 mt-1">{description.length}/2000 chars (min 10)</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertTriangle size={12} /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            <CheckCircle size={12} /> {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/20 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><FileText size={16} /> Submit Report</>}
        </button>
      </form>
    </div>
  );
}
