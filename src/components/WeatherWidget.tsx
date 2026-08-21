'use client';

import { useState, useEffect } from 'react';
import {
    Cloud,
    Sun,
    CloudRain,
    CloudSnow,
    CloudLightning,
    Wind,
    Droplets,
    Eye,
    Thermometer,
    MapPin,
    Loader2,
    CloudFog,
    Sunrise,
    Sunset
} from 'lucide-react';

const WEATHER_API_KEY = '87274363808c4f8ba56172008262302';
const WEATHER_URL = 'https://api.weatherapi.com/v1/forecast.json';

interface WeatherData {
    location: {
        name: string;
        region: string;
        country: string;
        localtime: string;
    };
    current: {
        temp_c: number;
        feelslike_c: number;
        condition: { text: string; icon: string; code: number };
        wind_kph: number;
        wind_dir: string;
        humidity: number;
        vis_km: number;
        uv: number;
        is_day: number;
    };
    forecast: {
        forecastday: {
            date: string;
            day: {
                maxtemp_c: number;
                mintemp_c: number;
                condition: { text: string; icon: string; code: number };
                daily_chance_of_rain: number;
            };
            astro: {
                sunrise: string;
                sunset: string;
            };
            hour: {
                time: string;
                temp_c: number;
                condition: { text: string; icon: string; code: number };
                chance_of_rain: number;
            }[];
        }[];
    };
}

const getWeatherIcon = (code: number, isDay: number) => {
    if (code === 1000) return isDay ? Sun : Sun;
    if (code >= 1003 && code <= 1009) return Cloud;
    if (code >= 1030 && code <= 1039) return CloudFog;
    if (code >= 1063 && code <= 1201) return CloudRain;
    if (code >= 1204 && code <= 1264) return CloudSnow;
    if (code >= 1273) return CloudLightning;
    return Cloud;
};

const getWeatherGradient = (code: number, isDay: number) => {
    if (code === 1000 && isDay) return 'from-amber-500/15 to-orange-500/10';
    if (code === 1000 && !isDay) return 'from-indigo-500/15 to-violet-500/10';
    if (code >= 1003 && code <= 1009) return 'from-slate-400/15 to-gray-500/10';
    if (code >= 1063 && code <= 1201) return 'from-blue-500/15 to-cyan-500/10';
    if (code >= 1204 && code <= 1264) return 'from-sky-300/15 to-blue-400/10';
    if (code >= 1273) return 'from-violet-500/15 to-purple-500/10';
    return 'from-cyan-500/15 to-blue-500/10';
};

export default function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [locationName, setLocationName] = useState('Vellore'); // Default VIT location

    useEffect(() => {
        fetchWeather();
    }, []);

    const fetchWeather = async () => {
        setLoading(true);
        setError('');
        try {
            // Try geolocation first
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        const { latitude, longitude } = pos.coords;
                        await fetchWeatherData(`${latitude},${longitude}`);
                    },
                    async () => {
                        // Fallback to Vellore (VIT)
                        await fetchWeatherData('Vellore');
                    },
                    { timeout: 3000 }
                );
            } else {
                await fetchWeatherData('Vellore');
            }
        } catch {
            setError('Could not fetch weather');
            setLoading(false);
        }
    };

    const fetchWeatherData = async (query: string) => {
        try {
            const res = await fetch(`${WEATHER_URL}?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}&days=3&aqi=no`);
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();
            setWeather(data);
            setLocationName(data.location.name);
        } catch {
            setError('Weather unavailable');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-[#0c0f17] rounded-xl p-5 border border-white/[0.05] flex items-center justify-center h-[140px]">
                <Loader2 size={20} className="text-cyan-400 animate-spin" />
            </div>
        );
    }

    if (error || !weather) {
        return (
            <div className="bg-[#0c0f17] rounded-xl p-4 border border-white/[0.05] text-center">
                <Cloud size={20} className="text-white/20 mx-auto mb-1" />
                <p className="text-white/30 text-xs">{error || 'Weather unavailable'}</p>
            </div>
        );
    }

    const { current, forecast } = weather;
    const WeatherIcon = getWeatherIcon(current.condition.code, current.is_day);
    const gradient = getWeatherGradient(current.condition.code, current.is_day);
    const today = forecast.forecastday[0];
    const upcomingHours = today.hour.filter(h => {
        const hourTime = new Date(h.time).getHours();
        const currentHour = new Date(weather.location.localtime).getHours();
        return hourTime > currentHour;
    }).slice(0, 5);

    // If no hours left today, show tomorrow's first hours
    const displayHours = upcomingHours.length > 0 ? upcomingHours :
        (forecast.forecastday[1]?.hour || []).slice(0, 5);

    return (
        <div className={`bg-gradient-to-br ${gradient} rounded-xl border border-white/[0.06] overflow-hidden`}>
            {/* Main Weather */}
            <div className="p-5 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-1.5 mb-1">
                        <MapPin size={11} className="text-white/30" />
                        <span className="text-white/40 text-[10px] font-medium">{locationName}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-white/90">{Math.round(current.temp_c)}°</span>
                        <span className="text-white/30 text-xs">C</span>
                    </div>
                    <p className="text-white/50 text-xs mt-0.5">{current.condition.text}</p>
                    <p className="text-white/25 text-[10px] mt-0.5">Feels like {Math.round(current.feelslike_c)}°</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                    <WeatherIcon size={40} className="text-white/40" />
                    <div className="flex gap-3">
                        <div className="text-center">
                            <Droplets size={11} className="text-cyan-400/60 mx-auto mb-0.5" />
                            <p className="text-[10px] text-white/40">{current.humidity}%</p>
                        </div>
                        <div className="text-center">
                            <Wind size={11} className="text-cyan-400/60 mx-auto mb-0.5" />
                            <p className="text-[10px] text-white/40">{Math.round(current.wind_kph)} km/h</p>
                        </div>
                        <div className="text-center">
                            <Eye size={11} className="text-cyan-400/60 mx-auto mb-0.5" />
                            <p className="text-[10px] text-white/40">{current.vis_km} km</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hourly Forecast */}
            {displayHours.length > 0 && (
                <div className="px-5 pb-4">
                    <div className="flex gap-2 overflow-x-auto">
                        {displayHours.map((h, i) => {
                            const HIcon = getWeatherIcon(h.condition.code, 1);
                            const time = new Date(h.time);
                            return (
                                <div key={i} className="flex-shrink-0 bg-white/[0.04] rounded-lg px-2.5 py-2 text-center min-w-[52px]">
                                    <p className="text-[9px] text-white/30">{time.getHours().toString().padStart(2, '0')}:00</p>
                                    <HIcon size={14} className="text-white/35 mx-auto my-1" />
                                    <p className="text-[11px] text-white/60 font-medium">{Math.round(h.temp_c)}°</p>
                                    {h.chance_of_rain > 30 && (
                                        <p className="text-[8px] text-cyan-400/50">💧{h.chance_of_rain}%</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 3-Day Forecast */}
            <div className="px-5 pb-4 border-t border-white/[0.04] pt-3">
                <div className="flex gap-3 justify-between">
                    {forecast.forecastday.map((day, i) => {
                        const DIcon = getWeatherIcon(day.day.condition.code, 1);
                        const date = new Date(day.date);
                        const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en', { weekday: 'short' });
                        return (
                            <div key={i} className="flex-1 text-center">
                                <p className="text-[10px] text-white/30 mb-1">{dayName}</p>
                                <DIcon size={16} className="text-white/30 mx-auto mb-1" />
                                <div className="flex items-center justify-center gap-1">
                                    <span className="text-[11px] text-white/60 font-medium">{Math.round(day.day.maxtemp_c)}°</span>
                                    <span className="text-[10px] text-white/25">{Math.round(day.day.mintemp_c)}°</span>
                                </div>
                                {day.day.daily_chance_of_rain > 30 && (
                                    <p className="text-[8px] text-cyan-400/40 mt-0.5">💧{day.day.daily_chance_of_rain}%</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sunrise/Sunset */}
            <div className="px-5 pb-3 flex justify-center gap-6">
                <div className="flex items-center gap-1.5">
                    <Sunrise size={10} className="text-amber-400/50" />
                    <span className="text-[9px] text-white/25">{today.astro.sunrise}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Sunset size={10} className="text-orange-400/50" />
                    <span className="text-[9px] text-white/25">{today.astro.sunset}</span>
                </div>
            </div>
        </div>
    );
}
