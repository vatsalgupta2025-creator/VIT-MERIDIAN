'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    MapPin, Clock, Navigation, GraduationCap, Utensils,
    Trophy, TreePine, BookOpen, ChevronRight, Zap, Users, Star,
    Route, X, Bike, Footprints,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const Balatro = dynamic(() => import('./Balatro'), { ssr: false });

// ── Types ──────────────────────────────────────────────────────
interface CourtAvailability {
    status: 'Available' | 'Engaged' | 'Maintenance';
    occupied: number;
    capacity: number;
}

interface CampusPlace {
    id: string;
    name: string;
    lat: number;
    lng: number;
    category: PlaceCategory;
    description: string;
    rating: number;
    visitors: number;
    color: string;
    availability?: CourtAvailability;
}

interface CampusEvent {
    id: string;
    name: string;
    lat: number;
    lng: number;
    intensity: number; // 0-1
    type: string;
    attendees: number;
    time: string;
    color: string;
}

type PlaceCategory = 'academic' | 'dining' | 'sports' | 'recreation' | 'library';

// ── Campus Data (VIT Chennai) ──────────────────────────────────
const CAMPUS_CENTER: [number, number] = [12.8406, 80.1534];

const categoryConfig: Record<PlaceCategory, { icon: typeof MapPin; label: string; color: string; gradient: string }> = {
    academic: { icon: GraduationCap, label: 'Academic', color: '#818cf8', gradient: 'from-indigo-500 to-violet-500' },
    dining: { icon: Utensils, label: 'Dining', color: '#fb923c', gradient: 'from-orange-500 to-amber-500' },
    sports: { icon: Trophy, label: 'Sports', color: '#34d399', gradient: 'from-emerald-500 to-teal-500' },
    recreation: { icon: TreePine, label: 'Recreation', color: '#a78bfa', gradient: 'from-violet-500 to-purple-500' },
    library: { icon: BookOpen, label: 'Library', color: '#38bdf8', gradient: 'from-sky-500 to-cyan-500' },
};

const campusPlaces: CampusPlace[] = [
    { id: 'tt', name: 'Technology Tower', lat: 12.8412, lng: 80.1540, category: 'academic', description: 'Main tech hub with labs & lecture halls', rating: 4.8, visitors: 350, color: '#818cf8' },
    { id: 'mb', name: 'Admin Block', lat: 12.8400, lng: 80.1525, category: 'academic', description: 'Administrative offices & examination cell', rating: 4.2, visitors: 110, color: '#818cf8' },
    { id: 'sjt', name: 'Academic Block 1 (AB1)', lat: 12.8418, lng: 80.1520, category: 'academic', description: 'Science & engineering lecture complex', rating: 4.5, visitors: 420, color: '#818cf8' },
    { id: 'fc', name: 'Main Food Court', lat: 12.8398, lng: 80.1545, category: 'dining', description: 'Multi-cuisine food court with 20+ stalls', rating: 4.3, visitors: 540, color: '#fb923c' },
    { id: 'tc', name: 'Java Green Café', lat: 12.8408, lng: 80.1555, category: 'dining', description: 'Popular café with south Indian & snacks', rating: 4.6, visitors: 280, color: '#fb923c' },
    { id: 'cs', name: 'Juice Junction', lat: 12.8395, lng: 80.1518, category: 'dining', description: 'Fresh juices, smoothies & light bites', rating: 4.7, visitors: 140, color: '#fb923c' },
    { id: 'sg', name: 'Sports Ground', lat: 12.8422, lng: 80.1550, category: 'sports', description: 'Cricket, football & athletics ground', rating: 4.9, visitors: 180, color: '#34d399', availability: { status: 'Available', occupied: 150, capacity: 500 } },
    { id: 'ig', name: 'Indoor Stadium', lat: 12.8428, lng: 80.1530, category: 'sports', description: 'Badminton, basketball, TT & gym', rating: 4.7, visitors: 85, color: '#34d399' },
    { id: 'amp', name: 'Anna Auditorium', lat: 12.8410, lng: 80.1510, category: 'recreation', description: 'Main auditorium for festivals & events', rating: 4.8, visitors: 420, color: '#a78bfa' },
    { id: 'gal', name: 'Campus Green Park', lat: 12.8390, lng: 80.1505, category: 'recreation', description: 'Scenic gardens & walking track', rating: 4.9, visitors: 90, color: '#a78bfa' },
    { id: 'cl', name: 'Central Library', lat: 12.8404, lng: 80.1535, category: 'library', description: '5-floor library with digital resources', rating: 4.6, visitors: 310, color: '#38bdf8' },
    { id: 'bc', name: 'Badminton Courts', lat: 12.8426, lng: 80.1532, category: 'sports', description: 'Indoor Wooden Courts', rating: 4.8, visitors: 12, color: '#34d399', availability: { status: 'Engaged', occupied: 12, capacity: 12 } },
    { id: 'tenc', name: 'Tennis Courts', lat: 12.8419, lng: 80.1542, category: 'sports', description: 'Outdoor Synthetic Courts', rating: 4.5, visitors: 14, color: '#34d399', availability: { status: 'Available', occupied: 4, capacity: 16 } },
    { id: 'vc', name: 'Volleyball Courts', lat: 12.8420, lng: 80.1555, category: 'sports', description: 'Outdoor Sand & Synthetic', rating: 4.6, visitors: 28, color: '#34d399', availability: { status: 'Engaged', occupied: 24, capacity: 24 } },
];

const campusEvents: CampusEvent[] = [
    { id: 'e1', name: 'TechXplore Hackathon', lat: 12.8412, lng: 80.1540, intensity: 0.95, type: '🔥 Live', attendees: 450, time: 'Now — 11 PM', color: '#f43f5e' },
    { id: 'e2', name: 'AI/ML Workshop', lat: 12.8418, lng: 80.1520, intensity: 0.8, type: '🔥 Live', attendees: 180, time: 'Now — 6 PM', color: '#f97316' },
    { id: 'e3', name: 'Inter-Hostel Cricket', lat: 12.8422, lng: 80.1550, intensity: 0.7, type: '🏏 Sports', attendees: 320, time: '4 PM — 7 PM', color: '#22c55e' },
    { id: 'e4', name: 'Cultural Night', lat: 12.8410, lng: 80.1510, intensity: 0.9, type: '🎭 Cultural', attendees: 800, time: '7 PM — 10 PM', color: '#a855f7' },
    { id: 'e5', name: 'Startup Pitch Day', lat: 12.8400, lng: 80.1525, intensity: 0.6, type: '💡 Innovation', attendees: 150, time: '2 PM — 5 PM', color: '#eab308' },
    { id: 'e6', name: 'Photography Walk', lat: 12.8390, lng: 80.1505, intensity: 0.4, type: '📸 Casual', attendees: 45, time: '5 PM — 6:30 PM', color: '#06b6d4' },
    { id: 'e7', name: 'Book Club Meet', lat: 12.8404, lng: 80.1535, intensity: 0.35, type: '📚 Academic', attendees: 30, time: '3 PM — 4:30 PM', color: '#3b82f6' },
    { id: 'e8', name: 'Yoga Session', lat: 12.8395, lng: 80.1518, intensity: 0.5, type: '🧘 Wellness', attendees: 60, time: '6 AM — 7:30 AM', color: '#10b981' },
];

const nearbyDestinations = [
    { name: 'Vandalur Zoo', lat: 12.8805, lng: 80.0916, walkMin: 50, bikeMin: 18, distance: '6.5 km' },
    { name: 'Guduvancheri Station', lat: 12.8460, lng: 80.0628, walkMin: 55, bikeMin: 20, distance: '9.2 km' },
    { name: 'Kelambakkam Junction', lat: 12.7886, lng: 80.2196, walkMin: 60, bikeMin: 22, distance: '8.8 km' },
    { name: 'Sholinganallur Signal', lat: 12.9010, lng: 80.2279, walkMin: 45, bikeMin: 15, distance: '5.8 km' },
    { name: 'Urapakkam Market', lat: 12.8568, lng: 80.0710, walkMin: 40, bikeMin: 14, distance: '4.5 km' },
    { name: 'Perungalathur Bus Stand', lat: 12.9052, lng: 80.0962, walkMin: 38, bikeMin: 12, distance: '4.0 km' },
];

// ── Haversine Distance ─────────────────────────────────────────
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Map Sub-Component (Dynamic import to avoid SSR) ────────────
function LeafletMap({
    selectedPlace,
    selectedDestination,
    onPlaceClick,
    activeCategories,
}: {
    selectedPlace: CampusPlace | null;
    selectedDestination: typeof nearbyDestinations[0] | null;
    onPlaceClick: (place: CampusPlace) => void;
    activeCategories: PlaceCategory[];
}) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Layer[]>([]);
    const heatLayerRef = useRef<L.Layer | null>(null);
    const routeLayerRef = useRef<L.Layer | null>(null);

    // Initialize map
    useEffect(() => {
        if (typeof window === 'undefined' || !mapRef.current || mapInstanceRef.current) return;

        const loadMap = async () => {
            const L = (await import('leaflet')).default;

            // Fix default icon issue
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            });

            // Prevent "Map container is already initialized" during hot-reloads
            const container = mapRef.current;
            if (container) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (container as any)._leaflet_id = null;
            }

            const map = L.map(container!, {
                center: CAMPUS_CENTER,
                zoom: 16,
                zoomControl: false,
                attributionControl: false,
            });

            // Satellite map tiles (Esri World Imagery)
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 19,
                attribution: 'Tiles &copy; Esri',
            }).addTo(map);

            // Add semi-transparent dark overlay for UI readability
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
                opacity: 0.7,
            }).addTo(map);

            // Custom zoom control position
            L.control.zoom({ position: 'bottomright' }).addTo(map);

            // Campus boundary circle
            L.circle(CAMPUS_CENTER, {
                radius: 500,
                color: 'rgba(6, 182, 212, 0.3)',
                fillColor: 'rgba(6, 182, 212, 0.05)',
                fillOpacity: 0.3,
                weight: 2,
                dashArray: '8, 8',
            }).addTo(map);

            mapInstanceRef.current = map;
        };

        loadMap();

        return () => {
            mapInstanceRef.current?.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    // Update markers
    useEffect(() => {
        const updateMarkers = async () => {
            const map = mapInstanceRef.current;
            if (!map) return;
            const L = (await import('leaflet')).default;

            // Clear old markers
            markersRef.current.forEach((m) => map.removeLayer(m));
            markersRef.current = [];

            const filteredPlaces = campusPlaces.filter((p) => activeCategories.includes(p.category));

            filteredPlaces.forEach((place) => {
                const config = categoryConfig[place.category];

                const icon = L.divIcon({
                    className: 'custom-marker',
                    html: `
            <div class="campus-marker" style="--marker-color: ${place.color}; display: flex; justify-content: center; align-items: center; width: 44px; height: 44px; pointer-events: none;">
		<svg class="pl" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 0px 6px ${place.color}); width: 100%; height: 100%;">
			<defs>
				<linearGradient id="grad-${place.id}" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stop-color="#000"></stop>
					<stop offset="100%" stop-color="#fff"></stop>
				</linearGradient>
				<mask id="mask1-${place.id}">
					<rect x="0" y="0" width="160" height="160" fill="url(#grad-${place.id})"></rect>
				</mask>
				<mask id="mask2-${place.id}">
					<rect x="28" y="28" width="104" height="104" fill="url(#grad-${place.id})"></rect>
				</mask>
			</defs>
			
			<g>
				<g class="pl__ring-rotate">
					<circle class="pl__ring-stroke" cx="80" cy="80" r="72" fill="none" stroke="${place.color}" stroke-width="16" stroke-dasharray="452.39 452.39" stroke-dashoffset="452" stroke-linecap="round" transform="rotate(-45,80,80)"></circle>
				</g>
			</g>
			<g mask="url(#mask1-${place.id})">
				<g class="pl__ring-rotate">
					<circle class="pl__ring-stroke" cx="80" cy="80" r="72" fill="none" stroke="#fff" stroke-width="16" stroke-dasharray="452.39 452.39" stroke-dashoffset="452" stroke-linecap="round" transform="rotate(-45,80,80)"></circle>
				</g>
			</g>
			
			<g>
				<g stroke-width="4" stroke-dasharray="12 12" stroke-dashoffset="12" stroke-linecap="round" transform="translate(80,80)">
					<polyline class="pl__tick" stroke="rgba(255,255,255,0.3)" points="0,2 0,14" transform="rotate(-135,0,0) translate(0,40)"></polyline>
					<polyline class="pl__tick" stroke="rgba(255,255,255,0.3)" points="0,2 0,14" transform="rotate(-90,0,0) translate(0,40)"></polyline>
					<polyline class="pl__tick" stroke="rgba(255,255,255,0.3)" points="0,2 0,14" transform="rotate(-45,0,0) translate(0,40)"></polyline>
					<polyline class="pl__tick" stroke="rgba(255,255,255,0.3)" points="0,2 0,14" transform="rotate(0,0,0) translate(0,40)"></polyline>
					<polyline class="pl__tick" stroke="rgba(255,255,255,0.3)" points="0,2 0,14" transform="rotate(45,0,0) translate(0,40)"></polyline>
					<polyline class="pl__tick" stroke="rgba(255,255,255,0.3)" points="0,2 0,14" transform="rotate(90,0,0) translate(0,40)"></polyline>
					<polyline class="pl__tick" stroke="rgba(255,255,255,0.3)" points="0,2 0,14" transform="rotate(135,0,0) translate(0,40)"></polyline>
					<polyline class="pl__tick" stroke="rgba(255,255,255,0.3)" points="0,2 0,14" transform="rotate(180,0,0) translate(0,40)"></polyline>
				</g>
			</g>
			<g mask="url(#mask1-${place.id})">
				<g stroke-width="4" stroke-dasharray="12 12" stroke-dashoffset="12" stroke-linecap="round" transform="translate(80,80)">
					<polyline class="pl__tick" stroke="${place.color}" points="0,2 0,14" transform="rotate(-135,0,0) translate(0,40)"></polyline>
					<polyline class="pl__tick" stroke="${place.color}" points="0,2 0,14" transform="rotate(-90,0,0) translate(0,40)"></polyline>
					<polyline class="pl__tick" stroke="${place.color}" points="0,2 0,14" transform="rotate(-45,0,0) translate(0,40)"></polyline>
					<polyline class="pl__tick" stroke="${place.color}" points="0,2 0,14" transform="rotate(0,0,0) translate(0,40)"></polyline>
					<polyline class="pl__tick" stroke="${place.color}" points="0,2 0,14" transform="rotate(45,0,0) translate(0,40)"></polyline>
					<polyline class="pl__tick" stroke="${place.color}" points="0,2 0,14" transform="rotate(90,0,0) translate(0,40)"></polyline>
					<polyline class="pl__tick" stroke="${place.color}" points="0,2 0,14" transform="rotate(135,0,0) translate(0,40)"></polyline>
					<polyline class="pl__tick" stroke="${place.color}" points="0,2 0,14" transform="rotate(180,0,0) translate(0,40)"></polyline>
				</g>
			</g>
			
			<g>
				<g transform="translate(64,28)">
					<g class="pl__arrows" transform="rotate(45,16,52)">
						<path fill="${place.color}" d="M17.998,1.506l13.892,43.594c.455,1.426-.56,2.899-1.998,2.899H2.108c-1.437,0-2.452-1.473-1.998-2.899L14.002,1.506c.64-2.008,3.356-2.008,3.996,0Z"></path>
						<path fill="rgba(255,255,255,0.3)" d="M14.009,102.499L.109,58.889c-.453-1.421,.559-2.889,1.991-2.889H29.899c1.433,0,2.444,1.468,1.991,2.889l-13.899,43.61c-.638,2.001-3.345,2.001-3.983,0Z"></path>
					</g>
				</g>
			</g>
			<g mask="url(#mask2-${place.id})">
				<g transform="translate(64,28)">
					<g class="pl__arrows" transform="rotate(45,16,52)">
						<path fill="#fff" d="M17.998,1.506l13.892,43.594c.455,1.426-.56,2.899-1.998,2.899H2.108c-1.437,0-2.452-1.473-1.998-2.899L14.002,1.506c.64-2.008,3.356-2.008,3.996,0Z"></path>
						<path fill="${place.color}" d="M14.009,102.499L.109,58.889c-.453-1.421,.559-2.889,1.991-2.889H29.899c1.433,0,2.444,1.468,1.991,2.889l-13.899,43.61c-.638,2.001-3.345,2.001-3.983,0Z"></path>
					</g>
				</g>
			</g>
		</svg>
            </div>
          `,
                    iconSize: [44, 44],
                    iconAnchor: [22, 22],
                });

                const marker = L.marker([place.lat, place.lng], { icon })
                    .addTo(map)
                    .on('click', () => onPlaceClick(place));

                // Rich popup
                marker.bindPopup(
                    `<div style="font-family: Inter, sans-serif; min-width: 200px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <div style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, ${place.color}40, ${place.color}20); display: flex; align-items: center; justify-content: center; font-size: 14px;">
                ${place.category === 'academic' ? '🎓' : place.category === 'dining' ? '🍽' : place.category === 'sports' ? '🏆' : place.category === 'recreation' ? '🌿' : '📚'}
              </div>
              <div>
                <div style="font-weight: 700; color: #e2e8f0; font-size: 14px;">${place.name}</div>
                <div style="font-size: 11px; color: #94a3b8;">${config.label}</div>
              </div>
            </div>
            <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">${place.description}</div>
            ${place.availability ? `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; padding: 6px 10px; border-radius: 6px; background: ${place.availability.status === 'Available' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; border: 1px solid ${place.availability.status === 'Available' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};">
              <span style="font-size: 11px; font-weight: 600; color: ${place.availability.status === 'Available' ? '#34d399' : '#f87171'}; flex: 1;">
                ${place.availability.status === 'Available' ? '🟢 Available' : '🔴 Engaged'}
              </span>
              <span style="font-size: 11px; color: #e2e8f0; font-weight: 500;">
                ${place.availability.occupied}/${place.availability.capacity} Playing
              </span>
            </div>` : ''}
            <div style="display: flex; gap: 12px; font-size: 11px;">
              <span style="color: #fbbf24;">⭐ ${place.rating}</span>
              <span style="color: #94a3b8;">👥 ${place.visitors.toLocaleString()} visits</span>
            </div>
          </div>`,
                    {
                        className: 'campus-popup',
                        closeButton: true,
                    }
                );

                markersRef.current.push(marker);
            });

            // Event markers (small pulsing dots)
            campusEvents.forEach((event) => {
                const icon = L.divIcon({
                    className: 'custom-marker',
                    html: `
            <div class="event-marker" style="--event-color: ${event.color}">
              <div class="event-marker-pulse" style="background: ${event.color};"></div>
              <div class="event-marker-core" style="background: ${event.color}; box-shadow: 0 0 8px ${event.color};"></div>
            </div>
          `,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                });

                const marker = L.marker([event.lat, event.lng], { icon }).addTo(map);

                marker.bindPopup(
                    `<div style="font-family: Inter, sans-serif; min-width: 180px;">
            <div style="font-weight: 700; color: #e2e8f0; font-size: 13px; margin-bottom: 4px;">${event.name}</div>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <span style="font-size: 11px; padding: 2px 8px; border-radius: 999px; background: ${event.color}20; color: ${event.color}; font-weight: 600;">${event.type}</span>
            </div>
            <div style="font-size: 11px; color: #94a3b8;">
              <div>🕐 ${event.time}</div>
              <div>👥 ${event.attendees} attendees</div>
            </div>
          </div>`,
                    { className: 'campus-popup', closeButton: true }
                );

                markersRef.current.push(marker);
            });
        };

        updateMarkers();
    }, [activeCategories, onPlaceClick]); // Removed selectedPlace to avoid destroying markers on click

    // People density heatmap — based on visitor/attendee counts
    useEffect(() => {
        const renderHeatmap = async () => {
            const map = mapInstanceRef.current;
            if (!map) return;
            const L = (await import('leaflet')).default;

            // Remove old heatmap
            if (heatLayerRef.current) {
                map.removeLayer(heatLayerRef.current);
                heatLayerRef.current = null;
            }

            // Build density data from places (visitors) and events (attendees)
            const densityPoints: { lat: number; lng: number; people: number; color: string }[] = [];

            // Places — crowd density from visitor count
            campusPlaces.forEach((p) => {
                densityPoints.push({ lat: p.lat, lng: p.lng, people: p.visitors, color: p.color });
            });

            // Events — crowd density from attendee count
            campusEvents.forEach((e) => {
                densityPoints.push({ lat: e.lat, lng: e.lng, people: e.attendees, color: e.color });
            });

            // Normalize people count to 0–1 intensity
            const maxPeopleRaw = Math.max(...densityPoints.map((d) => d.people));
            // Cap normalization denominator so small groups don't map to 1.0 intensity massively
            const maxPeople = maxPeopleRaw < 600 ? 600 : maxPeopleRaw;

            const points = densityPoints.map((d) => ({
                ...d,
                intensity: Math.max(0.15, d.people / maxPeople),
            }));

            // Add spread points around high-density areas for organic blending
            const allPoints: typeof points = [];
            points.forEach((pt) => {
                allPoints.push(pt);
                const spreadCount = Math.round(pt.intensity * 10);
                for (let i = 0; i < spreadCount; i++) {
                    const angle = (i / spreadCount) * Math.PI * 2 + Math.random() * 0.5;
                    const dist = 0.0006 + Math.random() * 0.0015;
                    allPoints.push({
                        ...pt,
                        lat: pt.lat + Math.cos(angle) * dist,
                        lng: pt.lng + Math.sin(angle) * dist,
                        intensity: pt.intensity * (0.2 + Math.random() * 0.4),
                    });
                }
            });

            // Compute bounds with padding
            let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
            allPoints.forEach((pt) => {
                if (pt.lat < minLat) minLat = pt.lat;
                if (pt.lat > maxLat) maxLat = pt.lat;
                if (pt.lng < minLng) minLng = pt.lng;
                if (pt.lng > maxLng) maxLng = pt.lng;
            });
            const pad = 0.005;
            minLat -= pad; maxLat += pad; minLng -= pad; maxLng += pad;

            // Render on canvas
            const canvas = document.createElement('canvas');
            const W = 1400, H = 1400;
            canvas.width = W;
            canvas.height = H;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const toXY = (lat: number, lng: number) => ({
                x: ((lng - minLng) / (maxLng - minLng)) * W,
                y: ((maxLat - lat) / (maxLat - minLat)) * H,
            });

            const baseR = 90;

            // Pass 1: soft warm glow
            ctx.globalCompositeOperation = 'lighter';
            allPoints.forEach((pt) => {
                const { x, y } = toXY(pt.lat, pt.lng);
                const r = baseR * (0.7 + pt.intensity * 1.0);
                const hex = pt.color.replace('#', '');
                const cr = parseInt(hex.substring(0, 2), 16);
                const cg = parseInt(hex.substring(2, 4), 16);
                const cb = parseInt(hex.substring(4, 6), 16);

                const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 1.4);
                grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${pt.intensity * 0.5})`);
                grad.addColorStop(0.35, `rgba(${cr}, ${cg}, ${cb}, ${pt.intensity * 0.28})`);
                grad.addColorStop(0.7, `rgba(${cr}, ${cg}, ${cb}, ${pt.intensity * 0.08})`);
                grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
                ctx.beginPath();
                ctx.arc(x, y, r * 1.4, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
            });

            // Pass 2: bright cores for high-density zones
            points.forEach((pt) => {
                const { x, y } = toXY(pt.lat, pt.lng);
                const r = baseR * (0.3 + pt.intensity * 0.5);
                const hex = pt.color.replace('#', '');
                const cr = parseInt(hex.substring(0, 2), 16);
                const cg = parseInt(hex.substring(2, 4), 16);
                const cb = parseInt(hex.substring(4, 6), 16);

                const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
                grad.addColorStop(0, `rgba(255, 255, 255, ${pt.intensity * 0.4})`);
                grad.addColorStop(0.2, `rgba(${Math.min(255, cr + 50)}, ${Math.min(255, cg + 50)}, ${Math.min(255, cb + 50)}, ${pt.intensity * 0.55})`);
                grad.addColorStop(0.6, `rgba(${cr}, ${cg}, ${cb}, ${pt.intensity * 0.3})`);
                grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
            });

            ctx.globalCompositeOperation = 'source-over';

            // Overlay on map
            const dataUrl = canvas.toDataURL('image/png');
            const overlay = L.imageOverlay(dataUrl, L.latLngBounds([minLat, minLng], [maxLat, maxLng]), {
                opacity: 0.8,
                interactive: false,
                zIndex: 250,
            });
            overlay.addTo(map);
            heatLayerRef.current = overlay;

            // Add pulsing people-dots for each high-density zone
            campusPlaces.forEach((place) => {
                let dotSize = Math.max(6, Math.min(18, (place.visitors / maxPeople) * 18));
                let dotColor = place.color;
                let tooltipText = `<b>${place.name}</b><br>${place.visitors.toLocaleString()} people`;

                if (place.availability) {
                    dotSize = 14; // Fixed noticeable size for courts
                    if (place.availability.status === 'Engaged') {
                        dotColor = '#ef4444'; // Red
                        tooltipText = `<b>${place.name}</b><br><span style="color:#ef4444">🔴 Engaged</span> (${place.availability.occupied}/${place.availability.capacity})`;
                    } else if (place.availability.status === 'Available') {
                        dotColor = '#10b981'; // Emerald
                        tooltipText = `<b>${place.name}</b><br><span style="color:#10b981">🟢 Available</span> (${place.availability.occupied}/${place.availability.capacity})`;
                    }
                }

                const dotIcon = L.divIcon({
                    className: 'people-dot',
                    html: `<div style="
                        width: ${dotSize}px; height: ${dotSize}px;
                        background: ${dotColor};
                        border-radius: 50%;
                        box-shadow: 0 0 ${dotSize}px ${dotColor}, 0 0 ${dotSize * 2}px ${dotColor}40;
                        animation: dot-pulse 2s ease-in-out infinite;
                    "></div>`,
                    iconSize: [dotSize, dotSize],
                    iconAnchor: [dotSize / 2, dotSize / 2],
                });
                const dot = L.marker([place.lat, place.lng], { icon: dotIcon, interactive: true });
                dot.bindTooltip(tooltipText, {
                    className: 'density-tooltip',
                    direction: 'top',
                    offset: [0, -dotSize],
                });
                dot.addTo(map);
            });

            campusEvents.forEach((event) => {
                const dotSize = Math.max(6, Math.min(18, (event.attendees / maxPeople) * 18));
                const dotIcon = L.divIcon({
                    className: 'people-dot',
                    html: `<div style="
                        width: ${dotSize}px; height: ${dotSize}px;
                        background: ${event.color};
                        border-radius: 50%;
                        box-shadow: 0 0 ${dotSize}px ${event.color}, 0 0 ${dotSize * 2}px ${event.color}40;
                        animation: dot-pulse 1.5s ease-in-out infinite;
                    "></div>`,
                    iconSize: [dotSize, dotSize],
                    iconAnchor: [dotSize / 2, dotSize / 2],
                });
                const dot = L.marker([event.lat, event.lng], { icon: dotIcon, interactive: true });
                dot.bindTooltip(`<b>${event.name}</b><br>${event.attendees.toLocaleString()} attendees`, {
                    className: 'density-tooltip',
                    direction: 'top',
                    offset: [0, -dotSize],
                });
                dot.addTo(map);
            });
        };

        const timer = setTimeout(renderHeatmap, 400);
        return () => clearTimeout(timer);
    }, []);

    // Route line for travel time
    useEffect(() => {
        const updateRoute = async () => {
            const map = mapInstanceRef.current;
            if (!map) return;
            const L = (await import('leaflet')).default;

            if (routeLayerRef.current) {
                map.removeLayer(routeLayerRef.current);
                routeLayerRef.current = null;
            }

            if (selectedDestination) {
                const points: [number, number][] = [CAMPUS_CENTER, [selectedDestination.lat, selectedDestination.lng]];

                // Add intermediate curved points
                const midLat = (CAMPUS_CENTER[0] + selectedDestination.lat) / 2 + (Math.random() - 0.5) * 0.005;
                const midLng = (CAMPUS_CENTER[1] + selectedDestination.lng) / 2 + (Math.random() - 0.5) * 0.005;
                const routePoints: [number, number][] = [CAMPUS_CENTER, [midLat, midLng], [selectedDestination.lat, selectedDestination.lng]];

                const polyline = L.polyline(routePoints, {
                    color: '#06b6d4',
                    weight: 4,
                    opacity: 0.8,
                    dashArray: '12, 8',
                    className: 'route-line',
                }).addTo(map);

                // Destination marker
                const destIcon = L.divIcon({
                    className: 'custom-marker',
                    html: `
            <div class="dest-marker">
              <div class="dest-marker-pin"></div>
              <div class="dest-marker-label">${selectedDestination.name}</div>
            </div>
          `,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                });

                const destMarker = L.marker([selectedDestination.lat, selectedDestination.lng], { icon: destIcon }).addTo(map);

                routeLayerRef.current = L.layerGroup([polyline, destMarker]).addTo(map);
                map.fitBounds(L.latLngBounds(points).pad(0.3));
            }
        };

        updateRoute();
    }, [selectedDestination]);

    // Fly to selected place and launch popup
    useEffect(() => {
        if (selectedPlace && mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([selectedPlace.lat, selectedPlace.lng], 17, { duration: 1.2 });

            // Note: markersRef contains all L.Marker instances
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const target = markersRef.current.find((m: any) => {
                if (m.getLatLng) {
                    const ll = m.getLatLng();
                    return ll.lat === selectedPlace.lat && ll.lng === selectedPlace.lng;
                }
                return false;
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (target && (target as any).openPopup) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (target as any).openPopup();
            }
        }
    }, [selectedPlace]);

    if (typeof window === 'undefined') {
        return <div className="absolute inset-0 z-0 bg-[#0a0e1a]" />; // Fallback during SSR
    }

    return <div ref={mapRef} className="absolute inset-0 z-0" />;
}

// ── Main Component ─────────────────────────────────────────────
export default function CampusExplorer() {
    const [selectedPlace, setSelectedPlace] = useState<CampusPlace | null>(null);
    const [selectedDestination, setSelectedDestination] = useState<typeof nearbyDestinations[0] | null>(null);

    const [activeCategories, setActiveCategories] = useState<PlaceCategory[]>(['academic', 'dining', 'sports', 'recreation', 'library']);
    const [activePanel, setActivePanel] = useState<'places' | 'events' | 'travel'>('places');
    const [searchQuery, setSearchQuery] = useState('');
    const [travelMode, setTravelMode] = useState<'walk' | 'bike'>('walk');

    const handlePlaceClick = useCallback((place: CampusPlace) => {
        setSelectedPlace(prev => prev?.id === place.id ? null : place);
    }, []);

    const filteredPlaces = useMemo(() => {
        return campusPlaces.filter(
            (p) => activeCategories.includes(p.category) && p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [activeCategories, searchQuery]);

    const toggleCategory = (cat: PlaceCategory) => {
        setActiveCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
    };

    return (
        <div className="relative w-full h-full bg-[#0a0e1a] overflow-hidden">
            {/* Balatro Shader Background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                opacity: 0.55,
                pointerEvents: 'none',
            }}>
                <Balatro
                    color1="#06b6d4"
                    color2="#7c3aed"
                    color3="#0a0e1a"
                    spinSpeed={3.0}
                    spinRotation={-1.5}
                    contrast={2.5}
                    lighting={0.3}
                    spinAmount={0.15}
                    pixelFilter={900}
                    spinEase={0.8}
                    isRotate={true}
                    mouseInteraction={false}
                />
            </div>

            {/* Map Container - Full Screen */}
            <div className="absolute inset-0 z-0">
                <LeafletMap
                    selectedPlace={selectedPlace}
                    selectedDestination={selectedDestination}
                    onPlaceClick={handlePlaceClick}
                    activeCategories={activeCategories}
                />
            </div>

            {/* Floating Top-Left Panel for Search & Content */}
            <div className="absolute top-4 left-4 lg:top-6 lg:left-6 z-[1000] w-[340px] flex flex-col gap-4 max-h-[calc(100vh-2rem)] lg:max-h-[calc(100vh-3rem)] pointer-events-none">
                {/* Header inside floating panel */}
                <div className="p-4 rounded-2xl bg-[#0a0e1a]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl pointer-events-auto">
                    <h2 className="text-xl font-bold text-white/90 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Navigation size={16} className="text-white" />
                        </div>
                        Campus Explorer
                    </h2>
                    <p className="text-xs text-white/40 mt-1 pl-[44px]">Interactive map · Live events</p>
                </div>

                {/* Sidebar Panel */}
                <div className="flex flex-col gap-3 flex-1 overflow-hidden rounded-2xl bg-[#0a0e1a]/80 backdrop-blur-xl border border-white/[0.08] shadow-2xl p-4 pointer-events-auto shadow-black/50">
                    {/* Panel Tabs */}
                    <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                        {([
                            { id: 'places' as const, label: 'Places', icon: MapPin },
                            { id: 'events' as const, label: 'Events', icon: Zap },
                            { id: 'travel' as const, label: 'Travel', icon: Route },
                        ]).map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActivePanel(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${activePanel === tab.id
                                    ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-400 shadow-lg shadow-cyan-500/5'
                                    : 'text-white/30 hover:text-white/50 hover:bg-white/[0.03]'
                                    }`}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Panel Content */}
                    <div className="flex-1 overflow-y-auto rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 space-y-3 custom-scrollbar">
                        {activePanel === 'places' && (
                            <>
                                {/* Search */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search campus places..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                                    />
                                </div>

                                {/* Category Filters */}
                                <div className="flex flex-wrap gap-1.5">
                                    {(Object.entries(categoryConfig) as [PlaceCategory, typeof categoryConfig[PlaceCategory]][]).map(([key, config]) => {
                                        const isActive = activeCategories.includes(key);
                                        const Icon = config.icon;
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => toggleCategory(key)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200 ${isActive
                                                    ? `bg-gradient-to-r ${config.gradient} bg-opacity-15 text-white border border-white/10`
                                                    : 'bg-white/[0.03] text-white/25 border border-white/[0.04] hover:bg-white/[0.05]'
                                                    }`}
                                                style={isActive ? { background: `${config.color}20`, borderColor: `${config.color}30`, color: config.color } : {}}
                                            >
                                                <Icon size={12} />
                                                {config.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Places List */}
                                <div className="space-y-2">
                                    {filteredPlaces.map((place) => {
                                        const config = categoryConfig[place.category];
                                        const isSelected = selectedPlace?.id === place.id;
                                        return (
                                            <button
                                                key={place.id}
                                                onClick={() => setSelectedPlace(isSelected ? null : place)}
                                                className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${isSelected
                                                    ? 'bg-white/[0.08] border border-cyan-500/20'
                                                    : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08]'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                                                        style={{ background: `${place.color}15`, color: place.color }}
                                                    >
                                                        {place.category === 'academic' ? '🎓' : place.category === 'dining' ? '🍽' : place.category === 'sports' ? '🏆' : place.category === 'recreation' ? '🌿' : '📚'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-sm font-semibold text-white/80 truncate">{place.name}</h4>
                                                            <ChevronRight size={14} className={`text-white/20 transition-transform ${isSelected ? 'rotate-90 text-cyan-400' : 'group-hover:translate-x-0.5'}`} />
                                                        </div>
                                                        <p className="text-[11px] text-white/30 mt-0.5 truncate">{place.description}</p>
                                                        <div className="flex items-center gap-3 mt-1.5">
                                                            <span className="text-[10px] text-amber-400 flex items-center gap-1">
                                                                <Star size={10} fill="currentColor" /> {place.rating}
                                                            </span>
                                                            <span className="text-[10px] text-white/25 flex items-center gap-1">
                                                                <Users size={10} /> {place.visitors.toLocaleString()}
                                                            </span>
                                                            {place.availability && (
                                                                <span className={`text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold whitespace-nowrap ${place.availability.status === 'Available' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'}`}>
                                                                    {place.availability.status === 'Available' ? '🟢 Avail.' : '🔴 Engaged'} ({place.availability.occupied}/{place.availability.capacity})
                                                                </span>
                                                            )}
                                                            <span className="text-[10px] px-2 py-0.5 rounded-md font-medium whitespace-nowrap" style={{ background: `${place.color}15`, color: place.color }}>
                                                                {config.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {activePanel === 'events' && (
                            <>
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-sm font-bold text-white/60">Live & Upcoming Events</h3>
                                    <span className="text-[10px] px-2 py-1 rounded-full bg-red-500/15 text-red-400 font-semibold animate-pulse">
                                        {campusEvents.filter((e) => e.type.includes('Live')).length} Live
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {campusEvents
                                        .sort((a, b) => b.intensity - a.intensity)
                                        .map((event) => (
                                            <div
                                                key={event.id}
                                                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all cursor-pointer group"
                                                onClick={() => {
                                                    const place = campusPlaces.find((p) => Math.abs(p.lat - event.lat) < 0.001 && Math.abs(p.lng - event.lng) < 0.001);
                                                    if (place) setSelectedPlace(place);
                                                }}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-semibold text-white/80">{event.name}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span
                                                                className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
                                                                style={{ background: `${event.color}20`, color: event.color }}
                                                            >
                                                                {event.type}
                                                            </span>
                                                            <span className="text-[10px] text-white/30 flex items-center gap-1">
                                                                <Clock size={10} /> {event.time}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm font-bold text-white/60">{event.attendees}</div>
                                                        <div className="text-[9px] text-white/25">attendees</div>
                                                    </div>
                                                </div>
                                                {/* Intensity bar */}
                                                <div className="mt-2 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-700"
                                                        style={{
                                                            width: `${event.intensity * 100}%`,
                                                            background: `linear-gradient(90deg, ${event.color}80, ${event.color})`,
                                                            boxShadow: `0 0 10px ${event.color}40`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </>
                        )}

                        {activePanel === 'travel' && (
                            <>
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-sm font-bold text-white/60">Travel Time Calculator</h3>
                                </div>

                                {/* Mode Selector */}
                                <div className="flex gap-2 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                                    <button
                                        onClick={() => setTravelMode('walk')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${travelMode === 'walk'
                                            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                                            : 'text-white/30 hover:text-white/50'
                                            }`}
                                    >
                                        <Footprints size={14} /> Walking
                                    </button>
                                    <button
                                        onClick={() => setTravelMode('bike')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${travelMode === 'bike'
                                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                            : 'text-white/30 hover:text-white/50'
                                            }`}
                                    >
                                        <Bike size={14} /> Cycling
                                    </button>
                                </div>

                                <p className="text-[10px] text-white/25">
                                    From: <span className="text-cyan-400 font-semibold">VIT Campus Center</span>
                                </p>

                                {/* Destination Cards */}
                                <div className="space-y-2">
                                    {nearbyDestinations.map((dest) => {
                                        const isSelected = selectedDestination?.name === dest.name;
                                        const time = travelMode === 'walk' ? dest.walkMin : dest.bikeMin;
                                        return (
                                            <button
                                                key={dest.name}
                                                onClick={() => setSelectedDestination(isSelected ? null : dest)}
                                                className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${isSelected
                                                    ? 'bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20 shadow-lg shadow-cyan-500/5'
                                                    : 'bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08]'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-cyan-500/20' : 'bg-white/[0.04]'}`}>
                                                            <MapPin size={14} className={isSelected ? 'text-cyan-400' : 'text-white/30'} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-white/80">{dest.name}</h4>
                                                            <p className="text-[10px] text-white/30">{dest.distance} away</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`text-lg font-bold ${isSelected ? 'text-cyan-400' : 'text-white/50'}`}>{time}</div>
                                                        <div className="text-[9px] text-white/25">min</div>
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center gap-4 text-[10px] text-white/40">
                                                        <span className="flex items-center gap-1"><Footprints size={10} /> {dest.walkMin} min walk</span>
                                                        <span className="flex items-center gap-1"><Bike size={10} /> {dest.bikeMin} min cycle</span>
                                                        <span className="flex items-center gap-1"><Route size={10} /> {dest.distance}</span>
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {selectedDestination && (
                                    <button
                                        onClick={() => setSelectedDestination(null)}
                                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-white/40 hover:text-white/60 transition-all"
                                    >
                                        <X size={12} /> Clear Route
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Map Overlay Stats */}
            <div className="absolute top-4 right-4 lg:top-6 lg:right-6 z-[1000] flex flex-col gap-2 pointer-events-none">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0a0e1a]/80 backdrop-blur-xl border border-white/[0.08] pointer-events-auto shadow-2xl">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] text-white/60 font-medium">{campusEvents.length} Active Events</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0a0e1a]/80 backdrop-blur-xl border border-white/[0.08] pointer-events-auto shadow-2xl">
                    <Users size={12} className="text-cyan-400" />
                    <span className="text-[11px] text-white/60 font-medium">{campusEvents.reduce((s, e) => s + e.attendees, 0).toLocaleString()} People</span>
                </div>
            </div>
        </div>
    );
}
