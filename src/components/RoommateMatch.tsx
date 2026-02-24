'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Home, Utensils, Thermometer, Bed, Search, Filter,
    Heart, MessageCircle, User, Clock, MapPin, Star, ChevronRight,
    X, Check, Sparkles, Sliders, Send, UserPlus, Building,
    Leaf, Flame, Coffee, Wind, Fan, UserCheck, UserX, Settings
} from 'lucide-react';
import { currentUser } from '@/data/mockData';
import AnoAI from './ui/animated-shader-background';

// Types
interface RoommateProfile {
    id: string;
    name: string;
    email: string;
    avatar: string;
    year: string;
    branch: string;
    bio: string;
    // Block preference
    preferredBlock: string;
    // Mess preference
    messPreference: 'veg' | 'non-veg' | 'special' | 'food-park';
    // Room preference
    roomType: '2-bed' | '3-bed' | '4-bed' | '6-bed';
    acPreference: 'ac' | 'non-ac';
    // Lifestyle preferences
    sleepTime: 'early' | 'moderate' | 'late';
    wakeTime: 'early' | 'moderate' | 'late';
    studyStyle: 'silent' | 'music' | 'group';
    cleanliness: 'neat-freak' | 'moderate' | 'relaxed';
    socialLevel: 'introvert' | 'ambivert' | 'extrovert';
    smoking: boolean;
    drinking: boolean;
    // Interests
    interests: string[];
    // Match info
    matchScore?: number;
    matchReasons?: string[];
    // Status
    status: 'looking' | 'matched' | 'not-looking';
    createdAt: Date;
}

interface UserPreferences {
    preferredBlock: string;
    messPreference: 'veg' | 'non-veg' | 'special' | 'food-park';
    roomType: '2-bed' | '3-bed' | '4-bed' | '6-bed';
    acPreference: 'ac' | 'non-ac';
    sleepTime: 'early' | 'moderate' | 'late';
    wakeTime: 'early' | 'moderate' | 'late';
    studyStyle: 'silent' | 'music' | 'group';
    cleanliness: 'neat-freak' | 'moderate' | 'relaxed';
    socialLevel: 'introvert' | 'ambivert' | 'extrovert';
    smoking: boolean;
    drinking: boolean;
    interests: string[];
}

// Constants
const BLOCKS = [
    { id: 'A', label: 'Block A', gender: 'boys', description: 'Near Academic Area' },
    { id: 'D1', label: 'Block D1', gender: 'boys', description: 'Central Location' },
    { id: 'D2', label: 'Block D2', gender: 'boys', description: 'Near Sports Complex' },
    { id: 'B', label: 'Block B', gender: 'girls', description: 'Girls Hostel' },
    { id: 'C', label: 'Block C', gender: 'boys', description: 'Quiet Zone' },
    { id: 'E', label: 'Block E', gender: 'boys', description: 'New Building' },
];

const MESS_OPTIONS = [
    { id: 'veg', label: 'Veg Mess', icon: Leaf, color: 'text-green-400' },
    { id: 'non-veg', label: 'Non-Veg Mess', icon: Flame, color: 'text-orange-400' },
    { id: 'special', label: 'Special Mess', icon: Star, color: 'text-amber-400' },
    { id: 'food-park', label: 'Food Park', icon: Coffee, color: 'text-purple-400' },
];

const ROOM_TYPES = [
    { id: '2-bed', label: '2 Bed', description: 'More privacy, premium' },
    { id: '3-bed', label: '3 Bed', description: 'Balanced option' },
    { id: '4-bed', label: '4 Bed', description: 'Standard room' },
    { id: '6-bed', label: '6 Bed', description: 'Budget friendly' },
];

const AC_OPTIONS = [
    { id: 'ac', label: 'AC Room', icon: Wind, description: 'Climate controlled' },
    { id: 'non-ac', label: 'Non-AC Room', icon: Fan, description: 'Natural ventilation' },
];

const SLEEP_TIMES = [
    { id: 'early', label: 'Early Bird', time: '10 PM - 11 PM' },
    { id: 'moderate', label: 'Moderate', time: '11 PM - 12 AM' },
    { id: 'late', label: 'Night Owl', time: '12 AM onwards' },
];

const WAKE_TIMES = [
    { id: 'early', label: 'Early Riser', time: '5 AM - 7 AM' },
    { id: 'moderate', label: 'Moderate', time: '7 AM - 9 AM' },
    { id: 'late', label: 'Late Riser', time: '9 AM onwards' },
];

const STUDY_STYLES = [
    { id: 'silent', label: 'Silent Study', icon: '🤫' },
    { id: 'music', label: 'With Music', icon: '🎧' },
    { id: 'group', label: 'Group Study', icon: '👥' },
];

const CLEANLINESS_LEVELS = [
    { id: 'neat-freak', label: 'Neat Freak', description: 'Everything spotless' },
    { id: 'moderate', label: 'Moderate', description: 'Clean but lived-in' },
    { id: 'relaxed', label: 'Relaxed', description: 'Messy is fine' },
];

const SOCIAL_LEVELS = [
    { id: 'introvert', label: 'Introvert', icon: '🧘' },
    { id: 'ambivert', label: 'Ambivert', icon: '🎭' },
    { id: 'extrovert', label: 'Extrovert', icon: '🎉' },
];

const INTERESTS = [
    'Gaming', 'Music', 'Sports', 'Reading', 'Movies', 'Coding',
    'Photography', 'Travel', 'Cooking', 'Fitness', 'Art', 'Dance',
    'Writing', 'Podcasts', 'Anime', 'Cricket', 'Football', 'Basketball'
];

// Mock Data
const mockProfiles: RoommateProfile[] = [
    {
        id: '1',
        name: 'Arjun Sharma',
        email: 'arjun.sharma2024@vitstudent.ac.in',
        avatar: 'AS',
        year: '2nd Year',
        branch: 'CSE',
        bio: 'Looking for a chill roommate who enjoys gaming and late-night coding sessions. I keep my space clean but not obsessive about it.',
        preferredBlock: 'A',
        messPreference: 'non-veg',
        roomType: '3-bed',
        acPreference: 'non-ac',
        sleepTime: 'late',
        wakeTime: 'moderate',
        studyStyle: 'music',
        cleanliness: 'moderate',
        socialLevel: 'ambivert',
        smoking: false,
        drinking: false,
        interests: ['Gaming', 'Coding', 'Music', 'Cricket'],
        status: 'looking',
        createdAt: new Date('2024-01-15'),
    },
    {
        id: '2',
        name: 'Rahul Verma',
        email: 'rahul.verma2024@vitstudent.ac.in',
        avatar: 'RV',
        year: '1st Year',
        branch: 'ECE',
        bio: 'Early riser, focused on studies. Looking for someone who values quiet time and cleanliness.',
        preferredBlock: 'D1',
        messPreference: 'veg',
        roomType: '2-bed',
        acPreference: 'ac',
        sleepTime: 'early',
        wakeTime: 'early',
        studyStyle: 'silent',
        cleanliness: 'neat-freak',
        socialLevel: 'introvert',
        smoking: false,
        drinking: false,
        interests: ['Reading', 'Fitness', 'Music'],
        status: 'looking',
        createdAt: new Date('2024-01-18'),
    },
    {
        id: '3',
        name: 'Karthik Menon',
        email: 'karthik.m2023@vitstudent.ac.in',
        avatar: 'KM',
        year: '3rd Year',
        branch: 'IT',
        bio: 'Sports enthusiast! Looking for roommates who enjoy football and are okay with occasional gatherings.',
        preferredBlock: 'D2',
        messPreference: 'non-veg',
        roomType: '4-bed',
        acPreference: 'non-ac',
        sleepTime: 'moderate',
        wakeTime: 'early',
        studyStyle: 'group',
        cleanliness: 'moderate',
        socialLevel: 'extrovert',
        smoking: false,
        drinking: false,
        interests: ['Sports', 'Football', 'Fitness', 'Travel'],
        status: 'looking',
        createdAt: new Date('2024-01-20'),
    },
    {
        id: '4',
        name: 'Vikram Singh',
        email: 'vikram.singh2024@vitstudent.ac.in',
        avatar: 'VS',
        year: '2nd Year',
        branch: 'CSE',
        bio: 'Anime lover and night owl. Looking for someone who respects personal space but is up for occasional movie nights.',
        preferredBlock: 'E',
        messPreference: 'special',
        roomType: '3-bed',
        acPreference: 'ac',
        sleepTime: 'late',
        wakeTime: 'late',
        studyStyle: 'music',
        cleanliness: 'relaxed',
        socialLevel: 'ambivert',
        smoking: false,
        drinking: false,
        interests: ['Anime', 'Gaming', 'Movies', 'Coding'],
        status: 'looking',
        createdAt: new Date('2024-01-22'),
    },
    {
        id: '5',
        name: 'Aditya Kumar',
        email: 'aditya.k2024@vitstudent.ac.in',
        avatar: 'AK',
        year: '1st Year',
        branch: 'Mechanical',
        bio: 'Fitness freak and early bird. Looking for like-minded roommates who hit the gym and maintain discipline.',
        preferredBlock: 'C',
        messPreference: 'non-veg',
        roomType: '2-bed',
        acPreference: 'ac',
        sleepTime: 'early',
        wakeTime: 'early',
        studyStyle: 'silent',
        cleanliness: 'neat-freak',
        socialLevel: 'ambivert',
        smoking: false,
        drinking: false,
        interests: ['Fitness', 'Sports', 'Reading', 'Cooking'],
        status: 'looking',
        createdAt: new Date('2024-01-25'),
    },
    {
        id: '6',
        name: 'Siddharth Rao',
        email: 'sid.rao2023@vitstudent.ac.in',
        avatar: 'SR',
        year: '3rd Year',
        branch: 'CSE',
        bio: 'Music producer and coder. Need a roommate who is okay with occasional music sessions (with headphones).',
        preferredBlock: 'A',
        messPreference: 'food-park',
        roomType: '4-bed',
        acPreference: 'non-ac',
        sleepTime: 'late',
        wakeTime: 'moderate',
        studyStyle: 'music',
        cleanliness: 'moderate',
        socialLevel: 'extrovert',
        smoking: false,
        drinking: false,
        interests: ['Music', 'Coding', 'Photography', 'Travel'],
        status: 'looking',
        createdAt: new Date('2024-01-28'),
    },
];

// Calculate match score
const calculateMatchScore = (profile: RoommateProfile, preferences: UserPreferences): { score: number; reasons: string[] } => {
    let score = 0;
    const reasons: string[] = [];
    const maxScore = 100;

    // Block preference (20 points)
    if (profile.preferredBlock === preferences.preferredBlock) {
        score += 20;
        reasons.push('Same block preference');
    }

    // Mess preference (15 points)
    if (profile.messPreference === preferences.messPreference) {
        score += 15;
        reasons.push('Same mess preference');
    }

    // Room type (15 points)
    if (profile.roomType === preferences.roomType) {
        score += 15;
        reasons.push('Same room type');
    }

    // AC preference (10 points)
    if (profile.acPreference === preferences.acPreference) {
        score += 10;
        reasons.push('Same AC preference');
    }

    // Sleep time (10 points)
    if (profile.sleepTime === preferences.sleepTime) {
        score += 10;
        reasons.push('Similar sleep schedule');
    }

    // Wake time (5 points)
    if (profile.wakeTime === preferences.wakeTime) {
        score += 5;
        reasons.push('Similar wake time');
    }

    // Study style (5 points)
    if (profile.studyStyle === preferences.studyStyle) {
        score += 5;
        reasons.push('Compatible study style');
    }

    // Cleanliness (10 points)
    if (profile.cleanliness === preferences.cleanliness) {
        score += 10;
        reasons.push('Similar cleanliness level');
    }

    // Social level (5 points)
    if (profile.socialLevel === preferences.socialLevel) {
        score += 5;
        reasons.push('Similar social style');
    }

    // Interests (5 points max)
    const commonInterests = profile.interests.filter(i => preferences.interests.includes(i));
    if (commonInterests.length > 0) {
        score += Math.min(5, commonInterests.length * 2);
        reasons.push(`${commonInterests.length} common interests`);
    }

    return { score: Math.round((score / maxScore) * 100), reasons };
};

export default function RoommateMatch() {
    // State
    const [activeTab, setActiveTab] = useState<'browse' | 'preferences' | 'requests'>('browse');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBlock, setSelectedBlock] = useState('all');
    const [selectedMess, setSelectedMess] = useState('all');
    const [selectedRoomType, setSelectedRoomType] = useState('all');
    const [selectedProfile, setSelectedProfile] = useState<RoommateProfile | null>(null);
    const [showPreferencesModal, setShowPreferencesModal] = useState(false);

    // User preferences state
    const [userPrefs, setUserPrefs] = useState<UserPreferences>({
        preferredBlock: 'A',
        messPreference: 'non-veg',
        roomType: '3-bed',
        acPreference: 'non-ac',
        sleepTime: 'moderate',
        wakeTime: 'moderate',
        studyStyle: 'music',
        cleanliness: 'moderate',
        socialLevel: 'ambivert',
        smoking: false,
        drinking: false,
        interests: ['Gaming', 'Coding'],
    });

    // Connection requests state
    const [sentRequests, setSentRequests] = useState<string[]>([]);
    const [receivedRequests, setReceivedRequests] = useState<string[]>(['2', '5']);

    // Calculate match scores for all profiles
    const profiles = useMemo(() => {
        return mockProfiles.map(profile => {
            const { score, reasons } = calculateMatchScore(profile, userPrefs);
            return { ...profile, matchScore: score, matchReasons: reasons };
        }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }, [userPrefs]);

    // Filter profiles
    const filteredProfiles = useMemo(() => {
        return profiles.filter(profile => {
            if (selectedBlock !== 'all' && profile.preferredBlock !== selectedBlock) return false;
            if (selectedMess !== 'all' && profile.messPreference !== selectedMess) return false;
            if (selectedRoomType !== 'all' && profile.roomType !== selectedRoomType) return false;
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    profile.name.toLowerCase().includes(query) ||
                    profile.branch.toLowerCase().includes(query) ||
                    profile.interests.some(i => i.toLowerCase().includes(query))
                );
            }
            return true;
        });
    }, [profiles, selectedBlock, selectedMess, selectedRoomType, searchQuery]);

    // Get match score color
    const getMatchColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-emerald-400';
        if (score >= 40) return 'text-amber-400';
        return 'text-orange-400';
    };

    // Get match score bg
    const getMatchBg = (score: number) => {
        if (score >= 80) return 'bg-green-500/20 border-green-500/30';
        if (score >= 60) return 'bg-emerald-500/20 border-emerald-500/30';
        if (score >= 40) return 'bg-amber-500/20 border-amber-500/30';
        return 'bg-orange-500/20 border-orange-500/30';
    };

    // Send connection request
    const sendRequest = (profileId: string) => {
        setSentRequests(prev => [...prev, profileId]);
    };

    // Accept request
    const acceptRequest = (profileId: string) => {
        setReceivedRequests(prev => prev.filter(id => id !== profileId));
        // In real app, this would create a match
    };

    // Reject request
    const rejectRequest = (profileId: string) => {
        setReceivedRequests(prev => prev.filter(id => id !== profileId));
    };

    // Profile Card Component
    const ProfileCard = ({ profile }: { profile: RoommateProfile }) => {
        const messConfig = MESS_OPTIONS.find(m => m.id === profile.messPreference);
        const blockConfig = BLOCKS.find(b => b.id === profile.preferredBlock);

        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="group relative bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all"
            >
                {/* Match Score Badge */}
                {profile.matchScore !== undefined && (
                    <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg border text-xs font-bold ${getMatchBg(profile.matchScore)} ${getMatchColor(profile.matchScore)}`}>
                        {profile.matchScore}% Match
                    </div>
                )}

                <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white">
                            {profile.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white/90">{profile.name}</h3>
                            <p className="text-xs text-white/40">{profile.year} • {profile.branch}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Building size={12} className="text-violet-400" />
                                <span className="text-xs text-violet-400">Block {profile.preferredBlock}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-white/50 line-clamp-2 mb-4">{profile.bio}</p>

                    {/* Preferences Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] rounded-lg">
                            <Utensils size={14} className={messConfig?.color || 'text-white/40'} />
                            <span className="text-xs text-white/60">{messConfig?.label}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] rounded-lg">
                            <Bed size={14} className="text-cyan-400" />
                            <span className="text-xs text-white/60">{profile.roomType}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] rounded-lg">
                            {profile.acPreference === 'ac' ? (
                                <Wind size={14} className="text-blue-400" />
                            ) : (
                                <Fan size={14} className="text-teal-400" />
                            )}
                            <span className="text-xs text-white/60">{profile.acPreference === 'ac' ? 'AC' : 'Non-AC'}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] rounded-lg">
                            <Clock size={14} className="text-amber-400" />
                            <span className="text-xs text-white/60">{SLEEP_TIMES.find(s => s.id === profile.sleepTime)?.label}</span>
                        </div>
                    </div>

                    {/* Interests */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {profile.interests.slice(0, 4).map(interest => (
                            <span key={interest} className="px-2 py-0.5 rounded-md bg-violet-500/10 text-[10px] text-violet-400">
                                {interest}
                            </span>
                        ))}
                        {profile.interests.length > 4 && (
                            <span className="px-2 py-0.5 rounded-md bg-white/[0.05] text-[10px] text-white/40">
                                +{profile.interests.length - 4}
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                        <button
                            onClick={() => setSelectedProfile(profile)}
                            className="flex-1 py-2.5 rounded-xl bg-white/[0.05] text-white/60 text-sm font-medium hover:bg-white/[0.08] hover:text-white transition-all"
                        >
                            View Profile
                        </button>
                        {sentRequests.includes(profile.id) ? (
                            <button
                                disabled
                                className="flex-1 py-2.5 rounded-xl bg-violet-500/20 text-violet-400 text-sm font-medium"
                            >
                                <Check size={14} className="inline mr-1" />
                                Request Sent
                            </button>
                        ) : (
                            <button
                                onClick={() => sendRequest(profile.id)}
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                            >
                                <UserPlus size={14} className="inline mr-1" />
                                Connect
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="space-y-6 relative">
            {/* AnoAI Aurora Background */}
            <div className="fixed inset-0 z-0 pointer-events-none" style={{ opacity: 0.35 }}>
                <AnoAI />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Users size={20} className="text-white" />
                        </div>
                        Roommate Match
                    </h1>
                    <p className="text-sm text-white/40 mt-1">Find your perfect roommate based on preferences</p>
                </div>
                <button
                    onClick={() => setShowPreferencesModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-500/20 text-violet-400 rounded-xl text-sm font-medium hover:bg-violet-500/30 transition-colors"
                >
                    <Sliders size={16} />
                    My Preferences
                </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl w-fit">
                {[
                    { id: 'browse', label: 'Browse', icon: Search },
                    { id: 'preferences', label: 'My Preferences', icon: Sliders },
                    { id: 'requests', label: 'Requests', icon: UserCheck, badge: receivedRequests.length },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'bg-violet-500/20 text-violet-400'
                            : 'text-white/40 hover:text-white/60'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                        {tab.badge && tab.badge > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-[10px] text-white">
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Browse Tab */}
            {activeTab === 'browse' && (
                <>
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, branch, interests..."
                                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/30 transition-colors"
                            />
                        </div>

                        {/* Block Filter */}
                        <select
                            value={selectedBlock}
                            onChange={(e) => setSelectedBlock(e.target.value)}
                            className="px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white/70 focus:outline-none focus:border-violet-500/30"
                        >
                            <option value="all">All Blocks</option>
                            {BLOCKS.map(block => (
                                <option key={block.id} value={block.id}>Block {block.id}</option>
                            ))}
                        </select>

                        {/* Mess Filter */}
                        <select
                            value={selectedMess}
                            onChange={(e) => setSelectedMess(e.target.value)}
                            className="px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white/70 focus:outline-none focus:border-violet-500/30"
                        >
                            <option value="all">All Mess</option>
                            {MESS_OPTIONS.map(mess => (
                                <option key={mess.id} value={mess.id}>{mess.label}</option>
                            ))}
                        </select>

                        {/* Room Type Filter */}
                        <select
                            value={selectedRoomType}
                            onChange={(e) => setSelectedRoomType(e.target.value)}
                            className="px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white/70 focus:outline-none focus:border-violet-500/30"
                        >
                            <option value="all">All Room Types</option>
                            {ROOM_TYPES.map(room => (
                                <option key={room.id} value={room.id}>{room.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Profiles Grid */}
                    <AnimatePresence mode="wait">
                        {filteredProfiles.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-16"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                                    <Users size={32} className="text-white/20" />
                                </div>
                                <p className="text-lg font-medium text-white/40 mb-2">No profiles found</p>
                                <p className="text-sm text-white/30">Try adjusting your filters</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={`${selectedBlock}-${selectedMess}-${selectedRoomType}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                            >
                                {filteredProfiles.map(profile => (
                                    <ProfileCard key={profile.id} profile={profile} />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6"
                >
                    <h2 className="text-lg font-semibold text-white mb-6">Your Roommate Preferences</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Block Preference */}
                        <div>
                            <label className="block text-sm text-white/60 mb-3">Preferred Block</label>
                            <div className="grid grid-cols-3 gap-2">
                                {BLOCKS.map(block => (
                                    <button
                                        key={block.id}
                                        onClick={() => setUserPrefs(prev => ({ ...prev, preferredBlock: block.id }))}
                                        className={`p-3 rounded-xl text-sm transition-all ${userPrefs.preferredBlock === block.id
                                            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                            : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.06]'
                                            }`}
                                    >
                                        Block {block.id}
                                        {block.gender === 'girls' && (
                                            <span className="block text-[10px] text-pink-400">(Girls)</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mess Preference */}
                        <div>
                            <label className="block text-sm text-white/60 mb-3">Mess Preference</label>
                            <div className="grid grid-cols-2 gap-2">
                                {MESS_OPTIONS.map(mess => (
                                    <button
                                        key={mess.id}
                                        onClick={() => setUserPrefs(prev => ({ ...prev, messPreference: mess.id as typeof userPrefs.messPreference }))}
                                        className={`flex items-center gap-2 p-3 rounded-xl text-sm transition-all ${userPrefs.messPreference === mess.id
                                            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                            : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.06]'
                                            }`}
                                    >
                                        <mess.icon size={16} className={mess.color} />
                                        {mess.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Room Type */}
                        <div>
                            <label className="block text-sm text-white/60 mb-3">Room Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {ROOM_TYPES.map(room => (
                                    <button
                                        key={room.id}
                                        onClick={() => setUserPrefs(prev => ({ ...prev, roomType: room.id as typeof userPrefs.roomType }))}
                                        className={`p-3 rounded-xl text-sm transition-all ${userPrefs.roomType === room.id
                                            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                            : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.06]'
                                            }`}
                                    >
                                        <span className="font-medium">{room.label}</span>
                                        <span className="block text-[10px] text-white/30">{room.description}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* AC Preference */}
                        <div>
                            <label className="block text-sm text-white/60 mb-3">AC Preference</label>
                            <div className="grid grid-cols-2 gap-2">
                                {AC_OPTIONS.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setUserPrefs(prev => ({ ...prev, acPreference: opt.id as typeof userPrefs.acPreference }))}
                                        className={`flex items-center gap-2 p-3 rounded-xl text-sm transition-all ${userPrefs.acPreference === opt.id
                                            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                            : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.06]'
                                            }`}
                                    >
                                        <opt.icon size={16} />
                                        <div>
                                            <span className="block">{opt.label}</span>
                                            <span className="text-[10px] text-white/30">{opt.description}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sleep Time */}
                        <div>
                            <label className="block text-sm text-white/60 mb-3">Sleep Time</label>
                            <div className="grid grid-cols-3 gap-2">
                                {SLEEP_TIMES.map(time => (
                                    <button
                                        key={time.id}
                                        onClick={() => setUserPrefs(prev => ({ ...prev, sleepTime: time.id as typeof userPrefs.sleepTime }))}
                                        className={`p-3 rounded-xl text-sm transition-all ${userPrefs.sleepTime === time.id
                                            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                            : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.06]'
                                            }`}
                                    >
                                        <span className="block font-medium">{time.label}</span>
                                        <span className="text-[10px] text-white/30">{time.time}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Wake Time */}
                        <div>
                            <label className="block text-sm text-white/60 mb-3">Wake Up Time</label>
                            <div className="grid grid-cols-3 gap-2">
                                {WAKE_TIMES.map(time => (
                                    <button
                                        key={time.id}
                                        onClick={() => setUserPrefs(prev => ({ ...prev, wakeTime: time.id as typeof userPrefs.wakeTime }))}
                                        className={`p-3 rounded-xl text-sm transition-all ${userPrefs.wakeTime === time.id
                                            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                            : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.06]'
                                            }`}
                                    >
                                        <span className="block font-medium">{time.label}</span>
                                        <span className="text-[10px] text-white/30">{time.time}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Study Style */}
                        <div>
                            <label className="block text-sm text-white/60 mb-3">Study Style</label>
                            <div className="grid grid-cols-3 gap-2">
                                {STUDY_STYLES.map(style => (
                                    <button
                                        key={style.id}
                                        onClick={() => setUserPrefs(prev => ({ ...prev, studyStyle: style.id as typeof userPrefs.studyStyle }))}
                                        className={`p-3 rounded-xl text-sm transition-all ${userPrefs.studyStyle === style.id
                                            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                            : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.06]'
                                            }`}
                                    >
                                        <span className="text-lg">{style.icon}</span>
                                        <span className="block text-xs mt-1">{style.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Cleanliness */}
                        <div>
                            <label className="block text-sm text-white/60 mb-3">Cleanliness Level</label>
                            <div className="grid grid-cols-3 gap-2">
                                {CLEANLINESS_LEVELS.map(level => (
                                    <button
                                        key={level.id}
                                        onClick={() => setUserPrefs(prev => ({ ...prev, cleanliness: level.id as typeof userPrefs.cleanliness }))}
                                        className={`p-3 rounded-xl text-sm transition-all ${userPrefs.cleanliness === level.id
                                            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                            : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.06]'
                                            }`}
                                    >
                                        <span className="block font-medium">{level.label}</span>
                                        <span className="text-[10px] text-white/30">{level.description}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Social Level */}
                        <div>
                            <label className="block text-sm text-white/60 mb-3">Social Level</label>
                            <div className="grid grid-cols-3 gap-2">
                                {SOCIAL_LEVELS.map(level => (
                                    <button
                                        key={level.id}
                                        onClick={() => setUserPrefs(prev => ({ ...prev, socialLevel: level.id as typeof userPrefs.socialLevel }))}
                                        className={`p-3 rounded-xl text-sm transition-all ${userPrefs.socialLevel === level.id
                                            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                            : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.06]'
                                            }`}
                                    >
                                        <span className="text-lg">{level.icon}</span>
                                        <span className="block text-xs mt-1">{level.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Interests */}
                        <div className="md:col-span-2">
                            <label className="block text-sm text-white/60 mb-3">Interests (Select all that apply)</label>
                            <div className="flex flex-wrap gap-2">
                                {INTERESTS.map(interest => (
                                    <button
                                        key={interest}
                                        onClick={() => {
                                            setUserPrefs(prev => ({
                                                ...prev,
                                                interests: prev.interests.includes(interest)
                                                    ? prev.interests.filter(i => i !== interest)
                                                    : [...prev.interests, interest]
                                            }));
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${userPrefs.interests.includes(interest)
                                            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                            : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.06]'
                                            }`}
                                    >
                                        {interest}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="mt-6 pt-6 border-t border-white/[0.06]">
                        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium text-sm hover:opacity-90 transition-opacity">
                            Save Preferences
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Received Requests */}
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <UserCheck size={20} className="text-violet-400" />
                            Received Requests ({receivedRequests.length})
                        </h2>

                        {receivedRequests.length === 0 ? (
                            <p className="text-sm text-white/40 text-center py-8">No pending requests</p>
                        ) : (
                            <div className="space-y-3">
                                {receivedRequests.map(requestId => {
                                    const profile = profiles.find(p => p.id === requestId);
                                    if (!profile) return null;

                                    return (
                                        <div
                                            key={profile.id}
                                            className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                                                    {profile.avatar}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white/90">{profile.name}</p>
                                                    <p className="text-xs text-white/40">{profile.year} • {profile.branch}</p>
                                                </div>
                                                {profile.matchScore !== undefined && (
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getMatchBg(profile.matchScore)} ${getMatchColor(profile.matchScore)}`}>
                                                        {profile.matchScore}% Match
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => rejectRequest(profile.id)}
                                                    className="p-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                                >
                                                    <UserX size={18} />
                                                </button>
                                                <button
                                                    onClick={() => acceptRequest(profile.id)}
                                                    className="p-2.5 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                                                >
                                                    <UserCheck size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Sent Requests */}
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Send size={20} className="text-cyan-400" />
                            Sent Requests ({sentRequests.length})
                        </h2>

                        {sentRequests.length === 0 ? (
                            <p className="text-sm text-white/40 text-center py-8">No sent requests</p>
                        ) : (
                            <div className="space-y-3">
                                {sentRequests.map(requestId => {
                                    const profile = profiles.find(p => p.id === requestId);
                                    if (!profile) return null;

                                    return (
                                        <div
                                            key={profile.id}
                                            className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                                                    {profile.avatar}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white/90">{profile.name}</p>
                                                    <p className="text-xs text-white/40">{profile.year} • {profile.branch}</p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-medium">
                                                Pending
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Profile Detail Modal */}
            <AnimatePresence>
                {selectedProfile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedProfile(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#0c0f17] rounded-2xl border border-white/[0.06] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
                                        {selectedProfile.avatar}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{selectedProfile.name}</h2>
                                        <p className="text-sm text-white/40">{selectedProfile.year} • {selectedProfile.branch}</p>
                                        <p className="text-xs text-white/30">{selectedProfile.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedProfile(null)}
                                    className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Match Score */}
                            {selectedProfile.matchScore !== undefined && (
                                <div className={`p-4 rounded-xl mb-6 ${getMatchBg(selectedProfile.matchScore)}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-white/60">Match Score</span>
                                        <span className={`text-2xl font-bold ${getMatchColor(selectedProfile.matchScore)}`}>
                                            {selectedProfile.matchScore}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${selectedProfile.matchScore >= 80 ? 'bg-green-500' :
                                                selectedProfile.matchScore >= 60 ? 'bg-emerald-500' :
                                                    selectedProfile.matchScore >= 40 ? 'bg-amber-500' : 'bg-orange-500'
                                                }`}
                                            style={{ width: `${selectedProfile.matchScore}%` }}
                                        />
                                    </div>
                                    {selectedProfile.matchReasons && selectedProfile.matchReasons.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {selectedProfile.matchReasons.map((reason, idx) => (
                                                <span key={idx} className="px-2 py-1 rounded-lg bg-white/10 text-xs text-white/60">
                                                    ✓ {reason}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Bio */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-white/60 mb-2">About</h3>
                                <p className="text-sm text-white/80 leading-relaxed">{selectedProfile.bio}</p>
                            </div>

                            {/* Preferences Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-white/[0.03] rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building size={16} className="text-violet-400" />
                                        <span className="text-xs text-white/40">Block</span>
                                    </div>
                                    <p className="text-sm font-medium text-white">Block {selectedProfile.preferredBlock}</p>
                                </div>
                                <div className="p-4 bg-white/[0.03] rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Utensils size={16} className={MESS_OPTIONS.find(m => m.id === selectedProfile.messPreference)?.color} />
                                        <span className="text-xs text-white/40">Mess</span>
                                    </div>
                                    <p className="text-sm font-medium text-white">{MESS_OPTIONS.find(m => m.id === selectedProfile.messPreference)?.label}</p>
                                </div>
                                <div className="p-4 bg-white/[0.03] rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Bed size={16} className="text-cyan-400" />
                                        <span className="text-xs text-white/40">Room Type</span>
                                    </div>
                                    <p className="text-sm font-medium text-white">{ROOM_TYPES.find(r => r.id === selectedProfile.roomType)?.label}</p>
                                </div>
                                <div className="p-4 bg-white/[0.03] rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        {selectedProfile.acPreference === 'ac' ? (
                                            <Wind size={16} className="text-blue-400" />
                                        ) : (
                                            <Fan size={16} className="text-teal-400" />
                                        )}
                                        <span className="text-xs text-white/40">AC Preference</span>
                                    </div>
                                    <p className="text-sm font-medium text-white">{selectedProfile.acPreference === 'ac' ? 'AC Room' : 'Non-AC Room'}</p>
                                </div>
                            </div>

                            {/* Lifestyle */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-white/60 mb-3">Lifestyle</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-3 bg-white/[0.03] rounded-xl text-center">
                                        <span className="text-2xl">🌙</span>
                                        <p className="text-xs text-white/40 mt-1">Sleep</p>
                                        <p className="text-sm text-white/80">{SLEEP_TIMES.find(s => s.id === selectedProfile.sleepTime)?.label}</p>
                                    </div>
                                    <div className="p-3 bg-white/[0.03] rounded-xl text-center">
                                        <span className="text-2xl">☀️</span>
                                        <p className="text-xs text-white/40 mt-1">Wake</p>
                                        <p className="text-sm text-white/80">{WAKE_TIMES.find(w => w.id === selectedProfile.wakeTime)?.label}</p>
                                    </div>
                                    <div className="p-3 bg-white/[0.03] rounded-xl text-center">
                                        <span className="text-2xl">{STUDY_STYLES.find(s => s.id === selectedProfile.studyStyle)?.icon}</span>
                                        <p className="text-xs text-white/40 mt-1">Study</p>
                                        <p className="text-sm text-white/80">{STUDY_STYLES.find(s => s.id === selectedProfile.studyStyle)?.label}</p>
                                    </div>
                                    <div className="p-3 bg-white/[0.03] rounded-xl text-center">
                                        <span className="text-2xl">🧹</span>
                                        <p className="text-xs text-white/40 mt-1">Cleanliness</p>
                                        <p className="text-sm text-white/80">{CLEANLINESS_LEVELS.find(c => c.id === selectedProfile.cleanliness)?.label}</p>
                                    </div>
                                    <div className="p-3 bg-white/[0.03] rounded-xl text-center">
                                        <span className="text-2xl">{SOCIAL_LEVELS.find(s => s.id === selectedProfile.socialLevel)?.icon}</span>
                                        <p className="text-xs text-white/40 mt-1">Social</p>
                                        <p className="text-sm text-white/80">{SOCIAL_LEVELS.find(s => s.id === selectedProfile.socialLevel)?.label}</p>
                                    </div>
                                    <div className="p-3 bg-white/[0.03] rounded-xl text-center">
                                        <span className="text-2xl">🚭</span>
                                        <p className="text-xs text-white/40 mt-1">Habits</p>
                                        <p className="text-sm text-white/80">
                                            {selectedProfile.smoking ? '🚬' : '❌'} {selectedProfile.drinking ? '🍺' : '❌'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Interests */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-white/60 mb-3">Interests</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProfile.interests.map(interest => (
                                        <span key={interest} className="px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-400 text-sm">
                                            {interest}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                                <button
                                    onClick={() => setSelectedProfile(null)}
                                    className="flex-1 py-3 rounded-xl bg-white/[0.05] text-white/60 text-sm font-medium hover:bg-white/[0.08] transition-colors"
                                >
                                    Close
                                </button>
                                {sentRequests.includes(selectedProfile.id) ? (
                                    <button
                                        disabled
                                        className="flex-1 py-3 rounded-xl bg-violet-500/20 text-violet-400 text-sm font-medium"
                                    >
                                        <Check size={16} className="inline mr-1" />
                                        Request Sent
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            sendRequest(selectedProfile.id);
                                            setSelectedProfile(null);
                                        }}
                                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                                    >
                                        <UserPlus size={16} className="inline mr-1" />
                                        Send Connection Request
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
