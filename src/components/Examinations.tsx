'use client';

import React, { useState } from 'react';
import { useRBAC } from '@/context/RBACContext';
import { useAuditLog } from '@/context/AuditLogContext';
import { examScores, canonicalStudents, ledgerEntries, classSchedules } from '@/data/canonicalData';
import { FileText, AlertTriangle, ShieldCheck, CheckCircle, TrendingUp } from 'lucide-react';
import { ExamRecord } from '@/types/canonical';

export default function Examinations() {
  const { activeRole, can } = useRBAC();
  const { logAction } = useAuditLog();
  const [records, setRecords] = useState<ExamRecord[]>(examScores);
  
  const canEnterMarks = can('write', 'marks');
  
  // Faculty State
  const [selectedClassId, setSelectedClassId] = useState(classSchedules[0]?.id);
  const currentClass = classSchedules.find(c => c.id === selectedClassId) || classSchedules[0];

  // Student State
  // Defaulting to the primary integration student for the student view
  const myStudentId = '25bce1458';
  
  // Check if student is gated from exams (fees unpaid)
  const studentLedger = ledgerEntries.filter(l => l.studentId === myStudentId);
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

  // -----------------------------------------------------
  // FACULTY VIEW
  // -----------------------------------------------------
  if (canEnterMarks) {
    // For the selected class, get all exam records
    const classRecords = records.filter(r => r.courseId === currentClass.id);
    
    // Group by student for the table
    const studentsData = currentClass.students.map(studentId => {
      const student = canonicalStudents[studentId];
      const cat1 = classRecords.find(r => r.studentId === studentId && r.examType === 'CAT1');
      const cat2 = classRecords.find(r => r.studentId === studentId && r.examType === 'CAT2');
      const fat = classRecords.find(r => r.studentId === studentId && r.examType === 'FAT');
      
      const total = (cat1?.marksObtained || 0) + (cat2?.marksObtained || 0) + (fat?.marksObtained || 0);
      const maxTotal = (cat1?.maxMarks || 50) + (cat2?.maxMarks || 50) + (fat?.maxMarks || 100);
      const percentage = Math.round((total / maxTotal) * 100);

      return { student, cat1, cat2, fat, percentage };
    });

    const classAverage = Math.round(
      studentsData.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / (studentsData.length || 1)
    );

    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <TrendingUp className="text-blue-500" size={28} />
            Class Exam Results
          </h1>
          <select 
            value={selectedClassId} 
            onChange={e => setSelectedClassId(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-blue-500/50"
          >
            {classSchedules.map(c => (
              <option key={c.id} value={c.id} className="bg-neutral-900">{c.id} - {c.courseName}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.05]">
            <h3 className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-2">Class Average</h3>
            <p className="text-4xl font-mono font-bold text-blue-400">{classAverage}%</p>
          </div>
          <div className="p-5 rounded-2xl bg-black/40 border border-red-500/20">
            <h3 className="text-xs text-red-500/60 uppercase tracking-widest font-semibold mb-2">Below Average (&lt;50%)</h3>
            <p className="text-4xl font-mono font-bold text-red-400">
              {studentsData.filter(s => s.percentage < 50).length}
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-black/40 border border-emerald-500/20">
            <h3 className="text-xs text-emerald-500/60 uppercase tracking-widest font-semibold mb-2">Top Performers (&gt;90%)</h3>
            <p className="text-4xl font-mono font-bold text-emerald-400">
              {studentsData.filter(s => s.percentage >= 90).length}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.05] bg-black/40 overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-white/[0.02] border-b border-white/[0.05]">
              <tr>
                <th className="p-4 font-semibold text-white/60">Student</th>
                <th className="p-4 font-semibold text-white/60">CAT 1 (50)</th>
                <th className="p-4 font-semibold text-white/60">CAT 2 (50)</th>
                <th className="p-4 font-semibold text-white/60">FAT (100)</th>
                <th className="p-4 font-semibold text-white/60">Overall</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {studentsData.map(({ student, cat1, cat2, fat, percentage }) => {
                if (!student) return null;
                const isFailing = percentage < 50;

                return (
                  <tr key={student.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{student.personalInfo.fullName}</span>
                        <span className="text-xs text-white/40 font-mono">{student.id}</span>
                      </div>
                    </td>
                    
                    {/* Render Edit Inputs or Scores */}
                    {[cat1, cat2, fat].map((exam, idx) => (
                      <td key={idx} className="p-4 font-mono">
                        {exam ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              defaultValue={exam.marksObtained || ''}
                              onBlur={(e) => handleUpdateMarks(exam.id, e.target.value)}
                              className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-center font-bold outline-none focus:border-blue-500"
                            />
                          </div>
                        ) : (
                          <span className="text-white/20">--</span>
                        )}
                      </td>
                    ))}

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${isFailing ? 'text-red-400' : 'text-emerald-400'}`}>
                          {percentage}%
                        </span>
                        {isFailing && <AlertTriangle size={14} className="text-red-400" />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------
  // STUDENT VIEW
  // -----------------------------------------------------
  const myRecords = records.filter(r => r.studentId === myStudentId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
          <FileText className="text-blue-500" size={28} />
          My Examinations & Results
        </h1>
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

      {!isGated && (
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
        {myRecords.map((record) => (
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
                <p className="font-mono font-bold text-lg">
                  {record.marksObtained !== null ? record.marksObtained : '--'} <span className="text-white/40 text-sm">/ {record.maxMarks}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
        {myRecords.length === 0 && (
          <div className="p-8 text-center text-white/40 border border-white/5 rounded-2xl bg-white/[0.02]">
            No exam records found for your account.
          </div>
        )}
      </div>
    </div>
  );
}
