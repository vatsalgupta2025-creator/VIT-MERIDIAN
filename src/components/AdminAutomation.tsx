'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot,
    Play,
    Pause,
    Settings,
    CheckCircle,
    Clock,
    Zap,
    FileText,
    Send,
    Calendar,
    Users,
    Mail,
    Bell,
    Database,
    Workflow,
    ChevronRight,
    Activity,
    RefreshCw,
    ArrowRight,
    Timer,
    Target,
    TrendingUp,
    AlertCircle,
    Plus,
    Trash2,
    Edit3,
    Copy,
    MoreVertical
} from 'lucide-react';

interface AutomationTask {
    id: number;
    name: string;
    description: string;
    category: 'forms' | 'notifications' | 'reports' | 'approvals' | 'sync';
    status: 'active' | 'paused' | 'scheduled' | 'error';
    lastRun: string;
    nextRun: string;
    successRate: number;
    runs: number;
    trigger: 'manual' | 'scheduled' | 'event' | 'api';
    schedule?: string;
}

interface AutomationLog {
    id: number;
    taskId: number;
    taskName: string;
    status: 'success' | 'failed' | 'running';
    message: string;
    timestamp: string;
    duration: string;
}

const mockAutomationTasks: AutomationTask[] = [
    {
        id: 1,
        name: "Auto-Submit Leave Requests",
        description: "Automatically detect and submit leave requests based on attendance patterns",
        category: 'forms',
        status: 'active',
        lastRun: "2025-02-23 08:30 AM",
        nextRun: "2025-02-24 08:30 AM",
        successRate: 98.5,
        runs: 156,
        trigger: 'scheduled',
        schedule: "Daily at 8:30 AM"
    },
    {
        id: 2,
        name: "Event Approval Notifier",
        description: "Send automatic notifications to students when event approvals are processed",
        category: 'notifications',
        status: 'active',
        lastRun: "2025-02-23 02:15 PM",
        nextRun: "On event approval",
        successRate: 100,
        runs: 89,
        trigger: 'event'
    },
    {
        id: 3,
        name: "Weekly Report Generator",
        description: "Generate and email weekly academic reports to faculty advisors",
        category: 'reports',
        status: 'scheduled',
        lastRun: "2025-02-16 06:00 PM",
        nextRun: "2025-02-23 06:00 PM",
        successRate: 100,
        runs: 12,
        trigger: 'scheduled',
        schedule: "Every Sunday at 6:00 PM"
    },
    {
        id: 4,
        name: "Grade Entry Auto-Save",
        description: "Automatically save and backup grade entries every 30 minutes",
        category: 'sync',
        status: 'active',
        lastRun: "2025-02-23 11:45 AM",
        nextRun: "Continuous",
        successRate: 99.8,
        runs: 1247,
        trigger: 'scheduled',
        schedule: "Every 30 minutes"
    },
    {
        id: 5,
        name: "Fee Reminder Automation",
        description: "Send automated fee payment reminders to students with pending dues",
        category: 'notifications',
        status: 'paused',
        lastRun: "2025-02-10 09:00 AM",
        nextRun: "Paused",
        successRate: 95.2,
        runs: 45,
        trigger: 'scheduled',
        schedule: "Monthly on 1st"
    },
    {
        id: 6,
        name: "Certificate Auto-Generator",
        description: "Generate completion certificates when all requirements are met",
        category: 'forms',
        status: 'active',
        lastRun: "2025-02-23 10:00 AM",
        nextRun: "On completion check",
        successRate: 100,
        runs: 234,
        trigger: 'event'
    },
    {
        id: 7,
        name: "Library Due Date Alerts",
        description: "Send reminders 3 days before library book due dates",
        category: 'notifications',
        status: 'active',
        lastRun: "2025-02-23 07:00 AM",
        nextRun: "2025-02-24 07:00 AM",
        successRate: 97.8,
        runs: 567,
        trigger: 'scheduled',
        schedule: "Daily at 7:00 AM"
    },
    {
        id: 8,
        name: "Attendance Auto-Sync",
        description: "Sync attendance records across all systems every hour",
        category: 'sync',
        status: 'error',
        lastRun: "2025-02-23 10:00 AM",
        nextRun: "Under Review",
        successRate: 82.5,
        runs: 342,
        trigger: 'scheduled',
        schedule: "Hourly"
    }
];

const mockLogs: AutomationLog[] = [
    {
        id: 1,
        taskId: 1,
        taskName: "Auto-Submit Leave Requests",
        status: 'success',
        message: "Processed 12 leave requests successfully",
        timestamp: "2025-02-23 08:30:15 AM",
        duration: "2.3s"
    },
    {
        id: 2,
        taskId: 4,
        taskName: "Grade Entry Auto-Save",
        status: 'success',
        message: "Backup completed - 247 records synced",
        timestamp: "2025-02-23 11:45:00 AM",
        duration: "1.8s"
    },
    {
        id: 3,
        taskId: 8,
        taskName: "Attendance Auto-Sync",
        status: 'failed',
        message: "Connection timeout - retry scheduled",
        timestamp: "2025-02-23 10:00:00 AM",
        duration: "30.0s"
    },
    {
        id: 4,
        taskId: 2,
        taskName: "Event Approval Notifier",
        status: 'success',
        message: "Sent 5 notification emails",
        timestamp: "2025-02-23 02:15:30 PM",
        duration: "0.8s"
    },
    {
        id: 5,
        taskId: 6,
        taskName: "Certificate Auto-Generator",
        status: 'success',
        message: "Generated 3 certificates for CS301",
        timestamp: "2025-02-23 10:00:45 AM",
        duration: "4.2s"
    }
];

const categories = [
    { id: 'all', label: 'All', icon: Workflow },
    { id: 'forms', label: 'Forms', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'reports', label: 'Reports', icon: Database },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle },
    { id: 'sync', label: 'Sync', icon: RefreshCw },
];

export default function AdminAutomation() {
    const [tasks, setTasks] = useState<AutomationTask[]>(mockAutomationTasks);
    const [logs] = useState<AutomationLog[]>(mockLogs);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [activeTab, setActiveTab] = useState<'tasks' | 'logs' | 'create'>('tasks');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [stats, setStats] = useState({
        totalRuns: 0,
        successRate: 0,
        activeTasks: 0,
        timeSaved: 0
    });

    useEffect(() => {
        const totalRuns = tasks.reduce((sum, t) => sum + t.runs, 0);
        const successRate = tasks.reduce((sum, t) => sum + (t.successRate * t.runs), 0) / totalRuns;
        const activeTasks = tasks.filter(t => t.status === 'active').length;
        const timeSaved = Math.round(totalRuns * 2.5); // Assume 2.5 mins saved per run

        setStats({ totalRuns, successRate, activeTasks, timeSaved });
    }, [tasks]);

    const filteredTasks = selectedCategory === 'all'
        ? tasks
        : tasks.filter(t => t.category === selectedCategory);

    const toggleTaskStatus = (taskId: number) => {
        setTasks(tasks.map(task => {
            if (task.id === taskId) {
                return {
                    ...task,
                    status: task.status === 'active' ? 'paused' : 'active'
                };
            }
            return task;
        }));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'paused': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'scheduled': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
            case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-white/[0.06] text-white/40 border-white/[0.06]';
        }
    };

    const getTriggerIcon = (trigger: string) => {
        switch (trigger) {
            case 'manual': return Play;
            case 'scheduled': return Clock;
            case 'event': return Zap;
            case 'api': return Database;
            default: return Workflow;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white/90 flex items-center gap-3">
                        <Bot className="w-7 h-7 text-violet-400" />
                        Admin Automation
                    </h2>
                    <p className="text-sm text-white/40 mt-1">Automate repetitive admin tasks and workflows</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-cyan-600 rounded-xl text-white font-medium text-sm hover:shadow-lg hover:shadow-violet-500/20 transition-all"
                >
                    <Plus size={18} />
                    Create Automation
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Runs', value: stats.totalRuns.toLocaleString(), icon: Activity, color: 'cyan' },
                    { label: 'Success Rate', value: `${stats.successRate.toFixed(1)}%`, icon: Target, color: 'emerald' },
                    { label: 'Active Tasks', value: stats.activeTasks, icon: Zap, color: 'violet' },
                    { label: 'Time Saved', value: `${stats.timeSaved}m`, icon: Timer, color: 'amber' }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <stat.icon size={20} className={`text-${stat.color}-400`} />
                            <span className={`text-xs px-2 py-1 rounded-full bg-${stat.color}-500/10 text-${stat.color}-400`}>
                                +{Math.floor(Math.random() * 20) + 5}%
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-white/90">{stat.value}</p>
                        <p className="text-xs text-white/40">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { id: 'tasks', label: 'Automations', icon: Workflow },
                    { id: 'logs', label: 'Activity Logs', icon: Activity },
                    { id: 'create', label: 'Quick Create', icon: Plus }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id as any);
                            if (tab.id === 'create') setShowCreateModal(true);
                        }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:text-white/70'}`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:text-white/70'}`}
                    >
                        <cat.icon size={14} />
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Tasks Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredTasks.map(task => {
                        const TriggerIcon = getTriggerIcon(task.trigger);
                        return (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.1] transition-all group"
                            >
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${task.status === 'active' ? 'bg-emerald-500/20' : task.status === 'error' ? 'bg-red-500/20' : 'bg-white/[0.06]'}`}>
                                            <Workflow size={20} className={task.status === 'active' ? 'text-emerald-400' : task.status === 'error' ? 'text-red-400' : 'text-white/40'} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-white/90">{task.name}</h3>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(task.status)}`}>
                                                {task.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
                                        <MoreVertical size={16} className="text-white/30" />
                                    </button>
                                </div>

                                <p className="text-sm text-white/50 mb-4">
                                    {task.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.03] text-[11px] text-white/40 border border-white/[0.06]">
                                        <TriggerIcon size={10} />
                                        {task.trigger === 'scheduled' && task.schedule ? task.schedule : task.trigger}
                                    </span>
                                    <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.03] text-[11px] text-white/40 border border-white/[0.06]">
                                        <CheckCircle size={10} />
                                        {task.successRate}% success
                                    </span>
                                    <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.03] text-[11px] text-white/40 border border-white/[0.06]">
                                        <Activity size={10} />
                                        {task.runs} runs
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                                    <div className="flex items-center gap-4 text-xs text-white/30">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            Last: {task.lastRun}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {task.status === 'active' || task.status === 'paused' ? (
                                            <button
                                                onClick={() => toggleTaskStatus(task.id)}
                                                className={`p-2 rounded-lg transition-all ${task.status === 'active' ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
                                            >
                                                {task.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                                            </button>
                                        ) : null}
                                        <button className="p-2 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white/50 transition-all">
                                            <Settings size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Activity Logs Section */}
            {activeTab === 'logs' && (
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/[0.06]">
                        <h3 className="text-lg font-semibold text-white/90">Recent Activity</h3>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                        {logs.map(log => (
                            <div key={log.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${log.status === 'success' ? 'bg-emerald-500/20' : log.status === 'failed' ? 'bg-red-500/20' : 'bg-cyan-500/20'}`}>
                                    {log.status === 'success' ? <CheckCircle size={16} className="text-emerald-400" /> :
                                        log.status === 'failed' ? <AlertCircle size={16} className="text-red-400" /> :
                                            <Activity size={16} className="text-cyan-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white/80">{log.taskName}</p>
                                    <p className="text-xs text-white/40 truncate">{log.message}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-white/30">{log.timestamp}</p>
                                    <p className="text-xs text-white/40">{log.duration}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-900 border border-white/[0.1] rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white/90 flex items-center gap-2">
                                    <Bot size={20} className="text-violet-400" />
                                    Create New Automation
                                </h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 rounded-lg hover:bg-white/[0.06] text-white/40"
                                >
                                    <Plus size={20} className="rotate-45" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Automation Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Auto-Submit Weekly Reports"
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Description</label>
                                    <textarea
                                        placeholder="Describe what this automation does..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Category</label>
                                        <select className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                                            {categories.slice(1).map(cat => (
                                                <option key={cat.id} value={cat.id} className="bg-slate-800">{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Trigger Type</label>
                                        <select className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 focus:outline-none focus:ring-2 focus:ring-violet-500/50">
                                            <option value="scheduled" className="bg-slate-800">Scheduled</option>
                                            <option value="event" className="bg-slate-800">On Event</option>
                                            <option value="manual" className="bg-slate-800">Manual</option>
                                            <option value="api" className="bg-slate-800">API Trigger</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Schedule (if applicable)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Every day at 9:00 AM"
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white/80 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Actions</label>
                                    <div className="space-y-2">
                                        {['Send Email Notification', 'Update Database', 'Generate Report', 'Create Form Entry', 'Sync Data'].map((action, idx) => (
                                            <label key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.05]">
                                                <input type="checkbox" className="w-4 h-4 rounded bg-white/[0.06] border-white/[0.1] text-violet-500 focus:ring-violet-500/50" />
                                                <span className="text-sm text-white/70">{action}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-5 py-3 rounded-xl border border-white/[0.06] text-white/60 hover:text-white/80 hover:bg-white/[0.03] transition-all"
                                >
                                    Cancel
                                </button>
                                <button className="flex-1 px-5 py-3 bg-gradient-to-r from-violet-500 to-cyan-600 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-violet-500/20 transition-all flex items-center justify-center gap-2">
                                    <Play size={16} />
                                    Create Automation
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
