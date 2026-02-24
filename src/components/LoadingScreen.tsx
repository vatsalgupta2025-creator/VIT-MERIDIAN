'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Zap, GraduationCap, BookOpen, Users, Award } from 'lucide-react';
import { ShaderAnimation } from './ui/shader-animation';

// TODO: Add your friend's enhanced Loading Screen implementation here
// This component should include:
// - Animated logo/brand
// - Loading progress bar
// - Cool animations/effects
// - Tips/quotes while loading
// - Smooth transition to main app

interface LoadingScreenProps {
    onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
    const [progress, setProgress] = useState(0);
    const [currentTip, setCurrentTip] = useState(0);

    const tips = [
        "Loading your personalized dashboard...",
        "Connecting to campus resources...",
        "Fetching latest updates...",
        "Preparing AI assistants...",
        "Almost there...",
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(onComplete, 500);
                    return 100;
                }
                return prev + 2;
            });
        }, 50);

        return () => clearInterval(timer);
    }, [onComplete]);

    useEffect(() => {
        const tipTimer = setInterval(() => {
            setCurrentTip(prev => (prev + 1) % tips.length);
        }, 2000);

        return () => clearInterval(tipTimer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-[#040812] z-50 flex flex-col items-center justify-center"
        >
            {/* Shader Animation Background */}
            <div className="absolute inset-0 overflow-hidden">
                <ShaderAnimation />
            </div>

            {/* Logo Animation */}
            <div className="relative z-10">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center mb-8 shadow-lg shadow-cyan-500/20"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <Zap size={40} className="text-white" />
                    </motion.div>
                </motion.div>
            </div>

            {/* Brand Name */}
            <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent mb-2"
            >
                VITGROWW
            </motion.h1>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/40 text-sm mb-12"
            >
                Campus Operating System
            </motion.p>

            {/* Progress Bar */}
            <div className="w-64 h-1 bg-white/[0.06] rounded-full overflow-hidden mb-4">
                <motion.div
                    className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                />
            </div>

            {/* Progress Text */}
            <motion.p
                key={currentTip}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-white/30 text-xs"
            >
                {tips[currentTip]}
            </motion.p>

            {/* Stats Preview */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-12 flex gap-8"
            >
                {[
                    { icon: GraduationCap, label: 'Academic Tools' },
                    { icon: BookOpen, label: 'Resources' },
                    { icon: Users, label: 'Community' },
                    { icon: Award, label: 'Career' },
                ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 text-white/20">
                        <item.icon size={20} />
                        <span className="text-[10px]">{item.label}</span>
                    </div>
                ))}
            </motion.div>

            {/* Version */}
            <div className="absolute bottom-4 text-white/10 text-[10px]">
                v2.0.0 • Built for VIT Students
            </div>
        </motion.div>
    );
}
