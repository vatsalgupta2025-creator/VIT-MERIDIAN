'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, MessageSquare, FileText, Bell, Phone, Settings, ChevronRight,
  ChevronLeft, ArrowLeft, Check, X, HelpCircle, AlertTriangle, Shield,
  Utensils, GraduationCap, DollarSign, Users, Mail, PhoneCall,
  Clock, CheckCircle2, XCircle, AlertCircle, Filter, Send,
  Eye, EyeOff, Building2, Star, Zap, User, Info, MoreVertical,
  ToggleLeft, ToggleRight, Link2, UserCheck, Bot
} from 'lucide-react';
import {
  mockParent, mockStudents, mockSnapshots, mockLeaveRequests,
  mockNotifications, mockThreads, getHostelForStudent,
  getEmergencyContacts, NotificationCategory, LeaveRequest,
  ParentNotification, MessageThread, ChatMessage
} from '@/data/parentData';
import { centralAdmin } from '@/data/hostelsData';

type ParentScreen =
  | 'dashboard' | 'messages' | 'thread'
  | 'leaves' | 'notifications' | 'emergency' | 'settings' | 'linking';

const NAV = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'leaves', label: 'Approvals', icon: FileText },
  { id: 'notifications', label: 'Alerts', icon: Bell },
  { id: 'emergency', label: 'SOS', icon: Phone },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

const CAT_COLORS: Record<NotificationCategory, { bg: string; text: string; icon: typeof AlertCircle }> = {
  attendance: { bg: 'rgba(249,115,22,0.12)', text: '#fb923c', icon: GraduationCap },
  hostel: { bg: 'rgba(16,185,129,0.12)', text: '#34d399', icon: Building2 },
  fees: { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', icon: DollarSign },
  discipline: { bg: 'rgba(239,68,68,0.12)', text: '#f87171', icon: Shield },
  leave: { bg: 'rgba(139,92,246,0.12)', text: '#a78bfa', icon: FileText },
  general: { bg: 'rgba(255,255,255,0.06)', text: '#94a3b8', icon: Info },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  return 'Just now';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Attendance color ────────────────────────────────────────────────────────
function attColor(pct: number) {
  if (pct >= 85) return { bg: 'rgba(16,185,129,0.12)', text: '#34d399', bar: '#10b981' };
  if (pct >= 75) return { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', bar: '#f59e0b' };
  return { bg: 'rgba(239,68,68,0.12)', text: '#f87171', bar: '#ef4444' };
}

// ── Status Badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: LeaveRequest['status'] }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pending_proctor: { label: 'Awaiting Proctor', color: '#fbbf24', bg: 'rgba(245,158,11,0.12)' },
    pending_parent: { label: 'Needs Your Approval', color: '#a78bfa', bg: 'rgba(139,92,246,0.2)' },
    approved: { label: 'Approved', color: '#34d399', bg: 'rgba(16,185,129,0.12)' },
    rejected: { label: 'Rejected', color: '#f87171', bg: 'rgba(239,68,68,0.12)' },
    cancelled: { label: 'Cancelled', color: '#94a3b8', bg: 'rgba(255,255,255,0.06)' },
  };
  const s = map[status] || map.cancelled;
  return (
    <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
function Dashboard({ studentId, onNav }: { studentId: string; onNav: (s: ParentScreen, extra?: string) => void }) {
  const student = mockStudents[studentId];
  const snap = mockSnapshots[studentId];
  const hostel = getHostelForStudent(student);
  const att = attColor(snap.attendancePercent);
  const pendingLeaves = mockLeaveRequests.filter(l => l.studentId === studentId && l.status === 'pending_parent');
  const recentNotifs = mockNotifications.slice(0, 4);
  const unread = mockNotifications.filter(n => !n.read).length;

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <p className="text-white/40 text-sm">Good evening,</p>
        <h1 className="text-white text-2xl font-black">{mockParent.name.split(' ')[0]} 👋</h1>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Attendance */}
        <div className="rounded-2xl border border-white/[0.07] p-4" style={{ background: att.bg }}>
          <div className="flex items-center justify-between mb-2">
            <GraduationCap size={16} style={{ color: att.text }} />
            <span className="text-xs" style={{ color: att.text }}>Attendance</span>
          </div>
          <p className="text-white text-2xl font-black mb-1">{snap.attendancePercent}%</p>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${snap.attendancePercent}%`, background: att.bar }} />
          </div>
        </div>

        {/* Hostel */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117] p-4"
          style={{ borderColor: hostel ? `${hostel.accent}30` : undefined }}>
          <div className="flex items-center justify-between mb-2">
            <Building2 size={16} style={{ color: hostel?.accentText }} />
            <span className="text-xs text-white/40">Hostel</span>
          </div>
          <p className="text-white font-bold text-sm mb-0.5">{hostel?.name}</p>
          <p className="text-white/40 text-xs">Room {student.roomNo}</p>
          <p className="text-white/30 text-xs mt-1">
            ✓ In at {new Date(snap.lastHostelCheckIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Fee status */}
        <div className={`rounded-2xl border p-4 ${
          snap.feeStatus === 'paid' ? 'border-emerald-500/20 bg-emerald-500/5' :
          snap.feeStatus === 'due' ? 'border-amber-500/20 bg-amber-500/5' :
          'border-red-500/20 bg-red-500/5'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={16} className={
              snap.feeStatus === 'paid' ? 'text-emerald-400' :
              snap.feeStatus === 'due' ? 'text-amber-400' : 'text-red-400'
            } />
            <span className="text-xs text-white/40">Fees</span>
          </div>
          <p className={`font-black text-lg capitalize ${
            snap.feeStatus === 'paid' ? 'text-emerald-400' :
            snap.feeStatus === 'due' ? 'text-amber-400' : 'text-red-400'
          }`}>{snap.feeStatus}</p>
          {snap.amountDue && (
            <p className="text-white/40 text-xs mt-0.5">₹{snap.amountDue.toLocaleString('en-IN')} due</p>
          )}
        </div>

        {/* Alerts */}
        <button onClick={() => onNav('notifications')}
          className="rounded-2xl border border-violet-500/20 bg-violet-500/8 p-4 text-left hover:bg-violet-500/12 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <Bell size={16} className="text-violet-400" />
            {unread > 0 && <span className="text-xs bg-violet-500 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold">{unread}</span>}
          </div>
          <p className="text-white font-black text-2xl">{unread}</p>
          <p className="text-white/40 text-xs">Unread alerts</p>
        </button>
      </div>

      {/* Pending approvals banner */}
      {pendingLeaves.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onNav('leaves')}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-violet-500/15 border border-violet-500/30 hover:bg-violet-500/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <FileText size={16} className="text-violet-300" />
            </div>
            <div className="text-left">
              <p className="text-violet-200 font-semibold text-sm">{pendingLeaves.length} request{pendingLeaves.length > 1 ? 's' : ''} need your approval</p>
              <p className="text-violet-400/60 text-xs">Tap to review and approve/decline</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-violet-400" />
        </motion.button>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Quick Actions</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Message Warden', icon: MessageSquare, screen: 'messages' as ParentScreen, color: '#10b981' },
            { label: 'Leave Requests', icon: FileText, screen: 'leaves' as ParentScreen, color: '#8b5cf6' },
            { label: 'Emergency', icon: Phone, screen: 'emergency' as ParentScreen, color: '#ef4444' },
          ].map(action => (
            <button key={action.label} onClick={() => onNav(action.screen)}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/[0.07] bg-[#0d1117] hover:bg-white/[0.04] transition-colors group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${action.color}20` }}>
                <action.icon size={18} style={{ color: action.color }} />
              </div>
              <span className="text-white/60 text-xs text-center leading-tight group-hover:text-white/80 transition-colors">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/40 text-xs uppercase tracking-wider">Recent Alerts</p>
          <button onClick={() => onNav('notifications')} className="text-xs text-violet-400 hover:text-violet-300">See all</button>
        </div>
        <div className="space-y-2">
          {recentNotifs.map(n => {
            const cat = CAT_COLORS[n.category];
            const Icon = cat.icon;
            return (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${!n.read ? 'border-white/[0.1] bg-white/[0.03]' : 'border-white/[0.04] bg-transparent'}`}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: cat.bg }}>
                  <Icon size={13} style={{ color: cat.text }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs leading-relaxed ${!n.read ? 'text-white/80' : 'text-white/40'}`}>{n.message}</p>
                  <p className="text-white/25 text-xs mt-0.5">{formatDate(n.date)}</p>
                </div>
                {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MESSAGES
// ══════════════════════════════════════════════════════════════════════════════
function Messages({ studentId, onThread }: { studentId: string; onThread: (t: MessageThread) => void }) {
  const threads = mockThreads[studentId] || [];
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-white text-xl font-black mb-1">Messages</h2>
        <p className="text-white/40 text-sm">Direct lines to your child's warden and mentor.</p>
      </div>
      <div className="space-y-3">
        {threads.map(thread => (
          <button key={thread.threadId} onClick={() => onThread(thread)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/[0.07] bg-[#0d1117] hover:bg-white/[0.03] transition-colors text-left group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/[0.08] flex items-center justify-center shrink-0">
              {thread.role === 'warden' ? <Shield size={20} className="text-violet-400" /> :
               thread.role === 'proctor' ? <GraduationCap size={20} className="text-blue-400" /> :
               <User size={20} className="text-white/40" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-white font-semibold text-sm truncate">{thread.with}</p>
                <span className="text-white/30 text-xs shrink-0 ml-2">{timeAgo(thread.lastMessageAt)}</span>
              </div>
              <p className="text-white/40 text-xs capitalize mb-0.5">{thread.role}</p>
              <p className="text-white/30 text-xs truncate">{thread.lastMessage}</p>
            </div>
            {thread.unread > 0 && (
              <span className="w-5 h-5 rounded-full bg-violet-500 text-white text-xs flex items-center justify-center font-bold shrink-0">
                {thread.unread}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="p-4 rounded-2xl border border-white/[0.05] bg-white/[0.02]">
        <p className="text-white/30 text-xs text-center leading-relaxed">
          Message threads are linked to your child's assigned warden and mentor. For urgent matters, use Emergency Contacts.
        </p>
      </div>
    </div>
  );
}

// ── Thread Detail ──────────────────────────────────────────────────────────
function ThreadDetail({ thread, onBack }: { thread: MessageThread; onBack: () => void }) {
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<ChatMessage[]>(thread.messages);

  const send = () => {
    if (!input.trim()) return;
    setMsgs(prev => [...prev, {
      id: `m-${Date.now()}`, senderId: 'parent-001', senderName: 'Rajesh Sharma',
      senderRole: 'parent', body: input, sentAt: new Date().toISOString(),
    }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/[0.06]">
        <button onClick={onBack} className="p-1.5 text-white/40 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
          {thread.role === 'warden' ? <Shield size={16} className="text-violet-400" /> : <GraduationCap size={16} className="text-blue-400" />}
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">{thread.with}</p>
          <p className="text-white/40 text-xs capitalize">{thread.role}</p>
        </div>
        {thread.phone && (
          <a href={`tel:${thread.phone}`} className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/50 hover:text-white transition-colors">
            <PhoneCall size={15} />
          </a>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto mb-4">
        {msgs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare size={28} className="text-white/15 mb-3" />
            <p className="text-white/30 text-sm">No messages yet.</p>
            <p className="text-white/20 text-xs mt-1">Reach out to {thread.with} if you have any questions.</p>
          </div>
        )}
        {msgs.map(m => (
          <div key={m.id} className={`flex ${m.senderRole === 'parent' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm ${
              m.senderRole === 'parent'
                ? 'bg-violet-500/20 text-white/90 rounded-br-md'
                : 'bg-white/[0.06] text-white/80 rounded-bl-md'
            }`}>
              <p className="leading-relaxed">{m.body}</p>
              <p className="text-white/30 text-xs mt-1 text-right">
                {new Date(m.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                {m.readAt && ' ✓'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-white/[0.06]">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message..."
          className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/90 placeholder:text-white/30 outline-none focus:border-violet-500/40 transition-colors"
        />
        <button onClick={send} disabled={!input.trim()}
          className="p-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl hover:opacity-90 disabled:opacity-30 transition-opacity">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LEAVE APPROVALS
// ══════════════════════════════════════════════════════════════════════════════
function LeaveApprovals({ studentId }: { studentId: string }) {
  const [tab, setTab] = useState<'pending' | 'history'>('pending');
  const [requests, setRequests] = useState(mockLeaveRequests.filter(l => l.studentId === studentId));
  const [confirming, setConfirming] = useState<{ id: string; action: 'approved' | 'rejected' } | null>(null);

  const pending = requests.filter(r => r.status === 'pending_parent');
  const history = requests.filter(r => r.status !== 'pending_parent' && r.status !== 'pending_proctor');

  const doAction = (id: string, action: 'approved' | 'rejected') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    setConfirming(null);
  };

  const typeLabel: Record<string, string> = { outing: 'Outing', leave: 'Leave', emergency_leave: 'Emergency Leave' };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-white text-xl font-black mb-1">Leave & Outings</h2>
        <p className="text-white/40 text-sm">Review requests that need your approval.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['pending', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-white text-black' : 'bg-white/[0.05] text-white/50 border border-white/[0.08]'
            }`}>
            {t === 'pending' ? `Pending ${pending.length > 0 ? `(${pending.length})` : ''}` : 'History'}
          </button>
        ))}
      </div>

      {/* Pending */}
      {tab === 'pending' && (
        <div className="space-y-3">
          {pending.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 size={28} className="text-emerald-400/40 mb-3" />
              <p className="text-white/40 text-sm">No pending approvals</p>
              <p className="text-white/25 text-xs mt-1">You're all caught up!</p>
            </div>
          )}
          {pending.map(req => (
            <div key={req.id} className="rounded-2xl border border-violet-500/25 bg-violet-500/5 p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-semibold">{typeLabel[req.type]}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {formatDate(req.fromDate)}{req.fromDate !== req.toDate ? ` → ${formatDate(req.toDate)}` : ' (Day trip)'}
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </div>

              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <p className="text-white/60 text-xs font-medium mb-1">Reason</p>
                <p className="text-white/80 text-sm">{req.reason}</p>
              </div>

              {req.proctorComment && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
                  <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-emerald-400 text-xs font-medium mb-0.5">Proctor's note</p>
                    <p className="text-emerald-300/70 text-xs">{req.proctorComment}</p>
                  </div>
                </div>
              )}

              <p className="text-white/25 text-xs">Requested {timeAgo(req.requestedOn)}</p>

              {/* Action buttons */}
              {confirming?.id === req.id ? (
                <div className="rounded-xl bg-black/30 border border-white/[0.08] p-4 space-y-3">
                  <p className="text-white/70 text-sm text-center">
                    {confirming.action === 'approved'
                      ? `Confirm approval for ${typeLabel[req.type]}?`
                      : `Decline this ${typeLabel[req.type]} request?`}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirming(null)}
                      className="flex-1 py-2 rounded-xl bg-white/[0.06] text-white/50 text-sm hover:bg-white/[0.1] transition-colors">
                      Cancel
                    </button>
                    <button onClick={() => doAction(req.id, confirming.action)}
                      className={`flex-1 py-2 rounded-xl text-white text-sm font-semibold transition-colors ${
                        confirming.action === 'approved' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-red-500 hover:bg-red-400'
                      }`}>
                      {confirming.action === 'approved' ? 'Yes, Approve' : 'Yes, Decline'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setConfirming({ id: req.id, action: 'rejected' })}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/15 transition-colors">
                    <XCircle size={15} /> Decline
                  </button>
                  <button onClick={() => setConfirming({ id: req.id, action: 'approved' })}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-400 transition-colors">
                    <CheckCircle2 size={15} /> Approve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div className="space-y-3">
          {history.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText size={24} className="text-white/15 mb-3" />
              <p className="text-white/30 text-sm">No history yet</p>
            </div>
          )}
          {history.map(req => (
            <div key={req.id} className="rounded-2xl border border-white/[0.07] bg-[#0d1117] p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/70 font-medium text-sm">{typeLabel[req.type]}</p>
                <StatusBadge status={req.status} />
              </div>
              <p className="text-white/30 text-xs">
                {formatDate(req.fromDate)}{req.fromDate !== req.toDate ? ` – ${formatDate(req.toDate)}` : ''}
              </p>
              <p className="text-white/50 text-xs mt-1 italic">{req.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════
function NotificationsCenter() {
  const [filter, setFilter] = useState<NotificationCategory | 'all'>('all');
  const [notifs, setNotifs] = useState(mockNotifications);

  const filtered = filter === 'all' ? notifs : notifs.filter(n => n.category === filter);
  const cats: Array<NotificationCategory | 'all'> = ['all', 'attendance', 'hostel', 'fees', 'discipline', 'leave', 'general'];

  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-xl font-black">Notifications</h2>
        <button onClick={() => setNotifs(prev => prev.map(n => ({ ...n, read: true })))}
          className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
          Mark all read
        </button>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {cats.map(cat => {
          const count = cat === 'all' ? notifs.filter(n => !n.read).length : notifs.filter(n => n.category === cat && !n.read).length;
          return (
            <button key={cat} onClick={() => setFilter(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize flex items-center gap-1.5 ${
                filter === cat ? 'bg-white text-black' : 'bg-white/[0.05] text-white/50 border border-white/[0.08]'
              }`}>
              {cat}
              {count > 0 && <span className={`w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold ${filter === cat ? 'bg-black text-white' : 'bg-violet-500 text-white'}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12">
            <Bell size={24} className="text-white/15 mb-3" />
            <p className="text-white/30 text-sm">No notifications here</p>
          </div>
        )}
        {filtered.map(n => {
          const cat = CAT_COLORS[n.category];
          const Icon = cat.icon;
          return (
            <motion.div key={n.id} layout
              className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                !n.read ? 'border-white/[0.1] bg-white/[0.03]' : 'border-white/[0.04] bg-transparent opacity-60'
              }`}
              onClick={() => markRead(n.id)}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: cat.bg }}>
                <Icon size={16} style={{ color: cat.text }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold capitalize px-2 py-0.5 rounded-full" style={{ background: cat.bg, color: cat.text }}>{n.category}</span>
                  <span className="text-white/25 text-xs">{formatDate(n.date)}</span>
                </div>
                <p className={`text-sm leading-relaxed ${!n.read ? 'text-white/80' : 'text-white/40'}`}>{n.message}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-violet-400 mt-1.5 shrink-0" />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// EMERGENCY CONTACTS
// ══════════════════════════════════════════════════════════════════════════════
function EmergencyContacts({ studentId }: { studentId: string }) {
  const student = mockStudents[studentId];
  const { hostel, disciplineWarden, deputyDir } = getEmergencyContacts(student);

  const contacts = [
    hostel ? {
      label: `${hostel.name} Warden`,
      name: hostel.warden.names[0] || 'Block Warden',
      email: hostel.warden.email,
      phone: hostel.warden.phone,
      icon: Shield,
      color: hostel.accentText,
      bg: hostel.accentBg,
      priority: 'Primary Contact',
    } : null,
    deputyDir ? {
      label: 'Deputy Director (Hostels)',
      name: deputyDir.name,
      email: deputyDir.email,
      phone: deputyDir.phone,
      icon: Star,
      color: '#60a5fa',
      bg: 'rgba(59,130,246,0.12)',
      priority: 'Administrative',
    } : null,
    disciplineWarden ? {
      label: 'Warden (Discipline)',
      name: disciplineWarden.name,
      email: disciplineWarden.email,
      phone: disciplineWarden.phone,
      icon: Shield,
      color: '#f87171',
      bg: 'rgba(239,68,68,0.12)',
      priority: 'Discipline Matters',
    } : null,
    {
      label: 'Director (Hostels)',
      name: 'Dr. Janardhan Reddy K',
      email: 'chennai.dirhostel@vit.ac.in',
      phone: '044-3993 1272',
      icon: Building2,
      color: '#a78bfa',
      bg: 'rgba(139,92,246,0.12)',
      priority: 'Escalation',
    },
  ].filter(Boolean) as NonNullable<typeof contacts[0]>[];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white text-xl font-black mb-1">Emergency Contacts</h2>
        <p className="text-white/40 text-sm">One-tap access to key contacts for {student.name}.</p>
      </div>

      <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-3">
        <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
        <p className="text-emerald-300/80 text-sm">
          These contacts are automatically linked to {student.name}'s hostel block ({hostel?.name || 'N/A'}). Tap any phone number to call directly.
        </p>
      </div>

      <div className="space-y-3">
        {contacts.map((c, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-white/[0.07] bg-[#0d1117] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.bg }}>
                <c.icon size={18} style={{ color: c.color }} />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{c.label}</p>
                <p className="text-white/50 text-xs">{c.name}</p>
              </div>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-white/[0.05] text-white/30">{c.priority}</span>
            </div>
            <div className="space-y-2">
              {c.phone && (
                <a href={`tel:${c.phone}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8 hover:bg-emerald-500/15 transition-all group">
                  <PhoneCall size={16} className="text-emerald-400 shrink-0" />
                  <span className="text-emerald-300 text-sm font-medium">{c.phone}</span>
                  <span className="ml-auto text-xs text-emerald-400/50 group-hover:text-emerald-400 transition-colors">Call →</span>
                </a>
              )}
              {c.email && (
                <a href={`mailto:${c.email}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] transition-all group">
                  <Mail size={14} className="text-white/40 shrink-0" />
                  <span className="text-white/50 text-sm truncate">{c.email}</span>
                  <span className="ml-auto text-xs text-white/20 group-hover:text-white/40 transition-colors">Email →</span>
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════════════════════════
function ParentSettings({ studentId, onStudentSwitch }: { studentId: string; onStudentSwitch: (id: string) => void }) {
  const [prefs, setPrefs] = useState(mockParent.notificationPrefs);
  const cats = Object.keys(prefs) as NotificationCategory[];

  const toggle = (cat: NotificationCategory, channel: 'push' | 'sms' | 'email') => {
    setPrefs(prev => ({ ...prev, [cat]: { ...prev[cat], [channel]: !prev[cat][channel] } }));
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-white text-xl font-black mb-1">Settings</h2>
        <p className="text-white/40 text-sm">Manage your account and preferences.</p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117] p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 border border-violet-500/20 flex items-center justify-center">
            <span className="text-white text-xl font-black">{mockParent.name.charAt(0)}</span>
          </div>
          <div>
            <p className="text-white font-bold">{mockParent.name}</p>
            <p className="text-white/40 text-sm">{mockParent.email}</p>
            <p className="text-white/30 text-xs">{mockParent.phone}</p>
          </div>
        </div>
      </div>

      {/* Linked children */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117] p-5">
        <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Linked Children</p>
        <div className="space-y-2">
          {mockParent.linkedStudents.map(sid => {
            const s = mockStudents[sid];
            const hostel = getHostelForStudent(s);
            return (
              <button key={sid} onClick={() => onStudentSwitch(sid)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  sid === studentId ? 'border-violet-500/30 bg-violet-500/8' : 'border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05]'
                }`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
                  style={{ background: hostel?.accentBg, color: hostel?.accentText }}>
                  {s.avatarInitials}
                </div>
                <div className="flex-1">
                  <p className="text-white/80 font-medium text-sm">{s.name}</p>
                  <p className="text-white/30 text-xs">{s.regNo} · {hostel?.name} · {s.roomNo}</p>
                </div>
                {sid === studentId && <span className="text-xs text-violet-400 font-medium">Active</span>}
                <UserCheck size={14} className="text-white/20" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification preferences */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117] p-5">
        <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Notification Preferences</p>
        <div className="space-y-4">
          {cats.map(cat => {
            const catInfo = CAT_COLORS[cat];
            const Icon = catInfo.icon;
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={13} style={{ color: catInfo.text }} />
                  <span className="text-white/70 text-sm font-medium capitalize">{cat}</span>
                </div>
                <div className="flex gap-2 ml-5">
                  {(['push', 'sms', 'email'] as const).map(ch => (
                    <button key={ch} onClick={() => toggle(cat, ch)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        prefs[cat][ch] ? 'bg-white/10 border-white/20 text-white/80' : 'bg-white/[0.03] border-white/[0.06] text-white/25'
                      }`}>
                      {prefs[cat][ch] ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                      {ch.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function ParentPortal() {
  const [screen, setScreen] = useState<ParentScreen>('dashboard');
  const [activeStudentId, setActiveStudentId] = useState('student-123');
  const [activeThread, setActiveThread] = useState<MessageThread | null>(null);

  const student = mockStudents[activeStudentId];
  const hostel = getHostelForStudent(student);
  const pendingCount = mockLeaveRequests.filter(l => l.studentId === activeStudentId && l.status === 'pending_parent').length;
  const unreadNotifs = mockNotifications.filter(n => !n.read).length;

  const nav = (s: ParentScreen) => { setScreen(s); setActiveThread(null); };

  return (
    <div className="h-full flex flex-col">
      {/* Top bar: child selector */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-[#080b12] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
            style={{ background: hostel?.accentBg, color: hostel?.accentText }}>
            {student.avatarInitials}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{student.name}</p>
            <p className="text-white/30 text-xs">{hostel?.name} · {student.roomNo}</p>
          </div>
        </div>
        {/* Child switcher */}
        <div className="flex gap-1">
          {mockParent.linkedStudents.map(sid => {
            const s = mockStudents[sid];
            const h = getHostelForStudent(s);
            return (
              <button key={sid} onClick={() => setActiveStudentId(sid)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all"
                style={{
                  background: sid === activeStudentId ? h?.accentBg : 'rgba(255,255,255,0.05)',
                  color: sid === activeStudentId ? h?.accentText : 'rgba(255,255,255,0.3)',
                  border: sid === activeStudentId ? `1px solid ${h?.accent}40` : '1px solid rgba(255,255,255,0.06)',
                }}>
                {s.avatarInitials}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <AnimatePresence mode="wait">
          <motion.div key={screen + activeStudentId}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}
          >
            {screen === 'dashboard' && <Dashboard studentId={activeStudentId} onNav={nav} />}
            {screen === 'messages' && !activeThread && (
              <Messages studentId={activeStudentId} onThread={(t) => { setActiveThread(t); setScreen('thread'); }} />
            )}
            {screen === 'thread' && activeThread && (
              <div className="h-[calc(100vh-220px)] flex flex-col">
                <ThreadDetail thread={activeThread} onBack={() => { setActiveThread(null); setScreen('messages'); }} />
              </div>
            )}
            {screen === 'leaves' && <LeaveApprovals studentId={activeStudentId} />}
            {screen === 'notifications' && <NotificationsCenter />}
            {screen === 'emergency' && <EmergencyContacts studentId={activeStudentId} />}
            {screen === 'settings' && <ParentSettings studentId={activeStudentId} onStudentSwitch={id => { setActiveStudentId(id); setScreen('dashboard'); }} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Nav */}
      <div className="shrink-0 border-t border-white/[0.06] bg-[#080b12] px-4 py-3">
        <div className="flex justify-around">
          {NAV.map(item => {
            const isActive = screen === item.id || (item.id === 'messages' && screen === 'thread');
            const badge = item.id === 'leaves' ? pendingCount : item.id === 'notifications' ? unreadNotifs : 0;
            return (
              <button key={item.id} onClick={() => nav(item.id as ParentScreen)}
                className={`flex flex-col items-center gap-1 relative px-3 py-1 rounded-xl transition-all ${
                  isActive ? 'text-white' : 'text-white/30 hover:text-white/50'
                }`}>
                {isActive && (
                  <motion.div layoutId="parent-nav-indicator"
                    className="absolute inset-0 rounded-xl bg-white/[0.07]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <div className="relative">
                  <item.icon size={20} />
                  {badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-violet-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                      {badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium relative">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
