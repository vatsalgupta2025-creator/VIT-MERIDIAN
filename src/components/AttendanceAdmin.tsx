'use client';

import React, { useState } from 'react';
import { useRBAC } from '@/context/RBACContext';
import { useAuditLog } from '@/context/AuditLogContext';
import { canonicalStudents, classSchedules } from '@/data/canonicalData';
import { BarChart3, CheckCircle, XCircle, Users } from 'lucide-react';

export default function AttendanceAdmin() {
  const { activeRole } = useRBAC();
  const { logAction } = useAuditLog();

  const [selectedClass, setSelectedClass] = useState(classSchedules[0].id);
  const [selectedSlot, setSelectedSlot] = useState('Morning');
  
  const currentClass = classSchedules.find(c => c.id === selectedClass) || classSchedules[0];
  
  // Local state for attendance toggles (true = present, false = absent)
  const [attendanceState, setAttendanceState] = useState<Record<string, boolean>>(
    currentClass.students.reduce((acc, studentId) => ({ ...acc, [studentId]: true }), {})
  );

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newClassId = e.target.value;
    const newClass = classSchedules.find(c => c.id === newClassId) || classSchedules[0];
    setSelectedClass(newClassId);
    // Reset attendance state to all present for the new class
    setAttendanceState(newClass.students.reduce((acc, studentId) => ({ ...acc, [studentId]: true }), {}));
  };

  const handleToggleAttendance = (studentId: string) => {
    setAttendanceState(prev => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const handleMarkAllPresent = () => {
    const newState = { ...attendanceState };
    Object.keys(newState).forEach(key => { newState[key] = true; });
    setAttendanceState(newState);
  };

  const handleMarkAllAbsent = () => {
    const newState = { ...attendanceState };
    Object.keys(newState).forEach(key => { newState[key] = false; });
    setAttendanceState(newState);
  };

  const handleSubmitAttendance = () => {
    const presentCount = Object.values(attendanceState).filter(Boolean).length;
    
    logAction({
      actorId: 'CURRENT_USER',
      actorRole: activeRole,
      action: 'UPDATE',
      resourceType: 'ATTENDANCE',
      resourceId: `${selectedClass}-${selectedSlot}`,
      oldValue: 'N/A',
      newValue: `Submitted: ${presentCount}/${currentClass.students.length} present`
    });

    alert(`✅ Attendance submitted for ${currentClass.courseName} — ${selectedSlot} slot\n\nPresent: ${presentCount} / ${currentClass.students.length}`);
  };

  const presentCount = Object.values(attendanceState).filter(Boolean).length;
  const absentCount = currentClass.students.length - presentCount;
  const attendancePercentage = Math.round((presentCount / currentClass.students.length) * 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
          <BarChart3 className="text-emerald-500" size={28} />
          Class Attendance
        </h1>
        <button 
          onClick={handleSubmitAttendance}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20"
        >
          Submit Register
        </button>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.05]">
          <label className="block text-xs text-white/40 uppercase tracking-widest font-semibold mb-2">Select Class</label>
          <select 
            value={selectedClass}
            onChange={handleClassChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-emerald-500/50"
          >
            {classSchedules.map(c => (
              <option key={c.id} value={c.id} className="bg-neutral-900">{c.id} — {c.courseName}</option>
            ))}
          </select>
        </div>
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.05]">
          <label className="block text-xs text-white/40 uppercase tracking-widest font-semibold mb-2">Select Slot</label>
          <div className="flex gap-3">
            {['Morning', 'Evening'].map(slot => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  selectedSlot === slot 
                    ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/10' 
                    : 'bg-white/5 text-white/50 border-2 border-white/10 hover:border-white/20'
                }`}
              >
                {slot === 'Morning' ? '🌅' : '🌆'} {slot}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Stats */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.05]">
            <h3 className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-2">Total Students</h3>
            <p className="text-4xl font-mono font-bold text-white">
              {currentClass.students.length}
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-black/40 border border-emerald-500/20">
            <h3 className="text-xs text-emerald-500/60 uppercase tracking-widest font-semibold mb-2">Present</h3>
            <p className="text-4xl font-mono font-bold text-emerald-400">
              {presentCount}
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-black/40 border border-red-500/20">
            <h3 className="text-xs text-red-500/60 uppercase tracking-widest font-semibold mb-2">Absent</h3>
            <p className="text-4xl font-mono font-bold text-red-400">
              {absentCount}
            </p>
          </div>
          
          {/* Total Attendance % */}
          <div className="p-5 rounded-2xl bg-black/40 border border-cyan-500/20">
            <h3 className="text-xs text-cyan-500/60 uppercase tracking-widest font-semibold mb-2">Class Attendance</h3>
            <p className="text-4xl font-mono font-bold text-cyan-400">{attendancePercentage}%</p>
            <div className="w-full h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${attendancePercentage >= 75 ? 'bg-emerald-400' : 'bg-red-400'}`} 
                style={{ width: `${attendancePercentage}%` }} 
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleMarkAllPresent}
              className="flex-1 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl font-medium transition-colors text-xs text-emerald-400"
            >
              All Present
            </button>
            <button 
              onClick={handleMarkAllAbsent}
              className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl font-medium transition-colors text-xs text-red-400"
            >
              All Absent
            </button>
          </div>
        </div>

        {/* Right List (The Slider UI) */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-white/[0.05] bg-black/40 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.02] border-b border-white/[0.05]">
                <tr>
                  <th className="p-4 font-semibold text-white/60 w-12">#</th>
                  <th className="p-4 font-semibold text-white/60">Reg No</th>
                  <th className="p-4 font-semibold text-white/60">Student Name</th>
                  <th className="p-4 font-semibold text-white/60 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {currentClass.students.map((studentId, index) => {
                  const student = canonicalStudents[studentId];
                  if (!student) return null;
                  
                  const isPresent = attendanceState[studentId];

                  return (
                    <tr key={studentId} className={`transition-colors ${isPresent ? 'hover:bg-emerald-500/[0.03]' : 'hover:bg-red-500/[0.03] bg-red-500/[0.02]'}`}>
                      <td className="p-4 text-white/30 font-mono text-xs">{index + 1}</td>
                      <td className="p-4 font-mono text-white/70">
                        {student.id}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            isPresent ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {student.personalInfo.fullName.charAt(0)}
                          </div>
                          <span className="font-medium text-white">{student.personalInfo.fullName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-3">
                          <span className={`text-xs font-bold min-w-[60px] text-right ${isPresent ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isPresent ? 'PRESENT' : 'ABSENT'}
                          </span>
                          
                          {/* Slider Toggle */}
                          <button
                            onClick={() => handleToggleAttendance(studentId)}
                            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black ${
                              isPresent 
                                ? 'bg-emerald-500/40 focus:ring-emerald-500' 
                                : 'bg-red-500/40 focus:ring-red-500'
                            }`}
                          >
                            <span
                              className={`inline-block h-5 w-5 transform rounded-full shadow-lg transition-transform duration-300 ${
                                isPresent 
                                  ? 'translate-x-8 bg-emerald-400' 
                                  : 'translate-x-1 bg-red-400'
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
