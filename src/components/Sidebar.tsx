'use client';

import { useState } from 'react';
import {
    LayoutDashboard,
    Search,
    GitBranch,
    Activity,
    Bell,
    User,
    ChevronLeft,
    ChevronRight,
    Zap,
    LogOut,
    Settings,
    Brain,
    GraduationCap,
    FileText,
    Gamepad2,
    Share2,
    Library,
    Rocket,
    AlertCircle,
    Calendar,
    Users,
    Tent,
    BookOpenCheck,
    Wallet,
    BarChart3,
    Vote,
    HandHeart,
    MapPin,
    Binary,
    Bot,
    Bus,
    Car,
    Building2,
    HeartHandshake
} from 'lucide-react';
import { currentUser } from '@/data/mockData';

interface SidebarProps {
    activeSection: string;
    onNavigate: (section: string) => void;
}

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'campus', label: 'Campus Explorer', icon: MapPin },
    { id: 'search', label: 'Oracle Search', icon: Search },
    { id: 'answer-key', label: 'Answer Key', icon: FileText },
    { id: 'learning', label: 'Learning Hub', icon: GraduationCap },
    { id: 'visual-algos', label: 'Visual Algos', icon: Binary },
    { id: 'study-materials', label: 'Study Materials', icon: Library },
    { id: 'fileshare', label: 'File Share', icon: Share2 },
    { id: 'career', label: 'Career Hub', icon: Rocket },
    { id: 'lost-found', label: 'Lost & Found', icon: AlertCircle },
    { id: 'hostel', label: 'Hostels', icon: Building2 },
    { id: 'parent-portal', label: 'Parent Portal', icon: HeartHandshake },

    { id: 'clubs-events', label: 'Clubs & Events', icon: Tent },
    { id: 'roommate', label: 'Roommate Match', icon: Users },
    { id: 'note-share', label: 'Note Share', icon: FileText },
    { id: 'study-buddy', label: 'Study Buddy', icon: BookOpenCheck },
    { id: 'budget', label: 'Budget Tracker', icon: Wallet },
    { id: 'attendance', label: 'Attendance', icon: BarChart3 },

    { id: 'briefing', label: 'Smart Briefing', icon: Bell },
    { id: 'admin-automation', label: 'Admin Auto', icon: Zap },
    { id: 'group-study', label: 'Group Study', icon: HandHeart },
    { id: 'quick-poll', label: 'Quick Poll', icon: Vote },
    { id: 'travel-pool', label: 'Travel Pool', icon: Car },
    { id: 'bus-transport', label: 'Bus Transport', icon: Bus },
    { id: 'faculty', label: 'Faculty', icon: GraduationCap },
    { id: 'mock-interview', label: 'Mock Interview', icon: Users },
    { id: 'ai-chat', label: 'AI Chat', icon: Bot },
    { id: 'focus', label: 'Zen Focus', icon: Brain },
];

const bottomItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
];

export default function Sidebar({ activeSection, onNavigate }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={`relative flex flex-col h-screen transition-all duration-300 ease-out ${collapsed ? 'w-[72px]' : 'w-[260px]'
                }`}
        >
            {/* Glass background */}
            <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-xl border-r border-white/[0.06]" />

            <div className="relative z-10 flex flex-col h-full">
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 py-6 border-b border-white/[0.06]">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                        <Zap size={18} className="text-white" />
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <h1 className="text-lg font-bold tracking-wider bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                                VITGROWW
                            </h1>
                            <p className="text-[10px] text-white/30 tracking-widest -mt-0.5">LEARN & GROW OS</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    <p className={`text-[10px] font-semibold text-white/20 uppercase tracking-widest px-3 mb-3 ${collapsed ? 'hidden' : ''}`}>
                        Main
                    </p>
                    {navItems.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className={`group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-cyan-500/10 text-cyan-400'
                                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                                    } ${collapsed ? 'justify-center' : ''}`}
                                title={collapsed ? item.label : undefined}
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-cyan-400 rounded-r-full shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
                                )}
                                <item.icon
                                    size={20}
                                    className={`flex-shrink-0 transition-all ${isActive ? 'drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]' : 'group-hover:scale-110'
                                        }`}
                                />
                                {!collapsed && (
                                    <span className="text-sm font-medium truncate">{item.label}</span>
                                )}
                                {/* Tooltip for collapsed */}
                                {collapsed && (
                                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-white/10">
                                        {item.label}
                                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-slate-800 border-l border-b border-white/10" />
                                    </div>
                                )}
                            </button>
                        );
                    })}

                    <div className="my-4 border-t border-white/[0.04]" />

                    <p className={`text-[10px] font-semibold text-white/20 uppercase tracking-widest px-3 mb-3 ${collapsed ? 'hidden' : ''}`}>
                        System
                    </p>
                    {bottomItems.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className={`group relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-cyan-500/10 text-cyan-400'
                                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                                    } ${collapsed ? 'justify-center' : ''}`}
                                title={collapsed ? item.label : undefined}
                            >
                                <item.icon size={20} className="flex-shrink-0" />
                                {!collapsed && (
                                    <span className="text-sm font-medium truncate">{item.label}</span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* User card */}
                <div className={`px-3 pb-4 ${collapsed ? 'px-2' : ''}`}>
                    <div className={`flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] ${collapsed ? 'justify-center p-2' : ''}`}>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
                            {currentUser.avatar}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white/80 truncate">{currentUser.name}</p>
                                <p className="text-[11px] text-white/30 truncate">{currentUser.major}</p>
                            </div>
                        )}
                        {!collapsed && (
                            <button className="text-white/20 hover:text-white/50 transition-colors">
                                <LogOut size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-slate-700 transition-all z-20 shadow-lg"
                >
                    {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
                </button>
            </div>
        </aside>
    );
}
