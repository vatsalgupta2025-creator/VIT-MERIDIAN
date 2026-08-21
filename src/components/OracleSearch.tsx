'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Sparkles, TrendingUp, Clock, Bookmark, Filter, SlidersHorizontal,
  FileText, Video, Code, BookOpen, FileSpreadsheet, ChevronDown, ChevronRight,
  History, Star, Eye, Zap, Target, Brain, Mic, Globe, BookMarked,
  Download, Share2, ExternalLink, ArrowRight, RotateCcw, Trash2,
  LayoutGrid, List, CheckCircle2, AlertCircle
} from 'lucide-react';
import { resources, type Resource } from '@/data/mockData';
import { searchResources, getAutocompleteSuggestions } from '@/data/mockBackend';
import KnowledgeCard from './KnowledgeCard';
import confetti from 'canvas-confetti';

// Type icons mapping
const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  PDF: { icon: FileText, color: 'text-red-400', bg: 'bg-red-500/10', label: 'PDF Document' },
  PPTX: { icon: FileSpreadsheet, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Presentation' },
  VIDEO: { icon: Video, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Video' },
  DOCX: { icon: FileText, color: 'text-sky-400', bg: 'bg-sky-500/10', label: 'Document' },
  CODE: { icon: Code, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Code' },
  NOTES: { icon: BookOpen, color: 'text-violet-400', bg: 'bg-violet-500/10', label: 'Notes' },
};

const COURSES = ['All Courses', 'CS401', 'CS201', 'CS301', 'PHY201', 'CS501', 'CS102', 'CS302', 'MATH301', 'MATH202', 'CS303', 'CS402', 'CS405', 'CS404', 'CS403'];
const CATEGORIES = ['All Types', 'Study', 'Lecture', 'Tutorial', 'Lab'];

interface SearchFilters {
  type: string | null;
  course: string | null;
  category: string | null;
  minTrust: number;
  dateRange: 'all' | 'today' | 'week' | 'month';
}

export default function OracleSearch() {
  // Search state
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [results, setResults] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    type: null,
    course: null,
    category: null,
    minTrust: 0,
    dateRange: 'all',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // History & bookmarks
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Trending
  const [trendingSearches] = useState([
    'Database Normalization',
    'React Hooks',
    'Dynamic Programming',
    'Linked Lists',
    'Machine Learning',
    'Binary Trees',
    'Operating Systems',
    'Cybersecurity',
    'Neural Networks',
    'Graph Theory',
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('oracleSearchHistory');
    if (saved) setSearchHistory(JSON.parse(saved));
    const savedBookmarks = localStorage.getItem('oracleBookmarks');
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
  }, []);

  // Autocomplete suggestions
  useEffect(() => {
    if (query.length >= 2) {
      const sug = getAutocompleteSuggestions(query);
      setSuggestions(sug);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSuggestions([]);
        setShowHistory(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSuggestions([]);
        setShowHistory(false);
        setShowFilters(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setQuery(searchTerm);
    setSuggestions([]);
    setShowHistory(false);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const found = searchResources(searchTerm);
    
    // Apply filters
    let filtered = found;
    if (filters.type) filtered = filtered.filter(r => r.type === filters.type);
    if (filters.course && filters.course !== 'All Courses') filtered = filtered.filter(r => r.course.includes(filters.course!));
    if (filters.category && filters.category !== 'All Types') filtered = filtered.filter(r => r.category === filters.category);
    if (filters.minTrust > 0) filtered = filtered.filter(r => r.trust >= filters.minTrust);
    
    setResults(filtered);
    setShowResults(true);
    setIsSearching(false);
    
    // Save to history
    if (!searchHistory.includes(searchTerm)) {
      const newHistory = [searchTerm, ...searchHistory.slice(0, 9)];
      setSearchHistory(newHistory);
      localStorage.setItem('oracleSearchHistory', JSON.stringify(newHistory));
    }
    
    // Confetti for first search
    if (searchHistory.length === 0) {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }
  }, [filters, searchHistory]);

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('oracleSearchHistory');
  };

  const toggleBookmark = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newBookmarks = bookmarks.includes(id) 
      ? bookmarks.filter(b => b !== id)
      : [...bookmarks, id];
    setBookmarks(newBookmarks);
    localStorage.setItem('oracleBookmarks', JSON.stringify(newBookmarks));
    
    if (!bookmarks.includes(id)) {
      confetti({ particleCount: 20, spread: 30, origin: { y: 0.5 } });
    }
  };

  const filteredResults = useMemo(() => {
    return results.filter(r => {
      if (filters.type && r.type !== filters.type) return false;
      if (filters.course && filters.course !== 'All Courses' && !r.course.includes(filters.course)) return false;
      if (filters.category && filters.category !== 'All Types' && r.category !== filters.category) return false;
      if (r.trust < filters.minTrust) return false;
      return true;
    });
  }, [results, filters]);

  const bookmarkedResources = useMemo(() => {
    return resources.filter(r => bookmarks.includes(r.id));
  }, [bookmarks]);

  return (
    <div className="space-y-6" ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-500/20">
            <Brain size={20} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Oracle Search
            </h2>
            <p className="text-xs text-white/40">
              AI-powered knowledge discovery
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/80 transition-all"
          >
            {viewMode === 'grid' ? <List size={18} /> : <LayoutGrid size={18} />}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
              showFilters 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                : 'bg-white/[0.03] border-white/[0.06] text-white/60 hover:text-white'
            }`}
          >
            <SlidersHorizontal size={16} />
            <span className="text-sm">Filters</span>
            {(filters.type || filters.course || filters.minTrust > 0) && (
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
            )}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div
          className={`relative flex items-center gap-3 rounded-2xl transition-all duration-300 ${
            isFocused
              ? 'bg-white/[0.08] border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.12)]'
              : 'bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.06]'
          } border backdrop-blur-xl`}
        >
          <Search
            size={20}
            className={`ml-4 transition-colors flex-shrink-0 ${isFocused ? 'text-cyan-400' : 'text-white/30'}`}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setShowHistory(true);
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) handleSearch(query);
              if (e.key === 'Escape') {
                setSuggestions([]);
                setShowHistory(false);
              }
            }}
            placeholder="Search the Knowledge Mesh — resources, notes, lectures..."
            className="flex-1 bg-transparent py-4 text-base text-white/90 placeholder-white/25 outline-none"
          />
          
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                setShowResults(false);
                inputRef.current?.focus();
              }}
              className="p-2 rounded-full hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
            >
              <X size={18} />
            </button>
          )}
          
          <div className="hidden sm:flex items-center gap-1 px-2 mr-2">
            <span className="text-xs text-white/20 px-2 py-1 rounded bg-white/5">⌘K</span>
          </div>
          
          <button
            onClick={() => query.trim() && handleSearch(query)}
            disabled={isSearching}
            className="mr-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {isSearching ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Zap size={16} />
              </motion.div>
            ) : (
              <Sparkles size={16} />
            )}
            Search
          </button>
        </div>

        {/* Autocomplete / History Dropdown */}
        <AnimatePresence>
          {(suggestions.length > 0 || (showHistory && searchHistory.length > 0 && !query)) && !showResults && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 w-full bg-slate-900/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-2">
                  <p className="px-3 py-2 text-[11px] text-white/30 uppercase tracking-wider">Suggestions</p>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(s)}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-white/70 hover:bg-white/[0.05] hover:text-white/90 transition-colors rounded-xl"
                    >
                      <Search size={14} className="text-cyan-400/60" />
                      <span>{s}</span>
                      <ArrowRight size={14} className="ml-auto text-white/20" />
                    </button>
                  ))}
                </div>
              )}
              
              {/* Search History */}
              {showHistory && searchHistory.length > 0 && !query && (
                <div className="p-2 border-t border-white/[0.06]">
                  <div className="flex items-center justify-between px-3 py-2">
                    <p className="text-[11px] text-white/30 uppercase tracking-wider">Recent Searches</p>
                    <button
                      onClick={clearHistory}
                      className="text-[11px] text-white/30 hover:text-red-400 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={10} />
                      Clear
                    </button>
                  </div>
                  {searchHistory.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(term)}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-left text-sm text-white/60 hover:bg-white/[0.05] hover:text-white/90 transition-colors rounded-xl group"
                    >
                      <History size={14} className="text-white/30 group-hover:text-cyan-400/60" />
                      <span>{term}</span>
                      <ArrowRight size={14} className="ml-auto text-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* File Type */}
                <div>
                  <label className="text-xs text-white/40 mb-2 block">File Type</label>
                  <select
                    value={filters.type || ''}
                    onChange={(e) => setFilters(f => ({ ...f, type: e.target.value || null }))}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-cyan-500/30"
                  >
                    <option value="">All Types</option>
                    {Object.entries(typeConfig).map(([type, config]) => (
                      <option key={type} value={type}>{config.label}</option>
                    ))}
                  </select>
                </div>
                
                {/* Course */}
                <div>
                  <label className="text-xs text-white/40 mb-2 block">Course</label>
                  <select
                    value={filters.course || ''}
                    onChange={(e) => setFilters(f => ({ ...f, course: e.target.value || null }))}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-cyan-500/30"
                  >
                    {COURSES.map(course => (
                      <option key={course} value={course === 'All Courses' ? '' : course}>{course}</option>
                    ))}
                  </select>
                </div>
                
                {/* Category */}
                <div>
                  <label className="text-xs text-white/40 mb-2 block">Category</label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => setFilters(f => ({ ...f, category: e.target.value || null }))}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-cyan-500/30"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat === 'All Types' ? '' : cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                {/* Min Trust */}
                <div>
                  <label className="text-xs text-white/40 mb-2 block">Min Trust Score: {filters.minTrust}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.minTrust}
                    onChange={(e) => setFilters(f => ({ ...f, minTrust: parseInt(e.target.value) }))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="flex justify-between text-[10px] text-white/30 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
              
              {/* Reset Filters */}
              <div className="flex justify-end mt-4 pt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => setFilters({ type: null, course: null, category: null, minTrust: 0, dateRange: 'all' })}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white/40 hover:text-white/80 transition-colors"
                >
                  <RotateCcw size={14} />
                  Reset Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bookmarks Section (when no search) */}
      {!showResults && bookmarks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BookMarked size={16} className="text-amber-400" />
            <h3 className="text-sm font-medium text-white/80">Your Bookmarks</h3>
            <span className="text-xs text-white/40">({bookmarks.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {bookmarkedResources.slice(0, 3).map((resource) => (
              <motion.button
                key={resource.id}
                onClick={() => setSelectedResource(resource)}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/30 hover:bg-white/[0.05] transition-all text-left"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${typeConfig[resource.type]?.bg || 'bg-white/5'}`}>
                    {(() => {
                      const IconComponent = typeConfig[resource.type]?.icon || FileText;
                      return <IconComponent size={16} className={typeConfig[resource.type]?.color || 'text-white/40'} />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">{resource.title.replace(/[_]/g, ' ').replace(/\.\w+$/, '')}</p>
                    <p className="text-xs text-white/40">{resource.course}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Trending Searches */}
      {!showResults && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400" />
            <h3 className="text-sm font-medium text-white/80">Trending Now</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((term) => (
              <button
                key={term}
                onClick={() => handleSearch(term)}
                className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white/60 hover:text-white hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      <AnimatePresence mode="wait">
        {showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80">
                  <span className="font-bold text-cyan-400">{filteredResults.length}</span> result{filteredResults.length !== 1 ? 's' : ''} for "{query}"
                </p>
                {filteredResults.length !== results.length && (
                  <p className="text-xs text-white/40">
                    {results.length - filteredResults.length} hidden by filters
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowResults(false)}
                className="text-sm text-white/40 hover:text-white/80 transition-colors"
              >
                Clear Results
              </button>
            </div>

            {/* Results Grid/List */}
            {filteredResults.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
                {filteredResults.map((resource, index) => {
                  const tc = typeConfig[resource.type] || typeConfig.PDF;
                  const Icon = tc.icon;
                  const isBookmarked = bookmarks.includes(resource.id);
                  
                  return (
                    <motion.button
                      key={resource.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedResource(resource)}
                      className={`group relative text-left transition-all ${
                        viewMode === 'grid'
                          ? 'p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-cyan-500/30 hover:bg-white/[0.05]'
                          : 'flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-cyan-500/30 hover:bg-white/[0.05]'
                      }`}
                    >
                      {/* Type Icon */}
                      <div className={`${viewMode === 'grid' ? 'w-12 h-12 mb-4' : 'w-14 h-14'} rounded-xl ${tc.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={viewMode === 'grid' ? 24 : 28} className={tc.color} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`font-medium text-white/90 group-hover:text-cyan-400 transition-colors ${viewMode === 'grid' ? 'text-base mb-2' : 'text-sm'}`}>
                            {resource.title.replace(/[_]/g, ' ').replace(/\.\w+$/, '')}
                          </h4>
                          
                          {/* Bookmark Button */}
                          <button
                            onClick={(e) => toggleBookmark(resource.id, e)}
                            className={`p-2 rounded-lg transition-all ${
                              isBookmarked 
                                ? 'text-amber-400 bg-amber-500/10' 
                                : 'text-white/20 hover:text-amber-400 hover:bg-amber-500/10'
                            }`}
                          >
                            <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                        
                        <p className="text-xs text-white/40 mb-2 line-clamp-2">{resource.summary.slice(0, 100)}...</p>
                        
                        {/* Meta */}
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-white/30">{resource.course}</span>
                          <span className="text-white/20">·</span>
                          <span className={`px-2 py-0.5 rounded-full ${
                            resource.trust >= 90 ? 'bg-emerald-500/10 text-emerald-400' :
                            resource.trust >= 70 ? 'bg-amber-500/10 text-amber-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>
                            {resource.trust}% trust
                          </span>
                          <span className="text-white/20">·</span>
                          <span className="flex items-center gap-1 text-white/30">
                            <Star size={10} className="text-amber-400" />
                            {resource.rating}
                          </span>
                          <span className="text-white/20">·</span>
                          <span className="flex items-center gap-1 text-white/30">
                            <Eye size={10} />
                            {resource.views.toLocaleString()}
                          </span>
                        </div>
                        
                        {/* Tags - Grid only */}
                        {viewMode === 'grid' && (
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {resource.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="px-2 py-0.5 rounded-md bg-white/[0.05] text-[10px] text-white/40">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Arrow */}
                      <ChevronRight size={20} className="text-white/20 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 rounded-2xl bg-white/[0.02] border border-white/[0.06] border-dashed">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Search size={28} className="text-white/20" />
                </div>
                <p className="text-white/40">No results found</p>
                <p className="text-white/20 text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Knowledge Card Modal */}
      <AnimatePresence>
        {selectedResource && (
          <KnowledgeCard
            resource={selectedResource}
            onClose={() => setSelectedResource(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
