'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Plus, ListTodo, MoreVertical } from 'lucide-react';

interface Task {
    id: string;
    text: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high';
}

const initialTasks: Task[] = [
    { id: '1', text: 'Finish ML Assignment 4', completed: false, priority: 'high' },
    { id: '2', text: 'Review Graph Theory proofs', completed: true, priority: 'medium' },
    { id: '3', text: 'Prepare for club meeting', completed: false, priority: 'low' },
    { id: '4', text: 'Submit leave request form', completed: false, priority: 'medium' },
];

export default function TodoList() {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [newTask, setNewTask] = useState('');

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const addTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        const task: Task = {
            id: Date.now().toString(),
            text: newTask,
            completed: false,
            priority: 'medium'
        };
        setTasks([task, ...tasks]);
        setNewTask('');
    };

    return (
        <div className="glass-card p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                    <ListTodo size={16} className="text-emerald-400" />
                    Task Master
                </h3>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/5 text-white/60">
                    {tasks.filter(t => t.completed).length} / {tasks.length} Done
                </span>
            </div>

            <form onSubmit={addTask} className="mb-4 relative">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a new task..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.05] transition-all"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
                >
                    <Plus size={14} />
                </button>
            </form>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                <AnimatePresence>
                    {tasks.map(task => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className={`group flex items-start gap-3 p-3 rounded-xl border transition-all ${task.completed
                                    ? 'bg-white/[0.01] border-transparent opacity-50 block'
                                    : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                                }`}
                        >
                            <button
                                onClick={() => toggleTask(task.id)}
                                className={`mt-0.5 flex-shrink-0 transition-colors ${task.completed ? 'text-emerald-400' : 'text-white/20 group-hover:text-cyan-400'
                                    }`}
                            >
                                {task.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                            </button>

                            <div className="flex-1 min-w-0">
                                <p className={`text-sm transition-all ${task.completed ? 'text-white/40 line-through' : 'text-white/80'
                                    }`}>
                                    {task.text}
                                </p>
                            </div>

                            <button className="text-white/20 opacity-0 group-hover:opacity-100 hover:text-white/60 transition-all">
                                <MoreVertical size={14} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
