'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3,
    Plus,
    Vote,
    Clock,
    Users,
    CheckCircle,
    TrendingUp,
    Calendar,
    MoreVertical
} from 'lucide-react';

interface Poll {
    id: number;
    question: string;
    options: {
        id: number;
        text: string;
        votes: number;
        percentage: number;
    }[];
    totalVotes: number;
    status: 'active' | 'closed';
    category: 'academic' | 'event' | 'feedback' | 'general';
    createdBy: string;
    createdAt: string;
    endsAt: string;
    isVoted: boolean;
    votedOption?: number;
}

const mockPolls: Poll[] = [
    {
        id: 1,
        question: "Which topic should we cover in next week's tutorial?",
        options: [
            { id: 1, text: "Dynamic Programming Advanced", votes: 45, percentage: 38 },
            { id: 2, text: "Graph Algorithms Deep Dive", votes: 38, percentage: 32 },
            { id: 3, text: "Divide and Conquer", votes: 22, percentage: 18 },
            { id: 4, text: "String Matching Algorithms", votes: 14, percentage: 12 }
        ],
        totalVotes: 119,
        status: 'active',
        category: 'academic',
        createdBy: "Prof. Rajesh Kumar",
        createdAt: "2025-02-22",
        endsAt: "2025-02-25",
        isVoted: false
    },
    {
        id: 2,
        question: "What time works best for the weekend study session?",
        options: [
            { id: 1, text: "Saturday 10 AM", votes: 28, percentage: 42 },
            { id: 2, text: "Saturday 2 PM", votes: 19, percentage: 28 },
            { id: 3, text: "Sunday 10 AM", votes: 12, percentage: 18 },
            { id: 4, text: "Sunday 4 PM", votes: 8, percentage: 12 }
        ],
        totalVotes: 67,
        status: 'active',
        category: 'event',
        createdBy: "Ayush Upadhyay",
        createdAt: "2025-02-23",
        endsAt: "2025-02-24",
        isVoted: true,
        votedOption: 1
    },
    {
        id: 3,
        question: "How would you rate this week's lecture pace?",
        options: [
            { id: 1, text: "Too Fast", votes: 12, percentage: 15 },
            { id: 2, text: "Just Right", votes: 58, percentage: 72 },
            { id: 3, text: "Too Slow", votes: 11, percentage: 13 }
        ],
        totalVotes: 81,
        status: 'closed',
        category: 'feedback',
        createdBy: "CS301 Class Rep",
        createdAt: "2025-02-20",
        endsAt: "2025-02-22",
        isVoted: true,
        votedOption: 2
    },
    {
        id: 4,
        question: "Should we organize a coding competition this semester?",
        options: [
            { id: 1, text: "Yes, definitely!", votes: 89, percentage: 65 },
            { id: 2, text: "Maybe next semester", votes: 32, percentage: 23 },
            { id: 3, text: "Not interested", votes: 16, percentage: 12 }
        ],
        totalVotes: 137,
        status: 'active',
        category: 'general',
        createdBy: "Tech Club President",
        createdAt: "2025-02-21",
        endsAt: "2025-02-28",
        isVoted: false
    }
];

const categories = [
    { id: 'all', label: 'All', icon: BarChart3 },
    { id: 'academic', label: 'Academic' },
    { id: 'event', label: 'Events' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'general', label: 'General' },
];

export default function QuickPoll() {
    const [polls, setPolls] = useState<Poll[]>(mockPolls);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPoll, setNewPoll] = useState({
        question: '',
        options: ['', '', '', ''],
        category: 'general' as 'academic' | 'event' | 'feedback' | 'general',
        duration: 3
    });
    const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');

    const filteredPolls = polls.filter(poll => {
        const matchesCategory = selectedCategory === 'all' || poll.category === selectedCategory;
        const matchesStatus = activeTab === 'active' ? poll.status === 'active' : poll.status === 'closed';
        return matchesCategory && matchesStatus;
    });

    const vote = (pollId: number, optionId: number) => {
        setPolls(polls.map(poll => {
            if (poll.id === pollId && !poll.isVoted) {
                const totalVotes = poll.totalVotes + 1;
                const updatedOptions = poll.options.map(opt => ({
                    ...opt,
                    votes: opt.id === optionId ? opt.votes + 1 : opt.votes,
                    percentage: Math.round((opt.id === optionId ? opt.votes + 1 : opt.votes) / totalVotes * 100)
                }));
                return {
                    ...poll,
                    options: updatedOptions,
                    totalVotes,
                    isVoted: true,
                    votedOption: optionId
                };
            }
            return poll;
        }));
    };

    const handleCreatePoll = () => {
        if (!newPoll.question || newPoll.options.filter(o => o.trim()).length < 2) return;

        const poll: Poll = {
            id: polls.length + 1,
            question: newPoll.question,
            options: newPoll.options.filter(o => o.trim()).map((text, idx) => ({
                id: idx + 1,
                text,
                votes: 0,
                percentage: 0
            })),
            totalVotes: 0,
            status: 'active',
            category: newPoll.category,
            createdBy: "Ayush Upadhyay",
            createdAt: new Date().toISOString().split('T')[0],
            endsAt: new Date(Date.now() + newPoll.duration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isVoted: false
        };

        setPolls([poll, ...polls]);
        setShowCreateModal(false);
        setNewPoll({ question: '', options: ['', '', '', ''], category: 'general', duration: 3 });
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'academic': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
            case 'event': return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
            case 'feedback': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'general': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            default: return 'text-white/40 bg-white/[0.06] border-white/[0.06]';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white/90 flex items-center gap-3">
                        <Vote className="w-7 h-7 text-amber-400" />
                        Quick Poll
                    </h2>
                    <p className="text-sm text-white/40 mt-1">Create and vote on campus polls</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-white font-medium text-sm hover:shadow-lg hover:shadow-amber-500/20 transition-all"
                >
                    <Plus size={18} />
                    Create Poll
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Polls', value: polls.length, icon: BarChart3 },
                    { label: 'Active', value: polls.filter(p => p.status === 'active').length, icon: TrendingUp },
                    { label: 'Total Votes', value: polls.reduce((sum, p) => sum + p.totalVotes, 0), icon: Users },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4">
                        <stat.icon size={18} className="text-amber-400 mb-2" />
                        <p className="text-2xl font-bold text-white/90">{stat.value}</p>
                        <p className="text-xs text-white/40">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                {[
                    { id: 'active', label: 'Active Polls' },
                    { id: 'closed', label: 'Closed Polls' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:text-white/70'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredPolls.map(poll => (
                        <motion.div
                            key={poll.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5"
                        >
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getCategoryColor(poll.category)}`}>
                                            {poll.category.toUpperCase()}
                                        </span>
                                        {poll.status === 'active' ? (
                                            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                                                <Clock size={10} />
                                                Ends {poll.endsAt}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-white/30">Closed</span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-semibold text-white/90">{poll.question}</h3>
                                </div>
                                <button className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
                                    <MoreVertical size={16} className="text-white/30" />
                                </button>
                            </div>

                            <div className="space-y-2 mb-4">
                                {poll.options.map(option => (
                                    <button
                                        key={option.id}
                                        onClick={() => !poll.isVoted && poll.status === 'active' && vote(poll.id, option.id)}
                                        disabled={poll.isVoted || poll.status === 'closed'}
                                        className={`relative w-full p-3 rounded-xl border text-left transition-all ${poll.isVoted || poll.status === 'closed' ? 'bg-white/[0.03] border-white/[0.06]' : 'hover:border-amber-500/30 hover:bg-white/[0.03] cursor-pointer'} ${poll.votedOption === option.id ? 'border-amber-500/50 bg-amber-500/10' : ''}`}
                                    >
                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-3">
                                                {poll.isVoted && poll.votedOption === option.id && (
                                                    <CheckCircle size={16} className="text-amber-400" />
                                                )}
                                                <span className={`text-sm ${poll.votedOption === option.id ? 'text-amber-400' : 'text-white/70'}`}>
                                                    {option.text}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-white/40">{option.votes} votes</span>
                                                <span className={`text-sm font-medium ${poll.votedOption === option.id ? 'text-amber-400' : 'text-white/50'}`}>
                                                    {option.percentage}%
                                                </span>
                                            </div>
                                        </div>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${option.percentage}%` }}
                                            transition={{ duration: 0.5, ease: 'easeOut' }}
                                            className="absolute left-0 top-0 bottom-0 rounded-xl bg-amber-500/10"
                                        />
                                    </button>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                                <div className="flex items-center gap-4 text-xs text-white/30">
                                    <span className="flex items-center gap-1.5">
                                        <Users size={12} />
                                        {poll.totalVotes} votes
                                    </span>
                                </div>
                                {poll.isVoted && (
                                    <span className="text-xs text-amber-400 flex items-center gap-1">
                                        <CheckCircle size={12} />
                                        You voted
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredPolls.length === 0 && (
                <div className="text-center py-12">
                    <Vote size={48} className="mx-auto text-white/20 mb-4" />
                    <p className="text-white/40">No polls found</p>
                </div>
            )}

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
                            className="bg-slate-900 border border-white/[0.1] rounded-2xl p-6 w-full max-w-lg"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white/90 flex items-center gap-2">
                                    <Vote size={20} className="text-amber-400" />
                                    Create Poll
                                </h3>
                                <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg hover:bg-white/[0.06] text-white/40">
                                    <Plus size={20} className="rotate-45" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Question</label>
                                    <input
                                        type="text"
                                        placeholder="What would you like to ask?"
                                        value={newPoll.question}
                                        onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Options</label>
                                    {newPoll.options.map((opt, idx) => (
                                        <input
                                            key={idx}
                                            type="text"
                                            placeholder={`Option ${idx + 1}`}
                                            value={opt}
                                            onChange={(e) => {
                                                const newOptions = [...newPoll.options];
                                                newOptions[idx] = e.target.value;
                                                setNewPoll({ ...newPoll, options: newOptions });
                                            }}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 mb-2"
                                        />
                                    ))}
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
                                    onClick={handleCreatePoll}
                                    className="flex-1 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-amber-500/20 transition-all"
                                >
                                    Create Poll
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
