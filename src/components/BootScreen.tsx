'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BootScreenProps {
    onComplete: () => void;
}

const bootStages = [
    { text: "Loading today's schedule...", delay: 400 },
    { text: "Syncing attendance records...", delay: 600 },
    { text: "Checking exam deadlines...", delay: 500 },
    { text: "Connecting study groups...", delay: 400 },
    { text: "VITGROWW Ready ✓", delay: 800 },
];

export default function BootScreen({ onComplete }: BootScreenProps) {
    const [currentStage, setCurrentStage] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (currentStage < bootStages.length) {
            timeout = setTimeout(() => {
                setCurrentStage((prev) => prev + 1);
            }, bootStages[currentStage].delay);
        } else {
            timeout = setTimeout(() => {
                setFadeOut(true);
                setTimeout(onComplete, 500);
            }, 600);
        }

        return () => clearTimeout(timeout);
    }, [currentStage, onComplete]);

    return (
        <div 
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
            style={{ backgroundColor: 'var(--surface-base)' }}
        >
            {/* Background pattern */}
            <div className="absolute inset-0 bg-grid pointer-events-none" />

            <div className="relative z-10 w-full max-w-md p-8">
                {/* Logo mark */}
                <div className="flex justify-center mb-12">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-bold text-3xl shadow-lg"
                        style={{ 
                            background: 'var(--accent-primary)',
                            color: 'var(--text-inverse)'
                        }}
                    >
                        V
                    </motion.div>
                </div>

                {/* Loading stages like a register/ledger */}
                <div className="space-y-4">
                    {bootStages.map((stage, idx) => {
                        const isVisible = currentStage >= idx;
                        const isCurrent = currentStage === idx;
                        const isDone = currentStage > idx;

                        return (
                            <div 
                                key={idx} 
                                className="flex items-center gap-4 h-8"
                            >
                                <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                                    {isDone && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-2 h-2 rounded-full"
                                            style={{ background: 'var(--accent-tertiary)' }}
                                        />
                                    )}
                                    {isCurrent && (
                                        <motion.div
                                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                            className="w-2 h-2 rounded-full"
                                            style={{ background: 'var(--accent-primary)' }}
                                        />
                                    )}
                                </div>
                                
                                <div className="flex-1 relative overflow-hidden">
                                    {isVisible && (
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                            className="whitespace-nowrap font-mono text-sm"
                                            style={{ 
                                                color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)',
                                            }}
                                        >
                                            {stage.text}
                                        </motion.div>
                                    )}
                                    
                                    {/* Line under the text */}
                                    <div 
                                        className="absolute bottom-0 left-0 w-full h-[1px] opacity-20"
                                        style={{ background: 'var(--border)' }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
