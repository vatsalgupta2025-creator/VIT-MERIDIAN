'use client';

import { motion } from 'framer-motion';
import { Trophy, Medal, Crown } from 'lucide-react';
import { currentUser } from '@/data/mockData';

const leaderboardData = [
    { rank: 1, name: 'Priya Sharma', gpa: 3.98, xp: 4500, avatar: 'PS' },
    { rank: 2, name: 'Arjun Patel', gpa: 3.92, xp: 4200, avatar: 'AP' },
    { rank: 3, name: 'Ayush Upadhyay', gpa: 3.72, xp: currentUser.totalPoints, avatar: 'AU', isMe: true }, // Dynamic current user
    { rank: 4, name: 'Nina Singh', gpa: 3.70, xp: 3950, avatar: 'NS' },
    { rank: 5, name: 'Vikram Gupta', gpa: 3.65, xp: 3800, avatar: 'VG' },
];

export default function Leaderboard() {
    return (
        <div className="glass-card p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold text-white/90 flex items-center gap-2">
                        <Trophy className="text-amber-400" />
                        Global Leaderboard
                    </h3>
                    <p className="text-xs text-white/40 mt-1">BTech CSE AIML • 3rd Year</p>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold">
                    Season 4
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {leaderboardData.map((user, idx) => {
                    const isTop1 = user.rank === 1;
                    const isTop2 = user.rank === 2;
                    const isTop3 = user.rank === 3;

                    return (
                        <motion.div
                            key={user.rank}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.02, x: 5 }}
                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${user.isMe
                                    ? 'bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                                }`}
                        >
                            <div className="flex items-center justify-center w-8 font-bold text-lg">
                                {isTop1 ? <Crown className="text-yellow-400" /> :
                                    isTop2 ? <Medal className="text-gray-300" /> :
                                        isTop3 ? <Medal className="text-amber-600" /> :
                                            <span className="text-white/30">{user.rank}</span>}
                            </div>

                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transform rotate-3 ${isTop1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg shadow-yellow-500/20' :
                                    isTop2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                                        isTop3 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' :
                                            user.isMe ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white' :
                                                'bg-white/10 text-white/50'
                                }`}>
                                {user.avatar}
                            </div>

                            <div className="flex-1">
                                <h4 className={`font-bold ${user.isMe ? 'text-cyan-400' : 'text-white/90'}`}>
                                    {user.name} {user.isMe && '(You)'}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                                    <span>GPA: {user.gpa}</span>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                                    {user.xp.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-white/30 uppercase font-bold tracking-wider">XP</div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
