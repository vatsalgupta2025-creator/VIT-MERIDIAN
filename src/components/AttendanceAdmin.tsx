'use client';

import React, { useState } from 'react';
import { useRBAC } from '@/context/RBACContext';
import { useAuditLog } from '@/context/AuditLogContext';
import { canonicalStudents } from '@/data/canonicalData';
import { BarChart3, Users, AlertTriangle } from 'lucide-react';
import { AttendanceRecord } from '@/types/canonical';

const initialRecords: AttendanceRecord[] = [
  {
    id: 'ATT-1',
    studentId: '21BCE0001',
    courseId: 'CSE2005',
    facultyId: 'FAC001',
    totalClasses: 40,
    attendedClasses: 36,
    percentage: 90,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'ATT-2',
    studentId: '21BCE0002',
    courseId: 'CSE2005',
    facultyId: 'FAC001',
    totalClasses: 40,
    attendedClasses: 28,
    percentage: 70, // Warning threshold
    lastUpdated: new Date().toISOString()
  }
];

export default function AttendanceAdmin() {
  const { activeRole, can } = useRBAC();
  const { logAction } = useAuditLog();
  const [records, setRecords] = useState<AttendanceRecord[]>(initialRecords);

  const canMarkAttendance = can('write', 'attendance');

  const handleMarkPresent = (recordId: string) => {
    if (!canMarkAttendance) return;
    setRecords(prev => prev.map(r => {
      if (r.id === recordId) {
        const newAttended = r.attendedClasses + 1;
        const newTotal = r.totalClasses + 1;
        const newPercentage = Math.round((newAttended / newTotal) * 100);

        logAction({
          actorId: 'CURRENT_USER',
          actorRole: activeRole,
          action: 'UPDATE',
          resourceType: 'ATTENDANCE',
          resourceId: r.id,
          oldValue: `${r.percentage}%`,
          newValue: `${newPercentage}%`
        });

        return { ...r, attendedClasses: newAttended, totalClasses: newTotal, percentage: newPercentage };
      }
      return r;
    }));
  };

  const handleMarkAbsent = (recordId: string) => {
    if (!canMarkAttendance) return;
    setRecords(prev => prev.map(r => {
      if (r.id === recordId) {
        const newTotal = r.totalClasses + 1;
        const newPercentage = Math.round((r.attendedClasses / newTotal) * 100);

        logAction({
          actorId: 'CURRENT_USER',
          actorRole: activeRole,
          action: 'UPDATE',
          resourceType: 'ATTENDANCE',
          resourceId: r.id,
          oldValue: `${r.percentage}%`,
          newValue: `${newPercentage}%`
        });

        return { ...r, totalClasses: newTotal, percentage: newPercentage };
      }
      return r;
    }));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
          <BarChart3 className="text-emerald-500" size={28} />
          Attendance Rollup (CSE2005)
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Stats */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.05]">
            <h3 className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-2">Class Average</h3>
            <p className="text-4xl font-mono font-bold text-emerald-400">
              {Math.round(records.reduce((acc, r) => acc + r.percentage, 0) / records.length)}%
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.05]">
            <h3 className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-2">Defaulters (&lt;75%)</h3>
            <p className="text-4xl font-mono font-bold text-red-400">
              {records.filter(r => r.percentage < 75).length}
            </p>
          </div>
        </div>

        {/* Right List */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-white/[0.05] bg-black/40 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.02] border-b border-white/[0.05]">
                <tr>
                  <th className="p-4 font-semibold text-white/60">Student</th>
                  <th className="p-4 font-semibold text-white/60">Classes</th>
                  <th className="p-4 font-semibold text-white/60">Percentage</th>
                  {canMarkAttendance && (
                    <th className="p-4 font-semibold text-white/60 text-right">Today's Entry</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {records.map((record) => {
                  const student = canonicalStudents[record.studentId];
                  const isDefaulter = record.percentage < 75;

                  return (
                    <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                            {student.personalInfo.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{student.personalInfo.fullName}</p>
                            <p className="text-xs text-white/40 font-mono">{record.studentId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono">
                        {record.attendedClasses} / {record.totalClasses}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold ${isDefaulter ? 'text-red-400' : 'text-emerald-400'}`}>
                            {record.percentage}%
                          </span>
                          {isDefaulter && <AlertTriangle size={14} className="text-red-400" />}
                        </div>
                        {/* Mini progress bar */}
                        <div className="w-24 h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                          <div 
                            className={`h-full ${isDefaulter ? 'bg-red-400' : 'bg-emerald-400'}`} 
                            style={{ width: `${record.percentage}%` }} 
                          />
                        </div>
                      </td>
                      {canMarkAttendance && (
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleMarkPresent(record.id)}
                              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-medium transition-colors"
                            >
                              Present
                            </button>
                            <button 
                              onClick={() => handleMarkAbsent(record.id)}
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium transition-colors"
                            >
                              Absent
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
