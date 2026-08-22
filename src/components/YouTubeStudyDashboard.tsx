'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Play, Search, BookOpen, Flame, Trophy, Clock, CheckCircle2,
    TrendingUp, Eye, Award, ChevronRight, Loader2, X
} from 'lucide-react';
import { YouTubeVideo } from '@/types/learning';
import { searchYouTubeVideos, getVideoByUrl } from '@/lib/youtubeApi';
import { useUser } from '@/context/UserContext';

type Tab = 'discover' | 'continue' | 'history';

const STORAGE_KEY = 'vitgroww_learning_progress';
const HISTORY_KEY = 'vitgroww_learning_history';

interface WatchEntry {
    videoId: string;
    watchedAt: string;
    watchDuration: number;
    completed: boolean;
    pointsEarned: number;
}

function loadWatchHistory(): WatchEntry[] {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveWatchHistory(history: WatchEntry[]) {
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch { /* ignore */ }
}

export default function YouTubeStudyDashboard() {
    const { user, updateUser } = useUser();
    const [activeTab, setActiveTab] = useState<Tab>('discover');
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
    const [searchFocused, setSearchFocused] = useState(false);

    const watchHistory = useMemo(() => loadWatchHistory(), []);
    const watchedIds = useMemo(() => new Set(watchHistory.filter(w => w.completed).map(w => w.videoId)), [watchHistory]);

    const stats = useMemo(() => {
        const completed = watchHistory.filter(w => w.completed);
        const totalWatchTime = watchHistory.reduce((acc, w) => acc + w.watchDuration, 0);
        const totalPoints = watchHistory.reduce((acc, w) => acc + w.pointsEarned, 0);
        const streak = computeStreak(watchHistory);
        return {
            videosWatched: completed.length,
            watchTime: Math.round(totalWatchTime / 60),
            streak,
            points: totalPoints + (user.totalPoints || 0),
        };
    }, [watchHistory, user.totalPoints]);

    const continueWatching = useMemo(() => {
        return videos
            .filter(v => watchHistory.some(w => w.videoId === v.id && !w.completed))
            .slice(0, 6);
    }, [videos, watchHistory]);

    useEffect(() => {
        handleSearch('VIT Computer Science tutorials');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = async (query: string) => {
        if (!query.trim()) return;
        setIsLoading(true);
        setSearchQuery(query);
        try {
            const results = await searchYouTubeVideos(query, 24);
            setVideos(results);
        } catch (e) {
            console.error('Search failed:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVideoClick = (video: YouTubeVideo) => {
        setSelectedVideo(video);
        const entry: WatchEntry = {
            videoId: video.id,
            watchedAt: new Date().toISOString(),
            watchDuration: 0,
            completed: false,
            pointsEarned: 0,
        };
        const updated = [entry, ...watchHistory.filter(w => w.videoId !== video.id)].slice(0, 200);
        saveWatchHistory(updated);
        window.dispatchEvent(new CustomEvent('learning-history-updated'));
    };

    const handleMarkComplete = (videoId: string) => {
        const updated = watchHistory.map(w =>
            w.videoId === videoId && !w.completed
                ? { ...w, completed: true, watchDuration: w.watchDuration + 600, pointsEarned: 50 }
                : w
        );
        saveWatchHistory(updated);
        window.dispatchEvent(new CustomEvent('learning-history-updated'));
        if (selectedVideo?.id === videoId) {
            setSelectedVideo(null);
        }
    };

    const StatCard = ({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: 'cyan' | 'violet' | 'emerald' | 'amber' }) => {
        const colors: Record<string, string> = {
            cyan: 'text-cyan-400',
            violet: 'text-violet-400',
            emerald: 'text-emerald-400',
            amber: 'text-amber-400',
        };
        return (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/10 transition-colors">
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-mono mb-1">{label}</p>
                <p className={`text-2xl font-bold font-mono ${colors[accent || 'cyan']}`}>{value}</p>
                {sub && <p className="text-[10px] text-white/30 mt-0.5">{sub}</p>}
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold tracking-tight text-white">
                        Learning <span style={{ color: 'var(--accent-primary)' }}>Hub</span>
                    </h1>
                    <p className="mt-1 text-white/40 text-sm">Track progress and learn from curated YouTube content.</p>
                </div>

                {/* Search */}
                <div className={`relative w-full md:w-96 transition-all duration-200 ${searchFocused ? 'scale-[1.01]' : ''}`}>
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch(searchQuery)}
                        placeholder="Search topics, subjects, playlists..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => { setSearchQuery(''); setVideos([]); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Videos Watched" value={stats.videosWatched} sub="Completed" accent="emerald" />
                <StatCard label="Watch Time" value={`${stats.watchTime}m`} sub="Total learning time" accent="cyan" />
                <StatCard label="Streak" value={`${stats.streak}d`} sub="Keep it going!" accent="amber" />
                <StatCard label="XP Earned" value={stats.points} sub="All time" accent="violet" />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-white/[0.02] border border-white/[0.06] rounded-xl w-fit">
                {[
                    { id: 'discover' as Tab, label: 'Discover', icon: Search },
                    { id: 'continue' as Tab, label: 'Continue Watching', icon: Play },
                    { id: 'history' as Tab, label: 'History', icon: Clock },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${activeTab === tab.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
                    >
                        <tab.icon size={12} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'discover' && (
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={32} className="text-cyan-400 animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {videos.map((video, idx) => (
                                <motion.div
                                    key={video.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.02 }}
                                    className="group cursor-pointer"
                                    onClick={() => handleVideoClick(video)}
                                >
                                    <div className="relative aspect-video rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.06] group-hover:border-cyan-500/30 transition-all">
                                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="w-10 h-10 rounded-full bg-cyan-500/90 flex items-center justify-center">
                                                <Play size={16} className="text-white ml-0.5" fill="white" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-white font-mono">
                                            {video.duration}
                                        </div>
                                        {watchedIds.has(video.id) && (
                                            <div className="absolute top-1 left-1 w-5 h-5 rounded bg-emerald-500/90 flex items-center justify-center">
                                                <CheckCircle2 size={12} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="text-xs font-medium text-white/80 line-clamp-2 mt-1.5 group-hover:text-cyan-400 transition-colors">{video.title}</h4>
                                    <p className="text-[10px] text-white/40 mt-0.5">{video.channelTitle}</p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'continue' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {continueWatching.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-white/30 text-sm">
                            No videos in progress. Start watching to see them here.
                        </div>
                    ) : (
                        continueWatching.map((video, idx) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className="group cursor-pointer"
                                onClick={() => handleVideoClick(video)}
                            >
                                <div className="relative aspect-video rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.06] group-hover:border-cyan-500/30 transition-all">
                                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-10 h-10 rounded-full bg-cyan-500/90 flex items-center justify-center">
                                            <Play size={16} className="text-white ml-0.5" fill="white" />
                                        </div>
                                    </div>
                                </div>
                                <h4 className="text-xs font-medium text-white/80 line-clamp-2 mt-1.5 group-hover:text-cyan-400 transition-colors">{video.title}</h4>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="space-y-2">
                    {watchHistory.length === 0 ? (
                        <div className="text-center py-20 text-white/30 text-sm">No watch history yet.</div>
                    ) : (
                        watchHistory.slice(0, 50).map((entry, idx) => (
                            <div key={`${entry.videoId}-${entry.watchedAt}-${idx}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                    {entry.completed ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Play size={14} className="text-cyan-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white/80 truncate">{entry.videoId}</p>
                                    <p className="text-[10px] text-white/30 font-mono">{new Date(entry.watchedAt).toLocaleDateString()}</p>
                                </div>
                                <span className="text-[10px] text-white/30 font-mono">{Math.round(entry.watchDuration / 60)}m</span>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Video Player Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedVideo(null)}>
                    <div className="w-full max-w-4xl bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <h3 className="text-sm font-semibold text-white truncate pr-4">{selectedVideo.title}</h3>
                            <button onClick={() => setSelectedVideo(null)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                                <X size={16} className="text-white/60" />
                            </button>
                        </div>
                        <div className="aspect-video w-full bg-black">
                            <iframe
                                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0`}
                                title={selectedVideo.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            />
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-white/60">{selectedVideo.channelTitle}</p>
                                <p className="text-[10px] text-white/30 mt-0.5">{selectedVideo.viewCount?.toLocaleString()} views</p>
                            </div>
                            {!watchedIds.has(selectedVideo.id) && (
                                <button
                                    onClick={() => handleMarkComplete(selectedVideo.id)}
                                    className="px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-colors flex items-center gap-1.5"
                                >
                                    <CheckCircle2 size={14} />
                                    Mark Complete (+50 XP)
                                </button>
                            )}
                            {watchedIds.has(selectedVideo.id) && (
                                <span className="text-xs text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 size={14} /> Completed
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function computeStreak(history: WatchEntry[]): number {
    if (!history.length) return 0;
    const days = [...new Set(history.map(w => new Date(w.watchedAt).toISOString().split('T')[0]))].sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let current = days[0] === today ? today : days[0] === yesterday ? yesterday : null;
    if (!current) return 0;
    for (let i = 0; i < days.length; i++) {
        const expected = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
        if (days[i] === expected) streak++;
        else break;
    }
    return streak;
}
