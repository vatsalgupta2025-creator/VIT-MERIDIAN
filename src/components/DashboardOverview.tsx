'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    TrendingUp, BookOpen, Clock, Zap, Target, Flame, Activity,
    MapPin, GraduationCap, ChevronRight, Sparkles, Award, Brain,
    Calendar as CalendarIcon, FileText, Users, ArrowUpRight, BarChart3, Layers,
    Star, Bookmark, Bell, Search, MoreHorizontal, Plus
} from 'lucide-react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import WeatherWidget from './WeatherWidget';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { resources, currentUser } from '@/data/mockData';
import SearchBar from './SearchBar';
import CalendarWidget from './Calendar';
import TodoList from './TodoList';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Animated counter component
function AnimatedNumber({ value, duration = 2 }: { value: number; duration?: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
            setCount(Math.floor(progress * value));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [value, duration]);

    return <span>{count}</span>;
}

// Glass Card Component with hover effects
function GlassCard({ children, className = '', gradient = false, delay = 0, onMouseEnter, onMouseLeave }: {
    children: React.ReactNode;
    className?: string;
    gradient?: boolean;
    delay?: number;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, type: 'spring', stiffness: 100 }}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`relative overflow-hidden rounded-2xl backdrop-blur-xl border border-white/[0.06] ${gradient
                ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.02]'
                : 'bg-white/[0.03]'
                } ${className}`}
        >
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
            {children}
        </motion.div>
    );
}

// Stat Card with animated icon
function StatCard({ stat, index }: { stat: any; index: number }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <GlassCard
            delay={index * 0.1}
            className="p-5 cursor-pointer group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-start justify-between mb-4">
                <motion.div
                    animate={{
                        rotate: isHovered ? [0, -10, 10, -10, 0] : 0,
                        scale: isHovered ? 1.1 : 1
                    }}
                    transition={{ duration: 0.5 }}
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg ${stat.shadowColor}`}
                >
                    <stat.icon size={22} className="text-white" />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1 text-[11px] font-medium text-emerald-400/80 bg-emerald-500/10 px-2 py-1 rounded-full"
                >
                    <TrendingUp size={10} />
                    <span>{stat.change}</span>
                </motion.div>
            </div>

            <div className="relative">
                <motion.p
                    key={isHovered ? 'hovered' : 'normal'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-white/90"
                >
                    {stat.prefix}{stat.animated ? <AnimatedNumber value={parseInt(stat.value)} /> : stat.value}
                </motion.p>
                <p className="text-xs text-white/40 mt-1">{stat.label}</p>
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.progress}%` }}
                    transition={{ delay: index * 0.2 + 0.5, duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${stat.color}`}
                />
            </div>
        </GlassCard>
    );
}

// Quick Action Button
function QuickAction({ action, index }: { action: any; index: number }) {
    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="relative group overflow-hidden rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06] p-4 text-left transition-all hover:bg-white/[0.06] hover:border-white/[0.12]"
        >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-cyan-500/5 to-violet-500/5" />

            <div className="relative flex items-center gap-4">
                <div className="relative">
                    <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-xl shadow-lg`}
                    >
                        {action.icon}
                    </motion.div>
                    {action.badge && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {action.badge}
                        </span>
                    )}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{action.label}</p>
                    <p className="text-[11px] text-white/30">{action.desc}</p>
                </div>
                <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all" />
            </div>
        </motion.button>
    );
}

// Welcome Section with greeting based on time
function WelcomeSection() {
    const [greeting, setGreeting] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 17) setGreeting('Good afternoon');
        else setGreeting('Good evening');

        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500/20 via-violet-500/10 to-transparent border border-white/[0.08] p-8"
        >
            {/* Animated background orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/20 rounded-full blur-[80px] -ml-24 -mb-24 animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-3 mb-2"
                    >
                        <span className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-medium backdrop-blur-sm">
                            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block mr-1 animate-pulse" />
                            Online
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold text-white mb-1"
                    >
                        {greeting}, <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">{currentUser.name.split(' ')[0]}</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-white/50"
                    >
                        You have 3 tasks pending and 1 class starting soon
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="hidden md:flex items-center gap-4"
                >
                    <div className="text-right">
                        <p className="text-3xl font-bold text-white/90">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-xs text-white/40">Local Time</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Clock size={28} className="text-white" />
                    </div>
                </motion.div>
            </div>

            {/* Stats row in welcome */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="relative z-10 flex gap-6 mt-6 pt-6 border-t border-white/[0.06]"
            >
                {[
                    { label: 'XP Today', value: '+245', icon: Zap },
                    { label: 'Streak', value: '12 days', icon: Flame },
                    { label: 'Rank', value: '#42', icon: Award },
                ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <item.icon size={14} className="text-cyan-400" />
                        <span className="text-white/60 text-sm">{item.label}:</span>
                        <span className="text-white font-semibold text-sm">{item.value}</span>
                    </div>
                ))}
            </motion.div>
        </motion.div>
    );
}

// Ongoing Class Widget
function OngoingClassWidget() {
    const [currentClass, setCurrentClass] = useState<any>(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [progress, setProgress] = useState(100);

    const updateCurrentClass = useCallback(() => {
        const saved = localStorage.getItem('vitgroww_timetable');
        if (!saved) return;

        try {
            const timetable = JSON.parse(saved);
            const now = new Date();
            const dayIndex = now.getDay();
            if (dayIndex === 0) return;

            const dayName = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][dayIndex - 1];
            const daySchedule = timetable.schedule?.find((s: any) => s.day === dayName);
            if (!daySchedule) return;

            const currentTime = now.getHours() * 60 + now.getMinutes();

            for (const { slot, course } of daySchedule.slots) {
                if (!slot?.startTime || !course) continue;

                const [startH, startM] = slot.startTime.split(':').map(Number);
                const [endH, endM] = slot.endTime.split(':').map(Number);
                const slotStart = startH * 60 + startM;
                const slotEnd = endH * 60 + endM;

                if (currentTime >= slotStart && currentTime < slotEnd) {
                    setCurrentClass({ course, slot });
                    const remaining = slotEnd - currentTime;
                    setTimeRemaining(remaining);
                    setProgress((remaining / (slotEnd - slotStart)) * 100);
                    return;
                }
            }
            setCurrentClass(null);
        } catch { }
    }, []);

    useEffect(() => {
        updateCurrentClass();
        const interval = setInterval(updateCurrentClass, 60000);
        return () => clearInterval(interval);
    }, [updateCurrentClass]);

    const formatTime = (mins: number) => {
        const hrs = Math.floor(mins / 60);
        const m = mins % 60;
        return hrs > 0 ? `${hrs}h ${m}m` : `${m}m`;
    };

    if (!currentClass) {
        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                className="glass-card p-5 flex items-center justify-between cursor-pointer group"
                onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'timetable' }))}
            >
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.05] flex items-center justify-center">
                        <Clock size={28} className="text-white/30" />
                    </div>
                    <div>
                        <p className="text-white/50 text-sm font-medium">No ongoing class</p>
                        <p className="text-white/20 text-xs">Click to view timetable</p>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                    <ChevronRight size={18} className="text-white/30 group-hover:text-cyan-400 transition-colors" />
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            className="glass-card p-5 cursor-pointer group relative overflow-hidden"
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'timetable' }))}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 rounded-full blur-[40px] -mr-16 -mt-16" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold rounded-full flex items-center gap-1.5"
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        LIVE NOW
                    </motion.span>
                    <span className="text-white/30 text-xs font-medium">{currentClass.slot.code}</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{currentClass.course.name}</h3>

                <div className="flex items-center gap-4 text-xs text-white/50 mb-4">
                    <span className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-cyan-400" />
                        {currentClass.course.room}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <GraduationCap size={12} className="text-violet-400" />
                        {currentClass.course.code}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-white/40 text-xs">{formatTime(timeRemaining)} remaining</span>
                    </div>
                    <div className="h-2 w-28 bg-white/[0.08] rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500 rounded-full"
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// XP / Activity line chart
function ActivityChart() {
    const sharedTooltip = { backgroundColor: 'rgba(10,15,30,0.95)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, cornerRadius: 10, padding: 12, titleFont: { family: 'Inter', size: 12 }, bodyFont: { family: 'Inter', size: 13 }, displayColors: false };
    const data = useMemo(() => ({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'XP Gained',
            data: [12, 19, 15, 25, 22, 30, 35],
            borderColor: '#06b6d4',
            backgroundColor: (context: any) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                gradient.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
                gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
                return gradient;
            },
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#8b5cf6',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
        }]
    }), []);
    return (
        <GlassCard className="p-6" gradient delay={0.3}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div>
                    <h3 className="text-base font-semibold text-white/90 flex items-center gap-2"><Activity size={16} className="text-cyan-400" />Weekly XP</h3>
                    <p className="text-xs text-white/40 mt-0.5">Daily XP earned this week</p>
                </div>
                <span className="text-2xl font-black text-white">158 <span className="text-xs text-emerald-400 font-medium">XP</span></span>
            </div>
            <div className="relative z-10 h-[155px]">
                <Line data={data} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { ...sharedTooltip, callbacks: { label: (c) => `${c.parsed.y} XP` } } }, scales: { y: { display: false, beginAtZero: true, grid: { display: false } }, x: { grid: { display: false }, border: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'Inter', size: 11 } } } }, interaction: { intersect: false, mode: 'index' } }} />
            </div>
        </GlassCard>
    );
}

// Subject Performance Bar Chart
function SubjectPerformanceChart() {
    const data = useMemo(() => ({
        labels: ['DSA', 'DBMS', 'OS', 'CN', 'ML', 'SE'],
        datasets: [{
            label: 'Score (%)',
            data: [88, 76, 91, 65, 82, 70],
            backgroundColor: ['rgba(6,182,212,0.7)', 'rgba(139,92,246,0.7)', 'rgba(16,185,129,0.7)', 'rgba(245,158,11,0.7)', 'rgba(239,68,68,0.7)', 'rgba(99,102,241,0.7)'],
            borderColor: ['rgba(6,182,212,1)', 'rgba(139,92,246,1)', 'rgba(16,185,129,1)', 'rgba(245,158,11,1)', 'rgba(239,68,68,1)', 'rgba(99,102,241,1)'],
            borderWidth: 1.5,
            borderRadius: 8,
            borderSkipped: false as const,
        }]
    }), []);
    return (
        <GlassCard className="p-6" gradient delay={0.4}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-semibold text-white/90 flex items-center gap-2"><BarChart3 size={16} className="text-violet-400" />Subject Scores</h3>
                    <p className="text-xs text-white/40 mt-0.5">Current semester performance</p>
                </div>
                <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full">Avg 79%</span>
            </div>
            <div className="h-[155px]">
                <Bar data={data} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(10,15,30,0.95)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, cornerRadius: 10, padding: 10, displayColors: false, callbacks: { label: (c) => `Score: ${c.parsed.y}%` } } }, scales: { y: { display: false, beginAtZero: true, max: 100 }, x: { grid: { display: false }, border: { display: false }, ticks: { color: 'rgba(255,255,255,0.5)', font: { family: 'Inter', size: 11 } } } } }} />
            </div>
        </GlassCard>
    );
}

// Grade Distribution Doughnut
function GradeDistributionChart() {
    const data = useMemo(() => ({
        labels: ['O (90-100)', 'A+ (80-89)', 'A (70-79)', 'B+ (60-69)', 'B (<60)'],
        datasets: [{
            data: [2, 3, 1, 1, 1],
            backgroundColor: ['rgba(16,185,129,0.85)', 'rgba(6,182,212,0.85)', 'rgba(139,92,246,0.85)', 'rgba(245,158,11,0.85)', 'rgba(239,68,68,0.85)'],
            borderColor: 'rgba(0,0,0,0.3)',
            borderWidth: 2,
            hoverOffset: 8,
        }]
    }), []);
    const gradeColors = ['text-emerald-400', 'text-cyan-400', 'text-violet-400', 'text-amber-400', 'text-rose-400'];
    const dotColors = ['bg-emerald-400', 'bg-cyan-400', 'bg-violet-400', 'bg-amber-400', 'bg-rose-400'];
    return (
        <GlassCard className="p-6" gradient delay={0.5}>
            <h3 className="text-base font-semibold text-white/90 flex items-center gap-2 mb-4"><TrendingUp size={16} className="text-amber-400" />Grade Distribution</h3>
            <div className="flex items-center gap-4">
                <div className="h-[130px] w-[130px] flex-shrink-0">
                    <Doughnut data={data} options={{ responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(10,15,30,0.95)', cornerRadius: 10, padding: 10, displayColors: true } } }} />
                </div>
                <div className="flex flex-col gap-2">
                    {['O', 'A+', 'A', 'B+', 'B'].map((g, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${dotColors[i]}`} />
                            <span className={`${gradeColors[i]} font-medium`}>{g} grade</span>
                            <span className="text-white/30">·</span>
                            <span className="text-white/50">{[2, 3, 1, 1, 1][i]} subjects</span>
                        </div>
                    ))}
                </div>
            </div>
        </GlassCard>
    );
}

// Attendance Bar Chart
function AttendanceChart() {
    const data = useMemo(() => ({
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            { label: 'Attended', data: [22, 18, 20, 24, 19, 22], backgroundColor: 'rgba(16,185,129,0.7)', borderColor: 'rgba(16,185,129,1)', borderWidth: 1.5, borderRadius: 6, borderSkipped: false as const },
            { label: 'Total', data: [24, 20, 22, 26, 22, 24], backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderRadius: 6, borderSkipped: false as const },
        ]
    }), []);
    return (
        <GlassCard className="p-6" gradient delay={0.5}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-semibold text-white/90 flex items-center gap-2"><Users size={16} className="text-emerald-400" />Attendance</h3>
                    <p className="text-xs text-white/40 mt-0.5">Monthly classes attended</p>
                </div>
                <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full">87.5%</span>
            </div>
            <div className="h-[155px]">
                <Bar data={data} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(10,15,30,0.95)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, cornerRadius: 10, padding: 10 } }, scales: { y: { display: false }, x: { grid: { display: false }, border: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)', font: { family: 'Inter', size: 11 } } } } }} />
            </div>
        </GlassCard>
    );
}

export default function DashboardOverview() {
    const quickStats = [
        { label: 'Resources Accessed', value: '47', change: '+12%', icon: BookOpen, color: 'from-cyan-500 to-blue-500', shadowColor: 'shadow-cyan-500/20', progress: 78, animated: true, prefix: '' },
        { label: 'Deadlines This Week', value: '3', change: '2 urgent', icon: Clock, color: 'from-rose-500 to-orange-500', shadowColor: 'shadow-rose-500/20', progress: 60, animated: false, prefix: '' },
        { label: 'RUVI Score', value: currentUser.ruviScore.toString(), change: '+5 pts', icon: Target, color: 'from-violet-500 to-purple-500', shadowColor: 'shadow-violet-500/20', progress: 85, animated: true, prefix: '' },
        { label: 'XP Earned', value: '1250', change: '🔥 12-day streak', icon: Flame, color: 'from-amber-500 to-orange-500', shadowColor: 'shadow-amber-500/20', progress: 92, animated: true, prefix: '' },
    ];

    const quickActions = [
        { label: 'Timetable', icon: '📅', desc: 'View classes', gradient: 'from-cyan-500 to-blue-500', badge: null },
        { label: 'Upload Notes', icon: '📤', desc: 'Earn +15 XP', gradient: 'from-violet-500 to-purple-500', badge: null },
        { label: 'Study Groups', icon: '👥', desc: '4 active groups', gradient: 'from-emerald-500 to-teal-500', badge: '2' },
        { label: 'Resources', icon: '📚', desc: 'Browse library', gradient: 'from-amber-500 to-orange-500', badge: null },
    ];

    return (
        <>


            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative z-10 space-y-6 pb-8"
            >
                {/* Welcome Section */}
                <WelcomeSection />

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <SearchBar />
                </motion.div>



                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickStats.map((stat, i) => (
                        <StatCard key={i} stat={stat} index={i} />
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Activity Chart */}
                        <ActivityChart />

                        {/* 2x2 Analytics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SubjectPerformanceChart />
                            <GradeDistributionChart />
                        </div>

                        {/* Attendance Chart */}
                        <AttendanceChart />

                        {/* Quick Actions */}
                        <div>
                            <motion.h3
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2"
                            >
                                <Layers size={14} className="text-cyan-400" />
                                Quick Actions
                            </motion.h3>
                            <div className="grid grid-cols-2 gap-3">
                                {quickActions.map((action, i) => (
                                    <QuickAction key={i} action={action} index={i} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Ongoing Class */}
                        <OngoingClassWidget />

                        {/* Weather */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <WeatherWidget />
                        </motion.div>

                        {/* Mini Calendar */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <CalendarWidget />
                        </motion.div>

                        {/* Todo */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <TodoList />
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </>
    );
}
