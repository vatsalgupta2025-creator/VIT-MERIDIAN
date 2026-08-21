'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    ExternalLink,
    FileText,
    FolderOpen,
    GraduationCap,
    Globe,
    Star,
    Sparkles,
    Search,
    Clock,
    Users,
    Zap,
    Trophy,
    ArrowUpRight,
    TrendingUp,
    Flame,
    BookMarked,
    Library,
    Github
} from 'lucide-react';

interface Resource {
    id: string;
    title: string;
    description: string;
    url: string;
    icon: any;
    color: string;
    category: 'study-material' | 'pyq' | 'tool' | 'ai-career';
    tags: string[];
    featured?: boolean;
    stats?: string;
}

const resources: Resource[] = [
    {
        id: '1',
        title: 'VIT Study Materials',
        description: 'Complete Google Drive with notes, presentations, and study materials across all branches and semesters — a one-stop hub for everything you need.',
        url: 'https://drive.google.com/drive/folders/1Z4tBts_Y55n4m8yRSyV7WzKocVHpi9yC',
        icon: FolderOpen,
        color: 'cyan',
        category: 'study-material',
        tags: ['Notes', 'PPTs', 'All Branches'],
        featured: true,
        stats: '500+ Files'
    },
    {
        id: '2',
        title: 'VIT Paper Vault',
        description: 'The most comprehensive collection of VIT previous year question papers. Sorted by course code, semester, and exam type (CAT/FAT).',
        url: 'https://vitpapervault.in',
        icon: FileText,
        color: 'violet',
        category: 'pyq',
        tags: ['CAT Papers', 'FAT Papers', 'All Semesters'],
        featured: true,
        stats: '1000+ Papers'
    },
    {
        id: '3',
        title: 'VIT MIS Qube',
        description: 'Interactive quiz platform for MIS assessment preparation. Practice with real quiz patterns and track your progress.',
        url: 'https://vitmisqube.netlify.app',
        icon: Zap,
        color: 'amber',
        category: 'tool',
        tags: ['Quizzes', 'MIS', 'Practice'],
        stats: 'Interactive'
    },
    {
        id: '4',
        title: 'VHelp CC',
        description: 'Community-driven platform with curated study materials, important questions, and targeted exam preparation resources from VIT seniors.',
        url: 'https://www.vhelpcc.com/study-material',
        icon: Users,
        color: 'emerald',
        category: 'study-material',
        tags: ['Community', 'Important Qs', 'Exam Prep'],
        stats: 'Community'
    },
    {
        id: '5',
        title: 'VIT PYQPs Paaji',
        description: 'Open-source GitHub repository with well-organized previous year question papers, answer keys, and crowd-sourced solutions.',
        url: 'https://github.com/puneet-chandna/VIT-PYQPs-Paaji',
        icon: Github,
        color: 'rose',
        category: 'pyq',
        tags: ['Open Source', 'Solutions', 'Answer Keys'],
        featured: true,
        stats: 'Open Source'
    },
    // ── AI & Career Resources ──
    {
        id: '6',
        title: 'AI Agents Resource Library',
        description: '50+ hand-picked resources on AI agents — videos, GitHub repos, guides, books, and research papers all in one organized Google Doc.',
        url: 'https://docs.google.com/document/d/13XL6ymHVdwhsavZ5kKfWakNqcwx83fKCLrEETGU__1M/mobilebasic',
        icon: Sparkles,
        color: 'cyan',
        category: 'ai-career',
        tags: ['AI Agents', 'LLMs', 'Curated'],
        featured: true,
        stats: '50+ Resources'
    },
    {
        id: '7',
        title: 'Stanford Agentic AI Overview',
        description: 'Stanford\'s comprehensive overview of agentic AI — covers architectures, frameworks, and the future of autonomous AI systems.',
        url: 'https://lnkd.in/ddTqkXfB',
        icon: GraduationCap,
        color: 'violet',
        category: 'ai-career',
        tags: ['Stanford', 'Agentic AI', 'Research'],
        stats: 'Stanford'
    },
    {
        id: '8',
        title: 'Microsoft AI Agents for Beginners',
        description: 'Microsoft\'s official beginner-friendly GitHub curriculum for building AI agents — 18 lessons covering frameworks, tools, and hands-on projects.',
        url: 'https://lnkd.in/e-a2gqSv',
        icon: BookOpen,
        color: 'blue',
        category: 'ai-career',
        tags: ['Microsoft', 'Beginner', 'GitHub'],
        stats: '18 Lessons'
    },
    {
        id: '9',
        title: 'Google Agent Whitepaper',
        description: 'Google\'s official whitepaper on AI agents — architecture patterns, design principles, and best practices for building production-grade agents.',
        url: 'https://lnkd.in/eiPcrfd4',
        icon: Globe,
        color: 'amber',
        category: 'ai-career',
        tags: ['Google', 'Whitepaper', 'Architecture'],
        stats: 'Official'
    },
    {
        id: '10',
        title: 'Building Effective Agents (Anthropic)',
        description: 'Anthropic\'s guide to building effective AI agents — covers prompt engineering, tool use, chain-of-thought reasoning, and evaluation strategies.',
        url: 'https://lnkd.in/eYj6A4Vj',
        icon: BookOpen,
        color: 'emerald',
        category: 'ai-career',
        tags: ['Anthropic', 'Guide', 'Best Practices'],
        stats: 'Guide'
    },
    {
        id: '11',
        title: 'Hackathon Listings & Resources',
        description: 'Comprehensive Google Drive with hackathon prep materials, problem statements, and past winner solutions for major Indian hackathons.',
        url: 'https://drive.google.com/file/d/1H7I9JUDD1A8KKKSsvXB9BKj8rtcHNqpK/view',
        icon: Trophy,
        color: 'rose',
        category: 'ai-career',
        tags: ['Hackathons', 'Prep', 'Solutions'],
        stats: 'Drive'
    }
];

const categories = [
    { id: 'all', label: 'All', icon: Globe },
    { id: 'study-material', label: 'Study Material', icon: BookOpen },
    { id: 'pyq', label: 'Previous Papers', icon: FileText },
    { id: 'tool', label: 'Tools', icon: Zap },
    { id: 'ai-career', label: 'AI & Career', icon: Sparkles }
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export default function StudyMaterials() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = resources.filter(r => {
        const matchCategory = activeCategory === 'all' || r.category === activeCategory;
        const matchSearch = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase()) || r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchCategory && matchSearch;
    });

    const featured = resources.filter(r => r.featured);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-hidden"
        >
            {/* ── Hero Header ── */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0c0f17] to-[#0d1020] border border-white/[0.06] p-6">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/[0.08] rounded-full blur-[80px]" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-violet-500/[0.06] rounded-full blur-[60px]" />
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                                <Library size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Study Materials</h2>
                                <p className="text-white/35 text-xs">Curated VIT resources for exam domination</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-emerald-400/70 text-[10px] font-medium">{resources.length} Resources</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Flame size={10} className="text-amber-400/60" />
                                <span className="text-white/30 text-[10px]">Updated regularly</span>
                            </div>
                        </div>
                    </div>
                    {/* Quick Stats */}
                    <div className="hidden md:flex gap-3">
                        {[
                            { icon: FileText, value: '2', label: 'PYQ Sites', color: 'violet' },
                            { icon: BookOpen, value: '2', label: 'Study Hubs', color: 'cyan' },
                            { icon: Sparkles, value: '6', label: 'AI & Career', color: 'emerald' },
                            { icon: Zap, value: '1', label: 'Tool', color: 'amber' }
                        ].map((s, i) => (
                            <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-center min-w-[80px]">
                                <s.icon size={14} className={`text-${s.color}-400 mx-auto mb-1.5`} />
                                <p className="text-white/80 text-lg font-bold">{s.value}</p>
                                <p className="text-white/25 text-[9px]">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* ── Search + Filter ── */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 flex-shrink-0">
                <div className="flex-1 relative group">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400/50 transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search resources, tags, keywords..."
                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-cyan-500/30 focus:bg-white/[0.04] transition-all"
                    />
                </div>
                <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.04]">
                    {categories.map(cat => (
                        <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${activeCategory === cat.id
                                ? 'bg-cyan-500/20 text-cyan-400 shadow-sm shadow-cyan-500/10'
                                : 'text-white/30 hover:text-white/50 hover:bg-white/[0.03]'}`}>
                            <cat.icon size={12} /> {cat.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pb-6">

                {/* ── Featured Resources (Large Cards) ── */}
                {activeCategory === 'all' && !searchQuery && (
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center gap-2 mb-3">
                            <Star size={13} className="text-amber-400" />
                            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Featured Resources</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {featured.map((r, i) => (
                                <motion.a
                                    key={r.id}
                                    href={r.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.02, translateY: -4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-${r.color}-500/30 transition-all cursor-pointer`}
                                >
                                    {/* Gradient background */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${r.color === 'cyan' ? 'from-cyan-500/10 via-cyan-500/5 to-transparent' :
                                        r.color === 'violet' ? 'from-violet-500/10 via-violet-500/5 to-transparent' :
                                            'from-rose-500/10 via-rose-500/5 to-transparent'}`} />
                                    {/* Glow on hover */}
                                    <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${r.color === 'cyan' ? 'bg-cyan-500/15' : r.color === 'violet' ? 'bg-violet-500/15' : 'bg-rose-500/15'}`} />

                                    <div className="relative z-10 p-5">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-11 h-11 rounded-xl ${r.color === 'cyan' ? 'bg-cyan-500/15' : r.color === 'violet' ? 'bg-violet-500/15' : 'bg-rose-500/15'} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                <r.icon size={20} className={`${r.color === 'cyan' ? 'text-cyan-400' : r.color === 'violet' ? 'text-violet-400' : 'text-rose-400'}`} />
                                            </div>
                                            <ArrowUpRight size={16} className="text-white/10 group-hover:text-white/40 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                        </div>

                                        {/* Content */}
                                        <h3 className="text-white/90 text-sm font-bold mb-1.5 group-hover:text-white transition-colors">{r.title}</h3>
                                        <p className="text-white/30 text-[11px] leading-relaxed line-clamp-2 mb-4">{r.description}</p>

                                        {/* Tags + Stats */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-1.5">
                                                {r.tags.slice(0, 2).map(tag => (
                                                    <span key={tag} className="px-2 py-0.5 bg-white/[0.04] text-white/30 text-[9px] rounded-full border border-white/[0.04]">{tag}</span>
                                                ))}
                                            </div>
                                            {r.stats && (
                                                <span className={`text-[9px] font-bold ${r.color === 'cyan' ? 'text-cyan-400/50' : r.color === 'violet' ? 'text-violet-400/50' : 'text-rose-400/50'}`}>
                                                    {r.stats}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── All Resources (List) ── */}
                <motion.div variants={itemVariants}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <BookMarked size={13} className="text-cyan-400/60" />
                            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                                {activeCategory === 'all' ? 'All Resources' : categories.find(c => c.id === activeCategory)?.label}
                            </h3>
                            <span className="px-1.5 py-0.5 bg-white/[0.04] text-white/20 text-[9px] rounded-full">{filtered.length}</span>
                        </div>
                    </div>
                    <div className="space-y-2.5">
                        {filtered.map((r, i) => (
                            <motion.a
                                key={r.id}
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                whileHover={{ scale: 1.01, translateX: 4 }}
                                className={`group flex items-center gap-4 p-4 bg-[#0c0f17] rounded-xl border border-white/[0.05] hover:border-${r.color}-500/25 hover:bg-white/[0.02] transition-all`}
                            >
                                {/* Icon */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110 ${r.color === 'cyan' ? 'bg-cyan-500/15' :
                                    r.color === 'violet' ? 'bg-violet-500/15' :
                                        r.color === 'amber' ? 'bg-amber-500/15' :
                                            r.color === 'emerald' ? 'bg-emerald-500/15' :
                                                'bg-rose-500/15'}`}>
                                    <r.icon size={20} className={`${r.color === 'cyan' ? 'text-cyan-400' :
                                        r.color === 'violet' ? 'text-violet-400' :
                                            r.color === 'amber' ? 'text-amber-400' :
                                                r.color === 'emerald' ? 'text-emerald-400' :
                                                    'text-rose-400'}`} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h4 className="text-white/85 text-sm font-semibold group-hover:text-white transition-colors truncate">{r.title}</h4>
                                        {r.featured && (
                                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/10 text-amber-400/70 text-[8px] font-bold rounded-full border border-amber-500/10">
                                                <Star size={7} className="fill-current" /> TOP
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-white/30 text-[11px] line-clamp-1 mb-1.5">{r.description}</p>
                                    <div className="flex items-center gap-1.5">
                                        {r.tags.map(tag => (
                                            <span key={tag} className="px-1.5 py-0.5 bg-white/[0.03] text-white/20 text-[9px] rounded-full border border-white/[0.03]">{tag}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Right */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    {r.stats && (
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${r.color === 'cyan' ? 'bg-cyan-500/10 text-cyan-400/70' :
                                            r.color === 'violet' ? 'bg-violet-500/10 text-violet-400/70' :
                                                r.color === 'amber' ? 'bg-amber-500/10 text-amber-400/70' :
                                                    r.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400/70' :
                                                        'bg-rose-500/10 text-rose-400/70'}`}>
                                            {r.stats}
                                        </span>
                                    )}
                                    <ExternalLink size={14} className="text-white/10 group-hover:text-white/40 transition-colors" />
                                </div>
                            </motion.a>
                        ))}

                        {filtered.length === 0 && (
                            <div className="text-center py-16">
                                <Search size={28} className="text-white/[0.06] mx-auto mb-3" />
                                <p className="text-white/25 text-sm font-medium">No resources found</p>
                                <p className="text-white/15 text-xs mt-1">Try a different search or category</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ── Exam Prep Tips ── */}
                <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#0a1628] via-[#0c0f17] to-[#0c0f17] rounded-2xl p-6 border border-white/[0.05] relative overflow-hidden">
                    <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-cyan-500/[0.04] rounded-full blur-3xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                                <Sparkles size={13} className="text-amber-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-white">Exam Prep Strategy</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                                {
                                    icon: Trophy,
                                    title: 'PYQs are King',
                                    desc: 'Most FAT questions repeat or follow patterns from previous years. Start your prep here.',
                                    color: 'violet',
                                    step: '01'
                                },
                                {
                                    icon: Clock,
                                    title: 'Timed Practice',
                                    desc: 'Practice under real exam time: 3 hours for FAT, 90 minutes for CAT. Build speed and accuracy.',
                                    color: 'cyan',
                                    step: '02'
                                },
                                {
                                    icon: TrendingUp,
                                    title: 'Smart Weightage',
                                    desc: 'Focus on Part A (10 marks each) first. Master high-weightage topics before moving to details.',
                                    color: 'emerald',
                                    step: '03'
                                }
                            ].map(tip => (
                                <div key={tip.title} className={`p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-${tip.color}-500/15 transition-all group`}>
                                    <div className="flex items-center justify-between mb-2.5">
                                        <div className={`w-8 h-8 rounded-lg ${tip.color === 'violet' ? 'bg-violet-500/15' : tip.color === 'cyan' ? 'bg-cyan-500/15' : 'bg-emerald-500/15'} flex items-center justify-center`}>
                                            <tip.icon size={14} className={`${tip.color === 'violet' ? 'text-violet-400' : tip.color === 'cyan' ? 'text-cyan-400' : 'text-emerald-400'}`} />
                                        </div>
                                        <span className="text-white/[0.06] text-2xl font-black">{tip.step}</span>
                                    </div>
                                    <h4 className="text-white/70 text-xs font-semibold mb-1">{tip.title}</h4>
                                    <p className="text-white/25 text-[10px] leading-relaxed">{tip.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* ── Quick Access Footer ── */}
                <motion.div variants={itemVariants} className="flex items-center justify-center gap-3 py-2">
                    <span className="text-white/15 text-[10px]">Quick Access:</span>
                    {resources.slice(0, 3).map(r => (
                        <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-white/[0.02] border border-white/[0.04] rounded-full text-[10px] text-white/25 hover:text-white/50 hover:border-white/[0.1] transition-all flex items-center gap-1.5">
                            <r.icon size={9} /> {r.title.split(' ').slice(0, 2).join(' ')}
                        </a>
                    ))}
                </motion.div>
            </div>
        </motion.div>
    );
}
