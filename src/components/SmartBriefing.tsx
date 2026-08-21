'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Sun, Calendar, AlertTriangle, BookOpen, Sparkles, Volume2,
    Check, ChevronRight, Clock, X, Mail, Star, Tag, Archive, Trash2,
    RefreshCw, Filter, Search, Plus, ExternalLink, Pin, Bookmark,
    TrendingUp, Users, FileText, Zap, Eye, EyeOff, Settings, Link2,
    CalendarPlus, MessageSquare, Send, Inbox, Loader2
} from 'lucide-react';
import { currentUser } from '@/data/mockData';

// Types
interface Email {
    id: string;
    from: string;
    fromEmail: string;
    subject: string;
    preview: string;
    body: string;
    date: Date;
    read: boolean;
    starred: boolean;
    category: 'important' | 'academic' | 'events' | 'general' | 'spam';
    priority: 'high' | 'medium' | 'low';
    tags: string[];
    hasAttachment: boolean;
    isVIT: boolean;
    summary?: string;
    actionRequired?: boolean;
    deadline?: Date;
    calendarEvent?: {
        title: string;
        date: Date;
        time: string;
        location?: string;
    };
}

interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    time: string;
    location?: string;
    fromEmail: string;
    category: string;
}

// Mock VIT Email Data
const MOCK_EMAILS: Email[] = [
    {
        id: '1',
        from: 'VIT Academic Office',
        fromEmail: 'academic@vit.ac.in',
        subject: 'End Semester Examination Schedule - Winter 2024',
        preview: 'Dear Student, The end semester examination schedule has been released...',
        body: 'Dear Student,\n\nThe end semester examination schedule for Winter 2024 has been released. Please check your student portal for the complete timetable.\n\nImportant Notes:\n- Examinations begin from December 10, 2024\n- Hall tickets will be available from December 5\n- Report to your examination hall 30 minutes before the exam\n\nFor any queries, contact the examination cell.',
        date: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
        read: false,
        starred: true,
        category: 'important',
        priority: 'high',
        tags: ['examination', 'schedule', 'academic'],
        hasAttachment: true,
        isVIT: true,
        summary: 'End semester exams begin Dec 10. Hall tickets available Dec 5. Check portal for timetable.',
        actionRequired: true,
        calendarEvent: {
            title: 'End Semester Exams Begin',
            date: new Date('2024-12-10'),
            time: '09:00',
            location: 'Check Hall Ticket'
        }
    },
    {
        id: '2',
        from: 'Prof. Rajesh Kumar',
        fromEmail: 'rajesh.kumar@vit.ac.in',
        subject: 'Project Submission Deadline Extended',
        preview: 'The deadline for the mini project submission has been extended to...',
        body: 'Dear Students,\n\nBased on multiple requests, the deadline for the mini project submission has been extended from November 25 to November 30, 2024.\n\nPlease ensure all submissions are made through the course portal before the new deadline.\n\nLate submissions will not be accepted.\n\nBest regards,\nProf. Rajesh Kumar',
        date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        starred: false,
        category: 'academic',
        priority: 'medium',
        tags: ['project', 'deadline', 'extension'],
        hasAttachment: false,
        isVIT: true,
        summary: 'Project deadline extended to Nov 30. Submit through course portal.',
        actionRequired: true,
        deadline: new Date('2024-11-30')
    },
    {
        id: '3',
        from: 'VIT Placement Cell',
        fromEmail: 'placements@vit.ac.in',
        subject: 'Google Campus Drive - Registration Open',
        preview: 'Google is conducting campus placements for the 2025 batch...',
        body: 'Dear Students,\n\nGoogle will be conducting campus placements for the 2025 batch on December 15, 2024.\n\nEligibility Criteria:\n- CGPA: 8.0 and above\n- No active backlogs\n- 2025 passing out batch\n\nRegistration Deadline: December 5, 2024\n\nRegister through the placement portal.',
        date: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        read: true,
        starred: true,
        category: 'important',
        priority: 'high',
        tags: ['placement', 'google', 'career'],
        hasAttachment: true,
        isVIT: true,
        summary: 'Google campus drive Dec 15. CGPA 8.0+ required. Register by Dec 5.',
        actionRequired: true,
        calendarEvent: {
            title: 'Google Campus Drive',
            date: new Date('2024-12-15'),
            time: '09:00',
            location: 'Main Auditorium'
        }
    },
    {
        id: '4',
        from: 'Library Services',
        fromEmail: 'library@vit.ac.in',
        subject: 'Book Return Reminder - Due Tomorrow',
        preview: 'This is a reminder that your borrowed books are due for return...',
        body: 'Dear Student,\n\nThis is a friendly reminder that the following books are due for return tomorrow:\n\n1. "Data Structures and Algorithms" - Due: Nov 25, 2024\n2. "Database Management Systems" - Due: Nov 25, 2024\n\nPlease return or renew the books to avoid late fees.\n\nLibrary timings: 8:00 AM - 10:00 PM',
        date: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
        read: true,
        starred: false,
        category: 'general',
        priority: 'low',
        tags: ['library', 'reminder', 'books'],
        hasAttachment: false,
        isVIT: true,
        summary: 'Return 2 library books by tomorrow to avoid late fees.',
        actionRequired: true,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24)
    },
    {
        id: '5',
        from: 'Tech Fest Committee',
        fromEmail: 'techfest@vit.ac.in',
        subject: 'TechVista 2024 - Registration Now Open!',
        preview: 'VIT\'s annual tech fest TechVista 2024 is here! Register now...',
        body: 'Dear Students,\n\nVIT\'s annual technical festival TechVista 2024 is scheduled for January 15-17, 2025.\n\nEvents include:\n- Hackathon (₹1 Lakh Prize)\n- Coding Competition\n- Robotics Challenge\n- Tech Talks by Industry Experts\n\nEarly bird registration ends December 20, 2024.\n\nRegister now at techvista.vit.ac.in',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: false,
        starred: false,
        category: 'events',
        priority: 'medium',
        tags: ['techfest', 'event', 'hackathon'],
        hasAttachment: true,
        isVIT: true,
        summary: 'TechVista 2024: Jan 15-17. Hackathon ₹1L prize. Early bird ends Dec 20.',
        calendarEvent: {
            title: 'TechVista 2024',
            date: new Date('2025-01-15'),
            time: '09:00',
            location: 'VIT Campus'
        }
    },
    {
        id: '6',
        from: 'Hostel Administration',
        fromEmail: 'hostel@vit.ac.in',
        subject: 'Winter Break Hostel Guidelines',
        preview: 'Important guidelines for hostel residents during winter break...',
        body: 'Dear Residents,\n\nWinter break hostel guidelines:\n\n1. Last date to vacate: December 20, 2024\n2. Reopening: January 2, 2025\n3. Submit gate pass before leaving\n4. Valuables should be taken or locked securely\n\nHostel mess will be closed from Dec 21 to Jan 1.\n\nFor emergencies, contact warden.',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        read: true,
        starred: false,
        category: 'general',
        priority: 'medium',
        tags: ['hostel', 'winter-break', 'guidelines'],
        hasAttachment: false,
        isVIT: true,
        summary: 'Hostel vacate by Dec 20, reopen Jan 2. Submit gate pass. Mess closed Dec 21-Jan 1.'
    },
    {
        id: '7',
        from: 'Coursera for Campus',
        fromEmail: 'notifications@coursera.org',
        subject: 'New Course Recommendation: Machine Learning Specialization',
        preview: 'Based on your learning history, we recommend...',
        body: 'Hello,\n\nBased on your learning history, we recommend:\n\nMachine Learning Specialization by Stanford University\n\n- 3 courses included\n- Certificate upon completion\n- 100% online\n\nStart learning today!',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        read: true,
        starred: false,
        category: 'spam',
        priority: 'low',
        tags: ['coursera', 'recommendation'],
        hasAttachment: false,
        isVIT: false,
        summary: 'Coursera recommends ML Specialization by Stanford.'
    }
];

const categoryConfig = {
    important: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Important', icon: AlertTriangle },
    academic: { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Academic', icon: BookOpen },
    events: { color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', label: 'Events', icon: Calendar },
    general: { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', label: 'General', icon: Mail },
    spam: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'Spam', icon: Archive },
};

const priorityConfig = {
    high: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'High' },
    medium: { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Medium' },
    low: { color: 'text-green-400', bg: 'bg-green-500/20', label: 'Low' },
};

interface SmartBriefingProps {
    fullPage?: boolean;
}

export default function SmartBriefing({ fullPage = false }: SmartBriefingProps) {
    const [emails, setEmails] = useState<Email[]>(MOCK_EMAILS);
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [filter, setFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isConnected, setIsConnected] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'summary'>('list');

    // Stats
    const stats = useMemo(() => {
        const unread = emails.filter(e => !e.read).length;
        const important = emails.filter(e => e.category === 'important' && !e.read).length;
        const actionRequired = emails.filter(e => e.actionRequired && !e.read).length;
        const events = emails.filter(e => e.calendarEvent).length;
        return { unread, important, actionRequired, events };
    }, [emails]);

    // Filtered emails
    const filteredEmails = useMemo(() => {
        let result = emails;

        if (filter !== 'all') {
            if (filter === 'unread') {
                result = result.filter(e => !e.read);
            } else if (filter === 'starred') {
                result = result.filter(e => e.starred);
            } else if (filter === 'action') {
                result = result.filter(e => e.actionRequired);
            } else {
                result = result.filter(e => e.category === filter);
            }
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(e =>
                e.subject.toLowerCase().includes(query) ||
                e.from.toLowerCase().includes(query) ||
                e.preview.toLowerCase().includes(query)
            );
        }

        return result.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [emails, filter, searchQuery]);

    // Sync emails
    const syncEmails = async () => {
        setIsSyncing(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSyncing(false);
    };

    // Mark as read
    const markAsRead = (id: string) => {
        setEmails(prev => prev.map(e => e.id === id ? { ...e, read: true } : e));
    };

    // Toggle star
    const toggleStar = (id: string) => {
        setEmails(prev => prev.map(e => e.id === id ? { ...e, starred: !e.starred } : e));
    };

    // Add to calendar
    const addToCalendar = (email: Email) => {
        if (email.calendarEvent) {
            const newEvent: CalendarEvent = {
                id: `cal-${Date.now()}`,
                title: email.calendarEvent.title,
                date: email.calendarEvent.date,
                time: email.calendarEvent.time,
                location: email.calendarEvent.location,
                fromEmail: email.id,
                category: email.category
            };
            setCalendarEvents(prev => [...prev, newEvent]);
            setShowCalendarModal(true);
        }
    };

    // Format time
    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const mins = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? '☀️ Good morning' : hour < 17 ? '🌤️ Good afternoon' : '🌙 Good evening';

    const getDate = () => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
    };

    // Render email list item
    const EmailListItem = ({ email }: { email: Email }) => {
        const catConfig = categoryConfig[email.category];
        const CatIcon = catConfig.icon;

        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`group relative p-4 rounded-xl border transition-all cursor-pointer hover:bg-white/[0.03] ${!email.read
                        ? `bg-white/[0.02] ${catConfig.border}`
                        : 'bg-transparent border-white/[0.04]'
                    }`}
                onClick={() => {
                    markAsRead(email.id);
                    setSelectedEmail(email);
                }}
            >
                {/* Unread indicator */}
                {!email.read && (
                    <div className="absolute top-4 left-1.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.5)]" />
                )}

                <div className="flex items-start gap-3 ml-3">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${email.isVIT ? 'bg-gradient-to-br from-cyan-500/20 to-violet-500/20' : 'bg-white/[0.05]'}`}>
                        {email.isVIT ? (
                            <span className="text-sm font-bold text-cyan-400">VIT</span>
                        ) : (
                            <Mail size={18} className="text-white/40" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className={`text-sm font-medium truncate ${email.read ? 'text-white/50' : 'text-white/90'}`}>
                                        {email.from}
                                    </span>
                                    {email.starred && <Star size={12} className="text-amber-400 fill-amber-400" />}
                                    {email.actionRequired && (
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-400">
                                            ACTION
                                        </span>
                                    )}
                                </div>
                                <p className={`text-sm truncate ${email.read ? 'text-white/40' : 'text-white/70 font-medium'}`}>
                                    {email.subject}
                                </p>
                            </div>
                            <span className="text-[10px] text-white/30 flex-shrink-0">
                                {formatTime(email.date)}
                            </span>
                        </div>

                        <p className={`text-xs mt-1 line-clamp-2 ${email.read ? 'text-white/25' : 'text-white/40'}`}>
                            {email.preview}
                        </p>

                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] ${catConfig.bg} ${catConfig.color}`}>
                                <CatIcon size={10} />
                                {catConfig.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] ${priorityConfig[email.priority].bg} ${priorityConfig[email.priority].color}`}>
                                {priorityConfig[email.priority].label}
                            </span>
                            {email.hasAttachment && (
                                <FileText size={12} className="text-white/30" />
                            )}
                            {email.calendarEvent && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addToCalendar(email);
                                    }}
                                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                                >
                                    <CalendarPlus size={10} />
                                    Add to Calendar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    // Render email detail
    const EmailDetail = ({ email }: { email: Email }) => {
        const catConfig = categoryConfig[email.category];

        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/[0.06]">
                    <button
                        onClick={() => setSelectedEmail(null)}
                        className="text-white/40 hover:text-white transition-colors"
                    >
                        ← Back
                    </button>
                    <div className="flex-1" />
                    <button
                        onClick={() => toggleStar(email.id)}
                        className={`p-2 rounded-lg transition-colors ${email.starred ? 'text-amber-400' : 'text-white/30 hover:text-white/50'}`}
                    >
                        <Star size={18} className={email.starred ? 'fill-amber-400' : ''} />
                    </button>
                    <button className="p-2 rounded-lg text-white/30 hover:text-white/50 transition-colors">
                        <Archive size={18} />
                    </button>
                    <button className="p-2 rounded-lg text-white/30 hover:text-white/50 transition-colors">
                        <Trash2 size={18} />
                    </button>
                </div>

                {/* Subject */}
                <h2 className="text-xl font-bold text-white mb-4">{email.subject}</h2>

                {/* Meta */}
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/[0.06]">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-cyan-400">VIT</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-white/80">{email.from}</p>
                        <p className="text-xs text-white/40">{email.fromEmail}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-white/40">
                            {email.date.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                        <div className="flex items-center gap-2 mt-1 justify-end">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${catConfig.bg} ${catConfig.color}`}>
                                {catConfig.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* AI Summary */}
                {email.summary && (
                    <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-cyan-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={14} className="text-cyan-400" />
                            <span className="text-xs font-medium text-cyan-400">AI Summary</span>
                        </div>
                        <p className="text-sm text-white/70">{email.summary}</p>
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    <div className="text-sm text-white/60 whitespace-pre-wrap leading-relaxed">
                        {email.body}
                    </div>
                </div>

                {/* Calendar Event */}
                {email.calendarEvent && (
                    <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Calendar size={20} className="text-emerald-400" />
                                <div>
                                    <p className="text-sm font-medium text-white/80">{email.calendarEvent.title}</p>
                                    <p className="text-xs text-white/40">
                                        {email.calendarEvent.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {email.calendarEvent.time}
                                        {email.calendarEvent.location && ` • ${email.calendarEvent.location}`}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => addToCalendar(email)}
                                className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors"
                            >
                                Add to Calendar
                            </button>
                        </div>
                    </div>
                )}

                {/* Tags */}
                <div className="mt-6 flex items-center gap-2 flex-wrap">
                    {email.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 rounded-lg bg-white/[0.05] text-xs text-white/40">
                            #{tag}
                        </span>
                    ))}
                </div>
            </motion.div>
        );
    };

    return (
        <div className={`flex flex-col ${fullPage ? 'space-y-6' : 'h-full'}`}>
            {/* Header with Email Connection Status */}
            <div className={`${fullPage ? '' : 'px-1'}`}>
                <div className="bg-gradient-to-br from-cyan-500/10 via-violet-500/5 to-transparent border border-white/[0.06] rounded-2xl p-5 mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-lg font-semibold text-white/80">
                                {greeting}, {currentUser.name.split(' ')[0]}!
                            </p>
                            <p className="text-xs text-white/30 mt-1 flex items-center gap-1.5">
                                <Calendar size={12} /> {getDate()}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Connection Status */}
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isConnected ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'} border`}>
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
                                <span className={`text-xs font-medium ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {isConnected ? 'VIT Email Connected' : 'Disconnected'}
                                </span>
                            </div>
                            <button
                                onClick={syncEmails}
                                disabled={isSyncing}
                                className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.06] text-white/40 hover:text-white/60 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-4 gap-2 mt-4">
                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                            <div className="flex items-center gap-2 mb-1">
                                <Inbox size={12} className="text-cyan-400" />
                                <span className="text-[10px] text-white/40">Unread</span>
                            </div>
                            <p className="text-xl font-bold text-white">{stats.unread}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle size={12} className="text-red-400" />
                                <span className="text-[10px] text-white/40">Important</span>
                            </div>
                            <p className="text-xl font-bold text-red-400">{stats.important}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                            <div className="flex items-center gap-2 mb-1">
                                <Zap size={12} className="text-amber-400" />
                                <span className="text-[10px] text-white/40">Action</span>
                            </div>
                            <p className="text-xl font-bold text-amber-400">{stats.actionRequired}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar size={12} className="text-emerald-400" />
                                <span className="text-[10px] text-white/40">Events</span>
                            </div>
                            <p className="text-xl font-bold text-emerald-400">{stats.events}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & View Toggle */}
            <div className="flex items-center gap-3 px-1">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search emails..."
                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/30 transition-colors"
                    />
                </div>
                <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/40 hover:text-white/60'}`}
                    >
                        List
                    </button>
                    <button
                        onClick={() => setViewMode('summary')}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === 'summary' ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/40 hover:text-white/60'}`}
                    >
                        Summary
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 px-1">
                {[
                    { id: 'all', label: 'All', icon: Inbox },
                    { id: 'unread', label: 'Unread', icon: Eye, count: stats.unread },
                    { id: 'important', label: 'Important', icon: AlertTriangle },
                    { id: 'academic', label: 'Academic', icon: BookOpen },
                    { id: 'events', label: 'Events', icon: Calendar },
                    { id: 'starred', label: 'Starred', icon: Star },
                    { id: 'action', label: 'Action Required', icon: Zap },
                ].map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${filter === f.id
                                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                                : 'bg-white/[0.03] text-white/30 border border-white/[0.04] hover:bg-white/[0.05]'
                            }`}
                    >
                        <f.icon size={12} />
                        {f.label}
                        {f.count !== undefined && f.count > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-cyan-500/30 text-cyan-300 text-[9px]">
                                {f.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Email List or Detail */}
            <div className={`flex-1 ${fullPage ? '' : 'overflow-hidden'}`}>
                <AnimatePresence mode="wait">
                    {selectedEmail ? (
                        <motion.div
                            key="detail"
                            className={`h-full ${fullPage ? '' : 'overflow-y-auto pr-1'} px-1`}
                        >
                            <EmailDetail email={selectedEmail} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            className={`space-y-2 ${fullPage ? '' : 'overflow-y-auto pr-1 h-full'} px-1`}
                        >
                            {filteredEmails.length === 0 ? (
                                <div className="text-center py-12">
                                    <Inbox size={32} className="text-white/10 mx-auto mb-3" />
                                    <p className="text-sm text-white/30">No emails found</p>
                                </div>
                            ) : (
                                filteredEmails.map(email => (
                                    <EmailListItem key={email.id} email={email} />
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Calendar Modal */}
            <AnimatePresence>
                {showCalendarModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCalendarModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#0c0f17] rounded-2xl border border-white/[0.06] p-6 max-w-md w-full"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <Check size={20} className="text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Added to Calendar</h3>
                                    <p className="text-xs text-white/40">Event has been added to your calendar</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-4">
                                {calendarEvents[calendarEvents.length - 1] && (
                                    <>
                                        <p className="text-sm font-medium text-white/80">
                                            {calendarEvents[calendarEvents.length - 1].title}
                                        </p>
                                        <p className="text-xs text-white/40 mt-1">
                                            {calendarEvents[calendarEvents.length - 1].date.toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                month: 'long',
                                                day: 'numeric'
                                            })} at {calendarEvents[calendarEvents.length - 1].time}
                                        </p>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={() => setShowCalendarModal(false)}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-medium text-sm"
                            >
                                Done
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Voice input button */}
            {fullPage && (
                <div className="flex items-center gap-3 pt-4 px-1">
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.06] transition-colors">
                        <Volume2 size={16} />
                        <span className="text-sm">Ask SYNAPSE about your emails...</span>
                    </button>
                </div>
            )}
        </div>
    );
}
