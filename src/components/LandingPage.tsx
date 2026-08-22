'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Briefcase, ArrowRight, Sparkles } from 'lucide-react';

interface LandingPageProps {
    onSelectRole: (role: 'student' | 'employee') => void;
}

export default function LandingPage({ onSelectRole }: LandingPageProps) {
    const [hovered, setHovered] = useState<'student' | 'employee' | null>(null);

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1528 40%, #0a1220 100%)' }}>

            {/* Ambient glow blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-[120px]"
                style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-10 blur-[100px]"
                style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-[150px]"
                style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }} />

            {/* Animated star dots */}
            {Array.from({ length: 40 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full bg-white"
                    style={{
                        width: Math.random() * 2 + 1 + 'px',
                        height: Math.random() * 2 + 1 + 'px',
                        top: Math.random() * 100 + '%',
                        left: Math.random() * 100 + '%',
                        opacity: Math.random() * 0.5 + 0.1,
                    }}
                />
            ))}

            {/* Logo + Brand */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="flex flex-col items-center mb-16"
            >
                <div className="flex items-center gap-3 mb-4">
                    <img src="/logo.png" alt="VIT-MERIDIAN" className="w-12 h-12 rounded-xl object-cover" />
                    <span className="text-3xl font-bold tracking-tight text-white">VIT-MERIDIAN</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <Sparkles size={13} className="text-indigo-400" />
                    <span>Your Intelligent Campus Companion</span>
                </div>
            </motion.div>

            {/* Heading */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                    Welcome. Who are you?
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.45)' }} className="text-base">
                    Choose your role to access your personalised dashboard
                </p>
            </motion.div>

            {/* Role Cards */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="flex gap-6 flex-wrap justify-center px-6"
            >
                {/* Student Card */}
                <motion.button
                    onMouseEnter={() => setHovered('student')}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => onSelectRole('student')}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group w-72 h-80 rounded-3xl flex flex-col items-center justify-center gap-5 cursor-pointer transition-all duration-300 overflow-hidden"
                    style={{
                        background: hovered === 'student'
                            ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))'
                            : 'rgba(255,255,255,0.03)',
                        border: hovered === 'student'
                            ? '1.5px solid rgba(99,102,241,0.6)'
                            : '1.5px solid rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(12px)',
                    }}
                >
                    {/* Top glow on hover */}
                    <div
                        className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-[60px] transition-opacity duration-300"
                        style={{
                            background: 'radial-gradient(circle, #6366f1, transparent)',
                            opacity: hovered === 'student' ? 0.4 : 0,
                        }}
                    />

                    <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300"
                        style={{
                            background: hovered === 'student'
                                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                : 'rgba(99,102,241,0.12)',
                            border: '1px solid rgba(99,102,241,0.3)',
                            boxShadow: hovered === 'student' ? '0 0 30px rgba(99,102,241,0.4)' : 'none',
                        }}
                    >
                        <GraduationCap size={36} color={hovered === 'student' ? '#fff' : '#818cf8'} />
                    </div>

                    <div className="text-center">
                        <h2 className="text-xl font-bold text-white mb-1.5">Student</h2>
                        <p className="text-sm px-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
                            Access academics, campus life, clubs, timetable & more
                        </p>
                    </div>

                    <div
                        className="flex items-center gap-2 text-sm font-semibold transition-all duration-200"
                        style={{ color: hovered === 'student' ? '#818cf8' : 'rgba(255,255,255,0.3)' }}
                    >
                        <span>Sign in as Student</span>
                        <ArrowRight size={15} />
                    </div>
                </motion.button>

                {/* Employee Card */}
                <motion.button
                    onMouseEnter={() => setHovered('employee')}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => onSelectRole('employee')}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group w-72 h-80 rounded-3xl flex flex-col items-center justify-center gap-5 cursor-pointer transition-all duration-300 overflow-hidden"
                    style={{
                        background: hovered === 'employee'
                            ? 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(6,182,212,0.15))'
                            : 'rgba(255,255,255,0.03)',
                        border: hovered === 'employee'
                            ? '1.5px solid rgba(14,165,233,0.6)'
                            : '1.5px solid rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(12px)',
                    }}
                >
                    <div
                        className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-[60px] transition-opacity duration-300"
                        style={{
                            background: 'radial-gradient(circle, #0ea5e9, transparent)',
                            opacity: hovered === 'employee' ? 0.4 : 0,
                        }}
                    />

                    <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300"
                        style={{
                            background: hovered === 'employee'
                                ? 'linear-gradient(135deg, #0ea5e9, #06b6d4)'
                                : 'rgba(14,165,233,0.12)',
                            border: '1px solid rgba(14,165,233,0.3)',
                            boxShadow: hovered === 'employee' ? '0 0 30px rgba(14,165,233,0.4)' : 'none',
                        }}
                    >
                        <Briefcase size={36} color={hovered === 'employee' ? '#fff' : '#38bdf8'} />
                    </div>

                    <div className="text-center">
                        <h2 className="text-xl font-bold text-white mb-1.5">Employee</h2>
                        <p className="text-sm px-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
                            Faculty portal, admin tools, smart briefing & automation
                        </p>
                    </div>

                    <div
                        className="flex items-center gap-2 text-sm font-semibold transition-all duration-200"
                        style={{ color: hovered === 'employee' ? '#38bdf8' : 'rgba(255,255,255,0.3)' }}
                    >
                        <span>Sign in as Employee</span>
                        <ArrowRight size={15} />
                    </div>
                </motion.button>
            </motion.div>

            {/* Footer */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="absolute bottom-8 text-xs"
                style={{ color: 'rgba(255,255,255,0.2)' }}
            >
                VIT Chennai · Powered by VIT-MERIDIAN Platform
            </motion.p>
        </div>
    );
}
