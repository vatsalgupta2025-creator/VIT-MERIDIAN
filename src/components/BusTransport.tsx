'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, MapPin, Clock, AlertTriangle, Info, QrCode, 
  ChevronRight, ArrowLeft, Search, Calendar, User, ShieldCheck 
} from 'lucide-react';
import { 
  BusRoute, MOCK_BUS_ROUTES, MY_BUS_PASS, TRANSPORT_ANNOUNCEMENTS 
} from '@/data/transportData';

type Tab = 'routes' | 'live' | 'pass';

export default function BusTransport() {
  const [activeTab, setActiveTab] = useState<Tab>('routes');
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-white text-3xl font-black mb-2">Transport Hub</h1>
        <p className="text-white/40 text-sm">Track college buses, view routes, and access your digital pass.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#0d1117] p-1.5 rounded-2xl border border-white/[0.05] mb-6">
        {(['routes', 'live', 'pass'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSelectedRoute(null); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all capitalize ${
              activeTab === tab 
                ? 'bg-white/10 text-white shadow-sm' 
                : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02]'
            }`}
          >
            {tab === 'routes' && 'Bus Routes'}
            {tab === 'live' && 'Live Tracking'}
            {tab === 'pass' && 'My Pass'}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'routes' && !selectedRoute && (
            <motion.div key="routes-list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <RouteList onSelect={setSelectedRoute} />
            </motion.div>
          )}
          {activeTab === 'routes' && selectedRoute && (
            <motion.div key="route-detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <RouteDetail route={selectedRoute} onBack={() => setSelectedRoute(null)} />
            </motion.div>
          )}
          {activeTab === 'live' && (
            <motion.div key="live" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <LiveTracking />
            </motion.div>
          )}
          {activeTab === 'pass' && (
            <motion.div key="pass" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <DigitalPass />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROUTE LIST
// ══════════════════════════════════════════════════════════════════════════════
function RouteList({ onSelect }: { onSelect: (r: BusRoute) => void }) {
  const [search, setSearch] = useState('');

  const filtered = MOCK_BUS_ROUTES.filter(r => 
    r.startPoint.toLowerCase().includes(search.toLowerCase()) || 
    r.routeNumber.includes(search)
  );

  return (
    <div className="space-y-4">
      {/* Announcements */}
      {TRANSPORT_ANNOUNCEMENTS.map(ann => (
        <div key={ann.id} className={`p-4 rounded-2xl border flex items-start gap-3 ${
          ann.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
        }`}>
          {ann.type === 'warning' ? <AlertTriangle size={18} className="shrink-0 mt-0.5" /> : <Info size={18} className="shrink-0 mt-0.5" />}
          <div>
            <p className="text-sm font-medium">{ann.text}</p>
            <p className="text-xs opacity-60 mt-1">{ann.time}</p>
          </div>
        </div>
      ))}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input 
          type="text" 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by route number or location..." 
          className="w-full bg-[#0d1117] border border-white/[0.07] rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-white/20 outline-none transition-colors"
        />
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(route => (
          <button 
            key={route.id} 
            onClick={() => onSelect(route)}
            className="text-left p-5 rounded-2xl border border-white/[0.07] bg-[#0d1117] hover:bg-white/[0.03] transition-colors group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-lg border border-blue-500/30">
                  {route.routeNumber}
                </div>
                <div>
                  <p className="text-white font-bold">{route.startPoint}</p>
                  <p className="text-white/40 text-xs flex items-center gap-1"><MapPin size={10} /> to {route.endPoint}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-white/20 group-hover:text-white/60 transition-colors group-hover:translate-x-1" />
            </div>
            
            <div className="flex items-center gap-4 text-xs text-white/50 pt-3 border-t border-white/[0.05]">
              <span className="flex items-center gap-1"><Clock size={12} /> {route.stops.length} Stops</span>
              <span className="flex items-center gap-1"><User size={12} /> {route.driverName}</span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 text-white/40">No routes found matching your search.</div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROUTE DETAIL (Stops)
// ══════════════════════════════════════════════════════════════════════════════
function RouteDetail({ route, onBack }: { route: BusRoute, onBack: () => void }) {
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
        <ArrowLeft size={16} /> Back to Routes
      </button>

      <div className="p-6 rounded-2xl border border-white/[0.07] bg-[#0d1117]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black text-xl border border-blue-500/30">
              {route.routeNumber}
            </div>
            <div>
              <h2 className="text-white text-xl font-bold">{route.startPoint}</h2>
              <p className="text-white/40 text-sm">To {route.endPoint}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <p className="text-white/40 text-xs mb-1">Driver Name</p>
            <p className="text-white/90 text-sm font-medium">{route.driverName}</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <p className="text-white/40 text-xs mb-1">Driver Contact</p>
            <p className="text-white/90 text-sm font-medium">{route.driverPhone}</p>
          </div>
        </div>

        <h3 className="text-white font-semibold mb-4">Route Schedule</h3>
        
        <div className="relative pl-6 space-y-6">
          <div className="absolute left-2.5 top-2 bottom-2 w-px bg-white/[0.1]" />
          
          {route.stops.map((stop, idx) => (
            <div key={idx} className="relative">
              <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full border-2 border-[#0d1117] bg-white/40" />
              <p className="text-white/90 font-medium">{stop.name}</p>
              <div className="flex items-center gap-4 mt-1 text-xs">
                <span className="text-emerald-400 flex items-center gap-1"><Clock size={12} /> {stop.expectedTimeMorn} (Pickup)</span>
                <span className="text-blue-400 flex items-center gap-1"><Clock size={12} /> {stop.expectedTimeEve} (Drop)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LIVE TRACKING
// ══════════════════════════════════════════════════════════════════════════════
function LiveTracking() {
  const activeRoutes = MOCK_BUS_ROUTES.filter(r => r.status !== 'boarding');

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'on_time': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'delayed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/10 flex items-start gap-3 text-blue-300">
        <Info size={18} className="shrink-0 mt-0.5" />
        <p className="text-sm">Live tracking is currently active for morning pickup schedules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeRoutes.map(route => (
          <div key={route.id} className="p-5 rounded-2xl border border-white/[0.07] bg-[#0d1117] flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center font-bold">
                  {route.routeNumber}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{route.startPoint}</h3>
                  <p className="text-white/40 text-xs">To {route.endPoint}</p>
                </div>
              </div>
              <div className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border ${getStatusColor(route.status)}`}>
                {route.status.replace('_', ' ')}
              </div>
            </div>

            <div className="flex-1 bg-white/[0.02] rounded-xl border border-white/[0.04] p-4 flex flex-col justify-center relative overflow-hidden">
              {/* Mock Map Background */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <Bus size={32} className={route.status === 'delayed' ? 'text-red-400' : 'text-emerald-400'} />
                <p className="text-white/70 text-sm font-medium mt-3 mb-1">Currently near</p>
                <p className="text-white text-lg font-bold">{route.currentLocation}</p>
                {route.delayMinutes && (
                  <p className="text-red-400 text-xs mt-2 font-medium">Running {route.delayMinutes} mins late</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DIGITAL PASS
// ══════════════════════════════════════════════════════════════════════════════
function DigitalPass() {
  const route = MOCK_BUS_ROUTES.find(r => r.routeNumber === MY_BUS_PASS.routeAssigned);

  return (
    <div className="flex justify-center py-6">
      <div className="w-full max-w-sm rounded-[32px] p-1 border-4 border-[#0d1117] shadow-2xl relative overflow-hidden bg-white/[0.03]">
        {/* Glow Effects */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 bg-[#0d1117] rounded-[28px] border border-white/[0.08] overflow-hidden backdrop-blur-xl">
          {/* Header */}
          <div className="bg-white/5 p-6 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bus size={20} className="text-blue-400" />
              <span className="text-white font-bold tracking-wide">DAY SCHOLAR</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <ShieldCheck size={20} className="text-emerald-400" />
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-white text-2xl font-black">{MY_BUS_PASS.studentName}</h2>
              <p className="text-white/50 tracking-widest">{MY_BUS_PASS.registrationNumber}</p>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 bg-white/[0.03] rounded-2xl p-4 border border-white/[0.05] text-center">
                <p className="text-white/40 text-xs mb-1">Route No.</p>
                <p className="text-blue-400 text-3xl font-black">{MY_BUS_PASS.routeAssigned}</p>
              </div>
              <div className="flex-1 bg-white/[0.03] rounded-2xl p-4 border border-white/[0.05] text-center flex flex-col justify-center">
                <p className="text-white/40 text-xs mb-1">Valid Till</p>
                <p className="text-white/90 text-sm font-bold">May 2024</p>
              </div>
            </div>

            <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.05]">
              <p className="text-white/40 text-xs mb-1 text-center">Boarding Point</p>
              <p className="text-white text-lg font-bold text-center">{MY_BUS_PASS.boardingPoint}</p>
              {route && (
                <p className="text-white/40 text-xs text-center mt-1">To: {route.endPoint}</p>
              )}
            </div>

            {/* Mock QR Code Box */}
            <div className="pt-4 border-t border-white/[0.08] flex flex-col items-center">
              <div className="w-32 h-32 bg-white rounded-xl p-2 flex flex-wrap gap-1">
                {/* Fake QR Pattern */}
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className={`w-3 h-3 ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`} />
                ))}
              </div>
              <p className="text-white/30 text-[10px] mt-3 tracking-widest">SCAN TO BOARD</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
