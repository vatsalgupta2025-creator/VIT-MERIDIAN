'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = new Date();

    const generateDays = () => {
        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10 w-full" />);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const isToday =
                today.getDate() === i &&
                today.getMonth() === currentDate.getMonth() &&
                today.getFullYear() === currentDate.getFullYear();

            // Randomly mock some events for visual flair
            const hasEvent = i % 7 === 0 || i % 12 === 0;
            const isCritical = i === 15 || i === 28;

            days.push(
                <motion.div
                    key={i}
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                    whileTap={{ scale: 0.95 }}
                    className={`h-10 w-full flex flex-col items-center justify-center rounded-lg cursor-pointer transition-colors relative group
                        ${isToday ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30' : 'hover:bg-white/10 text-white/70'}
                    `}
                >
                    <span className="text-sm">{i}</span>
                    <div className="flex gap-1 mt-1">
                        {hasEvent && <div className={`w-1 h-1 rounded-full ${isCritical ? 'bg-red-400' : 'bg-emerald-400'}`} />}
                    </div>
                </motion.div>
            );
        }
        return days;
    };

    return (
        <div className="glass-card p-5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                    <CalendarIcon size={16} className="text-violet-400" />
                    Interactive Calendar
                </h3>
                <div className="flex items-center gap-3">
                    <button onClick={prevMonth} className="text-white/40 hover:text-white transition-colors">
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm font-medium text-white/90 min-w-[100px] text-center">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={nextMonth} className="text-white/40 hover:text-white transition-colors">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map(day => (
                    <div key={day} className="text-center text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentDate.toISOString()}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-7 gap-1 flex-1"
                >
                    {generateDays()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
