'use client';

import { useState } from 'react';
import {
    LayoutDashboard, Search, User, ChevronLeft, ChevronRight,
    Settings, Brain, GraduationCap, FileText, Share2, Library,
    Rocket, AlertCircle, Calendar, Users, Tent, BookOpenCheck,
    Wallet, BarChart3, Vote, HandHeart, MapPin, Binary, Bot,
    Bus, Car, Edit3, UserCheck, ChevronDown, Bell, Zap
} from 'lucide-react';
import { useUser } from '@/context/UserContext';

interface SidebarProps {
    activeSection: string;
    onNavigate: (section: string) => void;
}

// Module categories with their items
const categories = [
    {
        id: 'academics',
        label: 'Academics',
        items: [
            { id: 'timetable', label: 'Timetable', icon: Calendar },
            { id: 'attendance', label: 'Attendance', icon: BarChart3 },
            { id: 'learning', label: 'Learning Hub', icon: GraduationCap },
            { id: 'study-materials', label: 'Study Materials', icon: Library },
            { id: 'answer-key', label: 'Answer Key', icon: FileText },
            { id: 'visual-algos', label: 'Visual Algos', icon: Binary },
            { id: 'note-share', label: 'Note Share', icon: FileText },
            { id: 'study-buddy', label: 'Study Buddy', icon: BookOpenCheck },
            { id: 'group-study', label: 'Group Study', icon: HandHeart },
        ],
    },
    {
        id: 'campus',
        label: 'Campus Life',
        items: [
            { id: 'campus', label: 'Campus Explorer', icon: MapPin },
            { id: 'clubs-events', label: 'Clubs & Events', icon: Tent },
            { id: 'roommate', label: 'Roommate Match', icon: Users },
            { id: 'lost-found', label: 'Lost & Found', icon: AlertCircle },
            { id: 'budget', label: 'Budget Tracker', icon: Wallet },
            { id: 'quick-poll', label: 'Quick Poll', icon: Vote },
            { id: 'travel-pool', label: 'Travel Pool', icon: Car },
            { id: 'bus-transport', label: 'Bus Transport', icon: Bus },
            { id: 'faculty', label: 'Faculty Portal', icon: UserCheck },
        ],
    },
    {
        id: 'ai',
        label: 'AI Core',
        items: [
            { id: 'search', label: 'Oracle Search', icon: Search },
            { id: 'ai-chat', label: 'AI Chat', icon: Bot },
            { id: 'mock-interview', label: 'Mock Interview', icon: Users },
        ],
    },
    {
        id: 'career',
        label: 'Career & Growth',
        items: [
            { id: 'career', label: 'Career Hub', icon: Rocket },
            { id: 'focus', label: 'Zen Focus', icon: Brain },
        ],
    },
    {
        id: 'productivity',
        label: 'Productivity',
        items: [
            { id: 'fileshare', label: 'File Share', icon: Share2 },
            { id: 'briefing', label: 'Smart Briefing', icon: Bell },
            { id: 'admin-automation', label: 'Admin Auto', icon: Zap },
        ],
    },
];

const bottomItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
];

export default function Sidebar({ activeSection, onNavigate }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const { user, setIsEditModalOpen } = useUser();
    const [expandedCategories, setExpandedCategories] = useState<string[]>(
        // Auto-expand the category containing the active section
        categories
            .filter(cat => cat.items.some(item => item.id === activeSection))
            .map(cat => cat.id)
    );

    const toggleCategory = (catId: string) => {
        setExpandedCategories(prev =>
            prev.includes(catId)
                ? prev.filter(id => id !== catId)
                : [...prev, catId]
        );
    };

    // Find if active section belongs to a category
    const activeCategory = categories.find(cat =>
        cat.items.some(item => item.id === activeSection)
    )?.id;

    return (
        <aside
            className={`relative flex flex-col h-screen transition-all duration-300 ease-out ${collapsed ? 'w-[64px]' : 'w-[250px]'
                }`}
        >
            {/* Solid background */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'var(--surface-raised)',
                    borderRight: '1px solid var(--border)',
                }}
            />

            <div className="relative z-10 flex flex-col h-full">
                {/* Logo / Brand */}
                <div className="flex items-center justify-between h-16 px-4">
                    {!collapsed && (
                        <div className="flex items-center gap-2.5">
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm"
                                style={{
                                    background: 'var(--accent-primary)',
                                    color: 'var(--text-inverse)',
                                }}
                            >
                                V
                            </div>
                            <span
                                className="font-display font-bold text-base tracking-tight"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                VITGROWW
                            </span>
                        </div>
                    )}
                    {collapsed && (
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm mx-auto"
                            style={{
                                background: 'var(--accent-primary)',
                                color: 'var(--text-inverse)',
                            }}
                        >
                            V
                        </div>
                    )}
                    {!collapsed && (
                        <button
                            onClick={() => setCollapsed(true)}
                            className="p-1.5 rounded-md transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                            aria-label="Collapse sidebar"
                        >
                            <ChevronLeft size={16} />
                        </button>
                    )}
                </div>

                {/* Dashboard link (always visible) */}
                <div className="px-2 mb-1">
                    <button
                        onClick={() => onNavigate('dashboard')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${collapsed ? 'justify-center' : ''
                            }`}
                        style={{
                            background: activeSection === 'dashboard' ? 'var(--accent-primary-muted)' : 'transparent',
                            color: activeSection === 'dashboard' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            borderLeft: activeSection === 'dashboard' ? '3px solid var(--accent-primary)' : '3px solid transparent',
                        }}
                    >
                        <LayoutDashboard size={18} />
                        {!collapsed && <span className="font-medium">Dashboard</span>}
                    </button>
                </div>

                {/* Scrollable category navigation */}
                <nav className="flex-1 overflow-y-auto px-2 py-1 custom-scrollbar">
                    {categories.map(category => {
                        const isExpanded = expandedCategories.includes(category.id) || collapsed;
                        const hasActiveItem = category.id === activeCategory;

                        return (
                            <div key={category.id} className="mb-1">
                                {/* Category header */}
                                {!collapsed && (
                                    <button
                                        onClick={() => toggleCategory(category.id)}
                                        className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest transition-colors"
                                        style={{
                                            color: hasActiveItem ? 'var(--accent-primary)' : 'var(--text-muted)',
                                        }}
                                    >
                                        <span>{category.label}</span>
                                        <ChevronDown
                                            size={12}
                                            className="transition-transform duration-200"
                                            style={{
                                                transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                            }}
                                        />
                                    </button>
                                )}

                                {/* Category items */}
                                <div
                                    className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    {category.items.map(item => {
                                        const isActive = activeSection === item.id;
                                        const Icon = item.icon;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => onNavigate(item.id)}
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${collapsed ? 'justify-center' : ''
                                                    }`}
                                                style={{
                                                    background: isActive ? 'var(--accent-primary-muted)' : 'transparent',
                                                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                                    borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                                                }}
                                                onMouseEnter={e => {
                                                    if (!isActive) {
                                                        e.currentTarget.style.background = 'var(--surface-overlay)';
                                                        e.currentTarget.style.color = 'var(--text-primary)';
                                                    }
                                                }}
                                                onMouseLeave={e => {
                                                    if (!isActive) {
                                                        e.currentTarget.style.background = 'transparent';
                                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                                    }
                                                }}
                                                title={collapsed ? item.label : undefined}
                                            >
                                                <Icon size={17} />
                                                {!collapsed && (
                                                    <span className="font-medium truncate">{item.label}</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* Bottom section */}
                <div
                    className="px-2 py-3"
                    style={{ borderTop: '1px solid var(--border)' }}
                >
                    {/* Utility links */}
                    {bottomItems.map(item => {
                        const isActive = activeSection === item.id;
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${collapsed ? 'justify-center' : ''
                                    }`}
                                style={{
                                    background: isActive ? 'var(--accent-primary-muted)' : 'transparent',
                                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'var(--surface-overlay)';
                                        e.currentTarget.style.color = 'var(--text-primary)';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = 'var(--text-secondary)';
                                    }
                                }}
                            >
                                <Icon size={17} />
                                {!collapsed && <span className="font-medium">{item.label}</span>}
                            </button>
                        );
                    })}

                    {/* Student info */}
                    {!collapsed && (
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left group"
                            style={{ background: 'var(--surface-overlay)', border: '1px solid var(--border)' }}
                        >
                            <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-xs flex-shrink-0"
                                style={{ background: 'var(--accent-primary-muted)', color: 'var(--accent-primary)' }}
                            >
                                {(user.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p
                                    className="text-sm font-semibold truncate"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    {user.name || 'Set your name'}
                                </p>
                                <p
                                    className="text-[10px] font-mono truncate"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    {user.regNo || 'Set reg. number'}
                                </p>
                            </div>
                            <Edit3
                                size={12}
                                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                style={{ color: 'var(--text-muted)' }}
                            />
                        </button>
                    )}

                    {/* Collapse toggle when collapsed */}
                    {collapsed && (
                        <button
                            onClick={() => setCollapsed(false)}
                            className="w-full flex items-center justify-center py-2 mt-2 rounded-lg transition-colors"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                            aria-label="Expand sidebar"
                        >
                            <ChevronRight size={16} />
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
}
