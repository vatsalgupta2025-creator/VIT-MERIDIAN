'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Play, Search, BookOpen, Trophy, Clock, X,
  Award, TrendingUp, Flame, CheckCircle, Zap,
  Loader2, Sparkles, Brain, Eye, Crown, Medal,
  Hexagon, Key, Link, Plus, Trash2, ListVideo,
  AlertCircle,
} from 'lucide-react';

const YOUTUBE_API_KEY = 'AIzaSyBO51V6jlM98u5BvRyfyE6PPbWyHC7S_tI';
const YOUTUBE_BASE = 'https://www.googleapis.com/youtube/v3';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration: string;
  viewCount: number;
}

// ── Fallback mock data so the UI is never empty ──────────────
const FALLBACK_DSA: Video[] = [
  { id: 'RBSGKlAvoiM', title: 'Data Structures Full Course - Learn DSA in 8 Hours', description: '', thumbnail: 'https://i.ytimg.com/vi/RBSGKlAvoiM/hqdefault.jpg', channelTitle: 'Abdul Bari', publishedAt: '2023-01-15', duration: '8:05:30', viewCount: 1250000 },
  { id: '8hly31xKli0', title: 'Algorithms & Data Structures Tutorial - Full Course for Beginners', description: '', thumbnail: 'https://i.ytimg.com/vi/8hly31xKli0/hqdefault.jpg', channelTitle: 'freeCodeCamp', publishedAt: '2022-06-01', duration: '5:22:00', viewCount: 4200000 },
  { id: 'oz9cEqFynHU', title: 'Data Structures Easy to Advanced Full Tutorial from a Google Engineer', description: '', thumbnail: 'https://i.ytimg.com/vi/oz9cEqFynHU/hqdefault.jpg', channelTitle: 'William Fiset', publishedAt: '2021-09-10', duration: '8:03:12', viewCount: 3100000 },
  { id: 'xLetJpcjHS0', title: 'Complete DSA Course - Learn Data Structures and Algorithms', description: '', thumbnail: 'https://i.ytimg.com/vi/xLetJpcjHS0/hqdefault.jpg', channelTitle: 'Apna College', publishedAt: '2023-03-20', duration: '12:30:00', viewCount: 2500000 },
  { id: 'rZ41y93P2Qo', title: 'Sorting Algorithms Explained Visually', description: '', thumbnail: 'https://i.ytimg.com/vi/rZ41y93P2Qo/hqdefault.jpg', channelTitle: 'Beyond Fireship', publishedAt: '2023-07-15', duration: '12:45', viewCount: 1800000 },
  { id: 'kPRA0W1kECg', title: 'How I mastered Data Structures and Algorithms', description: '', thumbnail: 'https://i.ytimg.com/vi/kPRA0W1kECg/hqdefault.jpg', channelTitle: 'Coding Ninjas', publishedAt: '2023-05-10', duration: '15:22', viewCount: 950000 },
];

const FALLBACK_OS: Video[] = [
  { id: 'vBURTt97EkA', title: 'Operating Systems Full Course - 11 Hours', description: '', thumbnail: 'https://i.ytimg.com/vi/vBURTt97EkA/hqdefault.jpg', channelTitle: 'Neso Academy', publishedAt: '2022-04-12', duration: '11:02:00', viewCount: 3800000 },
  { id: '26QPDBe-NB8', title: 'OS Concepts - Process Management, Memory, Scheduling', description: '', thumbnail: 'https://i.ytimg.com/vi/26QPDBe-NB8/hqdefault.jpg', channelTitle: 'Gate Smashers', publishedAt: '2023-01-05', duration: '2:45:00', viewCount: 2100000 },
  { id: 'bkSWJJZNgf8', title: 'Operating System - Introduction & Types', description: '', thumbnail: 'https://i.ytimg.com/vi/bkSWJJZNgf8/hqdefault.jpg', channelTitle: 'Jenny Lectures', publishedAt: '2022-08-20', duration: '35:10', viewCount: 1600000 },
  { id: 'dz9GcOGRFU8', title: 'CPU Scheduling Algorithms in Operating Systems', description: '', thumbnail: 'https://i.ytimg.com/vi/dz9GcOGRFU8/hqdefault.jpg', channelTitle: 'Education 4u', publishedAt: '2022-03-15', duration: '42:30', viewCount: 900000 },
  { id: 'Jkmy2YLUbCI', title: 'Memory Management in Operating Systems', description: '', thumbnail: 'https://i.ytimg.com/vi/Jkmy2YLUbCI/hqdefault.jpg', channelTitle: 'Neso Academy', publishedAt: '2022-06-01', duration: '55:00', viewCount: 1200000 },
  { id: 'LKe7xk0bF-o', title: 'Deadlock in Operating System Explained', description: '', thumbnail: 'https://i.ytimg.com/vi/LKe7xk0bF-o/hqdefault.jpg', channelTitle: 'Gate Smashers', publishedAt: '2023-02-10', duration: '28:15', viewCount: 750000 },
];

// ── Helpers ──────────────────────────────────────────────────
function parseDuration(duration: string): string {
  if (!duration.startsWith('PT')) return duration;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  const h = match[1] ? parseInt(match[1]) : 0;
  const m = match[2] ? parseInt(match[2]) : 0;
  const s = match[3] ? parseInt(match[3]) : 0;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatViews(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

// ── YouTube Data API Fetcher ────────────────────────────────
async function fetchYouTubeVideos(query: string): Promise<Video[]> {
  try {
    const searchUrl = `${YOUTUBE_BASE}/search?part=snippet&q=${encodeURIComponent(query + ' tutorial lecture')}&type=video&maxResults=12&order=relevance&videoDuration=medium&key=${YOUTUBE_API_KEY}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) throw new Error(`Search failed: ${searchRes.status}`);
    const searchData = await searchRes.json();
    if (!searchData.items?.length) return [];

    const ids = searchData.items.map((i: any) => i.id.videoId).join(',');
    const detUrl = `${YOUTUBE_BASE}/videos?part=contentDetails,statistics,snippet&id=${ids}&key=${YOUTUBE_API_KEY}`;
    const detRes = await fetch(detUrl);
    if (!detRes.ok) throw new Error(`Details failed: ${detRes.status}`);
    const detData = await detRes.json();

    return (detData.items || []).map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
      duration: parseDuration(item.contentDetails.duration),
      viewCount: parseInt(item.statistics.viewCount) || 0,
    })).sort((a: Video, b: Video) => b.viewCount - a.viewCount);
  } catch (err) {
    console.error('YouTube API error:', err);
    return [];
  }
}

// ── Video Player Modal ──────────────────────────────────────
function VideoPlayerModal({ video, onClose }: { video: Video; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4" onClick={onClose}>
      <div className="relative w-full max-w-4xl bg-zinc-950 rounded-2xl overflow-hidden border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all">
          <X size={18} />
        </button>
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-white mb-1">{video.title}</h3>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span>{video.channelTitle}</span>
            <span className="flex items-center gap-1"><Eye size={14} />{formatViews(video.viewCount)} views</span>
            <span className="flex items-center gap-1"><Clock size={14} />{video.duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Video Card ──────────────────────────────────────────────
function VideoCard({ video, onClick }: { video: Video; onClick: () => void }) {
  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-white/[0.06] group-hover:border-cyan-500/40 transition-all">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg shadow-red-500/30">
            <Play size={24} className="text-white ml-1" fill="white" />
          </div>
        </div>
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[11px] text-white font-mono font-medium">
          {video.duration}
        </div>
      </div>
      <div className="mt-3 px-1">
        <h4 className="text-sm font-semibold text-zinc-200 line-clamp-2 group-hover:text-cyan-400 transition-colors leading-snug">{video.title}</h4>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500">
          <span className="truncate">{video.channelTitle}</span>
          <span className="flex items-center gap-1"><Eye size={11} />{formatViews(video.viewCount)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Learning Hub ───────────────────────────────────────
export default function LearningHub() {
  const [activeCategory, setActiveCategory] = useState<'DSA' | 'Operating System'>('DSA');
  const [dsaVideos, setDsaVideos] = useState<Video[]>([]);
  const [osVideos, setOsVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Video[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch videos for both categories on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const [dsaRes, osRes] = await Promise.all([
        fetchYouTubeVideos('DSA data structures algorithms'),
        fetchYouTubeVideos('Operating System OS concepts'),
      ]);

      setDsaVideos(dsaRes.length > 0 ? dsaRes : FALLBACK_DSA);
      setOsVideos(osRes.length > 0 ? osRes : FALLBACK_OS);
      setLoading(false);
    };
    load();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await fetchYouTubeVideos(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const currentVideos = searchResults.length > 0 
    ? searchResults 
    : activeCategory === 'DSA' ? dsaVideos : osVideos;

  const displayTitle = searchResults.length > 0 
    ? `Search results for "${searchQuery}"` 
    : activeCategory === 'DSA' ? 'Data Structures & Algorithms' : 'Operating Systems';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <Play size={20} className="text-white ml-0.5" fill="white" />
            </div>
            Learning Hub
          </h1>
          <p className="mt-2 text-zinc-400 text-sm">
            Watch curated educational videos on DSA & Operating Systems
          </p>
        </div>
        
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search any topic..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-cyan-500/50 transition-colors"
            />
            {searchQuery && (
              <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                <X size={14} />
              </button>
            )}
          </div>
          <button type="submit" disabled={isSearching} className="px-4 py-2.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-sm font-medium hover:bg-cyan-500/30 transition-colors disabled:opacity-50">
            {isSearching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
          </button>
        </form>
      </div>

      {/* Category Tabs */}
      {searchResults.length === 0 && (
        <div className="flex gap-3">
          {(['DSA', 'Operating System'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeCategory === cat 
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10' 
                  : 'bg-zinc-900/50 text-zinc-500 border border-zinc-800 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Section Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp size={18} className="text-cyan-500" />
          <h2 className="text-lg font-bold text-zinc-200">{displayTitle}</h2>
          <span className="text-sm text-zinc-600">({currentVideos.length} videos)</span>
        </div>
        {searchResults.length > 0 && (
          <button onClick={clearSearch} className="text-sm text-zinc-400 hover:text-white transition-colors">
            ← Back to categories
          </button>
        )}
      </div>

      {/* Video Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3 animate-pulse">
              <div className="aspect-video rounded-xl bg-zinc-800/50" />
              <div className="h-4 bg-zinc-800/50 rounded w-3/4" />
              <div className="h-3 bg-zinc-800/30 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : currentVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-zinc-900 flex items-center justify-center mb-4">
            <Search size={32} className="text-zinc-600" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-400 mb-2">No videos found</h3>
          <p className="text-sm text-zinc-600 text-center max-w-sm">
            Try a different search term, or check your internet connection.
          </p>
        </div>
      ) : (
        <>
          {/* Featured Hero Video */}
          <div 
            className="relative group cursor-pointer rounded-2xl overflow-hidden border border-white/[0.06] hover:border-cyan-500/30 transition-all"
            onClick={() => setSelectedVideo(currentVideos[0])}
          >
            <div className="aspect-[21/9] relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentVideos[0].thumbnail} alt={currentVideos[0].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-20 h-20 rounded-full bg-red-600/90 flex items-center justify-center shadow-2xl shadow-red-500/40">
                  <Play size={36} className="text-white ml-1" fill="white" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase rounded">Featured</span>
                  <span className="px-2 py-0.5 bg-white/10 text-white/70 text-[10px] font-medium rounded">{currentVideos[0].duration}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1 max-w-2xl">{currentVideos[0].title}</h3>
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                  <span>{currentVideos[0].channelTitle}</span>
                  <span className="flex items-center gap-1"><Eye size={14} />{formatViews(currentVideos[0].viewCount)} views</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rest of Videos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentVideos.slice(1).map(video => (
              <VideoCard key={video.id} video={video} onClick={() => setSelectedVideo(video)} />
            ))}
          </div>
        </>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </div>
  );
}
