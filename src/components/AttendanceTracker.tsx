'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3, Plus, Trash2, AlertTriangle, CheckCircle2, TrendingUp,
    Calculator, BookOpen, Target, Award, Clock, Minus, ChevronDown,
    AlertCircle, Sparkles, GraduationCap
} from 'lucide-react';

interface Subject {
    id: string;
    name: string;
    code: string;
    attended: number;
    total: number;
    credits: number;
    grade: string;
}

const GRADES = [
    { grade: 'S', points: 10 },
    { grade: 'A', points: 9 },
    { grade: 'B', points: 8 },
    { grade: 'C', points: 7 },
    { grade: 'D', points: 6 },
    { grade: 'E', points: 5 },
    { grade: 'F', points: 0 },
];

export default function AttendanceTracker() {
    const [activeView, setActiveView] = useState<'attendance' | 'cgpa'>('attendance');
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState('');
    const [newCode, setNewCode] = useState('');
    const [newCredits, setNewCredits] = useState('3');

    // Load data
    useEffect(() => {
        const saved = localStorage.getItem('vitgroww_attendance');
        if (saved) {
            try { setSubjects(JSON.parse(saved)); } catch { }
        }
    }, []);

    // Save data
    useEffect(() => {
        if (subjects.length > 0) {
            localStorage.setItem('vitgroww_attendance', JSON.stringify(subjects));
        }
    }, [subjects]);

    const addSubject = () => {
        if (!newName.trim()) return;
        const subject: Subject = {
            id: `sub-${Date.now()}`,
            name: newName,
            code: newCode || 'SUB',
            attended: 0,
            total: 0,
            credits: Number(newCredits) || 3,
            grade: 'S'
        };
        setSubjects(prev => [...prev, subject]);
        setNewName('');
        setNewCode('');
        setShowAdd(false);
    };

    const deleteSubject = (id: string) => {
        setSubjects(prev => prev.filter(s => s.id !== id));
    };

    const updateAttendance = (id: string, field: 'attended' | 'total', delta: number) => {
        setSubjects(prev => prev.map(s => {
            if (s.id !== id) return s;
            const val = Math.max(0, s[field] + delta);
            if (field === 'attended' && val > s.total) return s;
            return { ...s, [field]: val };
        }));
    };

    const markPresent = (id: string) => {
        setSubjects(prev => prev.map(s =>
            s.id === id ? { ...s, attended: s.attended + 1, total: s.total + 1 } : s
        ));
    };

    const markAbsent = (id: string) => {
        setSubjects(prev => prev.map(s =>
            s.id === id ? { ...s, total: s.total + 1 } : s
        ));
    };

    const updateGrade = (id: string, grade: string) => {
        setSubjects(prev => prev.map(s =>
            s.id === id ? { ...s, grade } : s
        ));
    };

    const getPercentage = (s: Subject) => s.total === 0 ? 100 : Math.round((s.attended / s.total) * 100);

    const getColor = (pct: number) => pct >= 75 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
    const getStatusText = (pct: number) => pct >= 90 ? 'Excellent' : pct >= 75 ? 'Safe' : pct >= 60 ? 'Warning' : 'Danger';

    const canMiss = (s: Subject) => {
        // How many classes can you miss and stay at 75%?
        // (attended) / (total + x) >= 0.75
        // attended >= 0.75 * (total + x)
        // x <= (attended / 0.75) - total
        if (s.total === 0) return 99;
        const maxMissable = Math.floor(s.attended / 0.75 - s.total);
        return Math.max(0, maxMissable);
    };

    const needToAttend = (s: Subject) => {
        // How many classes to attend to reach 75%?
        // (attended + x) / (total + x) >= 0.75
        // attended + x >= 0.75 * total + 0.75x
        // 0.25x >= 0.75*total - attended
        // x >= 3*total - 4*attended
        if (getPercentage(s) >= 75) return 0;
        return Math.max(0, Math.ceil(3 * s.total - 4 * s.attended));
    };

    // CGPA calculation
    const cgpa = useMemo(() => {
        const withGrades = subjects.filter(s => s.grade !== 'F' || true);
        if (withGrades.length === 0) return 0;
        const totalPoints = withGrades.reduce((sum, s) => {
            const gradePoint = GRADES.find(g => g.grade === s.grade)?.points || 0;
            return sum + (gradePoint * s.credits);
        }, 0);
        const totalCredits = withGrades.reduce((sum, s) => sum + s.credits, 0);
        return totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
    }, [subjects]);

    const overallAttendance = useMemo(() => {
        const totalAttended = subjects.reduce((s, sub) => s + sub.attended, 0);
        const totalClasses = subjects.reduce((s, sub) => s + sub.total, 0);
        return totalClasses === 0 ? 100 : Math.round((totalAttended / totalClasses) * 100);
    }, [subjects]);

    const dangerSubjects = subjects.filter(s => getPercentage(s) < 75 && s.total > 0);

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                    <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.5 }}
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 border border-white/10">
                        <BarChart3 size={28} className="text-white" />
                    </motion.div>
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Attendance & CGPA</h2>
                        <p className="text-white/40 text-sm">Track attendance & calculate your CGPA</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-white/[0.03] rounded-xl border border-white/[0.06] p-1">
                        {[
                            { id: 'attendance' as const, label: 'Attendance' },
                            { id: 'cgpa' as const, label: 'CGPA' },
                        ].map(v => (
                            <button key={v.id} onClick={() => setActiveView(v.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeView === v.id ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/40 hover:text-white/80'}`}>
                                {v.label}
                            </button>
                        ))}
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAdd(!showAdd)}
                        className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                        <Plus size={18} /> Add Subject
                    </motion.button>
                </div>
            </div>

            {/* Danger Alert */}
            {dangerSubjects.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 flex-shrink-0">
                    <AlertTriangle size={20} className="text-rose-400 flex-shrink-0" />
                    <div>
                        <p className="text-rose-400 text-sm font-semibold">Attendance below 75%</p>
                        <p className="text-rose-400/60 text-xs">{dangerSubjects.map(s => s.code).join(', ')} — You may face debarment!</p>
                    </div>
                </motion.div>
            )}

            {/* Add Subject */}
            <AnimatePresence>
                {showAdd && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 flex-shrink-0 overflow-hidden">
                        <div className="grid grid-cols-3 gap-4">
                            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Subject Name"
                                className="w-full bg-black/30 border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/40" />
                            <input value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="Code (e.g., CSE2011)"
                                className="w-full bg-black/30 border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/40" />
                            <input type="number" value={newCredits} onChange={e => setNewCredits(e.target.value)} placeholder="Credits"
                                className="w-full bg-black/30 border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-emerald-500/40" />
                        </div>
                        <button onClick={addSubject} className="mt-3 w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all">
                            Add Subject
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
                <AnimatePresence mode="wait">
                    {/* ATTENDANCE VIEW */}
                    {activeView === 'attendance' && (
                        <motion.div key="att" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                            {/* Overview Stats */}
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { label: 'Subjects', value: subjects.length, color: 'cyan' },
                                    { label: 'Overall', value: `${overallAttendance}%`, color: overallAttendance >= 75 ? 'emerald' : 'rose' },
                                    { label: 'Safe', value: subjects.filter(s => getPercentage(s) >= 75).length, color: 'emerald' },
                                    { label: 'At Risk', value: dangerSubjects.length, color: 'rose' },
                                ].map((s, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 text-center">
                                        <p className={`text-2xl font-bold text-${s.color}-400`}>{s.value}</p>
                                        <p className="text-white/30 text-xs">{s.label}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Subject Cards */}
                            {subjects.length === 0 ? (
                                <div className="bg-white/[0.03] rounded-2xl border border-dashed border-white/[0.08] p-16 text-center">
                                    <BookOpen size={48} className="text-white/10 mx-auto mb-4" />
                                    <p className="text-white/30 text-sm">Add your subjects to start tracking attendance</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {subjects.map((s, i) => {
                                        const pct = getPercentage(s);
                                        const color = getColor(pct);
                                        const missable = canMiss(s);
                                        const needed = needToAttend(s);
                                        return (
                                            <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                                className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 group relative overflow-hidden">
                                                {/* Glow */}
                                                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" style={{ backgroundColor: color + '15' }} />

                                                <div className="flex items-start gap-4 relative z-10">
                                                    {/* Progress Ring */}
                                                    <div className="relative w-16 h-16 flex-shrink-0">
                                                        <svg className="w-16 h-16 -rotate-90">
                                                            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                                                            <motion.circle cx="32" cy="32" r="28" fill="none"
                                                                stroke={color} strokeWidth="5" strokeLinecap="round"
                                                                initial={{ strokeDasharray: '0 176' }}
                                                                animate={{ strokeDasharray: `${pct * 1.76} 176` }}
                                                                transition={{ duration: 1 }}
                                                            />
                                                        </svg>
                                                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{pct}%</span>
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h3 className="text-white/90 font-semibold text-sm">{s.name}</h3>
                                                                <p className="text-white/30 text-[10px]">{s.code} · {s.credits} credits</p>
                                                            </div>
                                                            <button onClick={() => deleteSubject(s.id)}
                                                                className="opacity-0 group-hover:opacity-100 p-1.5 text-white/20 hover:text-red-400 transition-all">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-white/50 text-xs">{s.attended}/{s.total} classes</span>
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold`}
                                                                style={{ backgroundColor: color + '20', color }}>
                                                                {getStatusText(pct)}
                                                            </span>
                                                        </div>

                                                        {/* Quick actions */}
                                                        <div className="flex items-center gap-2 mt-3">
                                                            <button onClick={() => markPresent(s.id)}
                                                                className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/25 transition-all flex items-center gap-1">
                                                                <CheckCircle2 size={12} /> Present
                                                            </button>
                                                            <button onClick={() => markAbsent(s.id)}
                                                                className="px-3 py-1.5 bg-rose-500/15 text-rose-400 rounded-lg text-xs font-medium hover:bg-rose-500/25 transition-all flex items-center gap-1">
                                                                <AlertCircle size={12} /> Absent
                                                            </button>
                                                        </div>

                                                        {/* Prediction */}
                                                        <div className="mt-3 p-2 bg-black/20 rounded-lg">
                                                            {pct >= 75 ? (
                                                                <p className="text-emerald-400/70 text-[11px]">✨ You can miss <b>{missable}</b> more classes safely</p>
                                                            ) : (
                                                                <p className="text-rose-400/70 text-[11px]">⚠️ Attend <b>{needed}</b> consecutive classes to reach 75%</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* CGPA VIEW */}
                    {activeView === 'cgpa' && (
                        <motion.div key="cgpa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                            {/* CGPA Display */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 backdrop-blur-xl border border-violet-500/20 rounded-3xl p-8 text-center">
                                <GraduationCap size={40} className="text-violet-400 mx-auto mb-4" />
                                <p className="text-white/40 text-sm mb-2">Your Current CGPA</p>
                                <p className="text-6xl font-black bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">{cgpa}</p>
                                <p className="text-white/30 text-xs mt-2">{subjects.length} subjects · {subjects.reduce((s, sub) => s + sub.credits, 0)} total credits</p>
                                <div className="flex justify-center gap-4 mt-6">
                                    <div className="px-4 py-2 bg-white/[0.05] rounded-xl">
                                        <p className="text-white/30 text-[10px] uppercase">Grade</p>
                                        <p className="text-lg font-bold text-emerald-400">
                                            {cgpa >= 9 ? 'S' : cgpa >= 8 ? 'A' : cgpa >= 7 ? 'B' : cgpa >= 6 ? 'C' : cgpa >= 5 ? 'D' : 'F'}
                                        </p>
                                    </div>
                                    <div className="px-4 py-2 bg-white/[0.05] rounded-xl">
                                        <p className="text-white/30 text-[10px] uppercase">Percentile</p>
                                        <p className="text-lg font-bold text-cyan-400">{Math.round(cgpa * 10)}%</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Grade Assignment */}
                            {subjects.length === 0 ? (
                                <div className="bg-white/[0.03] rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
                                    <Calculator size={48} className="text-white/10 mx-auto mb-4" />
                                    <p className="text-white/30 text-sm">Add subjects to calculate your CGPA</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">Assign Grades</h3>
                                    {subjects.map((s, i) => {
                                        const gradePoint = GRADES.find(g => g.grade === s.grade)?.points || 0;
                                        return (
                                            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                                className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
                                                <div className="flex-1">
                                                    <h4 className="text-white/80 text-sm font-medium">{s.name}</h4>
                                                    <p className="text-white/30 text-[10px]">{s.code} · {s.credits} credits · GP: {gradePoint}</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    {GRADES.map(g => (
                                                        <button key={g.grade} onClick={() => updateGrade(s.id, g.grade)}
                                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${s.grade === g.grade
                                                                ? 'bg-violet-500/30 text-violet-400 border border-violet-500/50'
                                                                : 'bg-white/[0.03] text-white/30 border border-white/[0.06] hover:bg-white/[0.06]'}`}>
                                                            {g.grade}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Grade Scale Reference */}
                            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
                                <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-3">VIT Grade Scale</h3>
                                <div className="grid grid-cols-7 gap-2">
                                    {GRADES.map(g => (
                                        <div key={g.grade} className="p-3 bg-white/[0.03] rounded-xl text-center border border-white/[0.05]">
                                            <p className="text-lg font-bold text-violet-400">{g.grade}</p>
                                            <p className="text-white/30 text-[10px]">{g.points} pts</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
