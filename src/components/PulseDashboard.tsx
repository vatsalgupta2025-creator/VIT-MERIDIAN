'use client';

import { useMemo } from 'react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import {
    Activity, TrendingUp, Flame, Trophy, Target, Brain, Zap,
    BarChart3,
} from 'lucide-react';
import { userEngagement, weeklyHeatmap, heatmapLabels, currentUser } from '@/data/mockData';
import { generateInsight } from '@/data/mockBackend';
import Leaderboard from './Leaderboard';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function StatCard({
    label,
    value,
    icon: Icon,
    color,
    suffix = '',
}: {
    label: string;
    value: number;
    icon: React.ElementType;
    color: string;
    suffix?: string;
}) {
    return (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.05] transition-colors">
            <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={color} />
                <span className="text-[11px] text-white/40 font-medium">{label}</span>
            </div>
            <p className={`text-2xl font-bold ${color}`}>
                {value}<span className="text-sm font-normal text-white/30">{suffix}</span>
            </p>
        </div>
    );
}

function HeatmapCell({ value, max }: { value: number; max: number }) {
    const intensity = value / max;
    const bg =
        intensity > 0.8 ? 'bg-cyan-500' :
            intensity > 0.6 ? 'bg-cyan-500/70' :
                intensity > 0.4 ? 'bg-cyan-500/40' :
                    intensity > 0.2 ? 'bg-cyan-500/20' :
                        intensity > 0 ? 'bg-cyan-500/10' : 'bg-white/[0.03]';

    return (
        <div
            className={`w-full aspect-square rounded-md ${bg} transition-all hover:scale-110 cursor-pointer`}
            title={`Activity: ${value}`}
        />
    );
}

export default function PulseDashboard() {
    const radarData = useMemo(
        () => ({
            labels: ['Attendance', 'Resources', 'Social', 'System', 'Contributions', 'Consistency'],
            datasets: [
                {
                    label: 'Your Engagement',
                    data: [
                        userEngagement.attendance,
                        userEngagement.academicResources,
                        userEngagement.socialLife,
                        userEngagement.systemUsage,
                        userEngagement.contributions,
                        userEngagement.consistency,
                    ],
                    backgroundColor: 'rgba(6, 182, 212, 0.15)',
                    borderColor: 'rgba(6, 182, 212, 0.7)',
                    borderWidth: 2,
                    pointBackgroundColor: '#06b6d4',
                    pointBorderColor: 'rgba(6, 182, 212, 0.3)',
                    pointHoverBackgroundColor: '#06b6d4',
                    pointHoverBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
                {
                    label: 'Cohort Average',
                    data: [78, 72, 68, 65, 60, 70],
                    backgroundColor: 'rgba(139, 92, 246, 0.08)',
                    borderColor: 'rgba(139, 92, 246, 0.4)',
                    borderWidth: 1.5,
                    borderDash: [4, 4],
                    pointBackgroundColor: 'rgba(139, 92, 246, 0.5)',
                    pointRadius: 3,
                    pointHoverRadius: 5,
                },
            ],
        }),
        []
    );

    const radarOptions = useMemo(
        () => ({
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 20,
                        display: false,
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.04)',
                    },
                    angleLines: {
                        color: 'rgba(255, 255, 255, 0.04)',
                    },
                    pointLabels: {
                        color: 'rgba(255, 255, 255, 0.4)',
                        font: { size: 11, family: 'Inter' },
                    },
                },
            },
            plugins: {
                legend: {
                    position: 'bottom' as const,
                    labels: {
                        color: 'rgba(255, 255, 255, 0.4)',
                        font: { size: 11, family: 'Inter' },
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: 'circle',
                    },
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    titleFont: { family: 'Inter' },
                    bodyFont: { family: 'Inter' },
                    cornerRadius: 8,
                },
            },
        }),
        []
    );

    const insight = useMemo(() => generateInsight(userEngagement), []);
    const heatmapMax = Math.max(...weeklyHeatmap.flat());

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold text-white/90 flex items-center gap-2">
                    <Activity size={20} className="text-violet-400" />
                    VitGroww Intelligence — Pulse
                </h2>
                <p className="text-xs text-white/30 mt-0.5">Your engagement analytics & RUVI score</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="RUVI Score" value={currentUser.ruviScore} icon={Target} color="text-cyan-400" suffix="/100" />
                <StatCard label="XP Points" value={currentUser.totalPoints} icon={Zap} color="text-violet-400" />
                <StatCard label="Day Streak" value={currentUser.streak} icon={Flame} color="text-amber-400" />
                <StatCard label="VitGroww Rank" value={currentUser.rank} icon={Trophy} color="text-emerald-400" suffix="th" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Radar Chart */}
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-white/60 mb-4 flex items-center gap-2">
                        <BarChart3 size={14} className="text-cyan-400" />
                        Engagement Radar
                    </h3>
                    <div className="w-full max-w-[320px] mx-auto">
                        <Radar data={radarData} options={radarOptions} />
                    </div>
                </div>

                {/* AI Insight + Heatmap */}
                <div className="space-y-4">
                    {/* AI Insight */}
                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center">
                                <Brain size={12} className="text-white" />
                            </div>
                            <h3 className="text-sm font-semibold text-white/60">AI Insight</h3>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed">
                            {insight}
                        </p>
                    </div>

                    {/* Heatmap */}
                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
                        <h3 className="text-sm font-semibold text-white/60 mb-4 flex items-center gap-2">
                            <TrendingUp size={14} className="text-emerald-400" />
                            Weekly Activity
                        </h3>
                        <div className="space-y-2">
                            {weeklyHeatmap.map((row, rowIdx) => (
                                <div key={rowIdx} className="flex items-center gap-2">
                                    <span className="text-[10px] text-white/25 w-20 text-right flex-shrink-0">
                                        {heatmapLabels.rows[rowIdx]}
                                    </span>
                                    <div className="flex-1 grid grid-cols-7 gap-1.5">
                                        {row.map((val, colIdx) => (
                                            <HeatmapCell key={colIdx} value={val} max={heatmapMax} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {/* Day labels */}
                            <div className="flex items-center gap-2">
                                <span className="w-20 flex-shrink-0" />
                                <div className="flex-1 grid grid-cols-7 gap-1.5">
                                    {heatmapLabels.cols.map((day) => (
                                        <span key={day} className="text-[9px] text-white/20 text-center">
                                            {day}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* Legend */}
                        <div className="flex items-center gap-2 mt-4 justify-end">
                            <span className="text-[10px] text-white/20">Less</span>
                            {[0.1, 0.25, 0.45, 0.65, 0.85].map((v, i) => (
                                <div
                                    key={i}
                                    className="w-3 h-3 rounded-sm"
                                    style={{ backgroundColor: `rgba(6, 182, 212, ${v})` }}
                                />
                            ))}
                            <span className="text-[10px] text-white/20">More</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gamification badge */}
            <div className="bg-gradient-to-r from-violet-500/10 via-cyan-500/5 to-emerald-500/10 border border-white/[0.06] rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <Trophy size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white/80">Level {currentUser.level} — Knowledge Seeker</p>
                        <p className="text-xs text-white/35 mt-0.5">
                            {currentUser.totalPoints} XP · {250 - (currentUser.totalPoints % 250)} XP to Level {currentUser.level + 1}
                        </p>
                    </div>
                </div>
                <div className="w-32 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                        style={{ width: `${((currentUser.totalPoints % 250) / 250) * 100}%` }}
                    />
                </div>
            </div>

            {/* Global Leaderboard Section */}
            <div className="mt-6 h-[400px]">
                <Leaderboard />
            </div>
        </div>
    );
}
