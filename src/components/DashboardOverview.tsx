'use client';

import { useState, useEffect } from 'react';
import {
    TrendingUp, Calendar as CalendarIcon, Clock, Users, BookOpen,
    Zap, Rocket, AlertCircle, MapPin, Search, ChevronRight,
    BarChart3, FileText, Binary, Bot, Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import SearchBar from './SearchBar';

// New DashCard replacing GlassCard
function DashCard({ children, className = '', accent }: { children: React.ReactNode, className?: string, accent?: 'red' | 'yellow' | 'green' }) {
    let cardClass = 'card-raised';
    if (accent === 'red') cardClass = 'card-accent-red';
    if (accent === 'yellow') cardClass = 'card-accent-yellow';
    if (accent === 'green') cardClass = 'card-accent-green';

    return (
        <div className={`p-5 ${cardClass} ${className}`}>
            {children}
        </div>
    );
}

function AttendancePulse({ percentage }: { percentage: number }) {
    // Threshold is 75% for VIT
    const isSafe = percentage >= 75;
    const isWarning = percentage >= 65 && percentage < 75;
    
    let colorVar = 'var(--accent-tertiary)'; // Green
    if (isWarning) colorVar = 'var(--accent-secondary)'; // Yellow
    if (!isSafe && !isWarning) colorVar = 'var(--accent-primary)'; // Red

    const dashArray = 283;
    const dashOffset = dashArray - (dashArray * percentage) / 100;

    return (
        <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Background ring */}
            <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="var(--surface-overlay)" 
                    strokeWidth="8" 
                />
                
                {/* 75% Threshold Marker */}
                <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="var(--border)" 
                    strokeWidth="10" 
                    strokeDasharray="2 281"
                    strokeDashoffset={-(dashArray * 0.75)}
                />

                {/* Progress ring */}
                <motion.circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke={colorVar} 
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: dashArray }}
                    animate={{ strokeDashoffset: dashOffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{ strokeDasharray: dashArray }}
                />
            </svg>
            
            {/* Pulse effect if warning/danger */}
            {(!isSafe) && (
                <motion.div 
                    className="absolute inset-0 rounded-full"
                    style={{ border: `2px solid ${colorVar}` }}
                    animate={{ scale: [1, 1.2], opacity: [0.8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}

            <div className="text-center z-10 flex flex-col items-center">
                <span className="text-2xl font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                    {percentage}%
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: colorVar }}>
                    {isSafe ? 'Safe' : isWarning ? 'Warning' : 'Danger'}
                </span>
            </div>
        </div>
    );
}

export default function DashboardOverview() {
    const { user } = useUser();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const greeting = currentTime.getHours() < 12 ? 'Good morning' 
        : currentTime.getHours() < 18 ? 'Good afternoon' 
        : 'Good evening';

    const firstName = user.name ? user.name.split(' ')[0] : 'Student';

    // Register-style quick links
    const registerModules = [
        { id: 'timetable', label: 'Timetable', category: 'academic', status: 'Live', time: '2m ago', icon: CalendarIcon },
        { id: 'attendance', label: 'Attendance Ledger', category: 'academic', status: '87%', time: '1h ago', icon: BarChart3 },
        { id: 'hostel-hub', label: 'Hostel Hub', category: 'hostel', status: 'Open', time: '6h ago', icon: Users },
        { id: 'parent-portal', label: 'Parent Portal', category: 'hostel', status: 'Active', time: '1h ago', icon: Brain },
        { id: 'search', label: 'Oracle Search', category: 'ai', status: 'Ready', time: 'Just now', icon: Search },
        { id: 'study-materials', label: 'Study Materials', category: 'academic', status: '12 new', time: '3h ago', icon: BookOpen },
        { id: 'campus', label: 'Campus Map', category: 'campus', status: 'Active', time: '5h ago', icon: MapPin },
        { id: 'ai-chat', label: 'AI Assistant', category: 'ai', status: 'Online', time: '1d ago', icon: Bot },
    ];

    const filteredModules = activeTab === 'all' 
        ? registerModules 
        : registerModules.filter(m => m.category === activeTab);

    // Helper to dispatch navigate event to parent
    const navigateTo = (route: string) => {
        window.dispatchEvent(new CustomEvent('navigate', { detail: route }));
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold tracking-tight">
                        {greeting}, <span style={{ color: 'var(--accent-primary)' }}>{firstName}</span>
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Here is your campus register for today.
                    </p>
                </div>
                
                <div className="w-full md:w-72">
                    <SearchBar />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Register */}
                <div className="lg:col-span-2 space-y-6">
                    {/* The Register */}
                    <DashCard>
                        <div className="flex items-center justify-between mb-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                            <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                                <FileText size={18} style={{ color: 'var(--accent-secondary)' }} />
                                Active Modules
                            </h2>
                            
                            {/* Category Tabs */}
                            <div className="flex gap-2 text-xs font-mono">
                                {['all', 'academic', 'hostel', 'campus', 'ai'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className="px-3 py-1 rounded-full transition-colors capitalize"
                                        style={{
                                            background: activeTab === tab ? 'var(--surface-overlay)' : 'transparent',
                                            color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                                            border: `1px solid ${activeTab === tab ? 'var(--border)' : 'transparent'}`
                                        }}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            {filteredModules.map((module) => (
                                <button
                                    key={module.id}
                                    onClick={() => navigateTo(module.id)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-[var(--surface-overlay)] transition-colors group text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-md bg-[var(--surface-base)] border border-[var(--border)] group-hover:border-[var(--accent-primary)] transition-colors">
                                            <module.icon size={16} style={{ color: 'var(--text-secondary)' }} className="group-hover:text-[var(--accent-primary)] transition-colors" />
                                        </div>
                                        <span className="font-medium text-[var(--text-primary)]">{module.label}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 font-mono text-xs">
                                        <span className="text-[var(--accent-primary)] font-semibold">{module.status}</span>
                                        <span className="text-[var(--text-muted)] w-16 text-right">{module.time}</span>
                                        <ChevronRight size={14} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </DashCard>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <DashCard accent="green">
                            <p className="text-xs text-[var(--text-secondary)] font-mono uppercase tracking-wider mb-1">Current CGPA</p>
                            <p className="text-2xl font-mono font-bold text-[var(--text-primary)]">8.92</p>
                            <p className="text-[10px] text-[var(--accent-tertiary)] mt-1 flex items-center gap-1">
                                <TrendingUp size={10} /> +0.15 this sem
                            </p>
                        </DashCard>
                        
                        <DashCard accent="yellow">
                            <p className="text-xs text-[var(--text-secondary)] font-mono uppercase tracking-wider mb-1">Study Streak</p>
                            <p className="text-2xl font-mono font-bold text-[var(--text-primary)]">12d</p>
                            <p className="text-[10px] text-[var(--accent-secondary)] mt-1 flex items-center gap-1">
                                <TrendingUp size={10} /> Personal best!
                            </p>
                        </DashCard>

                        <DashCard accent="red">
                            <p className="text-xs text-[var(--text-secondary)] font-mono uppercase tracking-wider mb-1">Next Exam</p>
                            <p className="text-2xl font-mono font-bold text-[var(--text-primary)]">4d</p>
                            <p className="text-[10px] text-[var(--text-muted)] mt-1">
                                Operating Systems
                            </p>
                        </DashCard>
                    </div>
                </div>

                {/* Right Column - Widgets */}
                <div className="space-y-6">
                    {/* Attendance Signature Widget */}
                    <DashCard className="flex flex-col items-center py-8">
                        <h3 className="font-display font-semibold mb-6 text-[var(--text-secondary)]">Overall Attendance</h3>
                        <AttendancePulse percentage={82} />
                        
                        <div className="mt-6 w-full space-y-2">
                            <div className="flex justify-between text-xs font-mono">
                                <span className="text-[var(--text-muted)]">Operating Sys</span>
                                <span className="text-[var(--accent-tertiary)]">85%</span>
                            </div>
                            <div className="flex justify-between text-xs font-mono">
                                <span className="text-[var(--text-muted)]">Database Mgt</span>
                                <span className="text-[var(--accent-secondary)]">76%</span>
                            </div>
                            <div className="flex justify-between text-xs font-mono">
                                <span className="text-[var(--text-muted)]">Theory of Comp</span>
                                <span className="text-[var(--accent-primary)]">71%</span>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => navigateTo('attendance')}
                            className="mt-6 text-xs text-[var(--accent-primary)] hover:underline font-mono"
                        >
                            View detailed ledger →
                        </button>
                    </DashCard>

                    {/* Today's Schedule Mini */}
                    <DashCard>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-display font-semibold text-[var(--text-secondary)]">Up Next</h3>
                            <Clock size={14} className="text-[var(--text-muted)]" />
                        </div>
                        
                        <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[5px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-[var(--border)]">
                            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-3 h-3 rounded-full border border-white bg-[var(--surface-raised)] text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-[.is-active]:bg-[var(--accent-primary)] group-[.is-active]:text-white group-[.is-active]:border-[var(--accent-primary-muted)] ml-[5px] -translate-x-[5px] md:mx-auto md:translate-x-0 z-10"></div>
                                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-[var(--surface-overlay)] p-3 rounded border border-[var(--border)] shadow">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="font-bold text-[var(--text-primary)] text-sm">OS Lecture</div>
                                        <div className="font-mono text-[10px] text-[var(--accent-primary)]">11:30 AM</div>
                                    </div>
                                    <div className="text-xs text-[var(--text-muted)]">SJT 312 • Prof. Smith</div>
                                </div>
                            </div>
                            
                            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                <div className="flex items-center justify-center w-3 h-3 rounded-full border border-[var(--border)] bg-[var(--surface-raised)] text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-[5px] -translate-x-[5px] md:mx-auto md:translate-x-0 z-10"></div>
                                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="font-bold text-[var(--text-secondary)] text-sm">DBMS Lab</div>
                                        <div className="font-mono text-[10px] text-[var(--text-muted)]">2:00 PM</div>
                                    </div>
                                    <div className="text-xs text-[var(--text-muted)]">AB1 401</div>
                                </div>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => navigateTo('timetable')}
                            className="mt-4 w-full text-center text-xs text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors font-mono"
                        >
                            Open Timetable
                        </button>
                    </DashCard>
                </div>
            </div>
        </div>
    );
}
