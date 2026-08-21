'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, MapPin, Clock, Tag, Eye, MessageCircle, Phone,
    CheckCircle, AlertTriangle, X, ChevronRight, Filter, Grid, List,
    Camera, Send, User, Calendar, Bell, Bookmark, Share2, Flag,
    Package, Shirt, Laptop, Wallet, Key, CreditCard, BookOpen, Glasses,
    Headphones, Watch, FileText, Archive, Image as ImageIcon, Loader2
} from 'lucide-react';
import { currentUser } from '@/data/mockData';

// Pexels API Key
const PEXELS_API_KEY = 'qGurvYVbKiIGyTVDHjr0dxrrvIBTjf7HfNCzynS3CymE84l3TFkWByCN';

// Types
interface LostFoundItem {
    id: string;
    type: 'lost' | 'found';
    title: string;
    description: string;
    category: string;
    location: string;
    date: Date;
    image?: string;
    status: 'active' | 'resolved' | 'expired';
    reportedBy: {
        name: string;
        email: string;
        phone?: string;
        avatar: string;
    };
    contactPreference: 'email' | 'phone' | 'in-app';
    reward?: number;
    tags: string[];
    views: number;
    bookmarks: number;
    resolvedAt?: Date;
    resolvedBy?: string;
}

interface PexelsPhoto {
    id: number;
    src: {
        medium: string;
        large: string;
        original: string;
    };
    photographer: string;
    alt: string;
}

// Category config
const CATEGORIES = [
    { id: 'electronics', label: 'Electronics', icon: Laptop, color: 'from-blue-500 to-cyan-500' },
    { id: 'documents', label: 'Documents/IDs', icon: FileText, color: 'from-amber-500 to-orange-500' },
    { id: 'accessories', label: 'Accessories', icon: Watch, color: 'from-pink-500 to-rose-500' },
    { id: 'clothing', label: 'Clothing', icon: Shirt, color: 'from-violet-500 to-purple-500' },
    { id: 'keys', label: 'Keys', icon: Key, color: 'from-emerald-500 to-green-500' },
    { id: 'wallet', label: 'Wallet/Purse', icon: Wallet, color: 'from-yellow-500 to-amber-500' },
    { id: 'cards', label: 'Cards/IDs', icon: CreditCard, color: 'from-red-500 to-pink-500' },
    { id: 'books', label: 'Books/Notes', icon: BookOpen, color: 'from-indigo-500 to-blue-500' },
    { id: 'glasses', label: 'Glasses', icon: Glasses, color: 'from-teal-500 to-cyan-500' },
    { id: 'headphones', label: 'Audio/Headphones', icon: Headphones, color: 'from-slate-500 to-gray-500' },
    { id: 'other', label: 'Other', icon: Package, color: 'from-gray-500 to-slate-500' },
];

const LOCATIONS = [
    'Main Building', 'Library', 'Cafeteria', 'Sports Complex', 'Hostel Block A',
    'Hostel Block B', 'Hostel Block C', 'Academic Block', 'Admin Building',
    'Parking Lot', 'Garden Area', 'Auditorium', 'Labs', 'Other'
];

// Mock data
const MOCK_ITEMS: LostFoundItem[] = [
    {
        id: '1',
        type: 'lost',
        title: 'Blue iPhone 15 Pro Case with Student ID',
        description: 'Lost my blue silicone iPhone 15 Pro case somewhere between the library and cafeteria. My student ID was inside the case. Please contact me if found!',
        category: 'electronics',
        location: 'Library',
        date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=400',
        status: 'active',
        reportedBy: {
            name: 'Rahul Sharma',
            email: 'rahul.sharma@vitstudent.ac.in',
            phone: '+91 98765 43210',
            avatar: 'RS'
        },
        contactPreference: 'phone',
        reward: 200,
        tags: ['iphone', 'case', 'student-id', 'blue'],
        views: 45,
        bookmarks: 3
    },
    {
        id: '2',
        type: 'found',
        title: 'Black Wallet Found Near Main Gate',
        description: 'Found a black leather wallet near the main gate around 4 PM. Contains some cash and cards. Owner please contact with proof of ownership.',
        category: 'wallet',
        location: 'Main Building',
        date: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        image: 'https://images.pexels.com/photos/1119141/pexels-photo-1119141.jpeg?auto=compress&cs=tinysrgb&w=400',
        status: 'active',
        reportedBy: {
            name: 'Priya Patel',
            email: 'priya.patel@vitstudent.ac.in',
            avatar: 'PP'
        },
        contactPreference: 'email',
        tags: ['wallet', 'black', 'leather'],
        views: 78,
        bookmarks: 5
    },
    {
        id: '3',
        type: 'lost',
        title: 'Set of Keys with Red Keychain',
        description: 'Lost my keys with a distinctive red heart-shaped keychain. Has 4-5 keys including a bike key. Lost near the sports complex.',
        category: 'keys',
        location: 'Sports Complex',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        image: 'https://images.pexels.com/photos/209581/pexels-photo-209581.jpeg?auto=compress&cs=tinysrgb&w=400',
        status: 'active',
        reportedBy: {
            name: 'Amit Kumar',
            email: 'amit.kumar@vitstudent.ac.in',
            phone: '+91 87654 32109',
            avatar: 'AK'
        },
        contactPreference: 'phone',
        reward: 100,
        tags: ['keys', 'red-keychain', 'bike-key'],
        views: 120,
        bookmarks: 8
    },
    {
        id: '4',
        type: 'found',
        title: 'Prescription Glasses in Brown Case',
        description: 'Found prescription glasses in a brown leather case near the academic block. Owner please describe the glasses to claim.',
        category: 'glasses',
        location: 'Academic Block',
        date: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18 hours ago
        image: 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=400',
        status: 'active',
        reportedBy: {
            name: 'Sneha Reddy',
            email: 'sneha.reddy@vitstudent.ac.in',
            avatar: 'SR'
        },
        contactPreference: 'in-app',
        tags: ['glasses', 'prescription', 'brown-case'],
        views: 34,
        bookmarks: 2
    },
    {
        id: '5',
        type: 'lost',
        title: 'Sony WH-1000XM4 Headphones',
        description: 'Lost my black Sony noise-cancelling headphones somewhere in the library. Very important to me, reward offered!',
        category: 'headphones',
        location: 'Library',
        date: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        image: 'https://images.pexels.com/photos/3394666/pexels-photo-3394666.jpeg?auto=compress&cs=tinysrgb&w=400',
        status: 'active',
        reportedBy: {
            name: 'Vikram Singh',
            email: 'vikram.singh@vitstudent.ac.in',
            phone: '+91 76543 21098',
            avatar: 'VS'
        },
        contactPreference: 'phone',
        reward: 500,
        tags: ['sony', 'headphones', 'black', 'noise-cancelling'],
        views: 234,
        bookmarks: 15
    },
    {
        id: '6',
        type: 'found',
        title: 'VIT ID Card - Name: Rohan Mehta',
        description: 'Found a VIT student ID card near the cafeteria. Name on card: Rohan Mehta, Reg No: 21BCE1234.',
        category: 'cards',
        location: 'Cafeteria',
        date: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        status: 'active',
        reportedBy: {
            name: 'Ananya Gupta',
            email: 'ananya.gupta@vitstudent.ac.in',
            avatar: 'AG'
        },
        contactPreference: 'email',
        tags: ['id-card', 'vit', 'student-id'],
        views: 89,
        bookmarks: 4
    },
    {
        id: '7',
        type: 'lost',
        title: 'Blue Backpack with Laptop',
        description: 'Lost my blue HP backpack containing a laptop and some books. Lost near the parking lot. Please help!',
        category: 'other',
        location: 'Parking Lot',
        date: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
        status: 'resolved',
        reportedBy: {
            name: 'Karan Joshi',
            email: 'karan.joshi@vitstudent.ac.in',
            avatar: 'KJ'
        },
        contactPreference: 'email',
        tags: ['backpack', 'laptop', 'blue', 'hp'],
        views: 312,
        bookmarks: 22,
        resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        resolvedBy: 'Found by security'
    }
];

export default function LostAndFound() {
    const [items, setItems] = useState<LostFoundItem[]>(MOCK_ITEMS);
    const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('active');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
    const [reportType, setReportType] = useState<'lost' | 'found'>('lost');

    // Image search state
    const [imageSearchQuery, setImageSearchQuery] = useState('');
    const [searchedImages, setSearchedImages] = useState<PexelsPhoto[]>([]);
    const [isSearchingImages, setIsSearchingImages] = useState(false);
    const [showImagePicker, setShowImagePicker] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'other',
        location: 'Other',
        contactPreference: 'email' as 'email' | 'phone' | 'in-app',
        reward: '',
        tags: '',
        image: ''
    });

    // Search images from Pexels
    const searchImages = async (query: string) => {
        if (!query.trim()) return;

        setIsSearchingImages(true);
        try {
            const response = await fetch(
                `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=12&page=1`,
                {
                    headers: {
                        Authorization: PEXELS_API_KEY,
                    },
                }
            );
            const data = await response.json();
            setSearchedImages(data.photos || []);
        } catch (error) {
            console.error('Error searching images:', error);
        } finally {
            setIsSearchingImages(false);
        }
    };

    // Filtered items
    const filteredItems = useMemo(() => {
        let result = items;

        if (filter !== 'all') {
            result = result.filter(item => item.type === filter);
        }

        if (categoryFilter !== 'all') {
            result = result.filter(item => item.category === categoryFilter);
        }

        if (statusFilter !== 'all') {
            result = result.filter(item => item.status === statusFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.location.toLowerCase().includes(query) ||
                item.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        return result.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [items, filter, categoryFilter, statusFilter, searchQuery]);

    // Stats
    const stats = useMemo(() => {
        const active = items.filter(i => i.status === 'active');
        return {
            total: items.length,
            lost: active.filter(i => i.type === 'lost').length,
            found: active.filter(i => i.type === 'found').length,
            resolved: items.filter(i => i.status === 'resolved').length
        };
    }, [items]);

    // Format time
    const formatTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const mins = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Submit report
    const handleSubmitReport = () => {
        const newItem: LostFoundItem = {
            id: Date.now().toString(),
            type: reportType,
            title: formData.title,
            description: formData.description,
            category: formData.category,
            location: formData.location,
            date: new Date(),
            image: formData.image || undefined,
            status: 'active',
            reportedBy: {
                name: currentUser.name,
                email: currentUser.email || 'student@vit.ac.in',
                avatar: currentUser.avatar
            },
            contactPreference: formData.contactPreference,
            reward: formData.reward ? parseInt(formData.reward) : undefined,
            tags: formData.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
            views: 0,
            bookmarks: 0
        };

        setItems(prev => [newItem, ...prev]);
        setShowReportModal(false);
        setFormData({
            title: '',
            description: '',
            category: 'other',
            location: 'Other',
            contactPreference: 'email',
            reward: '',
            tags: '',
            image: ''
        });
        setSearchedImages([]);
        setImageSearchQuery('');
    };

    // Mark as resolved
    const markResolved = (id: string) => {
        setItems(prev => prev.map(item =>
            item.id === id
                ? { ...item, status: 'resolved' as const, resolvedAt: new Date(), resolvedBy: 'Owner confirmed' }
                : item
        ));
        setSelectedItem(null);
    };

    // Get category config
    const getCategoryConfig = (categoryId: string) => {
        return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
    };

    // Item Card Component
    const ItemCard = ({ item }: { item: LostFoundItem }) => {
        const catConfig = getCategoryConfig(item.category);
        const CatIcon = catConfig.icon;

        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`group relative rounded-2xl border transition-all overflow-hidden ${item.status === 'resolved'
                    ? 'bg-white/[0.01] border-white/[0.04] opacity-60'
                    : item.type === 'lost'
                        ? 'bg-red-500/5 border-red-500/10 hover:border-red-500/20'
                        : 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/20'
                    }`}
            >
                {/* Type Badge */}
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider z-10 ${item.type === 'lost'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                    {item.type}
                </div>

                {/* Status Badge */}
                {item.status === 'resolved' && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-bold bg-cyan-500/20 text-cyan-400 z-10">
                        Resolved
                    </div>
                )}

                {/* Image */}
                {item.image && (
                    <div className="relative h-40 w-full overflow-hidden">
                        <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                )}

                <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3 mt-6">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${catConfig.color} flex items-center justify-center flex-shrink-0`}>
                            <CatIcon size={24} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white/90 line-clamp-2 leading-snug">
                                {item.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                                <MapPin size={12} />
                                <span>{item.location}</span>
                                <span>•</span>
                                <Clock size={12} />
                                <span>{formatTime(item.date)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-white/50 line-clamp-2 mb-3">
                        {item.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {item.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded-md bg-white/[0.05] text-[10px] text-white/40">
                                #{tag}
                            </span>
                        ))}
                        {item.tags.length > 3 && (
                            <span className="px-2 py-0.5 rounded-md bg-white/[0.05] text-[10px] text-white/40">
                                +{item.tags.length - 3}
                            </span>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                        <div className="flex items-center gap-3 text-xs text-white/40">
                            <span className="flex items-center gap-1">
                                <Eye size={12} />
                                {item.views}
                            </span>
                            <span className="flex items-center gap-1">
                                <Bookmark size={12} />
                                {item.bookmarks}
                            </span>
                            {item.reward && (
                                <span className="flex items-center gap-1 text-amber-400">
                                    ₹{item.reward}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setSelectedItem(item)}
                            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                            View Details
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20">
                        <Search size={20} className="text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                            Lost & Found
                        </h2>
                        <p className="text-xs text-white/40">
                            Report lost items or help others find theirs
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20">
                        <span className="text-xs text-red-400">Lost</span>
                        <p className="text-lg font-bold text-white">{stats.lost}</p>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-xs text-emerald-400">Found</span>
                        <p className="text-lg font-bold text-white">{stats.found}</p>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                        <span className="text-xs text-cyan-400">Resolved</span>
                        <p className="text-lg font-bold text-white">{stats.resolved}</p>
                    </div>
                    <button
                        onClick={() => {
                            setReportType('lost');
                            setShowReportModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium text-sm hover:opacity-90 transition-opacity"
                    >
                        <Plus size={18} />
                        Report Item
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search items, locations, tags..."
                        className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/30 transition-colors"
                    />
                </div>

                {/* Type Filter */}
                <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'lost', label: 'Lost', color: 'text-red-400' },
                        { id: 'found', label: 'Found', color: 'text-emerald-400' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id as typeof filter)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.id
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'text-white/40 hover:text-white/60'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Category Filter */}
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white/70 focus:outline-none focus:border-amber-500/30"
                >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                </select>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    className="px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white/70 focus:outline-none focus:border-amber-500/30"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                </select>

                {/* View Toggle */}
                <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-amber-500/10 text-amber-400' : 'text-white/40 hover:text-white/60'}`}
                    >
                        <Grid size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-amber-500/10 text-amber-400' : 'text-white/40 hover:text-white/60'}`}
                    >
                        <List size={16} />
                    </button>
                </div>
            </div>

            {/* Items Grid/List */}
            <AnimatePresence mode="wait">
                {filteredItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <Archive size={32} className="text-white/20" />
                        </div>
                        <p className="text-lg font-medium text-white/40 mb-2">No items found</p>
                        <p className="text-sm text-white/30 mb-6">Try adjusting your filters or search query</p>
                        <button
                            onClick={() => {
                                setFilter('all');
                                setCategoryFilter('all');
                                setStatusFilter('active');
                                setSearchQuery('');
                            }}
                            className="px-4 py-2 rounded-xl bg-white/[0.05] text-white/60 text-sm hover:bg-white/[0.08] transition-colors"
                        >
                            Clear Filters
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key={`${viewMode}-${filter}-${categoryFilter}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                            : 'space-y-3'
                        }
                    >
                        {filteredItems.map(item => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Report Modal */}
            <AnimatePresence>
                {showReportModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowReportModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#0c0f17] rounded-2xl border border-white/[0.06] p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Report {reportType === 'lost' ? 'Lost' : 'Found'} Item</h3>
                                    <p className="text-xs text-white/40">Help the community by reporting items</p>
                                </div>
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Type Toggle */}
                            <div className="flex items-center gap-2 p-1 bg-white/[0.03] rounded-xl mb-6">
                                <button
                                    onClick={() => setReportType('lost')}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${reportType === 'lost'
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'text-white/40 hover:text-white/60'
                                        }`}
                                >
                                    I Lost Something
                                </button>
                                <button
                                    onClick={() => setReportType('found')}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${reportType === 'found'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'text-white/40 hover:text-white/60'
                                        }`}
                                >
                                    I Found Something
                                </button>
                            </div>

                            {/* Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-white/40 mb-2">Title *</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="Brief description of the item"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/30"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-white/40 mb-2">Description *</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Provide details about the item, where it was lost/found, etc."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/30 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-white/40 mb-2">Category *</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 focus:outline-none focus:border-amber-500/30"
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-white/40 mb-2">Location *</label>
                                        <select
                                            value={formData.location}
                                            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 focus:outline-none focus:border-amber-500/30"
                                        >
                                            {LOCATIONS.map(loc => (
                                                <option key={loc} value={loc}>{loc}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-white/40 mb-2">Contact Preference</label>
                                    <div className="flex items-center gap-2">
                                        {[
                                            { id: 'email', label: 'Email', icon: MessageCircle },
                                            { id: 'phone', label: 'Phone', icon: Phone },
                                            { id: 'in-app', label: 'In-App', icon: User }
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setFormData(prev => ({ ...prev, contactPreference: opt.id as typeof formData.contactPreference }))}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all ${formData.contactPreference === opt.id
                                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                    : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                                                    }`}
                                            >
                                                <opt.icon size={14} />
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {reportType === 'lost' && (
                                    <div>
                                        <label className="block text-xs text-white/40 mb-2">Reward (₹) - Optional</label>
                                        <input
                                            type="number"
                                            value={formData.reward}
                                            onChange={(e) => setFormData(prev => ({ ...prev, reward: e.target.value }))}
                                            placeholder="Offer a reward for finding your item"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/30"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs text-white/40 mb-2">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        value={formData.tags}
                                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                                        placeholder="e.g., blue, wallet, leather"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/30"
                                    />
                                </div>

                                {/* Image Picker */}
                                <div>
                                    <label className="block text-xs text-white/40 mb-2">Item Image (Optional)</label>

                                    {/* Selected Image Preview */}
                                    {formData.image ? (
                                        <div className="relative mb-3">
                                            <img
                                                src={formData.image}
                                                alt="Selected"
                                                className="w-full h-40 object-cover rounded-xl"
                                            />
                                            <button
                                                onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white/80 hover:text-white transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Search Input */}
                                            <div className="flex gap-2 mb-3">
                                                <div className="relative flex-1">
                                                    <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                                    <input
                                                        type="text"
                                                        value={imageSearchQuery}
                                                        onChange={(e) => setImageSearchQuery(e.target.value)}
                                                        placeholder="Search for images..."
                                                        className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/30"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => searchImages(imageSearchQuery)}
                                                    disabled={isSearchingImages || !imageSearchQuery}
                                                    className="px-4 py-2.5 bg-amber-500/20 text-amber-400 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-amber-500/30 transition-colors"
                                                >
                                                    {isSearchingImages ? 'Searching...' : 'Search'}
                                                </button>
                                            </div>

                                            {/* Image Results */}
                                            {searchedImages.length > 0 && (
                                                <div className="grid grid-cols-3 gap-2 mb-3">
                                                    {searchedImages.map(photo => (
                                                        <button
                                                            key={photo.id}
                                                            onClick={() => setFormData(prev => ({ ...prev, image: photo.src.medium }))}
                                                            className="relative h-20 rounded-lg overflow-hidden group"
                                                        >
                                                            <img
                                                                src={photo.src.medium}
                                                                alt={photo.alt}
                                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <p className="text-[10px] text-white/30">Search and select an image from Pexels</p>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleSubmitReport}
                                disabled={!formData.title || !formData.description}
                                className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                            >
                                Submit Report
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Item Detail Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#0c0f17] rounded-2xl border border-white/[0.06] p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${selectedItem.type === 'lost'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-emerald-500/20 text-emerald-400'
                                    }`}>
                                    {selectedItem.type} Item
                                </div>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Image */}
                            {selectedItem.image && (
                                <div className="relative mb-4 rounded-xl overflow-hidden">
                                    <img
                                        src={selectedItem.image}
                                        alt={selectedItem.title}
                                        className="w-full h-48 object-cover"
                                    />
                                </div>
                            )}

                            {/* Title */}
                            <h2 className="text-xl font-bold text-white mb-2">{selectedItem.title}</h2>

                            {/* Meta */}
                            <div className="flex items-center gap-4 text-sm text-white/40 mb-4">
                                <span className="flex items-center gap-1">
                                    <MapPin size={14} />
                                    {selectedItem.location}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {formatTime(selectedItem.date)}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-white/60 leading-relaxed mb-4">
                                {selectedItem.description}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {selectedItem.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 rounded-lg bg-white/[0.05] text-xs text-white/50">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            {/* Reporter Info */}
                            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-4">
                                <p className="text-xs text-white/40 mb-2">Reported by</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white">
                                        {selectedItem.reportedBy.avatar}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white/80">{selectedItem.reportedBy.name}</p>
                                        <p className="text-xs text-white/40">{selectedItem.reportedBy.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Reward */}
                            {selectedItem.reward && (
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
                                    <p className="text-sm text-amber-400 font-medium">
                                        💰 Reward: ₹{selectedItem.reward}
                                    </p>
                                </div>
                            )}

                            {/* Status */}
                            {selectedItem.status === 'resolved' && (
                                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 mb-4">
                                    <div className="flex items-center gap-2 text-cyan-400">
                                        <CheckCircle size={18} />
                                        <span className="font-medium">This item has been resolved</span>
                                    </div>
                                    {selectedItem.resolvedBy && (
                                        <p className="text-xs text-cyan-400/60 mt-1">{selectedItem.resolvedBy}</p>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            {selectedItem.status === 'active' && (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => markResolved(selectedItem.id)}
                                        className="flex-1 py-3 rounded-xl bg-cyan-500/20 text-cyan-400 font-medium text-sm hover:bg-cyan-500/30 transition-colors"
                                    >
                                        Mark as Resolved
                                    </button>
                                    <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium text-sm hover:opacity-90 transition-opacity">
                                        Contact {selectedItem.reportedBy.name.split(' ')[0]}
                                    </button>
                                </div>
                            )}

                            {/* Stats */}
                            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/[0.06] text-xs text-white/40">
                                <span className="flex items-center gap-1">
                                    <Eye size={12} />
                                    {selectedItem.views} views
                                </span>
                                <span className="flex items-center gap-1">
                                    <Bookmark size={12} />
                                    {selectedItem.bookmarks} bookmarks
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
