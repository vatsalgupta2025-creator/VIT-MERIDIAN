'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle2, XCircle, Search, Save, CalendarClock, UserCheck } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useRBAC } from '@/context/RBACContext';
import { canonicalFaculties, canonicalStudents } from '@/data/canonicalData';

interface AttendanceRecord {
  regNo: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

export default function FacultyAttendance() {
  const { user } = useUser();
  const { activeRole } = useRBAC();
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord['status']>>({});
  
  if (activeRole !== 'FACULTY') {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400">
        <div className="text-center space-y-4">
          <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-semibold text-white">Access Denied</h2>
          <p>This module is restricted to Faculty members only.</p>
        </div>
      </div>
    );
  }

  const faculty = canonicalFaculties[user.regNo];
  if (!faculty) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400">
        <p>Faculty profile not found in canonical data.</p>
      </div>
    );
  }

  const assignedStudentsList = faculty.assignedStudents || [];
  
  const filteredStudents = assignedStudentsList.filter((regNo: string) => {
    const student = canonicalStudents[regNo];
    if (!student) return false;
    const searchLower = search.toLowerCase();
    return regNo.toLowerCase().includes(searchLower) || student.personalInfo.fullName.toLowerCase().includes(searchLower);
  });

  const handleMark = (regNo: string, status: AttendanceRecord['status']) => {
    setAttendance(prev => ({
      ...prev,
      [regNo]: status
    }));
  };

  const markAll = (status: AttendanceRecord['status']) => {
    const newAtt = { ...attendance };
    filteredStudents.forEach((regNo: string) => {
      newAtt[regNo] = status;
    });
    setAttendance(newAtt);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-8 h-8 text-indigo-400" />
            Class Attendance
          </h1>
          <p className="text-zinc-400 mt-1">Manage attendance for your assigned students (Capstone/Class)</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-xl border border-white/10">
            <CalendarClock className="w-5 h-5 text-indigo-400" />
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border-none text-white focus:outline-none focus:ring-0 text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors font-medium">
            <Save className="w-4 h-4" />
            Save Records
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/10 flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Total Students</p>
            <p className="text-2xl font-bold text-white">{assignedStudentsList.length}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/10 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 rounded-lg">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Present</p>
            <p className="text-2xl font-bold text-white">{Object.values(attendance).filter(s => s === 'PRESENT').length}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/10 flex items-center gap-4">
          <div className="p-3 bg-rose-500/20 rounded-lg">
            <XCircle className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Absent</p>
            <p className="text-2xl font-bold text-white">{Object.values(attendance).filter(s => s === 'ABSENT').length}</p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search students..."
              className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 rounded-2xl border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
          <h2 className="font-semibold text-white">Student Roster</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => markAll('PRESENT')}
              className="text-xs px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20"
            >
              Mark All Present
            </button>
            <button 
              onClick={() => markAll('ABSENT')}
              className="text-xs px-3 py-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20"
            >
              Mark All Absent
            </button>
          </div>
        </div>
        <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              No students found.
            </div>
          ) : (
            filteredStudents.map((regNo: string) => {
              const student = canonicalStudents[regNo];
              const status = attendance[regNo];
              return (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={regNo} 
                  className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-500/30">
                      {student.personalInfo.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{student.personalInfo.fullName}</p>
                      <p className="text-sm text-zinc-400">{regNo} • {student.academicInfo.program}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleMark(regNo, 'PRESENT')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        status === 'PRESENT' 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                          : 'bg-zinc-800 text-zinc-400 hover:bg-emerald-500/20 hover:text-emerald-400 border border-transparent hover:border-emerald-500/30'
                      }`}
                    >
                      Present
                    </button>
                    <button 
                      onClick={() => handleMark(regNo, 'ABSENT')}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        status === 'ABSENT' 
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                          : 'bg-zinc-800 text-zinc-400 hover:bg-rose-500/20 hover:text-rose-400 border border-transparent hover:border-rose-500/30'
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
