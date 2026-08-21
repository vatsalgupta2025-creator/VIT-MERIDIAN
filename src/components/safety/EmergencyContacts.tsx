'use client';

import { useState, useEffect, useCallback } from 'react';
import { Phone, Plus, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import type { SafeUser } from '../VitgrowwSafe';

interface Contact { id: string; name: string; phone: string; relationship: string; }
interface Props { user: SafeUser; }

export default function EmergencyContacts({ user }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', relationship: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch('/api/safety/contacts');
      if (res.ok) setContacts((await res.json()).contacts || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/safety/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setContacts(prev => [...prev, data.contact]);
      setForm({ name: '', phone: '', relationship: '' });
      setShowForm(false);
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/safety/contacts/${id}`, { method: 'DELETE' });
      if (res.ok) setContacts(prev => prev.filter(c => c.id !== id));
    } catch {}
  };

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Phone size={16} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white/90">Emergency Contacts</h2>
            <p className="text-xs text-white/40">Max 5 contacts</p>
          </div>
        </div>
        {contacts.length < 5 && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-medium hover:bg-emerald-500/30 transition-all">
            <Plus size={14} /> Add Contact
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-5 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
          <p className="text-sm font-medium text-white/80 mb-2">New Emergency Contact</p>
          <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-500/50 transition-all" required />
          <input type="tel" placeholder="Phone Number (e.g. +91-98765-43210)" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-500/50 transition-all" required />
          <input type="text" placeholder="Relationship (e.g. Mother, Friend)" value={form.relationship} onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-500/50 transition-all" required />
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-white/50 text-sm hover:bg-white/[0.08] transition-all">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-500/40 disabled:opacity-50 transition-all flex items-center justify-center gap-1">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : null} Save
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-12 text-center text-white/30">Loading...</div>
      ) : contacts.length === 0 ? (
        <div className="py-12 text-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <Phone size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/50 text-sm">No emergency contacts added</p>
          <p className="text-white/30 text-xs mt-1">Add contacts who should be notified in emergencies</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border border-white/10 flex items-center justify-center text-sm font-bold text-white/70">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">{c.name}</p>
                  <p className="text-xs text-white/40">{c.relationship} · <a href={`tel:${c.phone}`} className="text-cyan-400 hover:text-cyan-300">{c.phone}</a></p>
                </div>
              </div>
              <button onClick={() => handleDelete(c.id)} className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
