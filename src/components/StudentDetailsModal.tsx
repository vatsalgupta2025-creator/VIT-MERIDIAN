'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Hash, Sparkles, Check, X, GraduationCap } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export default function StudentDetailsModal() {
    const { user, updateUser, isEditModalOpen, setIsEditModalOpen } = useUser();
    const [name, setName] = useState(user.name);
    const [regNo, setRegNo] = useState(user.regNo);

    useEffect(() => {
        if (isEditModalOpen) {
            setName(user.name);
            setRegNo(user.regNo);
        }
    }, [isEditModalOpen, user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        updateUser({
            name: name.trim(),
            regNo: regNo.trim().toUpperCase() || '23BCE1000',
        });
        setIsEditModalOpen(false);
    };

    if (!isEditModalOpen) return null;

    // Get initials for live preview
    const initials = name.trim()
        ? name.trim().split(/\s+/).length > 1
            ? (name.trim().split(/\s+/)[0][0] + name.trim().split(/\s+/)[name.trim().split(/\s+/).length - 1][0]).toUpperCase()
            : name.trim().slice(0, 2).toUpperCase()
        : 'ST';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsEditModalOpen(false)}
                    className="absolute inset-0 bg-black/70 backdrop-blur-md"
                />

                {/* Modal Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#090e1a]/95 border border-white/[0.12] p-7 shadow-2xl shadow-cyan-500/10 backdrop-blur-2xl z-10"
                >
                    {/* Glowing ambient dots */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/20 rounded-full blur-[60px] pointer-events-none -mr-20 -mt-20" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-500/20 rounded-full blur-[60px] pointer-events-none -ml-20 -mb-20" />

                    {/* Close button */}
                    <button
                        onClick={() => setIsEditModalOpen(false)}
                        className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white transition-all"
                    >
                        <X size={16} />
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                            <GraduationCap size={24} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                Student Profile
                                <Sparkles size={16} className="text-cyan-400 animate-pulse" />
                            </h2>
                            <p className="text-xs text-white/40">Enter your details to customize your dashboard</p>
                        </div>
                    </div>

                    {/* Live Preview Avatar */}
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-cyan-500 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-violet-500/25">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                                {name.trim() || 'Your Full Name'}
                            </p>
                            <p className="text-xs text-cyan-400/80 font-mono tracking-wider truncate">
                                {regNo.trim().toUpperCase() || 'Registration Number'}
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-white/60 mb-2 flex items-center gap-1.5">
                                <User size={13} className="text-cyan-400" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                required
                                autoFocus
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

                        <div className="flex items-center gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/60 hover:text-white text-sm font-medium transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
                            >
                                <Check size={16} />
                                Save Profile
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
