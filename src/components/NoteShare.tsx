'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Search,
    Plus,
    Users,
    Star,
    Clock,
    BookOpen,
    Filter,
    TrendingUp,
    Heart,
    MessageCircle,
    Share2,
    MoreVertical,
    CheckCircle,
    Edit3,
    Trash2,
    Lock,
    Globe,
    Tag,
    Upload
} from 'lucide-react';

interface Note {
    id: number;
    title: string;
    content: string;
    author: string;
    authorAvatar: string;
    course: string;
    subject: string;
    tags: string[];
    likes: number;
    views: number;
    comments: number;
    isLiked: boolean;
    isBookmarked: boolean;
    visibility: 'public' | 'private' | 'course';
    createdAt: string;
    updatedAt: string;
    rating: number;
}

const mockNotes: Note[] = [
    {
        id: 1,
        title: "Complete Binary Trees Cheatsheet",
        content: "Comprehensive notes covering all binary tree operations, traversals, and common algorithms. Includes visual diagrams and step-by-step implementations for recursive and iterative approaches.",
        author: "Priya Sharma",
        authorAvatar: "PS",
        course: "CS102",
        subject: "Data Structures",
        tags: ["trees", "algorithms", "recursion", "interview-prep"],
        likes: 156,
        views: 892,
        comments: 23,
        isLiked: false,
        isBookmarked: true,
        visibility: "public",
        createdAt: "2025-02-20",
        updatedAt: "2025-02-20",
        rating: 4.8
    },
    {
        id: 2,
        title: "Python List Comprehensions Mastery",
        content: "Deep dive into Python list comprehensions with advanced patterns, nested comprehensions, and performance comparisons. Contains 50+ examples ranging from beginner to advanced.",
        author: "Arjun Patel",
        authorAvatar: "AP",
        course: "CS101",
        subject: "Programming Fundamentals",
        tags: ["python", "comprehensions", "best-practices"],
        likes: 89,
        views: 445,
        comments: 12,
        isLiked: true,
        isBookmarked: false,
        visibility: "public",
        createdAt: "2025-02-19",
        updatedAt: "2025-02-19",
        rating: 4.6
    },
    {
        id: 3,
        title: "DBMS Normalization - 1NF to BCNF",
        content: "Everything you need to know about database normalization. Includes step-by-step examples, common pitfalls, and practice problems with solutions.",
        author: "Sarah Chen",
        authorAvatar: "SC",
        course: "CS201",
        subject: "Database Systems",
        tags: ["database", "normalization", "SQL", "schema"],
        likes: 234,
        views: 1567,
        comments: 45,
        isLiked: false,
        isBookmarked: true,
        visibility: "course",
        createdAt: "2025-02-18",
        updatedAt: "2025-02-18",
        rating: 4.9
    },
    {
        id: 4,
        title: "OS Process Scheduling Deep Dive",
        content: "Detailed explanation of CPU scheduling algorithms with Gantt charts, waiting time calculations, and real-world examples. Covers FCFS, SJF, Priority, and Round Robin.",
        author: "Michael Torres",
        authorAvatar: "MT",
        course: "CS302",
        subject: "Operating Systems",
        tags: ["operating-systems", "scheduling", "CPU", "processes"],
        likes: 67,
        views: 312,
        comments: 8,
        isLiked: false,
        isBookmarked: false,
        visibility: "public",
        createdAt: "2025-02-17",
        updatedAt: "2025-02-17",
        rating: 4.5
    },
    {
        id: 5,
        title: "Calculus III - Stokes Theorem Explained",
        content: "Visual approach to understanding Stokes' Theorem with 3D vector field diagrams. Includes proof explanations and 20 practice problems.",
        author: "Anna Martinez",
        authorAvatar: "AM",
        course: "MATH301",
        subject: "Multivariable Calculus",
        tags: ["calculus", "vector-fields", "stokes-theorem", "integration"],
        likes: 45,
        views: 189,
        comments: 6,
        isLiked: false,
        isBookmarked: false,
        visibility: "public",
        createdAt: "2025-02-16",
        updatedAt: "2025-02-16",
        rating: 4.4
    }
];

const courses = ["All Courses", "CS101", "CS102", "CS201", "CS301", "CS302", "MATH301", "PHY201"];
const subjects = ["All Subjects", "Data Structures", "Programming Fundamentals", "Database Systems", "Operating Systems", "Multivariable Calculus"];
const tags = ["algorithms", "python", "database", "recursion", "trees", "SQL", "calculus", "networking"];

export default function NoteShare() {
    const [notes, setNotes] = useState<Note[]>(mockNotes);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCourse, setSelectedCourse] = useState("All Courses");
    const [selectedSubject, setSelectedSubject] = useState("All Subjects");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'popular' | 'recent' | 'my-notes'>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newNote, setNewNote] = useState({
        title: '',
        content: '',
        course: '',
        subject: '',
        tags: '',
        visibility: 'public' as 'public' | 'private' | 'course'
    });

    const filteredNotes = notes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCourse = selectedCourse === "All Courses" || note.course === selectedCourse;
        const matchesSubject = selectedSubject === "All Subjects" || note.subject === selectedSubject;
        const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => note.tags.includes(tag));

        return matchesSearch && matchesCourse && matchesSubject && matchesTags;
    }).sort((a, b) => {
        if (activeTab === 'popular') return b.likes - a.likes;
        if (activeTab === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0;
    });

    const handleLike = (noteId: number) => {
        setNotes(notes.map(note => {
            if (note.id === noteId) {
                return {
                    ...note,
                    likes: note.isLiked ? note.likes - 1 : note.likes + 1,
                    isLiked: !note.isLiked
                };
            }
            return note;
        }));
    };

    const handleBookmark = (noteId: number) => {
        setNotes(notes.map(note => {
            if (note.id === noteId) {
                return { ...note, isBookmarked: !note.isBookmarked };
            }
            return note;
        }));
    };

    const handleCreateNote = () => {
        if (!newNote.title || !newNote.content) return;

        const note: Note = {
            id: notes.length + 1,
            title: newNote.title,
            content: newNote.content,
            author: "Ayush Upadhyay",
            authorAvatar: "AU",
            course: newNote.course || "General",
            subject: newNote.subject || "General",
            tags: newNote.tags.split(',').map(t => t.trim()).filter(t => t),
            likes: 0,
            views: 0,
            comments: 0,
            isLiked: false,
            isBookmarked: false,
            visibility: newNote.visibility,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            rating: 0
        };

        setNotes([note, ...notes]);
        setShowCreateModal(false);
        setNewNote({ title: '', content: '', course: '', subject: '', tags: '', visibility: 'public' });
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white/90 flex items-center gap-3">
                        <FileText className="w-7 h-7 text-cyan-400" />
                        Note Share
                    </h2>
                    <p className="text-sm text-white/40 mt-1">Share and discover study notes from your campus</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-xl text-white font-medium text-sm hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                >
                    <Plus size={18} />
                    Create Note
                </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                        <input
                            type="text"
                            placeholder="Search notes by title, content, or tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${showFilters ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'border-white/[0.06] text-white/60 hover:text-white/80'}`}
                    >
                        <Filter size={18} />
                        Filters
                    </button>
                </div>

                {/* Filter Options */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 mt-4 border-t border-white/[0.06] space-y-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Course</label>
                                        <select
                                            value={selectedCourse}
                                            onChange={(e) => setSelectedCourse(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                        >
                                            {courses.map(course => (
                                                <option key={course} value={course} className="bg-slate-800">{course}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Subject</label>
                                        <select
                                            value={selectedSubject}
                                            onChange={(e) => setSelectedSubject(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                        >
                                            {subjects.map(subject => (
                                                <option key={subject} value={subject} className="bg-slate-800">{subject}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Tags</label>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => toggleTag(tag)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedTags.includes(tag) ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:text-white/70'}`}
                                            >
                                                #{tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { id: 'all', label: 'All Notes', icon: FileText },
                    { id: 'popular', label: 'Popular', icon: TrendingUp },
                    { id: 'recent', label: 'Recent', icon: Clock },
                    { id: 'my-notes', label: 'My Notes', icon: BookOpen }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:text-white/70'}`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredNotes.map(note => (
                        <motion.div
                            key={note.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.1] transition-all group"
                        >
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                                        {note.authorAvatar}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white/80">{note.author}</p>
                                        <p className="text-xs text-white/30">{note.course} · {note.subject}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    {note.visibility === 'private' ? (
                                        <Lock size={14} className="text-white/30" />
                                    ) : note.visibility === 'course' ? (
                                        <Users size={14} className="text-white/30" />
                                    ) : (
                                        <Globe size={14} className="text-white/30" />
                                    )}
                                    <button className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
                                        <MoreVertical size={16} className="text-white/30" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-white/90 mb-2 group-hover:text-cyan-400 transition-colors">
                                {note.title}
                            </h3>
                            <p className="text-sm text-white/50 line-clamp-2 mb-4">
                                {note.content}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {note.tags.slice(0, 4).map(tag => (
                                    <span key={tag} className="px-2 py-1 rounded-md bg-white/[0.03] text-[11px] text-white/40 border border-white/[0.06]">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleLike(note.id)}
                                        className={`flex items-center gap-1.5 text-xs transition-colors ${note.isLiked ? 'text-pink-400' : 'text-white/30 hover:text-pink-400'}`}
                                    >
                                        <Heart size={14} className={note.isLiked ? 'fill-current' : ''} />
                                        {note.likes}
                                    </button>
                                    <span className="flex items-center gap-1.5 text-xs text-white/30">
                                        <MessageCircle size={14} />
                                        {note.comments}
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs text-white/30">
                                        <Eye size={14} />
                                        {note.views}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {note.rating > 0 && (
                                        <span className="flex items-center gap-1 text-xs text-amber-400">
                                            <Star size={12} className="fill-current" />
                                            {note.rating}
                                        </span>
                                    )}
                                    <button
                                        onClick={() => handleBookmark(note.id)}
                                        className={`p-1.5 rounded-lg transition-colors ${note.isBookmarked ? 'text-cyan-400 bg-cyan-500/10' : 'text-white/30 hover:text-cyan-400 hover:bg-white/[0.06]'}`}
                                    >
                                        <BookOpen size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredNotes.length === 0 && (
                <div className="text-center py-12">
                    <FileText size={48} className="mx-auto text-white/20 mb-4" />
                    <p className="text-white/40">No notes found matching your criteria</p>
                </div>
            )}

            {/* Create Note Modal */}
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
                                    <Edit3 size={20} className="text-cyan-400" />
                                    Create New Note
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
                                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Title</label>
                                    <input
                                        type="text"
                                        placeholder="Enter note title..."
                                        value={newNote.title}
                                        onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Content</label>
                                    <textarea
                                        placeholder="Write your notes here..."
                                        value={newNote.content}
                                        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                                        rows={8}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Course</label>
                                        <select
                                            value={newNote.course}
                                            onChange={(e) => setNewNote({ ...newNote, course: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                        >
                                            <option value="" className="bg-slate-800">Select course...</option>
                                            {courses.slice(1).map(course => (
                                                <option key={course} value={course} className="bg-slate-800">{course}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Subject</label>
                                        <input
                                            type="text"
                                            placeholder="e.g., Data Structures"
                                            value={newNote.subject}
                                            onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., algorithms, trees, recursion"
                                        value={newNote.tags}
                                        onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Visibility</label>
                                    <div className="flex gap-3">
                                        {[
                                            { id: 'public', label: 'Public', icon: Globe, desc: 'Anyone can view' },
                                            { id: 'course', label: 'Course', icon: Users, desc: 'Same course students' },
                                            { id: 'private', label: 'Private', icon: Lock, desc: 'Only you' }
                                        ].map(vis => (
                                            <button
                                                key={vis.id}
                                                onClick={() => setNewNote({ ...newNote, visibility: vis.id as any })}
                                                className={`flex-1 p-3 rounded-xl border text-left transition-all ${newNote.visibility === vis.id ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.1]'}`}
                                            >
                                                <vis.icon size={18} className={`mb-1 ${newNote.visibility === vis.id ? 'text-cyan-400' : 'text-white/40'}`} />
                                                <p className="text-sm font-medium text-white/80">{vis.label}</p>
                                                <p className="text-[10px] text-white/30">{vis.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-5 py-3 rounded-xl border border-white/[0.06] text-white/60 hover:text-white/80 hover:bg-white/[0.03] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateNote}
                                    className="flex-1 px-5 py-3 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
                                >
                                    Publish Note
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Missing Eye icon component
function Eye({ size = 16, className = "" }: { size?: number; className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}
