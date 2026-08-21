'use client';

import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Wind, Fan, Utensils, Phone, Mail, Users, ChevronRight,
  ArrowLeft, Search, X, ExternalLink, MapPin, Star, Shield,
  Wrench, BookOpen, AlertCircle, Play, PhoneCall, AtSign, AlertTriangle
} from 'lucide-react';
import { hostels, centralAdmin, Hostel } from '@/data/hostelsData';
import HostelComplaints from './HostelComplaints';

type Screen = 'overview' | 'detail' | 'admin' | 'complaints';

const FILTERS = ['All', "Men's", 'Ladies', 'Full AC', 'Freshers', 'Seniors'];

function getFilteredHostels(hostels: Hostel[], search: string, filter: string) {
  return hostels.filter(h => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'All') return true;
    if (filter === "Men's") return h.category === "Men's Hostel";
    if (filter === 'Ladies') return h.category === 'Ladies Hostel';
    if (filter === 'Full AC') return h.acStatus === 'full';
    if (filter === 'Freshers') return h.yearGroup.toLowerCase().includes('fresher');
    if (filter === 'Seniors') return h.yearGroup.includes('2nd') || h.yearGroup.includes('3rd') || h.yearGroup.includes('Senior') || h.yearGroup === 'Mixed';
    return true;
  });
}

// ─── Overview Card ────────────────────────────────────────────────────────────
function HostelCard({ hostel, onClick }: { hostel: Hostel; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.025, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-white/[0.07] bg-[#0d1117] overflow-hidden group transition-shadow hover:shadow-xl"
      style={{ boxShadow: `0 0 0 0px ${hostel.accent}` }}
    >
      {/* Accent top bar */}
      <div className="h-1 w-full" style={{ background: hostel.accent }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black"
            style={{ background: hostel.accentBg, color: hostel.accentText }}
          >
            {hostel.name.charAt(0)}
          </div>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: hostel.accentBg, color: hostel.accentText }}
          >
            {hostel.category === "Men's Hostel" ? '🔷 Men\'s' : '🔶 Ladies'}
          </span>
        </div>

        {/* Block name */}
        <h3 className="text-white text-xl font-bold mb-1">{hostel.name}</h3>
        <p className="text-white/40 text-xs mb-3">{hostel.yearGroup}</p>

        {/* AC status row */}
        <div className="flex items-center gap-2 mb-3">
          {hostel.acStatus === 'full' ? (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Wind size={10} /> Full AC
            </span>
          ) : (
            <>
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Wind size={10} /> AC
              </span>
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/[0.05] text-white/40 border border-white/[0.08]">
                <Fan size={10} /> Non-AC
              </span>
            </>
          )}
        </div>

        {/* Mess preview */}
        <div className="flex items-start gap-2 mb-4">
          <Utensils size={12} className="text-white/30 mt-0.5 shrink-0" />
          <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{hostel.mess.hallName}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
          <div className="flex gap-1.5 flex-wrap">
            {hostel.mess.types.slice(0, 2).map(t => (
              <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-white/[0.05] text-white/40">{t}</span>
            ))}
            {hostel.mess.types.length > 2 && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-white/[0.05] text-white/30">+{hostel.mess.types.length - 2}</span>
            )}
          </div>
          <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-colors" style={{ color: hostel.accentText }} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Detail Screen ────────────────────────────────────────────────────────────
function HostelDetail({ hostel, onBack, onAdminClick, onComplaintsClick }: { hostel: Hostel; onBack: () => void; onAdminClick: () => void; onComplaintsClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        All Hostels
      </button>

      {/* Hero header */}
      <div
        className="rounded-2xl p-6 border border-white/[0.07] relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${hostel.accentBg}, rgba(13,17,23,0.9))` }}
      >
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-3xl"
          style={{ background: hostel.accent }}
        />
        <div className="relative z-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black mb-4"
            style={{ background: hostel.accentBg, color: hostel.accentText, border: `1px solid ${hostel.accent}40` }}
          >
            {hostel.name.charAt(0)}
          </div>
          <h1 className="text-white text-3xl font-black mb-2">{hostel.name}</h1>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs px-3 py-1 rounded-full font-medium border"
              style={{ background: hostel.accentBg, color: hostel.accentText, borderColor: `${hostel.accent}40` }}>
              {hostel.category}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-white/[0.07] text-white/60 border border-white/[0.1]">
              {hostel.yearGroup}
            </span>
            {hostel.tags.map(tag => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/[0.05] text-white/40 border border-white/[0.06]">{tag}</span>
            ))}
          </div>
          <p className="text-white/50 text-sm leading-relaxed">{hostel.description}</p>
        </div>
      </div>

      {/* Room Types */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117] p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: hostel.accentBg }}>
            <Building2 size={16} style={{ color: hostel.accentText }} />
          </div>
          <h2 className="text-white font-semibold">Room Types</h2>
        </div>

        {hostel.acStatus === 'full' ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Wind size={18} className="text-blue-400 shrink-0" />
            <p className="text-blue-300 text-sm font-medium">This block is fully air-conditioned across all room types.</p>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2 mt-3">
          {hostel.roomTypes.map((room, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-white/40" />
                <span className="text-white/80 text-sm">{room.type}</span>
              </div>
              {room.ac ? (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                  <Wind size={9} /> AC
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/[0.05] text-white/40">
                  <Fan size={9} /> Non-AC
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mess & Dining */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117] p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: hostel.accentBg }}>
            <Utensils size={16} style={{ color: hostel.accentText }} />
          </div>
          <h2 className="text-white font-semibold">Mess & Dining</h2>
        </div>

        <p className="text-white/60 text-sm font-medium mb-3">{hostel.mess.hallName}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {hostel.mess.types.map(type => (
            <span key={type} className="text-xs px-3 py-1 rounded-full border"
              style={{ background: hostel.accentBg, color: hostel.accentText, borderColor: `${hostel.accent}30` }}>
              {type}
            </span>
          ))}
        </div>

        {hostel.mess.note ? (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertCircle size={14} className="text-amber-400 mt-0.5 shrink-0" />
            <p className="text-amber-300/80 text-xs">{hostel.mess.note}</p>
          </div>
        ) : (
          <p className="text-white/25 text-xs italic">
            Caterers are periodically updated by administration via VTOP during the monthly mess-changing window.
          </p>
        )}
      </div>

      {/* Warden & Contacts */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117] p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: hostel.accentBg }}>
            <Shield size={16} style={{ color: hostel.accentText }} />
          </div>
          <h2 className="text-white font-semibold">Warden & Contacts</h2>
        </div>

        <WardenCard warden={hostel.warden} label={hostel.warden.label} accent={hostel.accent} accentBg={hostel.accentBg} accentText={hostel.accentText} />

        {hostel.secondaryWarden && (
          <>
            <div className="my-3 border-t border-white/[0.05]" />
            <WardenCard warden={hostel.secondaryWarden} label={hostel.secondaryWarden.label} accent={hostel.accent} accentBg={hostel.accentBg} accentText={hostel.accentText} />
          </>
        )}
      </div>

      {/* Video Tour (D Block) */}
      {hostel.videoTourUrl && (
        <div className="rounded-2xl border border-white/[0.07] bg-[#0d1117] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: hostel.accentBg }}>
              <Play size={16} style={{ color: hostel.accentText }} />
            </div>
            <h2 className="text-white font-semibold">Video Tour</h2>
          </div>
          <div className="rounded-xl overflow-hidden aspect-video">
            <iframe
              src={hostel.videoTourUrl}
              className="w-full h-full"
              allowFullScreen
              loading="lazy"
              title={`${hostel.name} Video Tour`}
            />
          </div>
          <p className="text-white/30 text-xs mt-2 text-center">
            Take a walkthrough of {hostel.name} — rooms and mess hall.
          </p>
        </div>
      )}

      {/* Admin link */}
      <button
        onClick={onAdminClick}
        className="w-full flex items-center justify-between p-4 rounded-2xl border border-white/[0.07] bg-[#0d1117] hover:bg-white/[0.03] transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center">
            <BookOpen size={16} className="text-white/40" />
          </div>
          <div className="text-left">
            <p className="text-white/70 text-sm font-medium">Need help with hostel admin?</p>
            <p className="text-white/30 text-xs">View Central Admin Contacts</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-white/30 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Complaints link */}
      <button
        onClick={onComplaintsClick}
        className="w-full flex items-center justify-between p-4 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-colors group mt-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center">
            <AlertTriangle size={16} className="text-red-400" />
          </div>
          <div className="text-left">
            <p className="text-red-300 text-sm font-medium">Report an Issue</p>
            <p className="text-red-400/50 text-xs">Raise a complaint about mess, maintenance, or discipline</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-red-400/50 group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
}

function WardenCard({ warden, label, accent, accentBg, accentText }: {
  warden: { names: string[]; email: string | null; phone: string | null; note?: string };
  label?: string;
  accent: string; accentBg: string; accentText: string;
}) {
  if (warden.note && warden.names.length === 0) {
    return (
      <div className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
        <AlertCircle size={14} className="text-white/30 mt-0.5 shrink-0" />
        <p className="text-white/40 text-sm">{warden.note}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {label && <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: accentText }}>{label}</p>}

      {warden.names.map(name => (
        <div key={name} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: accentBg, color: accentText }}>
            {name.split(' ').find(w => w.startsWith('Dr') || w.startsWith('Prof')) ? '👨‍🏫' : name.charAt(0)}
          </div>
          <div>
            <p className="text-white/80 text-sm font-medium">{name}</p>
            <p className="text-white/30 text-xs">Warden</p>
          </div>
        </div>
      ))}

      <div className="grid grid-cols-1 gap-2">
        {warden.email && (
          <a href={`mailto:${warden.email}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all group"
          >
            <AtSign size={14} className="text-white/40 shrink-0" />
            <span className="text-white/60 text-sm group-hover:text-white/80 transition-colors truncate">{warden.email}</span>
            <ExternalLink size={12} className="text-white/20 ml-auto shrink-0" />
          </a>
        )}
        {warden.phone && (
          <a href={`tel:${warden.phone}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all group"
          >
            <PhoneCall size={14} className="text-white/40 shrink-0" />
            <span className="text-white/60 text-sm group-hover:text-white/80 transition-colors">{warden.phone}</span>
            <ExternalLink size={12} className="text-white/20 ml-auto shrink-0" />
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Central Admin Screen ─────────────────────────────────────────────────────
function CentralAdminScreen({ onBack }: { onBack: () => void }) {
  const roleIcons: Record<string, ReactNode> = {
    'Director': <Star size={16} className="text-yellow-400" />,
    'Deputy': <Shield size={16} className="text-blue-400" />,
    'Food': <Utensils size={16} className="text-green-400" />,
    'Discipline': <BookOpen size={16} className="text-purple-400" />,
    'Maintenance': <Wrench size={16} className="text-orange-400" />,
  };

  const getIcon = (role: string) => {
    const key = Object.keys(roleIcons).find(k => role.includes(k));
    return key ? roleIcons[key] : <Users size={16} className="text-white/40" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.25 }}
      className="space-y-5"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {/* Header */}
      <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#0d1117] to-[#0a0d14] p-6">
        <div className="w-12 h-12 rounded-xl bg-white/[0.06] flex items-center justify-center mb-4">
          <Building2 size={22} className="text-white/60" />
        </div>
        <h1 className="text-white text-2xl font-black mb-1">Central Administration</h1>
        <p className="text-white/40 text-sm">VIT Chennai Hostel Office — Key contacts for hostel management.</p>
      </div>

      {/* Contacts */}
      <div className="space-y-3">
        {centralAdmin.map((admin, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-white/[0.07] bg-[#0d1117] p-5"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
                {getIcon(admin.role)}
              </div>
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-0.5">{admin.role}</p>
                <p className="text-white font-semibold">{admin.name}</p>
              </div>
            </div>
            <div className="space-y-2 ml-12">
              <a href={`mailto:${admin.email}`}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all group"
              >
                <Mail size={13} className="text-white/40 shrink-0" />
                <span className="text-white/55 text-xs group-hover:text-white/80 transition-colors truncate">{admin.email}</span>
              </a>
              {admin.phone ? (
                <a href={`tel:${admin.phone}`}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all group"
                >
                  <Phone size={13} className="text-white/40 shrink-0" />
                  <span className="text-white/55 text-xs group-hover:text-white/80 transition-colors">{admin.phone}</span>
                </a>
              ) : (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <Phone size={13} className="text-white/20 shrink-0" />
                  <span className="text-white/25 text-xs italic">Phone not available</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HostelHub() {
  const [screen, setScreen] = useState<Screen>('overview');
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = useMemo(
    () => getFilteredHostels(hostels, search, activeFilter),
    [search, activeFilter]
  );

  const openDetail = (hostel: Hostel) => {
    setSelectedHostel(hostel);
    setScreen('detail');
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 pb-10">
        <AnimatePresence mode="wait">

          {/* ── Overview ── */}
          {screen === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Header & Search */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-white text-2xl font-black mb-1">Hostels</h1>
                  <p className="text-white/40 text-sm">Explore residential blocks, rooms, and catering at VIT Chennai.</p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setScreen('complaints')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-semibold text-sm transition-colors shrink-0"
                  >
                    <AlertTriangle size={16} /> Complaints
                  </button>
                  <div className="relative flex-1 md:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      placeholder="Search blocks..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full bg-[#0d1117] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:border-white/20 outline-none transition-colors"
                    />
                    {search && (
                      <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Filter chips */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {FILTERS.map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                      activeFilter === filter
                        ? 'bg-white text-black border-white'
                        : 'bg-white/[0.04] text-white/50 border-white/[0.08] hover:text-white/70 hover:border-white/20'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Grid */}
              {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(hostel => (
                    <HostelCard key={hostel.id} hostel={hostel} onClick={() => { setSelectedHostel(hostel); setScreen('detail'); }} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
                    <Building2 size={28} className="text-white/20" />
                  </div>
                  <p className="text-white/50 font-medium mb-1">No hostels match this filter</p>
                  <p className="text-white/25 text-sm">Try a different search or filter combination</p>
                  <button
                    onClick={() => { setSearch(''); setActiveFilter('All'); }}
                    className="mt-4 px-4 py-2 rounded-xl bg-white/[0.06] text-white/50 text-sm hover:bg-white/[0.1] transition-colors"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Detail ── */}
          {screen === 'detail' && selectedHostel && (
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HostelDetail
                hostel={selectedHostel}
                onBack={() => { setSelectedHostel(null); setScreen('overview'); }}
                onAdminClick={() => setScreen('admin')}
                onComplaintsClick={() => setScreen('complaints')}
              />
            </motion.div>
          )}

          {/* ── Admin ── */}
          {screen === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CentralAdminScreen onBack={() => {
                if (selectedHostel) setScreen('detail');
                else setScreen('overview');
              }} />
            </motion.div>
          )}

          {/* ── Complaints ── */}
          {screen === 'complaints' && (
            <motion.div key="complaints" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HostelComplaints onBack={() => {
                if (selectedHostel) setScreen('detail');
                else setScreen('overview');
              }} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
