'use client';

import { useState, useEffect } from 'react';
import {
    X, ExternalLink, Download, Star, Eye, Clock, Shield, FileText,
    Video, Code, BookOpen, FileSpreadsheet, Bookmark, Share2, ChevronRight,
    CheckCircle
} from 'lucide-react';
import type { Resource } from '@/data/mockData';
import { summarizeResource } from '@/data/mockBackend';

// Toast notification component
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 2000);
        return () => clearTimeout(timer);
    }, [onClose]);
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/30 animate-in-slide">
            <CheckCircle size={16} />
            {message}
            <style jsx>{`
                .animate-in-slide {
                    animation: slideUp 0.3s ease-out;
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translate(-50%, 20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
            `}</style>
        </div>
    );
}

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    PDF: { icon: <FileText size={20} />, color: 'text-red-400', bg: 'bg-red-500/10' },
    PPTX: { icon: <FileSpreadsheet size={20} />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    VIDEO: { icon: <Video size={20} />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    DOCX: { icon: <FileText size={20} />, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    CODE: { icon: <Code size={20} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    NOTES: { icon: <BookOpen size={20} />, color: 'text-violet-400', bg: 'bg-violet-500/10' },
};

interface KnowledgeCardProps {
    resource: Resource;
    onClose: () => void;
}

export default function KnowledgeCard({ resource, onClose }: KnowledgeCardProps) {
    const [summary, setSummary] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const [displayedText, setDisplayedText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<string | null>(null);
    const [isBookmarked, setIsBookmarked] = useState(false);

    // Check if resource is bookmarked
    useEffect(() => {
        const saved = localStorage.getItem('oracleBookmarks');
        if (saved) {
            const bookmarks = JSON.parse(saved) as number[];
            setIsBookmarked(bookmarks.includes(resource.id));
        }
    }, [resource.id]);

    const showToast = (message: string) => {
        setToast(message);
    };

    const handleView = () => {
        window.open(resource.url, '_blank');
        showToast('Opening in new tab...');
    };

    const handleDownload = () => {
        // Create a temporary link for download
        const link = document.createElement('a');
        link.href = resource.url;
        link.download = resource.title;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Download started!');
    };

    const handleBookmark = () => {
        const saved = localStorage.getItem('oracleBookmarks');
        let bookmarks: number[] = saved ? JSON.parse(saved) : [];
        
        if (isBookmarked) {
            bookmarks = bookmarks.filter(id => id !== resource.id);
            showToast('Removed from bookmarks');
        } else {
            bookmarks.push(resource.id);
            showToast('Added to bookmarks!');
        }
        
        localStorage.setItem('oracleBookmarks', JSON.stringify(bookmarks));
        setIsBookmarked(!isBookmarked);
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: resource.title,
                    text: resource.summary.slice(0, 100) + '...',
                    url: resource.url,
                });
            } else {
                await navigator.clipboard.writeText(resource.url);
                showToast('Link copied to clipboard!');
            }
        } catch {
            showToast('Failed to share');
        }
    };

    const tc = typeConfig[resource.type] || typeConfig.PDF;

    // Simulate AI summary loading + typing effect
    useEffect(() => {
        setIsLoading(true);
        setDisplayedText('');
        setSummary('');

        summarizeResource(resource.id).then((text) => {
            setSummary(text);
            setIsLoading(false);
        });
    }, [resource.id]);

    useEffect(() => {
        if (!summary || isLoading) return;
        setIsTyping(true);
        let i = 0;
        const interval = setInterval(() => {
            if (i < summary.length) {
                setDisplayedText(summary.slice(0, i + 1));
                i++;
            } else {
                setIsTyping(false);
                clearInterval(interval);
            }
        }, 15);
        return () => clearInterval(interval);
    }, [summary, isLoading]);

    // Trust score ring
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (resource.trust / 100) * circumference;
    const trustColor =
        resource.trust >= 90 ? '#10b981' : resource.trust >= 70 ? '#f59e0b' : '#ef4444';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Card */}
            <div className="relative w-full max-w-2xl bg-slate-900/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden animate-in-scale max-h-[85vh] overflow-y-auto">
                {/* Gradient top accent */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

                {/* Header */}
                <div className="p-6 pb-0">
                    <div className="flex items-start gap-4">
                        {/* Type icon */}
                        <div className={`w-14 h-14 rounded-xl ${tc.bg} flex items-center justify-center flex-shrink-0 border border-white/[0.06] ${tc.color}`}>
                            {tc.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${tc.bg} ${tc.color}`}>
                                    {resource.type}
                                </span>
                                <span className="text-[11px] text-white/30">{resource.course}</span>
                            </div>
                            <h2 className="text-lg font-semibold text-white/90 leading-snug">
                                {resource.title.replace(/[_]/g, ' ').replace(/\.\w+$/, '')}
                            </h2>
                            <p className="text-xs text-white/40 mt-1">
                                by {resource.author} · {resource.date} · {resource.category}
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-5 mt-5 py-4 border-t border-b border-white/[0.06]">
                        <div className="flex items-center gap-1.5 text-white/40">
                            <Eye size={14} />
                            <span className="text-xs">{resource.views.toLocaleString()} views</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/40">
                            <Star size={14} className="text-amber-400" />
                            <span className="text-xs">{resource.rating}/5.0</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/40">
                            <Clock size={14} />
                            <span className="text-xs">{resource.date}</span>
                        </div>

                        {/* Trust Score ring */}
                        <div className="ml-auto flex items-center gap-3">
                            <div className="relative w-12 h-12">
                                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 96 96">
                                    <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="40"
                                        fill="none"
                                        stroke={trustColor}
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        className="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: trustColor }}>
                                    {resource.trust}
                                </span>
                            </div>
                            <div>
                                <p className="text-[11px] text-white/50 flex items-center gap-1">
                                    <Shield size={10} /> Trust Score
                                </p>
                                <p className="text-xs font-medium" style={{ color: trustColor }}>
                                    {resource.trust >= 90 ? 'Verified' : resource.trust >= 70 ? 'Good' : 'Unverified'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Summary */}
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">AI</span>
                        </div>
                        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                            AI-Generated Summary
                        </h3>
                        {isLoading && (
                            <span className="text-[11px] text-cyan-400/60 animate-pulse ml-2">
                                Extracting text...
                            </span>
                        )}
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        {isLoading ? (
                            <div className="space-y-2">
                                <div className="h-3 bg-white/[0.06] rounded animate-pulse w-full" />
                                <div className="h-3 bg-white/[0.06] rounded animate-pulse w-5/6" />
                                <div className="h-3 bg-white/[0.06] rounded animate-pulse w-4/6" />
                            </div>
                        ) : (
                            <p className="text-sm text-white/70 leading-relaxed">
                                {displayedText}
                                {isTyping && (
                                    <span className="inline-block w-[2px] h-4 bg-cyan-400 ml-0.5 animate-pulse align-middle" />
                                )}
                            </p>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {resource.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/40 hover:text-white/60 hover:bg-white/[0.06] transition-colors cursor-pointer"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex flex-wrap gap-2">
                    <button 
                        onClick={handleView}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20"
                    >
                        <ExternalLink size={14} />
                        View on Drive
                    </button>
                    <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 text-sm font-medium hover:bg-white/[0.1] hover:text-white/80 transition-colors"
                    >
                        <Download size={14} />
                        Download
                    </button>
                    <button 
                        onClick={handleBookmark}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                            isBookmarked 
                                ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' 
                                : 'bg-white/[0.06] border-white/[0.08] text-white/60 hover:bg-white/[0.1] hover:text-white/80'
                        }`}
                    >
                        <Bookmark size={14} className={isBookmarked ? 'fill-current' : ''} />
                        {isBookmarked ? 'Saved' : 'Save'}
                    </button>
                    <button 
                        onClick={handleShare}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 text-sm font-medium hover:bg-white/[0.1] hover:text-white/80 transition-colors"
                    >
                        <Share2 size={14} />
                        Share
                    </button>
                </div>

                {/* Toast */}
                {toast && <Toast message={toast} onClose={() => setToast(null)} />}

                {/* Related resources hint */}
                <div className="px-6 pb-6">
                    <button className="w-full flex items-center justify-between p-3 rounded-xl bg-violet-500/5 border border-violet-500/10 text-violet-400/70 hover:text-violet-400 transition-colors group">
                        <span className="text-xs font-medium">View Past Year Exam Questions →</span>
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            <style jsx>{`
        .animate-in-scale {
          animation: scaleIn 0.25s ease-out;
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
        </div>
    );
}
