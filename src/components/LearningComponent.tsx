'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PlayCircle, CheckCircle, GraduationCap, X, Search, Loader2,
    Filter, Bookmark, Flame, Star, Zap, ChevronLeft, ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { currentUser } from '@/data/mockData';

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || 'AIzaSyDwrXOb_52JLUDn8GC3ygKoO5als-eIcmA';


interface VideoItem {
    id: string;
    title: string;
    channelTitle: string;
    description: string;
    thumbnail: string;
    duration: string;
    completed: boolean;
    xp: number;
    category: string;
    rating: number;
    views: string;
}

const CATEGORIES = ['Retirement', 'Entrepreneurship', 'Credit', 'Investing', 'Budgeting', 'Taxes'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

// Generate heatmap data
const generateHeatmapData = () => {
    const data: { [key: string]: number }[] = [];
    const today = new Date();
    for (let week = 0; week < 20; week++) {
        const weekData: { [key: string]: number } = {};
        for (let day = 0; day < 7; day++) {
            const date = new Date(today);
            date.setDate(date.getDate() - (week * 7 + day));
            const key = date.toISOString().split('T')[0];
            weekData[key] = Math.random() > 0.4 ? Math.floor(Math.random() * 4) + 1 : 0;
        }
        data.push(weekData);
    }
    return data;
};

const recentActivity = [
    { date: 'Feb 19', xp: 54, color: 'bg-violet-500' },
    { date: 'Feb 17', xp: 31, color: 'bg-emerald-500' },
    { date: 'Feb 16', xp: 40, color: 'bg-cyan-500' },
];

export default function LearningComponent() {
    const [viewMode, setViewMode] = useState<'discover' | 'watch'>('discover');
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [completedVideos, setCompletedVideos] = useState<string[]>([]);

    // Quiz state
    const [quizQuestions, setQuizQuestions] = useState<{ question: string; options: string[]; correctAnswer: number; explanation: string }[]>([]);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [quizIndex, setQuizIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [quizDone, setQuizDone] = useState(false);

    const heatmapData = useMemo(() => generateHeatmapData(), []);

    useEffect(() => {
        handleSearch('Financial Literacy');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = async (queryToSearch: string | React.FormEvent) => {
        if (typeof queryToSearch !== 'string') {
            queryToSearch.preventDefault();
        }
        const q = typeof queryToSearch === 'string' ? queryToSearch : searchQuery;
        if (!q.trim()) return;

        setIsSearching(true);
        try {
            const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&key=${API_KEY}&maxResults=5`);
            const searchData = await searchRes.json();

            if (searchData.items && searchData.items.length > 0) {
                const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
                const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id=${videoIds}&key=${API_KEY}`);
                const videoData = await videoRes.json();

                const newVideos: VideoItem[] = videoData.items.map((item: any) => {
                    let durationStr = item.contentDetails.duration;
                    let durationDisplay = '15m';
                    const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                    if (match) {
                        const h = parseInt(match[1] || '0');
                        const m = parseInt(match[2] || '0');
                        durationDisplay = `${(h * 60) + m}m`;
                    }

                    let viewsCount = parseInt(item.statistics.viewCount || '0');
                    let viewsDisplay = viewsCount > 1000000
                        ? (viewsCount / 1000000).toFixed(1) + 'M'
                        : viewsCount > 1000
                            ? (viewsCount / 1000).toFixed(1) + 'K'
                            : viewsCount.toString();

                    return {
                        id: item.id,
                        title: item.snippet.title,
                        channelTitle: item.snippet.channelTitle,
                        description: item.snippet.description.substring(0, 120) + '...',
                        thumbnail: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
                        duration: durationDisplay,
                        completed: false,
                        xp: Math.floor(Math.random() * 50) + 30,
                        category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
                        rating: parseFloat((4 + Math.random()).toFixed(1)),
                        views: viewsDisplay
                    };
                });
                setVideos(newVideos);
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const playVideo = (video: VideoItem) => {
        setActiveVideo(video);
        setViewMode('watch');
        // Reset quiz state
        setQuizQuestions([]);
        setQuizIndex(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setQuizScore(0);
        setQuizDone(false);
        setIsGeneratingQuiz(false);
    };

    // Auto-generate quiz whenever a new video is opened
    useEffect(() => {
        if (!activeVideo || viewMode !== 'watch') return;
        if (completedVideos.includes(activeVideo.id)) return;
        const generate = async () => {
            setIsGeneratingQuiz(true);
            try {
                const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';
                const res = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    text: `You are an educational quiz generator. Based on this YouTube video titled "${activeVideo.title}" by ${activeVideo.channelTitle}, generate exactly 5 multiple-choice quiz questions that test understanding of the video topic.

Respond ONLY with a valid JSON array like this:
[
  {
    "question": "Question text?",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "Why this is correct."
  }
]

Do not include any other text, just the JSON array.` }]
                            }],
                            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
                        })
                    }
                );
                const data = await res.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                const jsonMatch = text.match(/\[.*\]/s);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    setQuizQuestions(parsed);
                }
            } catch (e) {
                console.error('Quiz generation failed', e);
            } finally {
                setIsGeneratingQuiz(false);
            }
        };
        generate();
    }, [activeVideo?.id, viewMode]);

    const handleQuizPass = () => {
        if (!activeVideo) return;
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#06b6d4', '#10b981', '#8b5cf6'] });
        if (!completedVideos.includes(activeVideo.id)) {
            setCompletedVideos(prev => [...prev, activeVideo.id]);
            currentUser.totalPoints += activeVideo.xp;
        }
    };

    const getHeatmapColor = (level: number) => {
        if (level === 0) return 'bg-white/[0.03]';
        if (level === 1) return 'bg-violet-900/60';
        if (level === 2) return 'bg-violet-700/70';
        if (level === 3) return 'bg-violet-500/80';
        return 'bg-violet-400';
    };

    // â”€â”€ DISCOVER VIEW â”€â”€
    const renderDiscover = () => (
        <div className="flex h-full gap-0">
            {/* â”€â”€ LEFT SIDEBAR â”€â”€ */}
            <div className="w-[200px] flex-shrink-0 flex flex-col gap-5 overflow-y-auto custom-scrollbar border-r border-white/[0.05] pr-4 mr-4 hidden lg:flex">
                {/* Streak Stats */}
                <div className="text-center">
                    <div className="flex items-center gap-2 justify-center mb-1">
                        <Flame size={18} className="text-amber-500" />
                        <span className="text-sm font-bold text-white">{currentUser.streak} day streak</span>
                    </div>
                    <p className="text-[10px] text-white/40 mb-3">Keep learning every day!</p>
                    <div className="flex justify-center gap-4">
                        <div className="text-center">
                            <p className="text-lg font-black text-amber-400">{currentUser.totalPoints}</p>
                            <p className="text-[9px] text-white/30 uppercase">Total XP</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-black text-emerald-400">129</p>
                            <p className="text-[9px] text-white/30 uppercase">Active Days</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-black text-violet-400">5</p>
                            <p className="text-[9px] text-white/30 uppercase">Max Streak</p>
                        </div>
                    </div>
                </div>

                {/* Heatmap */}
                <div className="bg-[#0c0f17] rounded-xl p-3 border border-white/[0.05]">
                    <div className="flex items-center justify-between mb-2">
                        <select className="bg-transparent text-[10px] text-white/60 border border-white/10 rounded px-1.5 py-0.5 focus:outline-none">
                            <option>2024</option>
                            <option>2025</option>
                        </select>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-white/30">Theme:</span>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <div className="w-2.5 h-2.5 rounded-full bg-violet-500 ring-1 ring-white/20" />
                        </div>
                    </div>

                    <div className="flex gap-0.5 text-[8px] text-white/30 mb-1 ml-4">
                        <span className="w-[34px] text-center">Jan</span>
                        <span className="w-[34px] text-center">Feb</span>
                    </div>

                    <div className="flex gap-[1px]">
                        <div className="flex flex-col gap-[1px] mr-1 text-[8px] text-white/30 justify-around">
                            <span>Mon</span>
                            <span>Wed</span>
                            <span>Fri</span>
                        </div>
                        <div className="flex gap-[2px] flex-wrap">
                            {heatmapData.map((week, wi) => (
                                <div key={wi} className="flex flex-col gap-[2px]">
                                    {Object.values(week).slice(0, 5).map((level, di) => (
                                        <div
                                            key={di}
                                            className={`w-[9px] h-[9px] rounded-[2px] ${getHeatmapColor(level)} transition-colors`}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 justify-between mt-2">
                        <div className="flex items-center gap-1">
                            <button className="text-white/30 hover:text-white/60"><ChevronLeft size={12} /></button>
                            <button className="text-white/30 hover:text-white/60"><ChevronRight size={12} /></button>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-[8px] text-white/30">Less</span>
                            {[0, 1, 2, 3, 4].map(l => (
                                <div key={l} className={`w-[8px] h-[8px] rounded-[2px] ${getHeatmapColor(l)}`} />
                            ))}
                            <span className="text-[8px] text-white/30">More</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div>
                    <h4 className="text-xs font-bold text-white/60 mb-3">Recent Activity</h4>
                    <div className="space-y-2">
                        {recentActivity.map((act, i) => (
                            <div key={i} className="flex items-center gap-2.5">
                                <div className={`w-3 h-3 rounded-sm ${act.color}`} />
                                <span className="text-xs text-white/70 flex-1">{act.date}</span>
                                <span className="text-xs font-bold text-emerald-400">+{act.xp} XP</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* â”€â”€ MAIN CONTENT â”€â”€ */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-6 relative flex items-center">
                    <Search size={18} className="absolute left-4 text-white/30" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search courses..."
                        className="w-full bg-[#111318] border border-white/[0.06] rounded-xl px-5 py-3 pl-11 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/15 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="absolute right-3 text-white/40 hover:text-white/70 transition-colors disabled:opacity-50"
                    >
                        {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Filter size={18} />}
                    </button>
                </form>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-6 pb-10">
                    {/* Featured Banner */}
                    {videos.length > 0 && (
                        <div>
                            <h2 className="text-lg font-bold text-white mb-4">Continue Learning</h2>
                            <div
                                className="relative w-full h-[240px] rounded-xl overflow-hidden group cursor-pointer"
                                onClick={() => playVideo(videos[0])}
                            >
                                <img
                                    src={videos[0].thumbnail}
                                    alt={videos[0].title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <span className="inline-block px-2.5 py-1 rounded bg-red-600 text-[10px] font-bold text-white uppercase tracking-wider mb-3">
                                        Featured
                                    </span>
                                    <h1 className="text-xl font-bold text-white mb-2 max-w-2xl leading-snug">
                                        {videos[0].title}
                                    </h1>
                                    <p className="text-xs text-white/60 mb-4 max-w-xl line-clamp-1">
                                        {videos[0].description}
                                    </p>
                                    <button
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black font-bold text-xs hover:bg-white/90 transition-colors"
                                        onClick={(e) => { e.stopPropagation(); playVideo(videos[0]); }}
                                    >
                                        <PlayCircle size={16} /> Start Learning
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* All Courses Grid */}
                    <div>
                        <h2 className="text-lg font-bold text-white mb-4">
                            All Courses <span className="text-sm font-normal text-white/30">({videos.length})</span>
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {videos.map((video) => (
                                <motion.div
                                    key={video.id}
                                    whileHover={{ y: -4 }}
                                    className="bg-[#0c0f17] rounded-xl overflow-hidden group cursor-pointer border border-white/[0.04] hover:border-white/10 transition-all flex flex-col"
                                    onClick={() => playVideo(video)}
                                >
                                    {/* Thumbnail */}
                                    <div className="relative aspect-video w-full overflow-hidden">
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        {/* Completed badge */}
                                        {completedVideos.includes(video.id) && (
                                            <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                                                <CheckCircle size={14} />
                                            </div>
                                        )}
                                        {/* Bookmark */}
                                        <button
                                            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-md bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-all border border-white/10"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Bookmark size={13} />
                                        </button>
                                        {/* Category tags */}
                                        <div className="absolute bottom-2.5 left-2.5 flex gap-1.5">
                                            <span className="px-2 py-0.5 rounded text-[9px] font-bold text-white bg-red-600/90">
                                                {video.category}
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-[9px] font-bold text-white bg-black/70 border border-white/10">
                                                {LEVELS[Math.floor(Math.random() * LEVELS.length)]}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-3.5 flex-1 flex flex-col">
                                        <h3 className="text-[13px] font-semibold text-white/90 line-clamp-2 leading-snug group-hover:text-cyan-400 transition-colors">
                                            {video.title}
                                        </h3>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // â”€â”€ WATCH VIEW â”€â”€
    const renderWatchMode = () => {
        if (!activeVideo) return null;
        const isCompleted = completedVideos.includes(activeVideo.id);

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col h-full overflow-hidden"
            >
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col lg:flex-row gap-6">
                    {/* Player */}
                    <div className="flex-1 space-y-4">
                        <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/10">
                            <iframe
                                src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                                title={activeVideo.title}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white mb-2">{activeVideo.title}</h1>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-white/50 mb-4">
                                <span>{activeVideo.channelTitle}</span>
                                <span>â€¢</span>
                                <span>{activeVideo.views} views</span>
                                <span>â€¢</span>
                                <span>{activeVideo.duration}</span>
                            </div>
                            <div className="bg-[#0c0f17] rounded-xl p-4 text-sm text-white/60 leading-relaxed border border-white/[0.05]">
                                {activeVideo.description}
                                <br /><br />
                                This module covers essential theoretical foundations and practical applications.
                            </div>
                        </div>
                    </div>

                    {/* Quiz Panel */}
                    <div className="w-full lg:w-[380px] flex-shrink-0">
                        <div className="bg-[#0c0f17] rounded-xl p-5 border border-white/[0.05] sticky top-0 h-full overflow-y-auto">
                            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                                <GraduationCap className="text-cyan-400" size={20} /> AI Knowledge Quiz
                            </h3>
                            <p className="text-[11px] text-white/40 mb-4">Earn {activeVideo.xp} XP by completing the quiz.</p>

                            {isCompleted ? (
                                <div className="text-center py-8 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                    <CheckCircle size={28} className="text-emerald-400 mx-auto mb-2" />
                                    <h4 className="font-bold text-emerald-400 text-sm">Module Mastered! ðŸŽ‰</h4>
                                    <p className="text-[11px] text-emerald-400/60 mt-1">XP already claimed.</p>
                                </div>
                            ) : isGeneratingQuiz ? (
                                <div className="text-center py-10">
                                    <Loader2 size={28} className="text-cyan-400 animate-spin mx-auto mb-3" />
                                    <p className="text-white/50 text-xs">Generating AI quiz from video...</p>
                                </div>
                            ) : quizQuestions.length === 0 ? (
                                <div className="text-center py-8 text-white/30 text-xs">Quiz unavailable. Check your API key.</div>
                            ) : quizDone ? (
                                <div className="text-center py-6">
                                    <div className="text-4xl mb-3">{quizScore >= 3 ? 'ðŸŽ‰' : 'ðŸ“š'}</div>
                                    <h4 className="font-bold text-white text-lg mb-1">{quizScore}/{quizQuestions.length} Correct</h4>
                                    <p className="text-white/40 text-xs mb-4">{quizScore >= 3 ? 'Great job! XP earned!' : 'Keep practising!'}</p>
                                    {quizScore >= 3 && !isCompleted && (
                                        <button onClick={handleQuizPass} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold text-sm mb-2">
                                            Claim {activeVideo.xp} XP
                                        </button>
                                    )}
                                    <button onClick={() => { setQuizIndex(0); setSelectedAnswer(null); setShowExplanation(false); setQuizScore(0); setQuizDone(false); }}
                                        className="w-full py-2 rounded-xl border border-white/10 text-white/50 text-xs hover:text-white transition">
                                        Retry Quiz
                                    </button>
                                </div>
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                                    <div className="flex justify-between text-[10px] text-white/30 mb-1">
                                        <span>Q{quizIndex + 1} of {quizQuestions.length}</span>
                                        <span>{quizScore} correct</span>
                                    </div>
                                    <p className="text-sm text-white/90 font-medium leading-relaxed">
                                        {quizQuestions[quizIndex].question}
                                    </p>
                                    <div className="space-y-2">
                                        {quizQuestions[quizIndex].options.map((opt, i) => {
                                            let cls = 'border-white/5 bg-white/[0.02] text-white/70 hover:bg-white/[0.05] hover:border-cyan-500/30';
                                            if (showExplanation) {
                                                if (i === quizQuestions[quizIndex].correctAnswer) cls = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400';
                                                else if (i === selectedAnswer) cls = 'border-red-500/50 bg-red-500/10 text-red-400';
                                                else cls = 'border-white/5 bg-white/[0.01] text-white/30';
                                            }
                                            return (
                                                <button key={i} disabled={showExplanation}
                                                    onClick={() => setSelectedAnswer(i)}
                                                    className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${cls} ${selectedAnswer === i && !showExplanation ? 'ring-1 ring-cyan-500/50' : ''}`}>
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {showExplanation && (
                                        <p className="text-[11px] text-white/50 bg-white/[0.03] rounded-lg p-2.5 border border-white/5">
                                            ðŸ’¡ {quizQuestions[quizIndex].explanation}
                                        </p>
                                    )}
                                    <div className="flex gap-2 pt-1">
                                        {!showExplanation ? (
                                            <button disabled={selectedAnswer === null}
                                                onClick={() => {
                                                    if (selectedAnswer === quizQuestions[quizIndex].correctAnswer) setQuizScore(s => s + 1);
                                                    setShowExplanation(true);
                                                }}
                                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-bold text-sm disabled:opacity-40">
                                                Submit
                                            </button>
                                        ) : (
                                            <button onClick={() => {
                                                if (quizIndex + 1 >= quizQuestions.length) setQuizDone(true);
                                                else { setQuizIndex(i => i + 1); setSelectedAnswer(null); setShowExplanation(false); }
                                            }} className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/15">
                                                {quizIndex + 1 >= quizQuestions.length ? 'See Results' : 'Next Question'}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    // â”€â”€ MAIN RETURN â”€â”€
    return (
        <div className="h-[calc(100vh-120px)] w-full flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Top Header Bar */}
            <div className="flex items-center justify-between mb-5 flex-shrink-0">
                <div className="flex items-center gap-3">
                    {viewMode === 'watch' ? (
                        <button onClick={() => setViewMode('discover')} className="text-white/50 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    ) : (
                        <X size={20} className="text-white/30" />
                    )}
                    <GraduationCap className="text-cyan-400" size={24} />
                    <div>
                        <h2 className="text-lg font-bold text-white leading-none">Learning Hub</h2>
                        <p className="text-[10px] text-white/40 mt-0.5">Master financial literacy</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-600/20 border border-violet-500/20 text-xs font-bold text-violet-400">
                        <Star size={12} /> Level 1
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400">
                        <Zap size={12} /> {currentUser.totalPoints} XP
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-bold text-orange-400">
                        <Flame size={12} /> {currentUser.streak} Day Streak
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    {viewMode === 'discover' ? (
                        <motion.div key="discover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                            {renderDiscover()}
                        </motion.div>
                    ) : (
                        <motion.div key="watch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                            {renderWatchMode()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}


