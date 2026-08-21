'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Video,
    MessageCircle,
    Clock,
    Calendar,
    Plus,
    Search,
    UserPlus,
    Play,
    MapPin,
    BookOpen,
    Timer,
    Bell,
    CheckCircle,
    ArrowRight,
    Filter,
    MoreVertical
} from 'lucide-react';

interface StudySession {
    id: number;
    title: string;
    description: string;
    subject: string;
    course: string;
    host: {
        name: string;
        avatar: string;
    };
    scheduledAt: string;
    duration: number; // in minutes
    maxParticipants: number;
    currentParticipants: number;
    type: 'video' | 'chat' | 'in-person';
    status: 'upcoming' | 'live' | 'completed';
    tags: string[];
    isJoined: boolean;
    location?: string;
}

const mockSessions: StudySession[] = [
    {
        id: 1,
        title: "CS401 Advanced Algorithms Review",
        description: "Preparing for the mid-term exam. We'll cover dynamic programming, greedy algorithms, and graph algorithms.",
        subject: "Advanced Algorithms",
        course: "CS401",
        host: { name: "Priya Sharma", avatar: "PS" },
        scheduledAt: "2025-02-24T14:00:00",
        duration: 90,
        maxParticipants: 10,
        currentParticipants: 7,
        type: 'video',
        status: 'upcoming',
        tags: ["algorithms", "exam-prep", "graphs"],
        isJoined: false
    },
    {
        id: 2,
        title: "Database Normalization Practice",
        description: "Working through practice problems on 1NF through BCNF. Bring your questions!",
        subject: "Database Systems",
        course: "CS201",
        host: { name: "Arjun Patel", avatar: "AP" },
        scheduledAt: "2025-02-23T16:00:00",
        duration: 60,
        maxParticipants: 8,
        currentParticipants: 5,
        type: 'video',
        status: 'live',
        tags: ["database", "normalization", "practice"],
        isJoined: true
    },
    {
        id: 3,
        title: "OS Process Scheduling Deep Dive",
        description: "Gantt chart exercises and CPU scheduling algorithm problems.",
        subject: "Operating Systems",
        course: "CS302",
        host: { name: "Michael Torres", avatar: "MT" },
        scheduledAt: "2025-02-25T10:00:00",
        duration: 75,
        maxParticipants: 12,
        currentParticipants: 4,
        type: 'chat',
        status: 'upcoming',
        tags: ["operating-systems", "scheduling", "CPU"],
        isJoined: false
    },
    {
        id: 4,
        title: "Python Coding Sprint",
        description: "30-minute coding challenges focusing on list comprehensions and file handling.",
        subject: "Programming Fundamentals",
        course: "CS101",
        host: { name: "Sarah Chen", avatar: "SC" },
        scheduledAt: "2025-02-23T18:00:00",
        duration: 45,
        maxParticipants: 6,
        currentParticipants: 6,
        type: 'video',
        status: 'upcoming',
        tags: ["python", "coding", "beginner"],
        isJoined: false
    },
    {
        id: 5,
        title: "Thermodynamics Problem Solving",
        description: "Working through heat engine and entropy problems from the textbook.",
        subject: "Thermodynamics",
        course: "PHY201",
        host: { name: "Anna Martinez", avatar: "AM" },
        scheduledAt: "2025-02-24T11:00:00",
        duration: 90,
        maxParticipants: 15,
        currentParticipants: 8,
        type: 'in-person',
        status: 'upcoming',
        location: "Library Room 302",
        tags: ["thermodynamics", "physics", "problems"],
        isJoined: false
    }
];

const subjects = ["All Subjects", "Advanced Algorithms", "Database Systems", "Operating Systems", "Programming Fundamentals", "Thermodynamics"];
const sessionTypes = [
    { id: 'all', label: 'All', icon: Users },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'in-person', label: 'In-Person', icon: MapPin },
];

export default function GroupStudy() {
    const [sessions, setSessions] = useState<StudySession[]>(mockSessions);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState("All Subjects");
    const [selectedType, setSelectedType] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newSession, setNewSession] = useState({
        title: '',
        description: '',
        subject: '',
        course: '',
        date: '',
        time: '',
        duration: 60,
        maxParticipants: 10,
        type: 'video' as 'video' | 'chat' | 'in-person',
        location: ''
    });

    const filteredSessions = sessions.filter(session => {
        const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            session.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            session.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesSubject = selectedSubject === "All Subjects" || session.subject === selectedSubject;
        const matchesType = selectedType === 'all' || session.type === selectedType;

        return matchesSearch && matchesSubject && matchesType;
    });

    const toggleJoin = (sessionId: number) => {
        setSessions(sessions.map(session => {
            if (session.id === sessionId) {
                const isJoining = !session.isJoined;
                return {
                    ...session,
                    isJoined: isJoining,
                    currentParticipants: isJoining ? session.currentParticipants + 1 : session.currentParticipants - 1
                };
            }
            return session;
        }));
    };

    const handleCreateSession = () => {
        if (!newSession.title || !newSession.subject) return;

        const session: StudySession = {
            id: sessions.length + 1,
            title: newSession.title,
            description: newSession.description,
            subject: newSession.subject,
            course: newSession.course || "General",
            host: { name: "Ayush Upadhyay", avatar: "AU" },
            scheduledAt: `${newSession.date}T${newSession.time}:00`,
            duration: newSession.duration,
            maxParticipants: newSession.maxParticipants,
            currentParticipants: 1,
            type: newSession.type,
            status: 'upcoming',
            tags: newSession.subject.toLowerCase().split(' '),
            isJoined: true
        };

        setSessions([session, ...sessions]);
        setShowCreateModal(false);
        setNewSession({
            title: '',
            description: '',
            subject: '',
            course: '',
            date: '',
            time: '',
            duration: 60,
            maxParticipants: 10,
            type: 'video',
            location: ''
        });
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return Video;
            case 'chat': return MessageCircle;
            case 'in-person': return MapPin;
            default: return Users;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'live': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'upcoming': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
            case 'completed': return 'bg-white/10 text-white/40 border-white/20';
            default: return 'bg-white/[0.06] text-white/40 border-white/[0.06]';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white/90 flex items-center gap-3">
                        <Users className="w-7 h-7 text-emerald-400" />
                        Group Study
                    </h2>
                    <p className="text-sm text-white/40 mt-1">Join or host study sessions with fellow students</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-xl text-white font-medium text-sm hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                >
                    <Plus size={18} />
                    Host Session
                </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search study sessions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                    </div>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                        {subjects.map(subject => (
                            <option key={subject} value={subject} className="bg-slate-800">{subject}</option>
                        ))}
                    </select>
                </div>

                {/* Type Filters */}
                <div className="flex gap-2 mt-4">
                    {sessionTypes.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setSelectedType(type.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${selectedType === type.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:text-white/70'}`}
                        >
                            <type.icon size={14} />
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sessions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredSessions.map(session => {
                        const TypeIcon = getTypeIcon(session.type);
                        const sessionDate = new Date(session.scheduledAt);

                        return (
                            <motion.div
                                key={session.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.1] transition-all group"
                            >
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${session.status === 'live' ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
                                            <TypeIcon size={24} className={session.status === 'live' ? 'text-red-400' : 'text-emerald-400'} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-white/90">{session.title}</h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(session.status)}`}>
                                                {session.status === 'live' ? '🔴 LIVE' : session.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
                                        <MoreVertical size={16} className="text-white/30" />
                                    </button>
                                </div>

                                <p className="text-sm text-white/50 mb-4 line-clamp-2">
                                    {session.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="px-2 py-1 rounded-md bg-white/[0.03] text-[11px] text-white/40 border border-white/[0.06]">
                                        {session.course}
                                    </span>
                                    <span className="px-2 py-1 rounded-md bg-white/[0.03] text-[11px] text-white/40 border border-white/[0.06]">
                                        {session.subject}
                                    </span>
                                    {session.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className="px-2 py-1 rounded-md bg-white/[0.03] text-[11px] text-emerald-400/60 border border-emerald-500/10">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Host Info */}
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/[0.06]">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                                        {session.host.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-white/70">{session.host.name}</p>
                                        <p className="text-xs text-white/30">Host</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-xs text-white/40">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={14} />
                                            {sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            {sessionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Timer size={14} />
                                            {session.duration}min
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-white/40">
                                            {session.currentParticipants}/{session.maxParticipants}
                                        </span>
                                        <button
                                            onClick={() => toggleJoin(session.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${session.isJoined ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/[0.06] text-white/70 hover:bg-emerald-500/20 hover:text-emerald-400'}`}
                                        >
                                            {session.isJoined ? (
                                                <>
                                                    <CheckCircle size={14} />
                                                    Joined
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus size={14} />
                                                    Join
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {filteredSessions.length === 0 && (
                <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-white/20 mb-4" />
                    <p className="text-white/40">No study sessions found</p>
                </div>
            )}

            {/* Create Session Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-900 border border-white/[0.1] rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white/90 flex items-center gap-2">
                                    <Users size={20} className="text-emerald-400" />
                                    Host Study Session
                                </h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 rounded-lg hover:bg-white/[0.06] text-white/40"
                                >
                                    <Plus size={20} className="rotate-45" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Session Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Algorithm Review Session"
                                        value={newSession.title}
                                        onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Description</label>
                                    <textarea
                                        placeholder="What will you cover in this session?"
                                        value={newSession.description}
                                        onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Subject</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Data Structures"
                                            value={newSession.subject}
                                            onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Course Code</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., CS102"
                                            value={newSession.course}
                                            onChange={(e) => setNewSession({ ...newSession, course: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Date</label>
                                        <input
                                            type="date"
                                            value={newSession.date}
                                            onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Time</label>
                                        <input
                                            type="time"
                                            value={newSession.time}
                                            onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Duration (min)</label>
                                        <select
                                            value={newSession.duration}
                                            onChange={(e) => setNewSession({ ...newSession, duration: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        >
                                            <option value={30} className="bg-slate-800">30 min</option>
                                            <option value={45} className="bg-slate-800">45 min</option>
                                            <option value={60} className="bg-slate-800">60 min</option>
                                            <option value={90} className="bg-slate-800">90 min</option>
                                            <option value={120} className="bg-slate-800">120 min</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Session Type</label>
                                        <div className="flex gap-2">
                                            {sessionTypes.slice(1).map(type => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setNewSession({ ...newSession, type: type.id as any })}
                                                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${newSession.type === type.id ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/[0.03] border-white/[0.06] text-white/50'}`}
                                                >
                                                    <type.icon size={16} />
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Max Participants</label>
                                        <select
                                            value={newSession.maxParticipants}
                                            onChange={(e) => setNewSession({ ...newSession, maxParticipants: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        >
                                            {[5, 6, 8, 10, 12, 15, 20].map(n => (
                                                <option key={n} value={n} className="bg-slate-800">{n} participants</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {newSession.type === 'in-person' && (
                                    <div>
                                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Location</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Library Room 302"
                                            value={newSession.location}
                                            onChange={(e) => setNewSession({ ...newSession, location: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-5 py-3 rounded-xl border border-white/[0.06] text-white/60 hover:text-white/80 hover:bg-white/[0.03] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateSession}
                                    className="flex-1 px-5 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Play size={16} />
                                    Host Session
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
