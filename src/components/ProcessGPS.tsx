'use client';

import { useState } from 'react';
import {
    CheckCircle2, Circle, Clock, MessageSquare, ChevronDown, ChevronUp,
    AlertCircle, User, FileText, Loader2,
} from 'lucide-react';
import { workflowRequests, type WorkflowStage } from '@/data/mockData';

function StageIcon({ status }: { status: WorkflowStage['status'] }) {
    switch (status) {
        case 'completed':
            return <CheckCircle2 size={22} className="text-emerald-400" />;
        case 'in-progress':
            return (
                <div className="relative">
                    <Loader2 size={22} className="text-cyan-400 animate-spin" />
                    <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" />
                </div>
            );
        case 'pending':
            return <Circle size={22} className="text-white/20" />;
    }
}

function statusBadge(status: WorkflowStage['status']) {
    switch (status) {
        case 'completed':
            return (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 uppercase tracking-wider">
                    Completed
                </span>
            );
        case 'in-progress':
            return (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/15 text-cyan-400 uppercase tracking-wider animate-pulse">
                    In Progress
                </span>
            );
        case 'pending':
            return (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.06] text-white/30 uppercase tracking-wider">
                    Pending
                </span>
            );
    }
}

export default function ProcessGPS() {
    const [activeRequest, setActiveRequest] = useState(0);
    const [expandedStage, setExpandedStage] = useState<number | null>(null);
    const [sliderValue, setSliderValue] = useState(2); // 0-indexed current active stage for demo

    const request = workflowRequests[activeRequest];

    // For slider-driven demo: override statuses dynamically
    const getStageStatus = (idx: number): WorkflowStage['status'] => {
        if (activeRequest === 0) {
            if (idx < sliderValue) return 'completed';
            if (idx === sliderValue) return 'in-progress';
            return 'pending';
        }
        return request.stages[idx].status;
    };

    const completedCount = request.stages.filter(
        (_, i) => getStageStatus(i) === 'completed'
    ).length;
    const progressPct = (completedCount / request.stages.length) * 100;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white/90 flex items-center gap-2">
                        <FileText size={20} className="text-cyan-400" />
                        Process GPS
                    </h2>
                    <p className="text-xs text-white/30 mt-0.5">Track your requests in real-time</p>
                </div>
                <div className="flex items-center gap-2">
                    {workflowRequests.map((req, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveRequest(i)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeRequest === i
                                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                                : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.06]'
                                }`}
                        >
                            {req.type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Request card */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden">
                {/* Request header */}
                <div className="p-5 border-b border-white/[0.06]">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[11px] font-mono text-white/30">{request.id}</span>
                                <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${request.priority === 'high'
                                        ? 'bg-red-500/15 text-red-400'
                                        : request.priority === 'medium'
                                            ? 'bg-amber-500/15 text-amber-400'
                                            : 'bg-emerald-500/15 text-emerald-400'
                                        }`}
                                >
                                    {request.priority} priority
                                </span>
                            </div>
                            <h3 className="text-base font-semibold text-white/85">{request.title}</h3>
                            <p className="text-xs text-white/30 mt-1">Submitted: {request.createdAt}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-cyan-400">{Math.round(progressPct)}%</p>
                            <p className="text-[11px] text-white/30">Complete</p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                                width: `${progressPct}%`,
                                background: 'linear-gradient(90deg, #10b981, #06b6d4, #8b5cf6)',
                            }}
                        />
                    </div>
                </div>

                {/* Timeline */}
                <div className="p-5">
                    {request.stages.map((stage, idx) => {
                        const status = getStageStatus(idx);
                        const isExpanded = expandedStage === idx;
                        const isLast = idx === request.stages.length - 1;

                        return (
                            <div key={stage.id} className="flex gap-4">
                                {/* Timeline line + icon */}
                                <div className="flex flex-col items-center">
                                    <div className="relative z-10">
                                        <StageIcon status={status} />
                                    </div>
                                    {!isLast && (
                                        <div
                                            className={`w-[2px] flex-1 min-h-[40px] my-1 transition-colors ${status === 'completed'
                                                ? 'bg-emerald-500/40'
                                                : status === 'in-progress'
                                                    ? 'bg-gradient-to-b from-cyan-500/40 to-white/5'
                                                    : 'bg-white/[0.06]'
                                                }`}
                                        />
                                    )}
                                </div>

                                {/* Content */}
                                <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
                                    <button
                                        onClick={() => setExpandedStage(isExpanded ? null : idx)}
                                        className="w-full text-left group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className={`text-sm font-medium ${status === 'pending' ? 'text-white/30' : 'text-white/80'
                                                    }`}>
                                                    {stage.name}
                                                </p>
                                                {stage.timestamp && (
                                                    <p className="text-[11px] text-white/25 mt-0.5 flex items-center gap-1">
                                                        <Clock size={10} /> {stage.timestamp}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {statusBadge(status)}
                                                {stage.comment && (
                                                    isExpanded
                                                        ? <ChevronUp size={14} className="text-white/20" />
                                                        : <ChevronDown size={14} className="text-white/20" />
                                                )}
                                            </div>
                                        </div>
                                    </button>

                                    {/* Expanded details */}
                                    {isExpanded && (
                                        <div className="mt-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] animate-in-slide space-y-2">
                                            <div className="flex items-center gap-1.5 text-xs text-white/40">
                                                <User size={12} />
                                                <span>{stage.assignee}</span>
                                            </div>
                                            {stage.comment && (
                                                <div className="flex items-start gap-1.5 text-xs text-white/50">
                                                    <MessageSquare size={12} className="mt-0.5 flex-shrink-0" />
                                                    <span className="italic">&ldquo;{stage.comment}&rdquo;</span>
                                                </div>
                                            )}
                                            {stage.estimatedCompletion && status !== 'completed' && (
                                                <div className="flex items-center gap-1.5 text-xs text-amber-400/60">
                                                    <AlertCircle size={12} />
                                                    <span>Est. completion: {stage.estimatedCompletion}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Demo slider (only for first workflow) */}
                {activeRequest === 0 && (
                    <div className="px-5 pb-5 border-t border-white/[0.04] pt-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[11px] text-white/30 uppercase tracking-wider font-semibold">
                                Demo: Advance Workflow
                            </p>
                            <p className="text-[11px] text-cyan-400/60 font-mono">
                                Stage {sliderValue + 1}/{request.stages.length}
                            </p>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={request.stages.length - 1}
                            value={sliderValue}
                            onChange={(e) => setSliderValue(parseInt(e.target.value))}
                            className="w-full accent-cyan-500 h-1.5 bg-white/[0.06] rounded-full appearance-none cursor-pointer custom-slider"
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="px-5 pb-5 flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 text-xs hover:bg-white/[0.06] hover:text-white/60 transition-colors">
                        <MessageSquare size={12} /> Add Comment
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 text-xs hover:bg-white/[0.06] hover:text-white/60 transition-colors">
                        <AlertCircle size={12} /> Notify Me
                    </button>
                </div>
            </div>

            <style jsx>{`
        .animate-in-slide {
          animation: slideDown 0.2s ease-out;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 1rem;
          height: 1rem;
          border-radius: 9999px;
          background-color: #22d3ee;
          box-shadow: 0 0 12px rgba(6,182,212,0.5);
          cursor: pointer;
        }
        .custom-slider::-moz-range-thumb {
          width: 1rem;
          height: 1rem;
          border-radius: 9999px;
          background-color: #22d3ee;
          box-shadow: 0 0 12px rgba(6,182,212,0.5);
          cursor: pointer;
          border: none;
        }
      `}</style>
        </div>
    );
}
