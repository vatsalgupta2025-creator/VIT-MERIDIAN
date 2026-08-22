'use client';

import { useState } from 'react';
import { 
  Menu, X, BookOpen, Calendar, Bot, Share2, 
  Settings, User, GraduationCap, Library, FileText,
  Search, MessageSquare, Tent, MapPin, Building2,
  Bell, FileOutput, Focus, ShieldAlert,
  Users, HandHeart, AlertCircle, Car,
  Binary, Wallet, CloudRain, ShieldCheck, Gamepad2, Vote, 
  Brain, FileKey, PlaneTakeoff, HeartHandshake, Zap, 
  Building, UserCheck, Rocket, UserMinus, FileSignature, 
  Bus, GraduationCap as Cap, UserCog, UserCheck2, FileCheck, Radio, AlertTriangle, BookOpenCheck, BarChart3,
  LayoutDashboard, ChevronLeft, ChevronRight, ChevronDown,
  Heart, Megaphone, MessageSquareWarning, Edit3
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useRBAC } from '@/context/RBACContext';

interface SidebarProps {
 activeSection: string;
 onNavigate: (section: string) => void;
}

// Define access rules for each module (simplified for demo)
const moduleAccess: Record<string, string[]> = {
  // Institution
  'student-info': ['STUDENT', 'FACULTY', 'DEPT_ADMIN', 'INSTITUTION_ADMIN'],
  'attendance-admin': ['STUDENT', 'FACULTY', 'DEPT_ADMIN', 'INSTITUTION_ADMIN'],
  'fees-finance': ['STUDENT', 'DEPT_ADMIN', 'INSTITUTION_ADMIN'],
  'examinations': ['STUDENT', 'FACULTY', 'DEPT_ADMIN', 'INSTITUTION_ADMIN'],
  'faculty-admin': ['FACULTY', 'DEPT_ADMIN', 'INSTITUTION_ADMIN'],
  'placement-admin': ['DEPT_ADMIN', 'INSTITUTION_ADMIN'],
  'hostel-admin': ['HOSTEL_WARDEN', 'INSTITUTION_ADMIN'],
  
  // Safety & Wellbeing
  'security-dashboard': ['SECURITY_OFFICER', 'INSTITUTION_ADMIN'],
  'emergency-comm': ['STUDENT', 'FACULTY', 'SECURITY_OFFICER', 'INSTITUTION_ADMIN'], // Students need panic button
  'women-safety': ['STUDENT', 'SAFETY_OFFICER', 'COUNSELOR', 'INSTITUTION_ADMIN'],
  'incident-reporting': ['STUDENT', 'FACULTY', 'SECURITY_OFFICER', 'DEPT_ADMIN', 'INSTITUTION_ADMIN'],
  'visitor-management': ['SECURITY_OFFICER', 'INSTITUTION_ADMIN'],
  'student-wellbeing': ['STUDENT', 'COUNSELOR', 'INSTITUTION_ADMIN'],
  'communication-hub': ['FACULTY', 'DEPT_ADMIN', 'INSTITUTION_ADMIN', 'STUDENT'],
  'complaints': ['STUDENT', 'FACULTY', 'DEPT_ADMIN', 'INSTITUTION_ADMIN'],
  'transport-admin': ['STUDENT', 'INSTITUTION_ADMIN', 'TRANSPORT_COORDINATOR'],
  'safe': ['STUDENT', 'FACULTY', 'ADMIN', 'SECURITY_OFFICER', 'INSTITUTION_ADMIN'],

  // Existing
  'timetable': ['STUDENT', 'FACULTY', 'ADMIN'],
  'attendance': ['STUDENT'],
  'learning': ['STUDENT', 'FACULTY'],
  'study-materials': ['STUDENT', 'FACULTY'],
  'answer-key': ['STUDENT', 'FACULTY'],
  'visual-algos': ['STUDENT'],
  'note-share': ['STUDENT'],
  'study-buddy': ['STUDENT'],
  'group-study': ['STUDENT'],
  'campus': ['STUDENT', 'FACULTY', 'WARDEN', 'ADMIN'],
  'hostel-hub': ['STUDENT'],
  'parent-portal': ['STUDENT', 'ADMIN'],
  'clubs-events': ['STUDENT', 'ADMIN'],
  'roommate': ['STUDENT'],
  'lost-found': ['STUDENT', 'ADMIN', 'WARDEN'],
  'budget': ['STUDENT'],
  'quick-poll': ['STUDENT', 'FACULTY', 'ADMIN'],
  'travel-pool': ['STUDENT', 'FACULTY'],
  'bus-transport': ['STUDENT', 'FACULTY'],
  'faculty': ['STUDENT'], // Student facing faculty portal
  'search': ['STUDENT', 'FACULTY', 'ADMIN'],
  'ai-chat': ['STUDENT', 'FACULTY'],
  'mock-interview': ['STUDENT'],
  'career': ['STUDENT'],
  'focus': ['STUDENT'],
  'fileshare': ['STUDENT', 'FACULTY', 'ADMIN'],
  'briefing': ['STUDENT', 'FACULTY', 'ADMIN'],
  'admin-automation': ['ADMIN'],
};

// Module categories with their items
const allCategories = [
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
    id: 'institution',
    label: 'Institution',
    items: [
      { id: 'student-info', label: 'Student SIS', icon: UserCheck },
      { id: 'attendance-admin', label: 'Attendance Rollup', icon: BarChart3 },
      { id: 'fees-finance', label: 'Fees & Finance', icon: Wallet },
      { id: 'examinations', label: 'Examinations', icon: FileText },
      { id: 'faculty-admin', label: 'Faculty Mgmt', icon: Users },
      { id: 'placement-admin', label: 'Placement Cell', icon: Rocket },
      { id: 'hostel-admin', label: 'Hostel Mgmt', icon: Building2 },
      { id: 'communication-hub', label: 'Communication', icon: Megaphone },
      { id: 'transport-admin', label: 'Transport', icon: Bus },
      { id: 'complaints', label: 'Complaints', icon: MessageSquareWarning },
    ],
  },
  {
    id: 'campus',
    label: 'Campus Life',
    items: [
      { id: 'safe', label: '🛡 VITGROWW SAFE', icon: ShieldAlert },
      { id: 'campus', label: 'Campus Explorer', icon: MapPin },
      { id: 'hostel-hub', label: 'Hostel Hub', icon: Building2 },
      { id: 'parent-portal', label: 'Parent Portal', icon: ShieldAlert },
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
  {
    id: 'safety-wellbeing',
    label: 'Safety & Security',
    items: [
      { id: 'security-dashboard', label: 'Security Ops', icon: ShieldAlert },
      { id: 'emergency-comm', label: 'Emergency', icon: Radio },
      { id: 'women-safety', label: 'Women\'s Safety', icon: ShieldAlert },
      { id: 'incident-reporting', label: 'Incident Report', icon: AlertTriangle },
      { id: 'visitor-management', label: 'Visitor Mgmt', icon: UserCheck },
      { id: 'student-wellbeing', label: 'Wellbeing', icon: Heart },
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
  const { activeRole } = useRBAC();

  // Filter categories based on RBAC
  const categories = allCategories
    .map(category => ({
      ...category,
      items: category.items.filter(item => {
        const allowedRoles = moduleAccess[item.id] || ['STUDENT']; // default
        return allowedRoles.includes(activeRole);
      })
    }))
    .filter(category => category.items.length > 0);

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
 {/* Solid metallic background */}
 <div
 className="absolute inset-0 bg-[var(--surface-base)] border-r border-[var(--border)]"
 />

 <div className="relative z-10 flex flex-col h-full">
 {/* Logo / Brand */}
 <div className="flex items-center justify-between h-16 px-4">
 {!collapsed && (
 <div className="flex items-center gap-2.5">
 <img 
 src="/logo.png" 
 alt="VIT-MERIDIAN Logo" 
 className="w-8 h-8 rounded-lg object-cover bg-transparent"
 />
 <span
 className="font-display font-bold text-base tracking-tight text-[var(--text-primary)]"
 >
 VIT-MERIDIAN
 </span>
 </div>
 )}
 {collapsed && (
 <img 
 src="/logo.png" 
 alt="VIT-MERIDIAN Logo" 
 className="w-8 h-8 rounded-lg object-cover bg-transparent mx-auto"
 />
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
 className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 overflow-hidden group ${collapsed ? 'justify-center' : ''
 }`}
 style={{
 background: activeSection === 'dashboard' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
 color: activeSection === 'dashboard' ? '#fff' : 'rgba(255, 255, 255, 0.6)',
 }}
 >
 {activeSection === 'dashboard' && (
 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-white rounded-r-full" />
 )}
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
 className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 overflow-hidden group ${collapsed ? 'justify-center' : ''
 }`}
 style={{
 background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
 color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.6)',
 }}
 onMouseEnter={e => {
 if (!isActive) {
 e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
 e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
 }
 }}
 onMouseLeave={e => {
 if (!isActive) {
 e.currentTarget.style.background = 'transparent';
 e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
 }
 }}
 title={collapsed ? item.label : undefined}
 >
 {isActive && (
 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-white rounded-r-full" />
 )}
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
