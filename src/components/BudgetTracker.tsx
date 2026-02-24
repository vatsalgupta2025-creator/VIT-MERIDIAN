'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet, Plus, Trash2, Sparkles, Loader2, TrendingUp, TrendingDown,
    DollarSign, Coffee, Car, BookOpen, Home, Film, ShoppingBag,
    PiggyBank, Target, BarChart3, ArrowUpRight, ArrowDownRight, Lightbulb
} from 'lucide-react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { ShaderAnimation } from './ui/shader-lines';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Filler);

const GEMINI_API_KEY = 'AIzaSyAAzmTY0Eb0_Ytm7SIkCbysBJPf0bWIMWo';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

interface Expense {
    id: string;
    amount: number;
    category: string;
    description: string;
    date: string;
}

const CATEGORIES = [
    { id: 'food', label: 'Food', icon: Coffee, color: '#f59e0b' },
    { id: 'transport', label: 'Transport', icon: Car, color: '#06b6d4' },
    { id: 'study', label: 'Study', icon: BookOpen, color: '#8b5cf6' },
    { id: 'hostel', label: 'Hostel', icon: Home, color: '#10b981' },
    { id: 'entertainment', label: 'Fun', icon: Film, color: '#ef4444' },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: '#ec4899' },
];

export default function BudgetTracker() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [newAmount, setNewAmount] = useState('');
    const [newCategory, setNewCategory] = useState('food');
    const [newDesc, setNewDesc] = useState('');
    const [monthlyBudget, setMonthlyBudget] = useState(15000);
    const [savingsGoal, setSavingsGoal] = useState(5000);
    const [aiAdvice, setAiAdvice] = useState('');
    const [generating, setGenerating] = useState(false);

    // Load data
    useEffect(() => {
        const saved = localStorage.getItem('vitgroww_budget');
        if (saved) {
            try {
                const d = JSON.parse(saved);
                setExpenses(d.expenses || []);
                setMonthlyBudget(d.budget || 15000);
                setSavingsGoal(d.savingsGoal || 5000);
            } catch { }
        }
    }, []);

    // Save data
    useEffect(() => {
        localStorage.setItem('vitgroww_budget', JSON.stringify({ expenses, budget: monthlyBudget, savingsGoal }));
    }, [expenses, monthlyBudget, savingsGoal]);

    const addExpense = () => {
        if (!newAmount || isNaN(Number(newAmount))) return;
        const expense: Expense = {
            id: `exp-${Date.now()}`,
            amount: Number(newAmount),
            category: newCategory,
            description: newDesc || CATEGORIES.find(c => c.id === newCategory)?.label || 'Expense',
            date: new Date().toISOString()
        };
        setExpenses(prev => [expense, ...prev]);
        setNewAmount('');
        setNewDesc('');
        setShowAdd(false);
    };

    const deleteExpense = (id: string) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
    };

    // Calculations
    const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
    const remaining = monthlyBudget - totalSpent;
    const savingsProgress = Math.max(0, Math.min(100, (remaining / savingsGoal) * 100));

    const categoryBreakdown = useMemo(() => {
        const breakdown: Record<string, number> = {};
        expenses.forEach(e => {
            breakdown[e.category] = (breakdown[e.category] || 0) + e.amount;
        });
        return breakdown;
    }, [expenses]);

    const weeklyData = useMemo(() => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const data = new Array(7).fill(0);
        const now = new Date();
        expenses.forEach(e => {
            const d = new Date(e.date);
            const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
            if (diff < 7) {
                const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
                data[dayIdx] += e.amount;
            }
        });
        return { labels: days, data };
    }, [expenses]);

    const getAdvice = async () => {
        setGenerating(true);
        try {
            const catSummary = CATEGORIES.map(c => `${c.label}: ₹${categoryBreakdown[c.id] || 0}`).join(', ');
            const prompt = `As a financial advisor for a college student in India, give 4 short practical tips based on their spending: Total: ₹${totalSpent}, Budget: ₹${monthlyBudget}, Breakdown: ${catSummary}.
            Return ONLY valid JSON: {"tips": ["tip 1", "tip 2", "tip 3", "tip 4"]}. No markdown.`;

            const res = await fetch(GEMINI_URL, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
            setAiAdvice(parsed.tips.join(' || '));
        } catch {
            setAiAdvice('Unable to get AI advice right now.');
        } finally {
            setGenerating(false);
        }
    };

    // Chart data
    const doughnutData = useMemo(() => ({
        labels: CATEGORIES.map(c => c.label),
        datasets: [{
            data: CATEGORIES.map(c => categoryBreakdown[c.id] || 0),
            backgroundColor: CATEGORIES.map(c => c.color + 'cc'),
            borderColor: 'rgba(0,0,0,0.3)',
            borderWidth: 2,
            hoverOffset: 8,
        }]
    }), [categoryBreakdown]);

    const barData = useMemo(() => ({
        labels: weeklyData.labels,
        datasets: [{
            label: 'Spent (₹)',
            data: weeklyData.data,
            backgroundColor: 'rgba(6,182,212,0.6)',
            borderColor: 'rgba(6,182,212,1)',
            borderWidth: 1.5,
            borderRadius: 6,
            borderSkipped: false as const,
        }]
    }), [weeklyData]);

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-hidden relative">
            {/* Shader Background */}
            <div className="absolute inset-0 z-0 opacity-35 pointer-events-none overflow-hidden rounded-2xl">
                <ShaderAnimation />
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                    <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.5 }}
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30 border border-white/10">
                        <Wallet size={28} className="text-white" />
                    </motion.div>
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Budget Tracker</h2>
                        <p className="text-white/40 text-sm">Track expenses & manage your student budget</p>
                    </div>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAdd(!showAdd)}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20">
                    <Plus size={18} /> Add Expense
                </motion.button>
            </div>

            {/* Add Expense Modal */}
            <AnimatePresence>
                {showAdd && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 flex-shrink-0 overflow-hidden">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-white/30 text-[10px] uppercase tracking-wider block mb-1">Amount (₹)</label>
                                <input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="500"
                                    className="w-full bg-black/30 border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/40" />
                            </div>
                            <div>
                                <label className="text-white/30 text-[10px] uppercase tracking-wider block mb-1">Category</label>
                                <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                                    className="w-full bg-black/30 border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/40">
                                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-white/30 text-[10px] uppercase tracking-wider block mb-1">Note</label>
                                <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Coffee at canteen"
                                    className="w-full bg-black/30 border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/40" />
                            </div>
                        </div>
                        <button onClick={addExpense} className="mt-4 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all">
                            Add Expense
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Stats + Charts */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, icon: TrendingDown, color: 'rose', sub: `of ₹${monthlyBudget.toLocaleString()}` },
                                { label: 'Remaining', value: `₹${Math.max(0, remaining).toLocaleString()}`, icon: TrendingUp, color: remaining > 0 ? 'emerald' : 'rose', sub: remaining > 0 ? 'On track' : 'Over budget!' },
                                { label: 'Savings', value: `${Math.round(savingsProgress)}%`, icon: PiggyBank, color: 'amber', sub: `Goal: ₹${savingsGoal.toLocaleString()}` },
                            ].map((stat, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                    className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
                                    <stat.icon size={20} className={`text-${stat.color}-400 mb-3`} />
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    <p className="text-white/30 text-xs mt-1">{stat.sub}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Doughnut */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
                                <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                                    <DollarSign size={14} className="text-amber-400" /> By Category
                                </h3>
                                <div className="h-[170px]">
                                    <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(10,15,30,0.95)', cornerRadius: 10, padding: 10, callbacks: { label: (c) => ` ₹${c.parsed}` } } } }} />
                                </div>
                                <div className="grid grid-cols-3 gap-1 mt-3">
                                    {CATEGORIES.map((c, i) => (
                                        <div key={i} className="flex items-center gap-1">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                                            <span className="text-[10px] text-white/40">{c.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Bar */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
                                <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                                    <BarChart3 size={14} className="text-cyan-400" /> Weekly Trend
                                </h3>
                                <div className="h-[190px]">
                                    <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(10,15,30,0.95)', cornerRadius: 10, padding: 10, callbacks: { label: (c) => ` ₹${c.parsed.y}` } } }, scales: { y: { display: false }, x: { grid: { display: false }, border: { display: false }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 } } } } }} />
                                </div>
                            </motion.div>
                        </div>

                        {/* AI Advice */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                            className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-violet-400 flex items-center gap-2">
                                    <Lightbulb size={16} /> AI Budget Advisor
                                </h3>
                                <button onClick={getAdvice} disabled={generating}
                                    className="px-3 py-1.5 bg-violet-500/20 text-violet-400 text-xs rounded-lg hover:bg-violet-500/30 transition-all flex items-center gap-1">
                                    {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                    Get Tips
                                </button>
                            </div>
                            {aiAdvice ? (
                                <div className="space-y-2">
                                    {aiAdvice.split(' || ').map((tip, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs text-white/60">
                                            <span className="text-violet-400 font-bold">{i + 1}.</span>
                                            <span>{tip}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-white/30 text-xs">Click "Get Tips" for AI-powered budget advice based on your spending</p>
                            )}
                        </motion.div>
                    </div>

                    {/* Right: Expense List + Settings */}
                    <div className="space-y-6">
                        {/* Budget Settings */}
                        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
                            <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Settings</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-white/30 text-[10px] uppercase block mb-1">Monthly Budget (₹)</label>
                                    <input type="number" value={monthlyBudget} onChange={e => setMonthlyBudget(Number(e.target.value))}
                                        className="w-full bg-black/30 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500/40" />
                                </div>
                                <div>
                                    <label className="text-white/30 text-[10px] uppercase block mb-1">Savings Goal (₹)</label>
                                    <input type="number" value={savingsGoal} onChange={e => setSavingsGoal(Number(e.target.value))}
                                        className="w-full bg-black/30 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-500/40" />
                                </div>
                            </div>
                            {/* Budget progress ring */}
                            <div className="flex items-center justify-center mt-4">
                                <div className="relative w-24 h-24">
                                    <svg className="w-24 h-24 -rotate-90">
                                        <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                                        <motion.circle cx="48" cy="48" r="42" fill="none"
                                            stroke={remaining > monthlyBudget * 0.3 ? '#10b981' : remaining > 0 ? '#f59e0b' : '#ef4444'}
                                            strokeWidth="6" strokeLinecap="round"
                                            initial={{ strokeDasharray: '0 264' }}
                                            animate={{ strokeDasharray: `${Math.max(0, Math.min(100, (totalSpent / monthlyBudget) * 100)) * 2.64} 264` }}
                                            transition={{ duration: 1 }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-lg font-bold text-white">{Math.round((totalSpent / monthlyBudget) * 100)}%</span>
                                        <span className="text-[10px] text-white/30">used</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Expenses */}
                        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
                            <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Recent ({expenses.length})</h3>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {expenses.length === 0 ? (
                                    <p className="text-white/20 text-xs text-center py-6">No expenses yet</p>
                                ) : expenses.slice(0, 20).map((e, i) => {
                                    const cat = CATEGORIES.find(c => c.id === e.category);
                                    return (
                                        <motion.div key={e.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                                            className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.05] group">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: (cat?.color || '#666') + '20' }}>
                                                {cat && <cat.icon size={14} style={{ color: cat.color }} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white/70 text-xs font-medium truncate">{e.description}</p>
                                                <p className="text-white/30 text-[10px]">{new Date(e.date).toLocaleDateString()}</p>
                                            </div>
                                            <span className="text-white font-bold text-sm">₹{e.amount}</span>
                                            <button onClick={() => deleteExpense(e.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-white/20 hover:text-red-400 transition-all">
                                                <Trash2 size={12} />
                                            </button>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
