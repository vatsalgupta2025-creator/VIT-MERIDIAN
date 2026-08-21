// ============================================================
// VITGROWW Learning Hub — YouTube API Service
// Supports both env-var API key and runtime user-supplied key
// ============================================================

import { YouTubeVideo } from '@/types/learning';
import { YOUTUBE_API_CONFIG, parseDuration, formatViewCount } from '@/data/learningData';

const ENV_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || 'AIzaSyDwrXOb_52JLUDn8GC3ygKoO5als-eIcmA';


// ── Internal helpers ─────────────────────────────────────────

interface YouTubeSearchItem {
    id: { videoId: string };
    snippet: {
        title: string;
        description: string;
        channelTitle: string;
        channelId: string;
        publishedAt: string;
        thumbnails: { default: { url: string }; medium: { url: string }; high: { url: string } };
    };
}

interface YouTubeVideoItem {
    id: string;
    snippet: {
        title: string;
        description: string;
        channelTitle: string;
        channelId: string;
        publishedAt: string;
        thumbnails: { default: { url: string }; medium: { url: string }; high: { url: string } };
    };
    contentDetails: { duration: string };
    statistics: { viewCount: string; likeCount: string };
}

function mapVideoItem(item: YouTubeVideoItem): YouTubeVideo {
    return {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default.url,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        duration: item.contentDetails.duration,
        viewCount: parseInt(item.statistics.viewCount) || 0,
        likeCount: parseInt(item.statistics.likeCount) || 0,
    };
}

// ── Extract video ID from any YouTube URL format ─────────────

export function extractVideoId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/, // bare ID
    ];
    for (const re of patterns) {
        const m = url.match(re);
        if (m) return m[1];
    }
    return null;
}

// ── Extract playlist ID from URL ─────────────────────────────

export function extractPlaylistId(url: string): string | null {
    const m = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    return m ? m[1] : null;
}

// ── Fetch details for a single video by URL or ID ────────────

export async function getVideoByUrl(urlOrId: string, apiKey?: string): Promise<YouTubeVideo | null> {
    const key = apiKey || ENV_API_KEY;
    if (!key) return null;
    const videoId = extractVideoId(urlOrId);
    if (!videoId) return null;

    try {
        const url = `${YOUTUBE_API_CONFIG.baseUrl}/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${key}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('YouTube API error');
        const data = await res.json();
        if (!data.items?.length) return null;
        return mapVideoItem(data.items[0]);
    } catch (e) {
        console.error('getVideoByUrl error:', e);
        return null;
    }
}

// ── Search videos ─────────────────────────────────────────────

export async function searchYouTubeVideos(query: string, maxResults = 20, apiKey?: string): Promise<YouTubeVideo[]> {
    const key = apiKey || ENV_API_KEY;
    if (!key) {
        console.warn('YouTube API key not set — using mock data.');
        return getMockVideos(query);
    }

    try {
        const eduQuery = `${query} tutorial lecture`;
        const searchUrl = `${YOUTUBE_API_CONFIG.baseUrl}/search?part=snippet&q=${encodeURIComponent(eduQuery)}&type=video&maxResults=${Math.min(50, maxResults)}&order=relevance&videoDuration=medium&key=${key}`;
        const searchRes = await fetch(searchUrl);
        if (!searchRes.ok) throw new Error('Search failed');
        const searchData = await searchRes.json();
        if (!searchData.items?.length) return [];

        const ids = searchData.items.map((i: YouTubeSearchItem) => i.id.videoId).join(',');
        const detRes = await fetch(`${YOUTUBE_API_CONFIG.baseUrl}/videos?part=contentDetails,statistics,snippet&id=${ids}&key=${key}`);
        if (!detRes.ok) throw new Error('Details failed');
        const detData = await detRes.json();
        return (detData.items as YouTubeVideoItem[]).map(mapVideoItem).sort((a, b) => b.viewCount - a.viewCount);
    } catch (e) {
        console.error('searchYouTubeVideos error:', e);
        return getMockVideos(query);
    }
}

// ── Get playlist videos ───────────────────────────────────────

export async function getPlaylistVideos(playlistId: string, maxResults = 30, apiKey?: string): Promise<YouTubeVideo[]> {
    const key = apiKey || ENV_API_KEY;
    if (!key) return getMockVideos('playlist');

    try {
        const listUrl = `${YOUTUBE_API_CONFIG.baseUrl}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${Math.min(50, maxResults)}&key=${key}`;
        const listRes = await fetch(listUrl);
        if (!listRes.ok) throw new Error('Playlist fetch failed');
        const listData = await listRes.json();
        if (!listData.items?.length) return [];

        const ids = listData.items
            .map((i: { snippet: { resourceId: { videoId: string } } }) => i.snippet.resourceId.videoId)
            .join(',');
        const detRes = await fetch(`${YOUTUBE_API_CONFIG.baseUrl}/videos?part=contentDetails,statistics,snippet&id=${ids}&key=${key}`);
        if (!detRes.ok) throw new Error('Details failed');
        const detData = await detRes.json();
        return (detData.items as YouTubeVideoItem[]).map(mapVideoItem);
    } catch (e) {
        console.error('getPlaylistVideos error:', e);
        return getMockVideos('playlist');
    }
}

// ── Get video details by ID ───────────────────────────────────

export async function getVideoDetails(videoId: string, apiKey?: string): Promise<YouTubeVideo | null> {
    return getVideoByUrl(videoId, apiKey);
}

// ── Mock data fallback ────────────────────────────────────────

function getMockVideos(query: string): YouTubeVideo[] {
    const mockVideos: YouTubeVideo[] = [
        { id: 'RBSGKlAvoiM', title: 'Introduction to Data Structures and Algorithms', description: 'Learn the fundamentals of data structures and algorithms.', thumbnail: 'https://i.ytimg.com/vi/RBSGKlAvoiM/maxresdefault.jpg', channelTitle: 'Abdul Bari', channelId: 'UCZCFT11CWBi3MHNlGf019nw', publishedAt: '2023-01-15T10:00:00Z', duration: 'PT45M30S', viewCount: 1250000, likeCount: 45000 },
        { id: 'bMknfKXIFA8', title: 'React Tutorial for Beginners', description: 'Complete React tutorial covering components, hooks, and state management.', thumbnail: 'https://i.ytimg.com/vi/bMknfKXIFA8/maxresdefault.jpg', channelTitle: 'Academind', channelId: 'UCSJbGtTlrDami-tDGPUV9-w', publishedAt: '2023-06-01T08:00:00Z', duration: 'PT2H10M', viewCount: 2100000, likeCount: 72000 },
        { id: 'rfscVS0vtbw', title: 'Python Tutorial - Full Course for Beginners', description: 'A complete Python tutorial for absolute beginners.', thumbnail: 'https://i.ytimg.com/vi/rfscVS0vtbw/maxresdefault.jpg', channelTitle: 'freeCodeCamp', channelId: 'UC8butISFssTIElRVOmh-0Og', publishedAt: '2023-03-10T14:00:00Z', duration: 'PT4H26M', viewCount: 15000000, likeCount: 320000 },
        { id: 'ukzFI9rgwfU', title: 'Machine Learning Basics', description: 'Introduction to machine learning concepts and algorithms.', thumbnail: 'https://i.ytimg.com/vi/ukzFI9rgwfU/maxresdefault.jpg', channelTitle: 'Stanford', channelId: 'UC-EnprmTZC_hBkQKtMk6XZg', publishedAt: '2022-09-15T12:00:00Z', duration: 'PT55M', viewCount: 3200000, likeCount: 95000 },
        { id: 'i7twT3U2_XQ', title: 'System Design Interview - Step by Step', description: 'Learn how to approach system design interviews.', thumbnail: 'https://i.ytimg.com/vi/i7twT3U2_XQ/maxresdefault.jpg', channelTitle: 'Gaurav Sen', channelId: 'UCRPMAqdtSgd0Ipeef7iFsKw', publishedAt: '2023-02-20T09:00:00Z', duration: 'PT38M', viewCount: 890000, likeCount: 28000 },
    ];
    if (query) {
        const lq = query.toLowerCase();
        const filtered = mockVideos.filter(v => v.title.toLowerCase().includes(lq) || v.description.toLowerCase().includes(lq));
        return filtered.length ? filtered : mockVideos;
    }
    return mockVideos;
}

// Re-export utility fns used by other files
export { parseDuration, formatViewCount };