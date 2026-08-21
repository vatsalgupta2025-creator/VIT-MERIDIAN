'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Hash, Mail, Sparkles, Check, Edit3, Award, Flame, Target, BookOpen, ShieldCheck } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export default function ProfileView() {
    const { user, updateUser, setIsEditModalOpen } = useUser();
    const [name, setName] = useState(user.name);
    const [regNo, setRegNo] = useState(user.regNo);
    const [savedNotice, setSavedNotice] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateUser({
            name: name.trim(),
            regNo: regNo.trim().toUpperCase(),
        });
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 2500);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            {/* Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500/15 via-violet-500/10 to-transparent border border-white/[0.08] p-8 backdrop-blur-xl"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-[90px] -mr-20 -mt-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/15 rounded-full blur-[90px] -ml-20 -mb-20 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-cyan-500 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-cyan-500/20 flex-shrink-0">
                        {user.avatar}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-1">
                            <h2 className="text-2xl font-bold text-white tracking-wide">{user.name}</h2>
                            <span className="px-3 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-semibold tracking-wider uppercase">
                                {user.regNo}
                            </span>
                        </div>
                        <p className="text-sm text-white/50">{user.major} · {user.year}</p>
                        <p className="text-xs text-white/30 mt-1 flex items-center justify-center md:justify-start gap-2">
                            <Mail size={12} /> {user.name.toLowerCase().replace(/\s+/g, '.') || 'student'}@vitgroww.edu
                        </p>
                    </div>

                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg hover:scale-105"
                    >
                        <Edit3 size={14} className="text-cyan-400" />
                        Quick Edit Modal
                    </button>
                </div>

                {/* Quick Stats Banner */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/[0.06]">
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400">
                            <BookOpen size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-white/40">Current GPA</p>
                            <p className="text-lg font-bold text-white">{user.gpa}</p>
                        </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400">
                            <Sparkles size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-white/40">Total XP</p>
                            <p className="text-lg font-bold text-violet-400">{user.totalPoints}</p>
                        </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                            <Target size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-white/40">RUVI Score</p>
                            <p className="text-lg font-bold text-emerald-400">{user.ruviScore}</p>
                        </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
                            <Flame size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-white/40">Daily Streak</p>
                            <p className="text-lg font-bold text-amber-400">{user.streak} Days</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Editable Profile Information */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-3xl bg-white/[0.03] border border-white/[0.08] p-7 backdrop-blur-xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <ShieldCheck size={18} className="text-cyan-400" />
                            Edit Student Identification
                        </h3>
                        <p className="text-xs text-white/40 mt-0.5">
                            Update your name and registration number to personalize your dashboard and reports
                        </p>
                    </div>

                    {savedNotice && (
                        <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                            <Check size={14} /> Saved Successfully
                        </span>
                    )}
                </div>

                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-medium text-white/60 mb-2 flex items-center gap-1.5">
                            <User size={13} className="text-cyan-400" />
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter full name"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-cyan-400/60 focus:bg-white/[0.07] text-white placeholder-white/20 text-sm outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-white/60 mb-2 flex items-center gap-1.5">
                            <Hash size={13} className="text-violet-400" />
                            Registration Number
                        </label>
                        <input
                            type="text"
                            value={regNo}
                            onChange={(e) => setRegNo(e.target.value)}
                            placeholder="e.g. 23BCE10482"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-violet-400/60 focus:bg-white/[0.07] text-white placeholder-white/20 text-sm outline-none transition-all uppercase tracking-wider font-mono"
                        />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                        <button
                            type="submit"
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
                        >
                            <Check size={16} />
                            Save Identification
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
