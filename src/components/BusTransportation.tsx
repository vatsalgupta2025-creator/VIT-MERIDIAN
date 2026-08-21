'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bus,
    MapPin,
    Clock,
    Search,
    Filter,
    Navigation,
    ChevronRight,
    Calendar,
    Timer,
    Route,
    X,
    CheckCircle2,
    AlertCircle,
    TrainFront
} from 'lucide-react';

interface BusSchedule {
    id: string;
    busNumber: string;
    route: string;
    from: string;
    to: string;
    departure: string;
    arrival: string;
    type: 'AC' | 'Non-AC';
    status: 'On Time' | 'Delayed' | 'Boarding';
    platform: string;
}

const containerV = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemV = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const generateBusData = (): BusSchedule[] => {
    const areas = [
        'Tambaram', 'Guindy', 'Velachery', 'Chromepet', 'Perungudi', 'Taramani',
        'Saidapet', 'KK Nagar', 'Anna Nagar', 'Nungambakkam', 'Adyar',
        'Thiruvanmiyur', 'Maduravoyal', 'Porur', 'Iyyappanthangal', 'Avadi',
        'Ambattur', 'Poonamallee', 'Villivakkam', 'Kolathur'
    ];

    const busNumbers = [
        '1A', '3B', '5C', '7D', '10A', '12B', '15C', '18D', '21A', '23B',
        '25C', '27D', '30A', '33B', '35C', '38D', '40A', '42B', '45C', '47D',
        '50A', '52B', '55C', '57D', '60A', '62B', '65C', '67D', '70A', '72B'
    ];

    const statuses: BusSchedule['status'][] = ['On Time', 'Delayed', 'Boarding'];
    const types: BusSchedule['type'][] = ['AC', 'Non-AC'];

    const buses: BusSchedule[] = [];
    const usedNumbers = new Set<string>();

    for (let i = 0; i < 18; i++) {
        let busNum = busNumbers[i % busNumbers.length];
        while (usedNumbers.has(busNum)) {
            busNum = busNumbers[Math.floor(Math.random() * busNumbers.length)];
        }
        usedNumbers.add(busNum);

        const from = areas[Math.floor(Math.random() * areas.length)];
        let to = areas[Math.floor(Math.random() * areas.length)];
        while (to === from) {
            to = areas[Math.floor(Math.random() * areas.length)];
        }

        const baseMinutes = 8 * 60;
        const maxMinutes = 17 * 60 + 30;
        const departureMinutes = baseMinutes + Math.floor(Math.random() * (maxMinutes - baseMinutes));
        const depHour = Math.floor(departureMinutes / 60);
        const depMin = departureMinutes % 60;
        const departure = `${depHour.toString().padStart(2, '0')}:${depMin.toString().padStart(2, '0')}`;

        const travelMinutes = 20 + Math.floor(Math.random() * 50);
        const arrivalMinutes = departureMinutes + travelMinutes;
        const arrHour = Math.min(Math.floor(arrivalMinutes / 60), 23);
        const arrMin = arrivalMinutes % 60;
        const arrival = `${arrHour.toString().padStart(2, '0')}:${arrMin.toString().padStart(2, '0')}`;

        const type = types[Math.floor(Math.random() * types.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const platform = `P${Math.floor(Math.random() * 6) + 1}`;

        buses.push({
            id: `bus-${i}`,
            busNumber: busNum,
            route: `${from} → VIT Chennai`,
            from,
            to: 'VIT Chennai',
            departure,
            arrival,
            type,
            status,
            platform
        });
    }

    return buses.sort((a, b) => a.departure.localeCompare(b.departure));
};

const BusSVG = () => (
    <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="30" width="160" height="60" rx="12" fill="url(#busGrad)" stroke="#06b6d4" strokeWidth="2"/>
        <rect x="30" y="40" width="35" height="25" rx="4" fill="#0ea5e9" opacity="0.8"/>
        <rect x="75" y="40" width="35" height="25" rx="4" fill="#0ea5e9" opacity="0.8"/>
        <rect x="120" y="40" width="35" height="25" rx="4" fill="#0ea5e9" opacity="0.8"/>
        <circle cx="55" cy="95" r="10" fill="#1e293b" stroke="#06b6d4" strokeWidth="2"/>
        <circle cx="55" cy="95" r="4" fill="#06b6d4"/>
        <circle cx="145" cy="95" r="10" fill="#1e293b" stroke="#06b6d4" strokeWidth="2"/>
        <circle cx="145" cy="95" r="4" fill="#06b6d4"/>
        <rect x="10" y="55" width="12" height="20" rx="2" fill="#22d3ee" opacity="0.9"/>
        <rect x="10" y="60" width="8" height="10" rx="1" fill="#0891b2"/>
        <text x="100" y="75" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" opacity="0.9">VIT</text>
        <defs>
            <linearGradient id="busGrad" x1="20" y1="30" x2="180" y2="90" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0f172a"/>
                <stop offset="1" stopColor="#1e293b"/>
            </linearGradient>
        </defs>
    </svg>
);

export default function BusTransportation() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'All' | 'AC' | 'Non-AC'>('All');
    const [filterStatus, setFilterStatus] = useState<'All' | 'On Time' | 'Delayed' | 'Boarding'>('All');
    const buses = useMemo(() => generateBusData(), []);

    const filteredBuses = buses.filter(bus => {
        const matchesSearch = bus.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            bus.from.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'All' || bus.type === filterType;
        const matchesStatus = filterStatus === 'All' || bus.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    const stats = useMemo(() => ({
        total: buses.length,
        ac: buses.filter(b => b.type === 'AC').length,
        nonAc: buses.filter(b => b.type === 'Non-AC').length,
        nextBus: buses[0]?.departure || '--:--'
    }), [buses]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'On Time': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' };
            case 'Delayed': return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', dot: 'bg-rose-400' };
            case 'Boarding': return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400' };
            default: return { bg: 'bg-white/5', text: 'text-white/60', border: 'border-white/10', dot: 'bg-white/40' };
        }
    };

    const getTypeColor = (type: string) => type === 'AC'
        ? { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' }
        : { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' };

    return (
        <motion.div variants={containerV} initial="hidden" animate="show" className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-hidden">
            {/* Header */}
            <motion.div variants={itemV} className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.5 }}
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 border border-white/10">
                        <Bus size={28} className="text-white" />
                    </motion.div>
                    <div>
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Bus Transportation</h2>
                        <p className="text-white/40 text-sm mt-1">VIT Chennai Day Scholar Bus Schedule</p>
                    </div>
                </div>
            </motion.div>

            {/* Hero Bus Image */}
            <motion.div variants={itemV} className="relative h-40 rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02]">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-24 relative z-10">
                        <BusSVG />
                    </div>
                </div>
                <div className="absolute bottom-4 left-6 z-10">
                    <p className="text-white/60 text-xs font-medium">VIT Chennai Official Transit</p>
                    <p className="text-white/30 text-[10px]">Daily scheduled service for day scholars</p>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemV} className="grid grid-cols-4 gap-3 flex-shrink-0">
                {[
                    { label: 'Total Buses', value: stats.total, icon: Bus, color: 'cyan' },
                    { label: 'AC Buses', value: stats.ac, icon: CheckCircle2, color: 'emerald' },
                    { label: 'Non-AC', value: stats.nonAc, icon: AlertCircle, color: 'violet' },
                    { label: 'Next Bus', value: stats.nextBus, icon: Clock, color: 'amber' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-3.5 text-center">
                        <s.icon size={16} className={`text-${s.color}-400 mx-auto mb-1.5`} />
                        <p className="text-xl font-bold text-white/80">{s.value}</p>
                        <p className="text-[9px] text-white/25 uppercase tracking-wider">{s.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Filters */}
            <motion.div variants={itemV} className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search bus number or route..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 transition-all text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-xl p-1">
                        {(['All', 'AC', 'Non-AC'] as const).map(t => (
                            <button key={t} onClick={() => setFilterType(t)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${filterType === t ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                    <div className="flex bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-xl p-1">
                        {(['All', 'On Time', 'Delayed', 'Boarding'] as const).map(s => (
                            <button key={s} onClick={() => setFilterStatus(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${filterStatus === s ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Bus Cards */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
                <AnimatePresence mode="wait">
                    <motion.div key="buses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredBuses.length > 0 ? (
                            filteredBuses.map((bus, i) => {
                                const statusColor = getStatusColor(bus.status);
                                const typeColor = getTypeColor(bus.type);
                                return (
                                    <motion.div key={bus.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] transition-all group relative overflow-hidden">
                                        {/* Glow */}
                                        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none bg-amber-500/5" />

                                        <div className="relative z-10">
                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-xl ${typeColor.bg} flex items-center justify-center border ${typeColor.border}`}>
                                                        <Bus size={20} className={typeColor.text} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white/90 text-base font-bold group-hover:text-amber-400 transition-colors">Bus {bus.busNumber}</h4>
                                                        <p className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-block ${typeColor.bg} ${typeColor.text} border ${typeColor.border}`}>
                                                            {bus.type}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider border ${statusColor.bg} ${statusColor.text} ${statusColor.border} flex items-center gap-1.5`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusColor.dot} ${bus.status === 'Boarding' ? 'animate-pulse' : ''}`} />
                                                    {bus.status}
                                                </span>
                                            </div>

                                            {/* Route */}
                                            <div className="flex items-center gap-2 mb-4 p-2.5 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                                                <MapPin size={14} className="text-amber-400/70 flex-shrink-0" />
                                                <span className="text-xs text-white/70 font-medium truncate">{bus.route}</span>
                                            </div>

                                            {/* Timing */}
                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                                                    <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                                                        <Clock size={10} /> Departure
                                                    </p>
                                                    <p className="text-white font-bold text-sm">{bus.departure}</p>
                                                </div>
                                                <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                                                    <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                                                        <Navigation size={10} /> Arrival
                                                    </p>
                                                    <p className="text-white font-bold text-sm">{bus.arrival}</p>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                                                <div className="flex items-center gap-1.5 text-white/40 text-[11px]">
                                                    <TrainFront size={12} />
                                                    Platform {bus.platform}
                                                </div>
                                                <div className="flex items-center gap-1 text-amber-400/70 text-[11px] font-medium">
                                                    View Route <ChevronRight size={12} />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border border-white/[0.06] border-dashed rounded-2xl bg-white/[0.01]">
                                <Bus size={32} className="text-white/20 mb-3" />
                                <p className="text-white/60 font-medium">No buses found</p>
                                <p className="text-sm text-white/40 mt-1">Try adjusting your filters</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
