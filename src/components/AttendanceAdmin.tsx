'use client';

import React, { useState } from 'react';
import { useRBAC } from '@/context/RBACContext';
import { useAuditLog } from '@/context/AuditLogContext';
import { canonicalStudents, classSchedules } from '@/data/canonicalData';
import { BarChart3, Users, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export default function AttendanceAdmin() {
  const { activeRole, can } = useRBAC();
  const { logAction } = useAuditLog();

  const [selectedClass, setSelectedClass] = useState(classSchedules[0].id);
  const [selectedSlot, setSelectedSlot] = useState(classSchedules[0].slots[0]);
  
  const currentClass = classSchedules.find(c => c.id === selectedClass) || classSchedules[0];
  
  // Local state for attendance toggles (true = present, false = absent)
  const [attendanceState, setAttendanceState] = useState<Record<string, boolean>>(
    currentClass.students.reduce((acc, studentId) => ({ ...acc, [studentId]: true }), {})
  );

  const canMarkAttendance = can('write', 'attendance');

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newClassId = e.target.value;
    const newClass = classSchedules.find(c => c.id === newClassId) || classSchedules[0];
    setSelectedClass(newClassId);
    setSelectedSlot(newClass.slots[0]);
    // Reset attendance state to all present for the new class
    setAttendanceState(newClass.students.reduce((acc, studentId) => ({ ...acc, [studentId]: true }), {}));
  };

  const handleToggleAttendance = (studentId: string) => {
    if (!canMarkAttendance) return;
    setAttendanceState(prev => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const handleMarkAllPresent = () => {
    if (!canMarkAttendance) return;
    const newState = { ...attendanceState };
    Object.keys(newState).forEach(key => { newState[key] = true; });
    setAttendanceState(newState);
  };

  const handleSubmitAttendance = () => {
    if (!canMarkAttendance) return;
    
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

    alert(`Attendance submitted for ${currentClass.id} - ${selectedSlot}`);
  };

  const presentCount = Object.values(attendanceState).filter(Boolean).length;
  const absentCount = currentClass.students.length - presentCount;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
          <BarChart3 className="text-emerald-500" size={28} />
          Class Attendance
        </h1>
        {canMarkAttendance && (
          <button 
            onClick={handleSubmitAttendance}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors"
          >
            Submit Register
          </button>
        )}
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.05]">
          <label className="block text-xs text-white/40 uppercase tracking-widest font-semibold mb-2">Select Class</label>
          <select 
            value={selectedClass}
            onChange={handleClassChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500/50"
          >
            {classSchedules.map(c => (
              <option key={c.id} value={c.id} className="bg-neutral-900">{c.id} - {c.courseName}</option>
            ))}
          </select>
        </div>
        <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.05]">
          <label className="block text-xs text-white/40 uppercase tracking-widest font-semibold mb-2">Select Slot</label>
          <select 
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-emerald-500/50"
          >
            {currentClass.slots.map(slot => (
              <option key={slot} value={slot} className="bg-neutral-900">{slot}</option>
            ))}
          </select>
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
            <h3 className="text-xs text-emerald-500/60 uppercase tracking-widest font-semibold mb-2">Present Today</h3>
            <p className="text-4xl font-mono font-bold text-emerald-400">
              {presentCount}
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-black/40 border border-red-500/20">
            <h3 className="text-xs text-red-500/60 uppercase tracking-widest font-semibold mb-2">Absent Today</h3>
            <p className="text-4xl font-mono font-bold text-red-400">
              {absentCount}
            </p>
          </div>
          
          {canMarkAttendance && (
            <button 
              onClick={handleMarkAllPresent}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium transition-colors text-sm"
            >
              Mark All Present
            </button>
          )}
        </div>

        {/* Right List (The Slider UI) */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-white/[0.05] bg-black/40 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.02] border-b border-white/[0.05]">
                <tr>
                  <th className="p-4 font-semibold text-white/60">Reg No</th>
                  <th className="p-4 font-semibold text-white/60">Student Name</th>
                  {canMarkAttendance && (
                    <th className="p-4 font-semibold text-white/60 text-right">Attendance Status</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {currentClass.students.map((studentId) => {
                  const student = canonicalStudents[studentId];
                  if (!student) return null;
                  
                  const isPresent = attendanceState[studentId];

                  return (
                    <tr key={studentId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-mono text-white/70">
                        {student.id}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                            {student.personalInfo.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{student.personalInfo.fullName}</p>
                          </div>
                        </div>
                      </td>
                      {canMarkAttendance && (
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-3">
                            <span className={`text-xs font-bold ${isPresent ? 'text-emerald-400' : 'text-red-400'}`}>
                              {isPresent ? 'PRESENT' : 'ABSENT'}
                            </span>
                            
                            {/* Slider UI */}
                            <button
                              onClick={() => handleToggleAttendance(studentId)}
                              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${
                                isPresent ? 'bg-emerald-500/40' : 'bg-red-500/40'
                              }`}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                  isPresent ? 'translate-x-8' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                      )}
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
