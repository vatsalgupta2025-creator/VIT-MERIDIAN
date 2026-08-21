'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, Upload, CheckCircle, AlertCircle, BookOpen,
    MapPin, User, ChevronRight, Trash2, Download, RefreshCw,
    Search, Filter, Plus, X, Bell, Info, GraduationCap,
    Timer, ArrowRight, LayoutGrid, List, Star
} from 'lucide-react';

// VIT Timetable Slot Definitions
interface TimeSlot {
    code: string;
    startTime: string;
    endTime: string;
    type: 'THEORY' | 'LAB';
}

interface Course {
    code: string;
    name: string;
    faculty: string;
    room: string;
    slot: string;
    type: 'THEORY' | 'LAB';
    credits?: number;
}

interface DaySchedule {
    day: string;
    slots: { slot: TimeSlot; course?: Course }[];
}

interface TimetableData {
    courses: Course[];
    schedule: DaySchedule[];
}

// VIT Standard Slots
const THEORY_SLOTS: TimeSlot[] = [
    { code: 'A1', startTime: '08:00', endTime: '08:50', type: 'THEORY' },
    { code: 'F1', startTime: '09:00', endTime: '09:50', type: 'THEORY' },
    { code: 'D1', startTime: '10:00', endTime: '10:50', type: 'THEORY' },
    { code: 'TB1', startTime: '11:00', endTime: '11:50', type: 'THEORY' },
    { code: 'TG1', startTime: '12:00', endTime: '12:50', type: 'THEORY' },
    { code: 'A2', startTime: '14:00', endTime: '14:50', type: 'THEORY' },
    { code: 'F2', startTime: '15:00', endTime: '15:50', type: 'THEORY' },
    { code: 'D2', startTime: '16:00', endTime: '16:50', type: 'THEORY' },
    { code: 'TB2', startTime: '17:00', endTime: '17:50', type: 'THEORY' },
    { code: 'TG2', startTime: '18:00', endTime: '18:50', type: 'THEORY' },
    // Additional slots
    { code: 'B1', startTime: '08:00', endTime: '08:50', type: 'THEORY' },
    { code: 'G1', startTime: '09:00', endTime: '09:50', type: 'THEORY' },
    { code: 'E1', startTime: '10:00', endTime: '10:50', type: 'THEORY' },
    { code: 'TC1', startTime: '11:00', endTime: '11:50', type: 'THEORY' },
    { code: 'TAA1', startTime: '12:00', endTime: '12:50', type: 'THEORY' },
    { code: 'B2', startTime: '14:00', endTime: '14:50', type: 'THEORY' },
    { code: 'G2', startTime: '15:00', endTime: '15:50', type: 'THEORY' },
    { code: 'E2', startTime: '16:00', endTime: '16:50', type: 'THEORY' },
    { code: 'TC2', startTime: '17:00', endTime: '17:50', type: 'THEORY' },
    { code: 'TAA2', startTime: '18:00', endTime: '18:50', type: 'THEORY' },
    { code: 'C1', startTime: '08:00', endTime: '08:50', type: 'THEORY' },
    { code: 'TD1', startTime: '09:00', endTime: '09:50', type: 'THEORY' },
    { code: 'TBB1', startTime: '10:00', endTime: '10:50', type: 'THEORY' },
    { code: 'C2', startTime: '14:00', endTime: '14:50', type: 'THEORY' },
    { code: 'TD2', startTime: '15:00', endTime: '15:50', type: 'THEORY' },
    { code: 'TBB2', startTime: '16:00', endTime: '16:50', type: 'THEORY' },
];

const LAB_SLOTS: TimeSlot[] = [
    { code: 'L1', startTime: '08:00', endTime: '08:50', type: 'LAB' },
    { code: 'L2', startTime: '08:50', endTime: '09:40', type: 'LAB' },
    { code: 'L3', startTime: '09:50', endTime: '10:40', type: 'LAB' },
    { code: 'L4', startTime: '10:40', endTime: '11:30', type: 'LAB' },
    { code: 'L5', startTime: '11:40', endTime: '12:30', type: 'LAB' },
    { code: 'L6', startTime: '12:30', endTime: '13:20', type: 'LAB' },
    { code: 'L31', startTime: '14:00', endTime: '14:50', type: 'LAB' },
    { code: 'L32', startTime: '14:50', endTime: '15:40', type: 'LAB' },
    { code: 'L33', startTime: '15:50', endTime: '16:40', type: 'LAB' },
    { code: 'L34', startTime: '16:40', endTime: '17:30', type: 'LAB' },
    { code: 'L35', startTime: '17:40', endTime: '18:30', type: 'LAB' },
    { code: 'L36', startTime: '18:30', endTime: '19:20', type: 'LAB' },
];

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// Slot mapping for each day
const DAY_SLOTS: Record<string, string[]> = {
    'MON': ['A1', 'F1', 'D1', 'TB1', 'TG1', 'L1-L6', 'L31-L36', 'A2', 'F2', 'D2', 'TB2', 'TG2'],
    'TUE': ['B1', 'G1', 'E1', 'TC1', 'TAA1', 'L7-L12', 'L37-L42', 'B2', 'G2', 'E2', 'TC2', 'TAA2'],
    'WED': ['C1', 'A1', 'F1', 'TD1', 'TBB1', 'L13-L18', 'L43-L48', 'C2', 'A2', 'F2', 'TD2', 'TBB2'],
    'THU': ['D1', 'B1', 'G1', 'TE1', 'TCC1', 'L19-L24', 'L49-L54', 'D2', 'B2', 'G2', 'TE2', 'TCC2'],
    'FRI': ['E1', 'C1', 'TA1', 'TF1', 'TDD1', 'L25-L30', 'L55-L60', 'E2', 'C2', 'TA2', 'TF2', 'TDD2'],
    'SAT': ['X11', 'X12', 'Y11', 'Y12', 'S8', 'L71-L76', 'L77-L82', 'X21', 'Z21', 'Y21', 'W21', 'W22'],
};

interface CurrentClass {
    course?: Course;
    slot?: TimeSlot;
    nextCourse?: Course;
    nextSlot?: TimeSlot;
    timeRemaining: number; // minutes
    isBreak: boolean;
}

export default function TimetableHelper() {
    const [timetable, setTimetable] = useState<TimetableData | null>(null);
    const [activeTab, setActiveTab] = useState<'timetable' | 'ffcs' | 'current'>('current');
    const [currentClass, setCurrentClass] = useState<CurrentClass | null>(null);
    const [uploadText, setUploadText] = useState('');
    const [showUpload, setShowUpload] = useState(false);
    const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 1 : new Date().getDay());
    const [ffcsQuery, setFfcsQuery] = useState('');
    const [conflicts, setConflicts] = useState<string[]>([]);

    // Load timetable from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('vitgroww_timetable');
        if (saved) {
            try {
                setTimetable(JSON.parse(saved));
            } catch { }
        }
    }, []);

    // Save timetable when changed
    useEffect(() => {
        if (timetable) {
            localStorage.setItem('vitgroww_timetable', JSON.stringify(timetable));
        }
    }, [timetable]);

    // Parse timetable from uploaded text
    const parseTimetable = useCallback((text: string): TimetableData => {
        const courses: Course[] = [];
        const lines = text.split('\n').filter(l => l.trim());
        
        // Simple parser - looks for patterns like "A1-BACSE105-ETH-AB1-401-ALL"
        const coursePattern = /([A-Z]\d+)-([A-Z]+\d+)-(ETH|ELA|LO|LAB)-([A-Z0-9]+)-(\d+)-ALL/gi;
        
        lines.forEach(line => {
            let match;
            while ((match = coursePattern.exec(line)) !== null) {
                const [_, slot, code, type, building, room] = match;
                courses.push({
                    code: code.toUpperCase(),
                    name: code.toUpperCase(), // Will be updated by user
                    faculty: 'TBD',
                    room: `${building}-${room}`,
                    slot: slot.toUpperCase(),
                    type: type === 'ETH' ? 'THEORY' : 'LAB',
                });
            }
        });

        // Build schedule
        const schedule: DaySchedule[] = DAYS.map(day => {
            const daySlots = DAY_SLOTS[day] || [];
            const slots = daySlots.map(slotCode => {
                // Handle lab ranges like L1-L6
                if (slotCode.includes('-')) {
                    const [start, end] = slotCode.split('-');
                    const labCourses = courses.filter(c => {
                        const labNum = parseInt(c.slot.replace('L', ''));
                        const startNum = parseInt(start.replace('L', ''));
                        const endNum = parseInt(end.replace('L', ''));
                        return labNum >= startNum && labNum <= endNum && c.type === 'LAB';
                    });
                    return { slot: LAB_SLOTS.find(s => s.code === start)!, course: labCourses[0] };
                }
                
                const course = courses.find(c => c.slot === slotCode);
                const slot = [...THEORY_SLOTS, ...LAB_SLOTS].find(s => s.code === slotCode);
                return { slot: slot || { code: slotCode, startTime: '', endTime: '', type: 'THEORY' }, course };
            }).filter(s => s.slot);

            return { day, slots };
        });

        return { courses, schedule };
    }, []);

    const handleUpload = () => {
        if (!uploadText.trim()) return;
        const parsed = parseTimetable(uploadText);
        setTimetable(parsed);
        setShowUpload(false);
        setUploadText('');
    };

    const addCourse = (course: Course) => {
        if (!timetable) return;
        setTimetable({
            ...timetable,
            courses: [...timetable.courses, course]
        });
    };

    const removeCourse = (courseCode: string) => {
        if (!timetable) return;
        setTimetable({
            ...timetable,
            courses: timetable.courses.filter(c => c.code !== courseCode)
        });
    };

    // Get current class info
    const updateCurrentClass = useCallback(() => {
        if (!timetable) return;

        const now = new Date();
        const dayIndex = now.getDay();
        if (dayIndex === 0) {
            setCurrentClass({ timeRemaining: 0, isBreak: true });
            return;
        }

        const dayName = DAYS[dayIndex - 1];
        const daySchedule = timetable.schedule.find(s => s.day === dayName);
        if (!daySchedule) return;

        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        let current: CurrentClass = { timeRemaining: 0, isBreak: true };
        
        for (let i = 0; i < daySchedule.slots.length; i++) {
            const { slot, course } = daySchedule.slots[i];
            if (!slot.startTime) continue;
            
            const [startH, startM] = slot.startTime.split(':').map(Number);
            const [endH, endM] = slot.endTime.split(':').map(Number);
            const slotStart = startH * 60 + startM;
            const slotEnd = endH * 60 + endM;

            if (currentTime >= slotStart && currentTime < slotEnd) {
                current = {
                    course,
                    slot,
                    timeRemaining: slotEnd - currentTime,
                    isBreak: !course
                };
                
                // Find next class
                for (let j = i + 1; j < daySchedule.slots.length; j++) {
                    if (daySchedule.slots[j].course) {
                        current.nextCourse = daySchedule.slots[j].course;
                        current.nextSlot = daySchedule.slots[j].slot;
                        break;
                    }
                }
                break;
            } else if (currentTime < slotStart) {
                // Before this slot
                if (!current.nextCourse && course) {
                    current.nextCourse = course;
                    current.nextSlot = slot;
                    current.timeRemaining = slotStart - currentTime;
                }
                break;
            }
        }

        setCurrentClass(current);
    }, [timetable]);

    useEffect(() => {
        updateCurrentClass();
        const interval = setInterval(updateCurrentClass, 60000);
        return () => clearInterval(interval);
    }, [updateCurrentClass]);

    // FFCS Helper - Check for conflicts
    const checkConflicts = (newSlot: string) => {
        if (!timetable) return [];
        const conflicts: string[] = [];
        
        timetable.courses.forEach(course => {
            if (course.slot === newSlot) {
                conflicts.push(`${course.code} already occupies ${newSlot}`);
            }
        });
        
        return conflicts;
    };

    // Get free slots for a day
    const getFreeSlots = (day: string) => {
        const daySlots = DAY_SLOTS[day] || [];
        const occupied = timetable?.courses.map(c => c.slot) || [];
        return daySlots.filter(s => !occupied.includes(s) && !s.includes('-'));
    };

    const formatTime = (minutes: number) => {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs}h ${mins}m`;
    };

    if (!timetable && !showUpload) {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Hero */}
                <div className="bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-2xl p-8 border border-white/[0.06]">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                            <Calendar size={28} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Timetable Helper</h2>
                            <p className="text-white/40">Manage your VIT timetable, track classes & plan FFCS</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowUpload(true)}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20"
                    >
                        <Upload size={18} /> Upload Timetable
                    </button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { icon: Clock, title: 'Live Class Tracker', desc: 'See ongoing & upcoming classes in real-time', color: 'cyan' },
                        { icon: Search, title: 'FFCS Helper', desc: 'Find free slots & check for conflicts', color: 'violet' },
                        { icon: Bell, title: 'Smart Reminders', desc: 'Get notified before classes start', color: 'amber' },
                    ].map((f, i) => (
                        <div key={i} className="bg-[#0c0f17] rounded-xl p-5 border border-white/[0.05]">
                            <div className={`w-10 h-10 rounded-lg bg-${f.color}-500/15 flex items-center justify-center mb-3`}>
                                <f.icon size={20} className={`text-${f.color}-400`} />
                            </div>
                            <h3 className="text-white/80 font-medium mb-1">{f.title}</h3>
                            <p className="text-white/30 text-xs">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        );
    }

    if (showUpload) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
                <div className="bg-[#0c0f17] rounded-2xl p-6 border border-white/[0.05]">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Upload size={18} className="text-cyan-400" /> Upload Your Timetable
                    </h3>
                    <p className="text-white/40 text-sm mb-4">
                        Paste your timetable data below. We&apos;ll automatically parse the course codes and slots.
                        <br />
                        <span className="text-cyan-400/60">Format: A1-BACSE105-ETH-AB1-401-ALL</span>
                    </p>
                    <textarea
                        value={uploadText}
                        onChange={(e) => setUploadText(e.target.value)}
                        placeholder="Paste your timetable here..."
                        className="w-full h-64 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-cyan-500/30 resize-none mb-4"
                    />
                    <div className="flex gap-3">
                        <button
                            onClick={handleUpload}
                            disabled={!uploadText.trim()}
                            className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-30 transition-opacity"
                        >
                            Parse Timetable
                        </button>
                        <button
                            onClick={() => setShowUpload(false)}
                            className="px-6 py-3 bg-white/[0.05] text-white/60 rounded-xl hover:bg-white/[0.08] transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 h-[calc(100vh-140px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                        <Calendar size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Timetable Helper</h2>
                        <p className="text-white/35 text-xs">{timetable?.courses.length || 0} courses • {DAYS.length} days</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowUpload(true)}
                        className="px-3 py-2 bg-white/[0.05] text-white/60 rounded-lg text-xs hover:bg-white/[0.08] transition-colors flex items-center gap-1.5"
                    >
                        <RefreshCw size={12} /> Re-upload
                    </button>
                    <button
                        onClick={() => setTimetable(null)}
                        className="px-3 py-2 bg-white/[0.05] text-rose-400 rounded-lg text-xs hover:bg-rose-500/10 transition-colors flex items-center gap-1.5"
                    >
                        <Trash2 size={12} /> Clear
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl w-fit flex-shrink-0 border border-white/[0.04]">
                {[
                    { id: 'current', label: 'Current Class', icon: Clock },
                    { id: 'timetable', label: 'Weekly View', icon: LayoutGrid },
                    { id: 'ffcs', label: 'FFCS Helper', icon: Search },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                            activeTab === tab.id
                                ? 'bg-cyan-500/20 text-cyan-400 shadow-sm'
                                : 'text-white/30 hover:text-white/50 hover:bg-white/[0.03]'
                        }`}
                    >
                        <tab.icon size={13} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
                <AnimatePresence mode="wait">
                    {/* CURRENT CLASS VIEW */}
                    {activeTab === 'current' && (
                        <motion.div key="current" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                            {/* Current Class Card */}
                            <div className="bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-2xl p-6 border border-white/[0.06]">
                                {currentClass?.course ? (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-medium rounded-full flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ongoing
                                            </span>
                                            <span className="text-white/30 text-xs">{currentClass.slot?.code} • {currentClass.slot?.startTime} - {currentClass.slot?.endTime}</span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-1">{currentClass.course.name}</h3>
                                        <p className="text-white/50 text-sm mb-4">{currentClass.course.code}</p>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="flex items-center gap-1.5 text-white/60">
                                                <MapPin size={14} className="text-cyan-400" /> {currentClass.course.room}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-white/60">
                                                <User size={14} className="text-violet-400" /> {currentClass.course.faculty}
                                            </span>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-white/[0.06]">
                                            <div className="flex items-center justify-between">
                                                <span className="text-white/40 text-xs">Time Remaining</span>
                                                <span className="text-white font-mono">{formatTime(currentClass.timeRemaining)}</span>
                                            </div>
                                            <div className="h-1.5 bg-white/[0.06] rounded-full mt-2 overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-cyan-500 to-violet-500"
                                                    initial={{ width: '100%' }}
                                                    animate={{ width: `${(currentClass.timeRemaining / 50) * 100}%` }}
                                                    transition={{ duration: 60, ease: 'linear' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : currentClass?.isBreak ? (
                                    <div className="text-center py-8">
                                        <div className="w-16 h-16 rounded-full bg-white/[0.05] flex items-center justify-center mx-auto mb-4">
                                            <Clock size={32} className="text-white/20" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-white/80 mb-2">No Class Right Now</h3>
                                        <p className="text-white/40 text-sm">Enjoy your break! 🎉</p>
                                        {currentClass.nextCourse && (
                                            <div className="mt-4 p-3 bg-white/[0.03] rounded-xl">
                                                <p className="text-white/30 text-xs mb-1">Next Class</p>
                                                <p className="text-white/70 font-medium">{currentClass.nextCourse.name}</p>
                                                <p className="text-cyan-400/60 text-xs">in {formatTime(currentClass.timeRemaining)}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-white/40">Classes over for today or weekend!</p>
                                    </div>
                                )}
                            </div>

                            {/* Today&apos;s Schedule */}
                            <div className="bg-[#0c0f17] rounded-xl p-5 border border-white/[0.05]">
                                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                    <List size={14} className="text-cyan-400" /> Today&apos;s Schedule
                                </h3>
                                <div className="space-y-2">
                                    {timetable?.schedule[selectedDay - 1]?.slots.filter(s => s.course).map(({ slot, course }, i) => {
                                        const now = new Date();
                                        const currentTime = now.getHours() * 60 + now.getMinutes();
                                        const [startH, startM] = slot.startTime.split(':').map(Number);
                                        const slotTime = startH * 60 + startM;
                                        const isPast = currentTime > slotTime + 50;
                                        const isCurrent = currentTime >= slotTime && currentTime < slotTime + 50;
                                        
                                        return (
                                            <div
                                                key={i}
                                                className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                                                    isCurrent ? 'bg-cyan-500/10 border border-cyan-500/20' :
                                                    isPast ? 'bg-white/[0.02] opacity-50' : 'bg-white/[0.03]'
                                                }`}
                                            >
                                                <div className="w-14 text-center">
                                                    <p className={`text-xs font-medium ${isCurrent ? 'text-cyan-400' : 'text-white/40'}`}>{slot.code}</p>
                                                    <p className="text-[10px] text-white/30">{slot.startTime}</p>
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm font-medium ${isCurrent ? 'text-white' : 'text-white/70'}`}>{course?.name}</p>
                                                    <p className="text-[10px] text-white/40">{course?.room}</p>
                                                </div>
                                                {isCurrent && (
                                                    <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] rounded-full">Now</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* WEEKLY VIEW */}
                    {activeTab === 'timetable' && (
                        <motion.div key="timetable" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                            {/* Day Selector */}
                            <div className="flex gap-2">
                                {DAYS.map((day, i) => (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDay(i + 1)}
                                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                                            selectedDay === i + 1
                                                ? 'bg-cyan-500/20 text-cyan-400'
                                                : 'bg-white/[0.03] text-white/40 hover:bg-white/[0.05]'
                                        }`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>

                            {/* Day Schedule */}
                            <div className="bg-[#0c0f17] rounded-xl p-5 border border-white/[0.05]">
                                <h3 className="text-sm font-semibold text-white mb-4">{DAYS[selectedDay - 1]} Schedule</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {timetable?.schedule[selectedDay - 1]?.slots.map(({ slot, course }, i) => (
                                        <div
                                            key={i}
                                            className={`flex items-center gap-4 p-3 rounded-xl ${
                                                course ? 'bg-white/[0.03]' : 'bg-white/[0.01]'
                                            }`}
                                        >
                                            <div className="w-16 text-center">
                                                <p className={`text-xs font-medium ${course ? 'text-cyan-400' : 'text-white/20'}`}>{slot.code}</p>
                                                <p className="text-[10px] text-white/30">{slot.startTime}-{slot.endTime}</p>
                                            </div>
                                            {course ? (
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium text-white/80">{course.name}</p>
                                                        <button
                                                            onClick={() => removeCourse(course.code)}
                                                            className="text-white/20 hover:text-rose-400 transition-colors"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[10px] text-white/40">
                                                        <span>{course.code}</span>
                                                        <span>•</span>
                                                        <span>{course.room}</span>
                                                        <span>•</span>
                                                        <span>{course.faculty}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex-1 flex items-center justify-between">
                                                    <span className="text-white/20 text-sm">Free Slot</span>
                                                    <button
                                                        onClick={() => {
                                                            const name = prompt('Course Name?');
                                                            if (name) addCourse({
                                                                code: `NEW${Date.now()}`,
                                                                name,
                                                                faculty: 'TBD',
                                                                room: 'TBD',
                                                                slot: slot.code,
                                                                type: slot.type
                                                            });
                                                        }}
                                                        className="text-cyan-400/40 hover:text-cyan-400 text-xs flex items-center gap-1"
                                                    >
                                                        <Plus size={12} /> Add
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* All Courses */}
                            <div className="bg-[#0c0f17] rounded-xl p-5 border border-white/[0.05]">
                                <h3 className="text-sm font-semibold text-white mb-4">All Courses ({timetable?.courses.length})</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {timetable?.courses.map((course, i) => (
                                        <div key={i} className="p-3 bg-white/[0.03] rounded-lg">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-white/80 font-medium text-sm">{course.name}</p>
                                                    <p className="text-cyan-400/60 text-xs">{course.code}</p>
                                                </div>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${course.type === 'THEORY' ? 'bg-blue-500/15 text-blue-400' : 'bg-amber-500/15 text-amber-400'}`}>
                                                    {course.type === 'THEORY' ? 'TH' : 'LAB'}
                                                </span>
                                            </div>
                                            <div className="mt-2 text-[10px] text-white/40 flex items-center gap-2">
                                                <Clock size={10} /> Slot {course.slot}
                                                <MapPin size={10} /> {course.room}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* FFCS HELPER */}
                    {activeTab === 'ffcs' && (
                        <motion.div key="ffcs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                            {/* Slot Checker */}
                            <div className="bg-[#0c0f17] rounded-xl p-5 border border-white/[0.05]">
                                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                    <Search size={14} className="text-violet-400" /> Check Slot Availability
                                </h3>
                                <div className="flex gap-3 mb-4">
                                    <input
                                        type="text"
                                        value={ffcsQuery}
                                        onChange={(e) => setFfcsQuery(e.target.value.toUpperCase())}
                                        placeholder="Enter slot (e.g., A1, L31)"
                                        className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-violet-500/30"
                                    />
                                    <button
                                        onClick={() => setConflicts(checkConflicts(ffcsQuery))}
                                        className="px-4 py-2 bg-violet-500/20 text-violet-400 rounded-lg text-sm hover:bg-violet-500/30 transition-colors"
                                    >
                                        Check
                                    </button>
                                </div>
                                {conflicts.length > 0 ? (
                                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                                        <p className="text-rose-400 text-xs font-medium mb-1 flex items-center gap-1">
                                            <AlertCircle size={12} /> Conflict Found!
                                        </p>
                                        <p className="text-white/50 text-xs">{conflicts[0]}</p>
                                    </div>
                                ) : ffcsQuery && (
                                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                        <p className="text-emerald-400 text-xs font-medium mb-1 flex items-center gap-1">
                                            <CheckCircle size={12} /> Slot Available!
                                        </p>
                                        <p className="text-white/50 text-xs">You can register for this slot.</p>
                                    </div>
                                )}
                            </div>

                            {/* Free Slots */}
                            <div className="bg-[#0c0f17] rounded-xl p-5 border border-white/[0.05]">
                                <h3 className="text-sm font-semibold text-white mb-4">Free Slots by Day</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {DAYS.slice(0, 5).map(day => {
                                        const free = getFreeSlots(day);
                                        return (
                                            <div key={day} className="p-3 bg-white/[0.03] rounded-lg">
                                                <p className="text-white/60 text-xs font-medium mb-2">{day}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {free.slice(0, 8).map(slot => (
                                                        <span key={slot} className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] rounded">
                                                            {slot}
                                                        </span>
                                                    ))}
                                                    {free.length > 8 && (
                                                        <span className="text-white/30 text-[10px]">+{free.length - 8} more</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* FFCS Tips */}
                            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-5 border border-amber-500/20">
                                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                    <Star size={14} className="text-amber-400" /> FFCS Tips
                                </h3>
                                <ul className="space-y-2">
                                    {[
                                        'Check for slot conflicts before registering',
                                        'Keep backup course options ready',
                                        'Lab slots (L1-L60) are 2-hour blocks',
                                        'Theory slots are 50 minutes each',
                                        'Avoid back-to-back classes when possible',
                                    ].map((tip, i) => (
                                        <li key={i} className="text-white/50 text-xs flex items-start gap-2">
                                            <span className="text-amber-400 mt-0.5">•</span> {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
