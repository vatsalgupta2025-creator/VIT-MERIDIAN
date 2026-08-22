'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
 Bus,
 MapPin,
 Clock,
 Search,
 Navigation,
 ChevronRight,
 TrainFront,
 CheckCircle2,
 AlertCircle,
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

const generateBusData = (): BusSchedule[] => {
 const areas = [
 'Tambaram', 'Guindy', 'Velachery', 'Chromepet', 'Perungudi', 'Taramani',
 'Saidapet', 'KK Nagar', 'Anna Nagar', 'Nungambakkam', 'Adyar',
 'Thiruvanmiyur', 'Maduravoyal', 'Porur', 'Iyyappanthangal', 'Avadi',
 'Ambattur', 'Poonamallee', 'Villivakkam', 'Kolathur',
 ];

 const busNumbers = [
 '1A', '3B', '5C', '7D', '10A', '12B', '15C', '18D', '21A', '23B',
 '25C', '27D', '30A', '33B', '35C', '38D', '40A', '42B', '45C', '47D',
 '50A', '52B', '55C', '57D', '60A', '62B', '65C', '67D', '70A', '72B',
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
 platform,
 });
 }

 return buses.sort((a, b) => a.departure.localeCompare(b.departure));
};

const BusSVG = () => (
 <svg viewBox="0 0 200 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
 <rect x="20" y="30" width="160" height="60" rx="12" fill="url(#busGrad)" stroke="#06b6d4" strokeWidth="2" />
 <rect x="30" y="40" width="35" height="25" rx="4" fill="#0ea5e9" opacity="0.8" />
 <rect x="75" y="40" width="35" height="25" rx="4" fill="#0ea5e9" opacity="0.8" />
 <rect x="120" y="40" width="35" height="25" rx="4" fill="#0ea5e9" opacity="0.8" />
 <circle cx="55" cy="95" r="10" fill="#1e293b" stroke="#06b6d4" strokeWidth="2" />
 <circle cx="55" cy="95" r="4" fill="#06b6d4" />
 <circle cx="145" cy="95" r="10" fill="#1e293b" stroke="#06b6d4" strokeWidth="2" />
 <circle cx="145" cy="95" r="4" fill="#06b6d4" />
 <rect x="10" y="55" width="12" height="20" rx="2" fill="#22d3ee" opacity="0.9" />
 <rect x="10" y="60" width="8" height="10" rx="1" fill="#0891b2" />
 <text x="100" y="75" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" opacity="0.9">VIT</text>
 <defs>
 <linearGradient id="busGrad" x1="20" y1="30" x2="180" y2="90" gradientUnits="userSpaceOnUse">
 <stop stopColor="#0f172a" />
 <stop offset="1" stopColor="#1e293b" />
 </linearGradient>
 </defs>
 </svg>
);

export default function BusTransportation() {
 const [searchQuery, setSearchQuery] = useState('');
 const [filterType, setFilterType] = useState<'All' | 'AC' | 'Non-AC'>('All');
 const [filterStatus, setFilterStatus] = useState<'All' | 'On Time' | 'Delayed' | 'Boarding'>('All');
 const [scrollProgress, setScrollProgress] = useState(0);

 const buses = useMemo(() => generateBusData(), []);
 const heroRef = useRef<HTMLDivElement>(null);
 const statsRef = useRef<HTMLDivElement>(null);
 const filtersRef = useRef<HTMLDivElement>(null);
 const cardsRef = useRef<HTMLDivElement>(null);

 const statsInView = useInView(statsRef, { once: true, margin: '-60px' });
 const filtersInView = useInView(filtersRef, { once: true, margin: '-60px' });
 const cardsInView = useInView(cardsRef, { once: true, margin: '-80px' });

 useEffect(() => {
 const main = document.querySelector('main');
 if (!main || !heroRef.current) return;

 const handleScroll = () => {
 const rect = heroRef.current!.getBoundingClientRect();
 const windowHeight = window.innerHeight;
 const start = windowHeight;
 const end = -rect.height;
 const progress = Math.min(Math.max((start - rect.top) / (start - end), 0), 1);
 setScrollProgress(progress);
 };

 main.addEventListener('scroll', handleScroll, { passive: true });
 handleScroll();

 return () => main.removeEventListener('scroll', handleScroll);
 }, []);

 const prefersReducedMotion = typeof window !== 'undefined'
 ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
 : false;

 const filteredBuses = buses.filter((bus) => {
 const matchesSearch = bus.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
 bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
 bus.from.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesType = filterType === 'All' || bus.type === filterType;
 const matchesStatus = filterStatus === 'All' || bus.status === filterStatus;
 return matchesSearch && matchesType && matchesStatus;
 });

 const stats = useMemo(
 () => ({
 total: buses.length,
 ac: buses.filter((b) => b.type === 'AC').length,
 nonAc: buses.filter((b) => b.type === 'Non-AC').length,
 nextBus: buses[0]?.departure || '--:--',
 }),
 [buses],
 );

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'On Time':
 return { bg: 'bg-zinc-800/50', text: 'text-zinc-300', border: 'border-zinc-700/50', dot: 'bg-zinc-800' };
 case 'Delayed':
 return { bg: 'bg-zinc-800/50', text: 'text-zinc-300', border: 'border-zinc-700/50', dot: 'bg-zinc-800' };
 case 'Boarding':
 return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400' };
 default:
 return { bg: 'bg-white/5', text: 'text-white/60', border: 'border-white/10', dot: 'bg-white/40' };
 }
 };

 const getTypeColor = (type: string) =>
 type === 'AC'
 ? { bg: 'bg-zinc-800/50', text: 'text-zinc-300', border: 'border-zinc-700/50' }
 : { bg: 'bg-zinc-800/50', text: 'text-zinc-300', border: 'border-zinc-700/50' };

 return (
 <motion.div
 variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}
 initial="hidden"
 animate="show"
 className="space-y-8 pb-16"
 >
 {/* Sticky Header */}
 <header className="sticky top-0 z-30 -mx-6 lg:-mx-8 px-6 lg:px-8 py-4 bg-[#040812]/80 backdrop-blur-xl border-b border-white/[0.06]">
 <div className="flex items-center justify-between gap-4">
 <div className="flex items-center gap-4">
 <motion.div
 animate={prefersReducedMotion ? {} : { rotate: 360, scale: 1.05 }}
 transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
 className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 border border-white/10"
 >
 <Bus size={24} className="text-white" />
 </motion.div>
 <div>
 <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
 Bus Transportation
 </h1>
 <p className="text-white/40 text-sm mt-0.5">VIT Chennai Day Scholar Bus Schedule</p>
 </div>
 </div>
 </div>
 </header>

 {/* Hero Section with Scroll-Driven Bus SVG */}
 <section
 ref={heroRef}
 className="relative h-56 md:h-72 rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02]"
 aria-label="Bus transportation hero"
 >
 <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5" />
 <div className="absolute inset-0 flex items-center justify-center">
 <motion.div
 className="w-44 md:w-56"
 style={{
 scale: prefersReducedMotion ? 1 : 1 - Math.min(scrollProgress * 0.4, 0.35),
 y: prefersReducedMotion ? 0 : scrollProgress * 40,
 opacity: prefersReducedMotion ? 1 : 1 - scrollProgress * 0.6,
 }}
 >
 <BusSVG />
 </motion.div>
 </div>
 <div className="absolute bottom-4 left-6 z-10">
 <p className="text-white/60 text-xs font-medium">VIT Chennai Official Transit</p>
 <p className="text-white/30 text-[10px]">Daily scheduled service for day scholars</p>
 </div>
 </section>

 {/* Stats */}
 <motion.section
 ref={statsRef}
 initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
 animate={statsInView ? { opacity: 1, y: 0 } : {}}
 transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: 'easeOut' }}
 className="grid grid-cols-2 md:grid-cols-4 gap-3"
 >
 {[
 { label: 'Total Buses', value: stats.total, icon: Bus, color: 'cyan' },
 { label: 'AC Buses', value: stats.ac, icon: CheckCircle2, color: 'emerald' },
 { label: 'Non-AC', value: stats.nonAc, icon: AlertCircle, color: 'violet' },
 { label: 'Next Bus', value: stats.nextBus, icon: Clock, color: 'amber' },
 ].map((s, i) => (
 <div
 key={i}
 className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4 text-center"
 >
 <s.icon size={18} className={`text-${s.color}-400 mx-auto mb-2`} />
 <p className="text-2xl font-bold text-white/90">{s.value}</p>
 <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">{s.label}</p>
 </div>
 ))}
 </motion.section>

 {/* Filters */}
 <motion.section
 ref={filtersRef}
 initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
 animate={filtersInView ? { opacity: 1, y: 0 } : {}}
 transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.1 }}
 className="flex flex-col sm:flex-row gap-3"
 >
 <div className="relative flex-1">
 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
 <input
 type="text"
 placeholder="Search bus number or route..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 transition-all text-sm"
 />
 </div>
 <div className="flex gap-2">
 <div className="flex bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-xl p-1">
 {(['All', 'AC', 'Non-AC'] as const).map((t) => (
 <button
 key={t}
 onClick={() => setFilterType(t)}
 className={`px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
 filterType === t ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'
 }`}
 >
 {t}
 </button>
 ))}
 </div>
 <div className="flex bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-xl p-1">
 {(['All', 'On Time', 'Delayed', 'Boarding'] as const).map((s) => (
 <button
 key={s}
 onClick={() => setFilterStatus(s)}
 className={`px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
 filterStatus === s ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'
 }`}
 >
 {s}
 </button>
 ))}
 </div>
 </div>
 </motion.section>

 {/* Bus Cards Grid */}
 <motion.section
 ref={cardsRef}
 initial={prefersReducedMotion ? false : { opacity: 0, y: 40 }}
 animate={cardsInView ? { opacity: 1, y: 0 } : {}}
 transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.7, ease: 'easeOut' }}
 className="min-h-0"
 >
 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 <AnimatePresence mode="wait">
 {filteredBuses.length > 0 ? (
 filteredBuses.map((bus, i) => {
 const statusColor = getStatusColor(bus.status);
 const typeColor = getTypeColor(bus.type);
 return (
 <motion.article
 key={bus.id}
 initial={prefersReducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 transition={
 prefersReducedMotion
 ? { duration: 0 }
 : { delay: i * 0.04, duration: 0.45, ease: 'easeOut' }
 }
 className="group relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.05] transition-all duration-300 overflow-hidden"
 >
 <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none bg-amber-500/5" />

 <div className="relative z-10">
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-3">
 <div
 className={`w-12 h-12 rounded-xl flex items-center justify-center border ${typeColor.bg} ${typeColor.border}`}
 >
 <Bus size={20} className={typeColor.text} />
 </div>
 <div>
 <h3 className="text-white/90 text-base font-bold group-hover:text-amber-400 transition-colors">
 Bus {bus.busNumber}
 </h3>
 <span
 className={`text-[10px] font-medium px-2 py-0.5 rounded-full inline-block border ${typeColor.bg} ${typeColor.text} ${typeColor.border}`}
 >
 {bus.type}
 </span>
 </div>
 </div>
 <span
 className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider border flex items-center gap-1.5 ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
 >
 <span
 className={`w-1.5 h-1.5 rounded-full ${statusColor.dot} ${
 bus.status === 'Boarding' ? 'animate-pulse' : ''
 }`}
 />
 {bus.status}
 </span>
 </div>

 <div className="flex items-center gap-2 mb-4 p-2.5 bg-white/[0.02] rounded-xl border border-white/[0.04]">
 <MapPin size={14} className="text-amber-400/70 flex-shrink-0" />
 <span className="text-xs text-white/70 font-medium truncate">{bus.route}</span>
 </div>

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
 </motion.article>
 );
 })
 ) : (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="col-span-full py-16 flex flex-col items-center justify-center text-center border border-white/[0.06] border-dashed rounded-2xl bg-white/[0.01]"
 >
 <Bus size={36} className="text-white/20 mb-3" />
 <p className="text-white/60 font-medium">No buses found</p>
 <p className="text-sm text-white/40 mt-1">Try adjusting your filters</p>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </motion.section>
 </motion.div>
 );
}
