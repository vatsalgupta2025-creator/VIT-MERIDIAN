'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, Shield, CheckCircle2, ChevronRight, ArrowLeft,
  MessageSquare, Camera, Check, X, Filter, Clock, Users,
  Building2, Plus, Star, ThumbsUp, ThumbsDown
} from 'lucide-react';
import {
  Complaint, ComplaintCategory, ComplaintStatus,
  CATEGORY_CONFIG, ROUTING_RULES, STATUS_CONFIG, STATUS_STEPS,
  mockComplaints, generateTrackingCode, getSlaLabel, getCategoryConfig, getAssignedLabel, getRoutingRule
} from '@/data/complaintsData';
import { currentUser } from '@/data/mockData';
import { hostels } from '@/data/hostelsData';

type Screen = 'list' | 'raise' | 'detail';

export default function HostelComplaints({ onBack }: { onBack: () => void }) {
  const [screen, setScreen] = useState<Screen>('list');
  const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints);
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);

  // Filter out anonymous complaints submitted by others (in a real app, this would be backend logic)
  const myComplaints = complaints.filter(c => c.studentId === currentUser.studentId || c.studentId === 'student-self');

  const nav = (s: Screen, c?: Complaint) => {
    if (c) setActiveComplaint(c);
    setScreen(s);
  };

  const handleNewComplaint = (c: Complaint) => {
    setComplaints(prev => [c, ...prev]);
    nav('list');
  };

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div key={screen}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }} className="h-full"
        >
          {screen === 'list' && <ComplaintsList complaints={myComplaints} onNav={nav} onBack={onBack} />}
          {screen === 'raise' && <RaiseComplaint onBack={() => nav('list')} onSubmit={handleNewComplaint} />}
          {screen === 'detail' && activeComplaint && <ComplaintDetail complaint={activeComplaint} onBack={() => nav('list')} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LIST SCREEN
// ══════════════════════════════════════════════════════════════════════════════
function ComplaintsList({ complaints, onNav, onBack }: { complaints: Complaint[], onNav: (s: Screen, c?: Complaint) => void, onBack: () => void }) {
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('active');

  const filtered = complaints.filter(c => {
    if (filter === 'active') return c.status !== 'resolved' && c.status !== 'closed';
    if (filter === 'closed') return c.status === 'resolved' || c.status === 'closed';
    return true;
  });

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-10">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] transition-colors">
          <ArrowLeft size={16} className="text-white/70" />
        </button>
        <div>
          <h1 className="text-white text-2xl font-black">Complaints</h1>
          <p className="text-white/40 text-sm">Raise and track hostel issues.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => onNav('raise')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white text-black font-semibold hover:bg-white/90 transition-colors">
          <Plus size={18} /> Raise Complaint
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {(['active', 'closed', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
              filter === f ? 'bg-white/10 text-white border border-white/20' : 'bg-transparent text-white/40 border border-white/[0.05] hover:text-white/70'
            }`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 border border-white/[0.05] rounded-2xl border-dashed">
            <CheckCircle2 size={32} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/50 text-sm">No {filter} complaints found.</p>
          </div>
        )}
        {filtered.map(c => {
          const cat = getCategoryConfig(c.category);
          const stat = STATUS_CONFIG[c.status];
          return (
            <button key={c.id} onClick={() => onNav('detail', c)}
              className="w-full text-left p-4 rounded-2xl border border-white/[0.07] bg-[#0d1117] hover:bg-white/[0.03] transition-colors group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-white/70 font-semibold text-sm">{cat.label}</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded" style={{ background: stat.bg, color: stat.color }}>
                  {stat.label}
                </span>
              </div>
              <p className="text-white/80 text-sm line-clamp-2 leading-relaxed mb-3">{c.description}</p>
              <div className="flex items-center justify-between text-xs text-white/30">
                <span>{c.trackingCode}</span>
                <span className="flex items-center gap-1 group-hover:text-white/50 transition-colors">
                  View details <ChevronRight size={14} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RAISE COMPLAINT SCREEN
// ══════════════════════════════════════════════════════════════════════════════
function RaiseComplaint({ onBack, onSubmit }: { onBack: () => void, onSubmit: (c: Complaint) => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [cat, setCat] = useState<ComplaintCategory | null>(null);
  const [desc, setDesc] = useState('');
  const [anon, setAnon] = useState(false);
  const [room, setRoom] = useState('D-204'); // Mock default

  const catConfig = cat ? getCategoryConfig(cat) : null;
  const isSensitive = catConfig?.forceAnonymous;

  const handleCatSelect = (cId: ComplaintCategory) => {
    const config = getCategoryConfig(cId);
    setCat(cId);
    setAnon(config.forceAnonymous);
    setStep(2);
  };

  const handleSubmit = () => {
    if (!cat) return;
    const rule = ROUTING_RULES.find(r => r.category === cat)!;
    const now = new Date();
    const deadline = new Date(now.getTime() + rule.slaHours * 3600000);

    const newComp: Complaint = {
      id: `c-${Date.now()}`,
      trackingCode: generateTrackingCode(anon),
      studentId: anon ? null : 'student-self',
      category: cat,
      description: desc,
      hostelBlockId: 'block-d', // Mock
      roomNo: room,
      isAnonymous: anon,
      status: 'submitted',
      assignedToRole: rule.defaultRole,
      assignedToLabel: getAssignedLabel(rule.defaultRole, 'D Block'),
      createdAt: now.toISOString(),
      resolvedAt: null,
      slaDeadline: deadline.toISOString(),
      escalated: false,
      escalatedAt: null,
      attachments: [],
      statusHistory: [{ status: 'submitted', changedAt: now.toISOString() }],
      comments: [],
      feedback: null
    };
    onSubmit(newComp);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => step === 2 ? setStep(1) : onBack()} className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] transition-colors">
          <ArrowLeft size={16} className="text-white/70" />
        </button>
        <h1 className="text-white text-xl font-bold">Raise Complaint</h1>
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <p className="text-white/50 text-sm mb-4">Select the category that best fits your issue. This helps us route it to the right person.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORY_CONFIG.map(c => (
              <button key={c.id} onClick={() => handleCatSelect(c.id)}
                className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border border-white/[0.07] bg-[#0d1117] hover:bg-white/[0.04] transition-all hover:-translate-y-1">
                <span className="text-3xl">{c.icon}</span>
                <span className="text-white/80 text-sm font-medium text-center leading-tight">{c.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {step === 2 && catConfig && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Selected Category Header */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-2xl">{catConfig.icon}</span>
            <div>
              <p className="text-white font-semibold">{catConfig.label}</p>
              <p className="text-white/40 text-xs">Category selected</p>
            </div>
            <button onClick={() => setStep(1)} className="ml-auto text-xs text-blue-400 hover:text-blue-300">Change</button>
          </div>

          {/* Sensitive Notice */}
          {catConfig.sensitiveNote && (
            <div className={`p-4 rounded-xl border flex gap-3 ${isSensitive ? 'bg-violet-500/10 border-violet-500/20 text-violet-300' : 'bg-amber-500/10 border-amber-500/20 text-amber-300'}`}>
              <Shield size={18} className="shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed">{catConfig.sensitiveNote}</p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <label className="text-white/70 text-sm font-medium">Description</label>
            <textarea
              value={desc} onChange={e => setDesc(e.target.value)}
              placeholder={catConfig.descriptionPlaceholder}
              className="w-full h-32 bg-[#0d1117] border border-white/[0.08] rounded-xl p-4 text-white/90 placeholder:text-white/30 text-sm outline-none focus:border-white/20 resize-none transition-colors"
            />
            <p className="text-right text-xs text-white/30">{desc.length}/1000</p>
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Block</label>
              <input type="text" value="D Block" disabled className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-white/50 cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium">Room / Area</label>
              <input type="text" value={room} onChange={e => setRoom(e.target.value)} className="w-full bg-[#0d1117] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/90 focus:border-white/20 transition-colors" />
            </div>
          </div>

          {/* Anonymous Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-[#0d1117]">
            <div>
              <p className="text-white/90 text-sm font-medium">Submit Anonymously</p>
              <p className="text-white/40 text-xs mt-0.5">Your name and room number will be hidden from staff.</p>
            </div>
            <button
              disabled={isSensitive}
              onClick={() => !isSensitive && setAnon(!anon)}
              className={`relative w-12 h-6 rounded-full transition-colors ${anon ? 'bg-blue-500' : 'bg-white/10'} ${isSensitive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${anon ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
          {isSensitive && <p className="text-xs text-white/30 italic mt-1 px-1">Locked for this category to protect your identity.</p>}

          <button
            disabled={!desc.trim()}
            onClick={handleSubmit}
            className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all disabled:opacity-30"
          >
            Submit Complaint
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DETAIL SCREEN
// ══════════════════════════════════════════════════════════════════════════════
function ComplaintDetail({ complaint, onBack }: { complaint: Complaint, onBack: () => void }) {
  const [commentInput, setCommentInput] = useState('');
  const cat = getCategoryConfig(complaint.category);
  const rule = getRoutingRule(complaint.category);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] transition-colors">
          <ArrowLeft size={16} className="text-white/70" />
        </button>
        <div>
          <p className="text-white/40 text-xs mb-0.5">{complaint.trackingCode}</p>
          <h1 className="text-white text-xl font-bold">{cat.label}</h1>
        </div>
        <div className="ml-auto">
          <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full" style={{ background: STATUS_CONFIG[complaint.status].bg, color: STATUS_CONFIG[complaint.status].color }}>
            {STATUS_CONFIG[complaint.status].label}
          </span>
        </div>
      </div>

      {/* Description Box */}
      <div className="p-5 rounded-2xl border border-white/[0.07] bg-[#0d1117] space-y-4">
        <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.05]">
          <div>
            <p className="text-white/30 text-xs mb-1">Submitted By</p>
            <div className="flex items-center gap-1.5">
              {complaint.isAnonymous ? (
                <><Shield size={14} className="text-blue-400" /><span className="text-white/70 text-sm">Anonymous</span></>
              ) : (
                <><Users size={14} className="text-white/40" /><span className="text-white/70 text-sm">{currentUser.name}</span></>
              )}
            </div>
          </div>
          <div>
            <p className="text-white/30 text-xs mb-1">Assigned To</p>
            <p className="text-white/70 text-sm font-medium">{complaint.isAnonymous ? 'Hidden to protect identity' : complaint.assignedToLabel}</p>
          </div>
        </div>
      </div>

      {/* Escalation Notice */}
      {complaint.escalated && (
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-semibold text-sm">SLA Breached — Escalated</p>
            <p className="text-amber-300/70 text-xs mt-0.5">This complaint exceeded the {rule.slaHours}-hour resolution target and has been automatically escalated to the {getAssignedLabel(rule.escalationRole)}.</p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="p-5 rounded-2xl border border-white/[0.07] bg-[#0d1117]">
        <h2 className="text-white font-semibold mb-5">Status Tracker</h2>
        <div className="relative pl-6 space-y-6">
          <div className="absolute left-2.5 top-2 bottom-2 w-px bg-white/[0.05]" />
          
          {complaint.statusHistory.map((sh, idx) => {
            const sc = STATUS_CONFIG[sh.status];
            return (
              <div key={idx} className="relative">
                <div className="absolute -left-[27px] w-3 h-3 rounded-full border-2 border-[#0d1117]" style={{ background: sc.color }} />
                <p className="text-white/90 text-sm font-medium mb-0.5" style={{ color: sc.color }}>{sc.label}</p>
                <p className="text-white/40 text-xs mb-1">{new Date(sh.changedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                {sh.note && <p className="text-white/60 text-xs italic bg-white/[0.02] p-2 rounded-lg mt-1 inline-block border border-white/[0.05]">{sh.note}</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Comments Thread */}
      {complaint.status !== 'closed' && (
        <div className="p-5 rounded-2xl border border-white/[0.07] bg-[#0d1117] flex flex-col h-80">
          <h2 className="text-white font-semibold mb-4 shrink-0">Updates & Discussion</h2>
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
            {complaint.comments.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-10">No updates yet.</p>
            ) : (
              complaint.comments.map(c => (
                <div key={c.id} className={`flex flex-col ${c.authorRole === 'student' || c.authorRole === 'anonymous_student' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-white/30 mb-1 px-1">{c.authorLabel}</span>
                  <div className={`px-3 py-2 rounded-xl text-sm max-w-[85%] ${
                    c.authorRole === 'student' || c.authorRole === 'anonymous_student' ? 'bg-blue-500/20 text-white border border-blue-500/30' : 'bg-white/[0.05] text-white/80 border border-white/[0.08]'
                  }`}>
                    {c.body}
                  </div>
                  <span className="text-[10px] text-white/20 mt-1">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <input type="text" value={commentInput} onChange={e => setCommentInput(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 text-sm text-white focus:border-white/20 outline-none" />
            <button disabled={!commentInput.trim()} className="px-4 py-2 bg-white text-black font-semibold rounded-xl text-sm hover:bg-white/90 disabled:opacity-50">Send</button>
          </div>
        </div>
      )}

      {/* Feedback Box (Resolved state) */}
      {complaint.status === 'resolved' && !complaint.feedback && (
        <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-center">
          <p className="text-emerald-300 font-semibold mb-1">Issue Resolved?</p>
          <p className="text-emerald-300/60 text-sm mb-4">Let us know if you're satisfied with the resolution.</p>
          <div className="flex justify-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
              <ThumbsUp size={16} /> Yes, resolved
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white/60 hover:text-white/90 transition-colors">
              <ThumbsDown size={16} /> No, reopen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
