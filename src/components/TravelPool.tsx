'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Car,
    Plane,
    Train,
    MapPin,
    Calendar,
    Users,
    Phone,
    Plus,
    ArrowRight,
    Search,
    Filter
} from 'lucide-react';
import { useUser } from '@/context/UserContext';

// Define the shape of a traveler
interface Traveler {
    name: string;
    phone: string;
}

// Define the shape of a travel pool
interface TravelPoolItem {
    id: string;
    destination: string;
    date: string; // YYYY-MM-DD
    mode: 'Taxi' | 'Train' | 'Plane';
    travelers: Traveler[];
}

// Dummy data to populate the pool initially
const initialPools: TravelPoolItem[] = [
    {
        id: '1',
        destination: 'Airport (BLR)',
        date: '2023-12-15',
        mode: 'Taxi',
        travelers: [
            { name: 'Ayush Upadhyay', phone: '+91 9876543210' },
            { name: 'Sarah Chen', phone: '+91 9123456780' }
        ]
    },
    {
        id: '2',
        destination: 'Chennai Central',
        date: '2023-12-18',
        mode: 'Train',
        travelers: [
            { name: 'Rahul Sharma', phone: '+91 9876123450' }
        ]
    }
];

export default function TravelPool() {
    const { user } = useUser();
    const [pools, setPools] = useState<TravelPoolItem[]>(initialPools);

    // Form State
    const [destination, setDestination] = useState('');
    const [date, setDate] = useState('');
    const [mode, setMode] = useState<'Taxi' | 'Train' | 'Plane'>('Taxi');
    const [name, setName] = useState(user.name || '');
    const [phone, setPhone] = useState('');

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMode, setFilterMode] = useState<'All' | 'Taxi' | 'Train' | 'Plane'>('All');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!destination || !date || !name || !phone) {
            alert("Please fill all required fields.");
            return;
        }

        // Convert input to lowercase for robust matching
        const destLower = destination.trim().toLowerCase();

        // Check if an existing pool matches exactly: same destination, date, mode
        const existingPoolIndex = pools.findIndex(
            (p) =>
                p.destination.toLowerCase() === destLower &&
                p.date === date &&
                p.mode === mode
        );

        if (existingPoolIndex >= 0) {
            // Join existing pool
            const updatedPools = [...pools];
            // Prevent duplicates if same person clicks twice
            const isAlreadyInPool = updatedPools[existingPoolIndex].travelers.some(
                t => t.phone === phone
            );

            if (!isAlreadyInPool) {
                updatedPools[existingPoolIndex].travelers.push({ name, phone });
                setPools(updatedPools);
            } else {
                alert("You are already in this pool!");
            }
        } else {
            // Create new pool
            const newPool: TravelPoolItem = {
                id: Date.now().toString(),
                destination: destination.trim(),
                date,
                mode,
                travelers: [{ name, phone }]
            };
            setPools([newPool, ...pools]);
        }

        // Reset some form fields (keep name/phone for convenience optionally, but let's reset all for now)
        setDestination('');
        // Keep date and mode as they might want to add friends
        setName('');
        setPhone('');
    };

    const getModeIcon = (poolMode: string) => {
        switch (poolMode) {
            case 'Taxi': return <Car size={18} className="text-cyan-400" />;
            case 'Train': return <Train size={18} className="text-violet-400" />;
            case 'Plane': return <Plane size={18} className="text-emerald-400" />;
            default: return <Car size={18} />;
        }
    };

    // Filter the pools
    const filteredPools = pools.filter(pool => {
        const matchesSearch = pool.destination.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMode = filterMode === 'All' || pool.mode === filterMode;
        return matchesSearch && matchesMode;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Travel Pool</h2>
                    <p className="text-white/50 text-sm">Find companions for your journey home. Share rides, split costs, make friends.</p>
                </div>
                <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                    <Car className="text-cyan-400" size={24} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Pane: Create/Join Form */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden">
                        {/* Decorative gradient */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Plus size={18} className="text-cyan-400" />
                            Create or Join Pool
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-white/50 pl-1 uppercase tracking-wider">Destination</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                    <input
                                        type="text"
                                        required
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        placeholder="e.g. Airport, Railway Station"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-white/50 pl-1 uppercase tracking-wider">Date</label>
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                    <input
                                        type="date"
                                        required
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white/80 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
                                        style={{ colorScheme: 'dark' }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-white/50 pl-1 uppercase tracking-wider">Mode of Transport</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['Taxi', 'Train', 'Plane'] as const).map((m) => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => setMode(m)}
                                            className={`py-2 rounded-xl border text-sm flex items-center justify-center gap-2 transition-all ${mode === m
                                                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                                                    : 'bg-black/20 border-white/10 text-white/50 hover:bg-white/[0.04]'
                                                }`}
                                        >
                                            {m === 'Taxi' && <Car size={14} />}
                                            {m === 'Train' && <Train size={14} />}
                                            {m === 'Plane' && <Plane size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-white/[0.06] my-6" />

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-white/50 pl-1 uppercase tracking-wider">Your Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-white/50 pl-1 uppercase tracking-wider">Phone / WhatsApp</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                    <input
                                        type="tel"
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+91 98765 43210"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white font-medium py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2"
                            >
                                Find/Create Pool <ArrowRight size={16} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Pane: Active Pools List */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                            <input
                                type="text"
                                placeholder="Search destinations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 transition-all text-sm"
                            />
                        </div>
                        <div className="flex bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-xl p-1 overflow-x-auto no-scrollbar">
                            {(['All', 'Taxi', 'Train', 'Plane'] as const).map(m => (
                                <button
                                    key={m}
                                    onClick={() => setFilterMode(m)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filterMode === m
                                            ? 'bg-white/10 text-white shadow-sm'
                                            : 'text-white/50 hover:text-white/80'
                                        }`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pools List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {filteredPools.length > 0 ? (
                                filteredPools.map((pool) => (
                                    <motion.div
                                        key={pool.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                                                    {pool.destination}
                                                </h4>
                                                <div className="flex items-center gap-3 text-xs text-white/50">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {new Date(pool.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        {getModeIcon(pool.mode)}
                                                        {pool.mode}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="bg-white/5 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shrink-0 border border-white/10">
                                                <Users size={14} className="text-cyan-400" />
                                                <span className="text-sm font-medium text-white">{pool.travelers.length}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-xs font-medium text-white/30 uppercase tracking-widest pl-1">Travelers</p>
                                            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                                                {pool.travelers.map((traveler, idx) => (
                                                    <div key={idx} className="bg-black/20 rounded-xl p-3 flex justify-between items-center border border-white/[0.04]">
                                                        <span className="text-sm text-white/90">{traveler.name}</span>
                                                        <a
                                                            href={`tel:${traveler.phone}`}
                                                            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-500/10 px-2 py-1 rounded-md"
                                                        >
                                                            <Phone size={10} />
                                                            {traveler.phone}
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border border-white/[0.06] border-dashed rounded-2xl bg-white/[0.01]">
                                    <Car size={32} className="text-white/20 mb-3" />
                                    <p className="text-white/60 font-medium">No travel pools found.</p>
                                    <p className="text-sm text-white/40 mt-1">Be the first to create one for this destination.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </div>
    );
}
