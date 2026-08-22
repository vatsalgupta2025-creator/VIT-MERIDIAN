'use client';

import React, { useState } from 'react';
import { useRBAC } from '@/context/RBACContext';
import { useAuditLog } from '@/context/AuditLogContext';
import { examRecords, canonicalStudents, ledgerEntries } from '@/data/canonicalData';
import { FileText, AlertTriangle, ShieldCheck, CheckCircle } from 'lucide-react';
import { ExamRecord } from '@/types/canonical';

export default function Examinations() {
  const { activeRole, can } = useRBAC();
  const { logAction } = useAuditLog();
  const [records, setRecords] = useState<ExamRecord[]>(examRecords);
  
  // Faculty views all records for their courses, Students view their own, Admins view all
  const canEnterMarks = can('write', 'marks');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('21BCE0001');

  // Check if student is gated from exams (fees unpaid)
  const studentLedger = ledgerEntries.filter(l => l.studentId === selectedStudentId);
  const totalDue = studentLedger.reduce((acc, curr) => acc + (curr.amountDue - curr.amountPaid), 0);
  const isGated = totalDue > 0;

  const handleUpdateMarks = (recordId: string, newMarks: string) => {
    if (!canEnterMarks) return;
    const num = parseInt(newMarks);
    if (isNaN(num)) return;

    setRecords(prev => prev.map(r => {
      if (r.id === recordId) {
        logAction({
          actorId: 'CURRENT_USER',
          actorRole: activeRole,
          action: 'UPDATE',
          resourceType: 'MARKS',
          resourceId: r.id,
          oldValue: r.marksObtained?.toString() || 'PENDING',
          newValue: num.toString()
        });
        return { ...r, marksObtained: num, status: 'ENTERED' };
      }
      return r;
    }));
  };

  const studentRecords = canEnterMarks ? records : records.filter(r => r.studentId === selectedStudentId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
          <FileText className="text-blue-500" size={28} />
          Examinations & Results
        </h1>
        {canEnterMarks && (
          <select 
            value={selectedStudentId} 
            onChange={e => setSelectedStudentId(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white/90 outline-none focus:border-blue-500/50"
          >
            {Object.values(canonicalStudents).map(s => (
              <option key={s.id} value={s.id}>{s.id} - {s.personalInfo.fullName}</option>
            ))}
          </select>
        )}
      </div>

      {isGated && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-4">
          <AlertTriangle className="text-red-400 mt-1 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-red-400">Exam Hall Ticket Blocked</h3>
            <p className="text-sm text-red-400/80 mt-1">
              Outstanding fee dues detected. Hall tickets cannot be generated until financial clearance is obtained.
            </p>
          </div>
        </div>
      )}

      {!isGated && activeRole === 'STUDENT' && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-4">
          <ShieldCheck className="text-emerald-400 mt-1 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-emerald-400">Hall Ticket Generated</h3>
            <p className="text-sm text-emerald-400/80 mt-1">
              Financial and attendance clearance verified. You can download your hall ticket.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 mt-6">
        {studentRecords.map((record) => (
          <div key={record.id} className="p-5 rounded-2xl bg-black/40 border border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg">{record.courseId}</h3>
              <p className="text-sm text-white/50">{record.examType} - Semester {record.semester}</p>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Status</p>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                  record.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  record.status === 'ENTERED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}>
                  {record.status === 'PUBLISHED' && <CheckCircle size={12} />}
                  {record.status}
                </span>
              </div>
              
              <div className="text-right min-w-[120px]">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Marks</p>
                {canEnterMarks && record.status !== 'PUBLISHED' ? (
                  <div className="flex items-center justify-end gap-2">
                    <input 
                      type="number" 
                      defaultValue={record.marksObtained || ''}
                      onBlur={(e) => handleUpdateMarks(record.id, e.target.value)}
                      className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-center font-mono font-bold outline-none focus:border-blue-500"
                    />
                    <span className="text-white/40 font-mono">/ {record.maxMarks}</span>
                  </div>
                ) : (
                  <p className="font-mono font-bold text-lg">
                    {record.marksObtained !== null ? record.marksObtained : '--'} <span className="text-white/40 text-sm">/ {record.maxMarks}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
