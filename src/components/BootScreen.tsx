'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ShaderBackground from '@/components/ui/shader-background';

interface BootScreenProps {
    onComplete: () => void;
}

const bootStages = [
    { text: "Initializing Neural Architecture...", duration: 600, color: "from-cyan-400 to-blue-500" },
    { text: "Connecting to VitGroww Mesh...", duration: 700, color: "from-blue-500 to-indigo-500" },
    { text: "Loading Oracle Search Engine...", duration: 600, color: "from-indigo-500 to-violet-500" },
    { text: "Calibrating Engagement Sensors...", duration: 500, color: "from-violet-500 to-purple-500" },
    { text: "Syncing Process Orchestrator...", duration: 600, color: "from-purple-500 to-fuchsia-500" },
    { text: "Activating VitGroww Intelligence...", duration: 500, color: "from-fuchsia-500 to-pink-500" },
    { text: "VITGROWW ONLINE ✓", duration: 800, color: "from-cyan-400 via-violet-400 to-emerald-400" },
];

export default function BootScreen({ onComplete }: BootScreenProps) {
    const [currentStage, setCurrentStage] = useState(0);
    const [progress, setProgress] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);
    const [bookOpen, setBookOpen] = useState(false);

    useEffect(() => {
        // Initial delay before book opens
        const initTimer = setTimeout(() => setBookOpen(true), 500);
        return () => clearTimeout(initTimer);
    }, []);

    useEffect(() => {
        if (!bookOpen) return;

        let timeout: NodeJS.Timeout;

        if (currentStage < bootStages.length) {
            timeout = setTimeout(() => {
                setCurrentStage((prev) => prev + 1);
                setProgress(((currentStage + 1) / bootStages.length) * 100);
            }, bootStages[currentStage].duration);
        } else {
            timeout = setTimeout(() => {
                setFadeOut(true);
                setTimeout(onComplete, 800);
            }, 600);
        }

        return () => clearTimeout(timeout);
    }, [currentStage, bookOpen, onComplete]);

    return (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-transparent transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
            <ShaderBackground />
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

                {/* Grid */}
                <div className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                    }}
                />
            </div>

            {/* CSS for 3D utilities */}
            <style jsx global>{`
                .perspective-2000 { perspective: 2000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
            `}</style>

            {/* 3D Book Container */}
            <div className="relative w-[320px] h-[420px] perspective-2000 mb-16 flex items-center justify-center">
                <motion.div
                    className="relative w-full h-full preserve-3d"
                    animate={{ rotateX: 10, rotateY: bookOpen ? -15 : 0, scale: bookOpen ? 1.05 : 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                >
                    {/* Back Cover */}
                    <div className="absolute inset-0 bg-slate-900 rounded-r-2xl border border-slate-700 shadow-2xl shadow-cyan-500/20" style={{ transform: 'translateZ(-15px)' }} />

                    {/* Pages */}
                    {bootStages.map((stage, index) => {
                        // Math to determine if page is flipped
                        const isFlipped = currentStage > index;
                        const isCurrent = currentStage === index;
                        const zIndex = isFlipped ? index : bootStages.length - index;

                        return (
                            <motion.div
                                key={index}
                                className="absolute inset-0 origin-left preserve-3d"
                                style={{ zIndex }}
                                initial={{ rotateY: 0 }}
                                animate={{
                                    rotateY: isFlipped ? -165 : 0,
                                    x: isFlipped ? -2 : 0
                                }}
                                transition={{
                                    duration: 0.8,
                                    ease: [0.645, 0.045, 0.355, 1.000] // smooth bezier
                                }}
                            >
                                {/* Page Paper front */}
                                <div className={`absolute inset-0 bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-r-xl border border-slate-700/50 backface-hidden flex flex-col items-center justify-center p-8 shadow-xl`}>

                                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/40 to-transparent" />

                                    {/* Content on the page */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: isCurrent || isFlipped ? 1 : 0, y: isCurrent || isFlipped ? 0 : 10 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-center relative z-10 w-full"
                                    >
                                        <h2 className={`text-4xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r ${stage.color}`}>
                                            {index === bootStages.length - 1 ? 'VITGROWW' : `Stage ${index + 1}`}
                                        </h2>
                                        <p className="text-slate-400 text-sm font-light leading-relaxed">
                                            {stage.text}
                                        </p>
                                    </motion.div>

                                    {/* Progress indicator on page */}
                                    {isCurrent && index < bootStages.length - 1 && (
                                        <div className="absolute bottom-12 left-12 right-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full bg-gradient-to-r ${stage.color}`}
                                                initial={{ width: '0%' }}
                                                animate={{ width: '100%' }}
                                                transition={{ duration: stage.duration / 1000, ease: "linear" }}
                                            />
                                        </div>
                                    )}

                                    {/* Final success check on last page */}
                                    {index === bootStages.length - 1 && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: isCurrent ? 1 : 0 }}
                                            transition={{ type: "spring", delay: 0.3 }}
                                            className="mt-8 w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                                        >
                                            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Back of the page (when flipped) */}
                                <div className="absolute inset-0 bg-slate-900 rounded-l-xl border border-slate-800 backface-hidden" style={{ transform: 'rotateY(180deg)' }}>
                                    <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/20 to-transparent" />
                                </div>
                            </motion.div>
                        );
                    })}

                    {/* Front Cover */}
                    <motion.div
                        className="absolute inset-0 origin-left preserve-3d z-50"
                        initial={{ rotateY: 0 }}
                        animate={{ rotateY: bookOpen ? -165 : 0 }}
                        transition={{ duration: 1.5, ease: [0.645, 0.045, 0.355, 1.000], delay: 0.2 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#0f172a] to-[#020617] rounded-r-2xl border-l-[8px] border-l-indigo-600/80 border border-slate-700 backface-hidden flex items-center justify-center shadow-2xl">
                            {/* Cover Design */}
                            <div className="w-[85%] h-[92%] border border-cyan-500/30 rounded-xl flex flex-col items-center justify-center relative overflow-hidden bg-black/20">
                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0%,transparent_70%)]" />

                                <motion.div
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-24 h-24 mb-8 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-500 p-1 shadow-[0_0_40px_rgba(6,182,212,0.4)]"
                                >
                                    <div className="w-full h-full bg-[#0f172a] rounded-full flex items-center justify-center">
                                        <svg className="w-12 h-12 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                </motion.div>

                                <h1 className="text-4xl md:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-cyan-600 relative z-10 px-4 text-center">
                                    VITGROWW
                                </h1>
                                <p className="text-violet-400/80 tracking-[0.4em] text-xs mt-4 relative z-10 font-bold">SMART CAMPUS OS</p>
                            </div>
                            <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white/10 to-transparent" />
                        </div>

                        <div className="absolute inset-0 bg-[#0f172a] rounded-l-2xl backface-hidden border-r border-slate-800" style={{ transform: 'rotateY(180deg)' }}>
                            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/40 to-transparent" />
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Overall Progress */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: bookOpen ? 1 : 0, y: bookOpen ? 0 : 20 }}
                transition={{ delay: 1 }}
                className="w-80 flex flex-col items-center"
            >
                <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden mb-3 backdrop-blur-sm border border-white/5">
                    <motion.div
                        className="h-full bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400"
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                <div className="flex justify-between w-full text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                    <span>System Boot Sequence</span>
                    <span className="text-cyan-500">{Math.round(progress)}%</span>
                </div>
            </motion.div>

        </div>
    );
}
