'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { SafeUser } from '../VitgrowwSafe';
import { MapPin, Shield, Phone, Zap } from 'lucide-react';

interface Location { id: string; name: string; type: string; latitude: number; longitude: number; description?: string; phone?: string; }
interface Density { location: string; count: number; }
interface Props { user: SafeUser; }

const TYPE_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  SECURITY_POST: { color: '#06b6d4', label: 'Security Post', icon: '🛡️' },
  MEDICAL: { color: '#f43f5e', label: 'Medical Centre', icon: '🏥' },
  HOSTEL: { color: '#8b5cf6', label: 'Hostel', icon: '🏠' },
  ACADEMIC: { color: '#f59e0b', label: 'Academic Block', icon: '🏫' },
  EMERGENCY_PHONE: { color: '#ef4444', label: 'Emergency Phone', icon: '📞' },
  MAIN_GATE: { color: '#10b981', label: 'Main Gate', icon: '🚪' },
};

export default function SafetyMapView({ user }: Props) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [density, setDensity] = useState<Density[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const fetchMapData = useCallback(async () => {
    try {
      const res = await fetch('/api/safety/map');
      if (res.ok) {
        const d = await res.json();
        setLocations(d.locations || []);
        setDensity(d.density || []);
      }
    } catch {}
  }, []);

  useEffect(() => { fetchMapData(); }, [fetchMapData]);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || locations.length === 0) return;

    const initMap = async () => {
      const L = await import('leaflet');
      // @ts-ignore
      await import('leaflet/dist/leaflet.css');

      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      if (!containerRef.current) return;

      const map = L.map(containerRef.current).setView([12.9705, 79.1565], 16);
      mapRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 19,
      }).addTo(map);

      // Add location markers
      locations.forEach((loc) => {
        const cfg = TYPE_CONFIG[loc.type] || { color: '#06b6d4', label: loc.type, icon: '📍' };
        const icon = L.divIcon({
          html: `<div style="background:${cfg.color}22;border:2px solid ${cfg.color};border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;box-shadow:0 0 12px ${cfg.color}44">${cfg.icon}</div>`,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        const marker = L.marker([loc.latitude, loc.longitude], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:Inter,sans-serif;padding:4px">
            <div style="font-weight:700;color:#fff;font-size:13px;margin-bottom:4px">${loc.name}</div>
            <div style="color:${cfg.color};font-size:11px;margin-bottom:4px">${cfg.label}</div>
            ${loc.description ? `<div style="color:#94a3b8;font-size:11px;margin-bottom:4px">${loc.description}</div>` : ''}
            ${loc.phone ? `<a href="tel:${loc.phone}" style="color:#06b6d4;font-size:11px">${loc.phone}</a>` : ''}
          </div>
        `, { className: 'campus-popup' });
        marker.on('click', () => setSelectedLocation(loc));
      });
    };

    initMap();
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [locations]);

  const types = [...new Set(locations.map(l => l.type))];

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
          <MapPin size={16} className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white/90">Campus Safety Map</h2>
          <p className="text-xs text-white/40">Real locations from database · Anonymized report density</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {types.map(t => {
          const cfg = TYPE_CONFIG[t];
          if (!cfg) return null;
          return (
            <span key={t} className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium border" style={{ color: cfg.color, borderColor: `${cfg.color}33`, backgroundColor: `${cfg.color}11` }}>
              {cfg.icon} {cfg.label}
            </span>
          );
        })}
      </div>

      {/* Map */}
      <div
        ref={containerRef}
        className="flex-1 rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0d1117]"
        style={{ minHeight: '400px' }}
      />

      {/* Density */}
      {density.length > 0 && (
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Report Density — Last 30 Days (Anonymized)</p>
          <div className="space-y-2">
            {density.slice(0, 5).map((d) => (
              <div key={d.location} className="flex items-center justify-between">
                <span className="text-xs text-white/60 truncate flex-1 mr-3">{d.location}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-white/[0.04] rounded-full h-1.5">
                    <div className="bg-orange-400/70 h-1.5 rounded-full" style={{ width: `${Math.min(100, d.count * 20)}%` }} />
                  </div>
                  <span className="text-xs text-white/40 w-12 text-right">{d.count} report{d.count !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
