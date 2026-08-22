'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, UserCheck, ShieldAlert, KeyRound } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useRBAC } from '@/context/RBACContext';
import { canonicalStudents, canonicalFaculties } from '@/data/canonicalData';

interface GlobalLoginProps {
  onLoginSuccess: () => void;
}

export default function GlobalLogin({ onLoginSuccess }: GlobalLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { updateUser } = useUser();
  const { setActiveRole } = useRBAC();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const uname = username.trim().toUpperCase();

    // Check if it's a student
    if (canonicalStudents[uname] && password === 'student123') {
      const stu = canonicalStudents[uname];
      updateUser({
        name: stu.personalInfo.fullName,
        regNo: stu.id,
        email: stu.personalInfo.email,
        avatar: stu.personalInfo.avatarUrl || '',
      });
      setActiveRole('STUDENT');
      onLoginSuccess();
      return;
    }

    // Check if it's a faculty
    if (canonicalFaculties[uname] && password === 'faculty123') {
      const fac = canonicalFaculties[uname];
      updateUser({
        name: fac.name,
        regNo: fac.id,
        email: `${fac.id}@vit.edu`, // Mock email
        avatar: '',
      });
      setActiveRole('FACULTY');
      onLoginSuccess();
      return;
    }

    setError('Invalid ID or Password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 rounded-2xl bg-zinc-900/80 border border-white/10 backdrop-blur-xl max-w-md w-full mx-4 shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
            <KeyRound className="w-8 h-8 text-indigo-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white text-center mb-2">VIT-MERIDIAN</h2>
        <p className="text-zinc-400 text-center mb-8 text-sm">Unified Campus OS Authentication</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">ID Number</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. 21BCE0001 or 52553"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1.5">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-rose-400 text-sm bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
              <ShieldAlert className="w-4 h-4" />
              {error}
            </motion.div>
          )}
          <button 
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition-colors mt-6 flex justify-center items-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            Secure Login
            <UserCheck className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-zinc-500 space-y-2">
          <p>Student Login: <span className="text-zinc-300">RegNo / student123</span></p>
          <p>Faculty Login: <span className="text-zinc-300">EmpID / faculty123</span></p>
        </div>
      </motion.div>
    </div>
  );
}
