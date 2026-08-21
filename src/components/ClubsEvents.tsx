'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Calendar, Flame, ChevronRight,
    MapPin, Clock, Search, ExternalLink
} from 'lucide-react';
import { ShaderAnimation } from './ui/shader-lines';

const CLUBS = [
    { name: 'Apple Developers Group', category: 'Technical', members: 420, icon: '🍎', color: 'slate' },
    { name: 'GDSC VIT', category: 'Technical', members: 650, icon: '⚡', color: 'blue' },
    { name: 'Music Club', category: 'Cultural', members: 120, icon: '🎵', color: 'violet' },
    { name: 'Dance Club', category: 'Cultural', members: 200, icon: '💃', color: 'pink' },
    { name: 'Finance Club', category: 'Management', members: 180, icon: '📈', color: 'emerald' },
    { name: 'Debate Society', category: 'Cultural', members: 90, icon: '🎙️', color: 'amber' }
];

const EVENTS = [
    { title: 'Vibrance 2026', date: 'March 14 - 17, 2026', time: '10:00 AM', location: 'Main Grounds', type: 'Cultural', image: '🎉' },
    { title: 'DevFest VIT', date: 'April 2, 2026', time: '09:00 AM', location: 'Anna Auditorium', type: 'Technical', image: '💻' },
    { title: 'GraVitas', date: 'September 20, 2026', time: '08:00 AM', location: 'SJT', type: 'Technical', image: '🚀' },
    { title: 'Finance Summit', date: 'May 10, 2026', time: '11:00 AM', location: 'Channa Reddy', type: 'Management', image: '📊' }
];

export default function ClubsEvents() {
    const [activeTab, setActiveTab] = useState<'clubs' | 'events'>('clubs');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClubs = CLUBS.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredEvents = EVENTS.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-120px)] w-full overflow-y-auto custom-scrollbar relative" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Shader Background */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none overflow-hidden rounded-2xl">
                <ShaderAnimation />
            </div>

            <div className="relative z-10 space-y-8 pb-10">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600/20 via-fuchsia-500/10 to-orange-500/20 p-10 border border-white/10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold tracking-wider uppercase border border-orange-500/20">Featured</span>
                                <span className="flex items-center gap-1.5 text-white/60 text-sm"><Flame size={14} className="text-orange-400" /> Hot Right Now</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">VIBRANCE 2026</h1>
                            <p className="text-white/60 max-w-xl text-lg mb-6">The biggest cultural and sports fest of VIT. Get ready for 4 days of non-stop excitement, pro-shows, and unforgettable memories.</p>
                            <button className="px-6 py-3 rounded-xl bg-white text-black font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                Register Now
                            </button>
                        </div>
                        <div className="text-9xl filter drop-shadow-[0_0_30px_rgba(217,70,239,0.3)]">
                            🎪
                        </div>
                    </div>
                </div>

                {/* Navigation & Search */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex p-1 bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/10 w-fit shrink-0 max-w-full overflow-x-auto hidden-scrollbar">
                        <button onClick={() => setActiveTab('clubs')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'clubs' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/80'}`}>
                            <Users size={18} /> Clubs & Chapters
                        </button>
                        <button onClick={() => setActiveTab('events')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'events' ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white/80'}`}>
                            <Calendar size={18} /> Upcoming Events
                        </button>
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                        <input type="text" placeholder={`Search ${activeTab}...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-colors" />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* CLUBS TAB */}
                    {activeTab === 'clubs' && (
                        <motion.div key="clubs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredClubs.map((club, i) => (
                                <div key={i} className={`group relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/10 p-6 hover:border-${club.color}-500/30 transition-colors cursor-pointer`}>
                                    <div className={`absolute inset-0 bg-gradient-to-br from-${club.color}-500/0 to-${club.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-14 h-14 rounded-2xl bg-${club.color}-500/10 border border-${club.color}-500/20 flex items-center justify-center text-3xl shadow-lg shadow-${club.color}-500/10`}>
                                            {club.icon}
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-white/5 text-white/50 text-[10px] font-bold uppercase tracking-wider border border-white/5">{club.category}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/60 transition-all">{club.name}</h3>
                                    <div className="flex items-center gap-1.5 text-white/40 text-sm mb-6">
                                        <Users size={14} /> {club.members}+ Active Members
                                    </div>
                                    <button className={`w-full py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white/80 font-medium group-hover:bg-${club.color}-500/20 group-hover:text-${club.color}-300 group-hover:border-${club.color}-500/30 transition-all flex items-center justify-center gap-2`}>
                                        Explore Club <ChevronRight size={16} />
                                    </button>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* EVENTS TAB */}
                    {activeTab === 'events' && (
                        <motion.div key="events" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                            {filteredEvents.map((event, i) => (
                                <div key={i} className="group relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/10 p-4 md:p-6 hover:border-violet-500/30 transition-colors flex flex-col md:flex-row md:items-center gap-6 cursor-pointer">
                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                    <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center text-4xl shadow-inner border border-white/5">
                                        {event.image}
                                    </div>

                                    <div className="flex-1 z-10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-2.5 py-1 rounded-md bg-violet-500/10 text-violet-400 text-[10px] font-bold uppercase border border-violet-500/20">{event.type}</span>
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-violet-300 transition-colors">{event.title}</h3>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
                                            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-white/30" /> {event.date}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={14} className="text-white/30" /> {event.time}</span>
                                            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-white/30" /> {event.location}</span>
                                        </div>
                                    </div>

                                    <div className="md:border-l md:border-white/10 md:pl-6 shrink-0 flex items-center justify-center z-10">
                                        <button className="w-full md:w-12 md:h-12 py-3 md:py-0 rounded-xl bg-white/5 hover:bg-violet-500/20 border border-white/10 text-white flex items-center justify-center transition-all group-hover:scale-110 group-hover:text-violet-300">
                                            <ExternalLink size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
