'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, FileText, Video, Code, BookOpen, FileSpreadsheet, Sparkles } from 'lucide-react';
import { searchResources, getAutocompleteSuggestions } from '@/data/mockBackend';
import type { Resource } from '@/data/mockData';
import KnowledgeCard from './KnowledgeCard';

const typeIcons: Record<string, React.ReactNode> = {
    PDF: <FileText size={14} className="text-red-400" />,
    PPTX: <FileSpreadsheet size={14} className="text-amber-400" />,
    VIDEO: <Video size={14} className="text-blue-400" />,
    DOCX: <FileText size={14} className="text-sky-400" />,
    CODE: <Code size={14} className="text-emerald-400" />,
    NOTES: <BookOpen size={14} className="text-violet-400" />,
};

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [results, setResults] = useState<Resource[]>([]);
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [showResults, setShowResults] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSearch = useCallback((searchTerm: string) => {
        const found = searchResources(searchTerm);
        setResults(found);
        setShowResults(true);
        setSuggestions([]);
    }, []);

    useEffect(() => {
        if (query.length >= 2) {
            const sug = getAutocompleteSuggestions(query);
            setSuggestions(sug);
        } else {
            setSuggestions([]);
        }
    }, [query]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setSuggestions([]);
                if (!selectedResource) setShowResults(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedResource]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && query.trim()) {
            handleSearch(query);
        }
        if (e.key === 'Escape') {
            setQuery('');
            setSuggestions([]);
            setShowResults(false);
            setSelectedResource(null);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-3xl mx-auto">
            {/* Search Input */}
            <div
                className={`relative flex items-center gap-3 rounded-2xl transition-all duration-300 ${isFocused
                        ? 'bg-white/[0.08] border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.08)]'
                        : 'bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.06]'
                    } border backdrop-blur-xl`}
            >
                <Search
                    size={18}
                    className={`ml-4 transition-colors flex-shrink-0 ${isFocused ? 'text-cyan-400' : 'text-white/30'
                        }`}
                />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search the Knowledge Mesh — resources, notes, lectures..."
                    className="flex-1 bg-transparent py-3.5 text-sm text-white/90 placeholder-white/25 outline-none"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            setResults([]);
                            setShowResults(false);
                            setSelectedResource(null);
                        }}
                        className="mr-2 p-1 rounded-full hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}
                <button
                    onClick={() => query.trim() && handleSearch(query)}
                    className="mr-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
                >
                    <Sparkles size={12} />
                    Search
                </button>
            </div>

            {/* Autocomplete Dropdown */}
            {suggestions.length > 0 && !showResults && (
                <div className="absolute top-full mt-2 w-full bg-slate-900/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden animate-in">
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setQuery(s);
                                handleSearch(s);
                            }}
                            className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-white/70 hover:bg-white/[0.05] hover:text-white/90 transition-colors border-b border-white/[0.04] last:border-0"
                        >
                            <Search size={14} className="text-white/20 flex-shrink-0" />
                            <span>{s}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Search Results */}
            {showResults && results.length > 0 && !selectedResource && (
                <div className="absolute top-full mt-2 w-full bg-slate-900/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl z-50 max-h-[420px] overflow-y-auto animate-in">
                    <div className="px-4 py-2.5 border-b border-white/[0.06]">
                        <p className="text-xs text-white/30 font-medium">
                            {results.length} result{results.length !== 1 ? 's' : ''} found
                        </p>
                    </div>
                    {results.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => setSelectedResource(r)}
                            className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-white/[0.05] transition-colors border-b border-white/[0.03] last:border-0 group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0 border border-white/[0.06]">
                                {typeIcons[r.type]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white/80 font-medium truncate group-hover:text-cyan-400 transition-colors">
                                    {r.title.replace(/[_]/g, ' ').replace(/\.\w+$/, '')}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] text-white/30">{r.course}</span>
                                    <span className="text-white/10">·</span>
                                    <span className="text-[11px] text-white/30">{r.type}</span>
                                </div>
                            </div>
                            <div
                                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${r.trust >= 90
                                        ? 'bg-emerald-500/15 text-emerald-400'
                                        : r.trust >= 70
                                            ? 'bg-amber-500/15 text-amber-400'
                                            : 'bg-red-500/15 text-red-400'
                                    }`}
                            >
                                {r.trust}%
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* No results */}
            {showResults && results.length === 0 && query.trim() && (
                <div className="absolute top-full mt-2 w-full bg-slate-900/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl z-50 p-8 text-center animate-in">
                    <p className="text-white/30 text-sm">No resources found for &ldquo;{query}&rdquo;</p>
                    <p className="text-white/15 text-xs mt-1">Try different keywords or browse categories</p>
                </div>
            )}

            {/* Knowledge Card overlay */}
            {selectedResource && (
                <KnowledgeCard
                    resource={selectedResource}
                    onClose={() => setSelectedResource(null)}
                />
            )}
        </div>
    );
}
