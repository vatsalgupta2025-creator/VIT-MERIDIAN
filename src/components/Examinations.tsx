'use client';

import React, { useState } from 'react';
import { useRBAC } from '@/context/RBACContext';
import { examScores, canonicalStudents, classSchedules } from '@/data/canonicalData';
import { FileText, AlertTriangle, TrendingUp, Award, Users } from 'lucide-react';
import { ExamRecord } from '@/types/canonical';

export default function Examinations() {
  const { activeRole } = useRBAC();
  const [records] = useState<ExamRecord[]>(examScores);
  
  const [selectedClassId, setSelectedClassId] = useState(classSchedules[0]?.id);
  const currentClass = classSchedules.find(c => c.id === selectedClassId) || classSchedules[0];

  // For the selected class, get all exam records
  const classRecords = records.filter(r => r.courseId === currentClass.id);
  
  // Group by student for the table
  const studentsData = currentClass.students.map(studentId => {
    const student = canonicalStudents[studentId];
    const cat1 = classRecords.find(r => r.studentId === studentId && r.examType === 'CAT1');
    const cat2 = classRecords.find(r => r.studentId === studentId && r.examType === 'CAT2');
    const fat = classRecords.find(r => r.studentId === studentId && r.examType === 'FAT');
    
    const totalMarks = (cat1?.marksObtained || 0) + (cat2?.marksObtained || 0) + (fat?.marksObtained || 0);
    const maxTotal = (cat1?.maxMarks || 50) + (cat2?.maxMarks || 50) + (fat?.maxMarks || 100);
    const percentage = Math.round((totalMarks / maxTotal) * 100);

    return { student, cat1, cat2, fat, totalMarks, maxTotal, percentage };
  }).filter(s => s.student);

  // Analytics
  const classAverage = Math.round(
    studentsData.reduce((acc, curr) => acc + curr.percentage, 0) / (studentsData.length || 1)
  );
  const avgCAT1 = Math.round(
    studentsData.reduce((acc, curr) => acc + (curr.cat1?.marksObtained || 0), 0) / (studentsData.length || 1)
  );
  const avgCAT2 = Math.round(
    studentsData.reduce((acc, curr) => acc + (curr.cat2?.marksObtained || 0), 0) / (studentsData.length || 1)
  );
  const avgFAT = Math.round(
    studentsData.reduce((acc, curr) => acc + (curr.fat?.marksObtained || 0), 0) / (studentsData.length || 1)
  );
  const topStudent = studentsData.reduce((best, curr) => curr.percentage > (best?.percentage || 0) ? curr : best, studentsData[0]);
  const failingCount = studentsData.filter(s => s.percentage < 50).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
          <TrendingUp className="text-blue-500" size={28} />
          Examination Results
        </h1>
        <select 
          value={selectedClassId} 
          onChange={e => setSelectedClassId(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500/50"
        >
          {classSchedules.map(c => (
            <option key={c.id} value={c.id} className="bg-neutral-900">{c.id} — {c.courseName}</option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-black/40 border border-blue-500/20">
          <h3 className="text-[10px] text-blue-400/60 uppercase tracking-widest font-semibold mb-1">Class Average</h3>
          <p className="text-3xl font-mono font-bold text-blue-400">{classAverage}%</p>
        </div>
        <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/20">
          <h3 className="text-[10px] text-cyan-400/60 uppercase tracking-widest font-semibold mb-1">Avg CAT 1</h3>
          <p className="text-3xl font-mono font-bold text-cyan-400">{avgCAT1}<span className="text-sm text-white/30">/50</span></p>
        </div>
        <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/20">
          <h3 className="text-[10px] text-purple-400/60 uppercase tracking-widest font-semibold mb-1">Avg CAT 2</h3>
          <p className="text-3xl font-mono font-bold text-purple-400">{avgCAT2}<span className="text-sm text-white/30">/50</span></p>
        </div>
        <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/20">
          <h3 className="text-[10px] text-amber-400/60 uppercase tracking-widest font-semibold mb-1">Avg FAT</h3>
          <p className="text-3xl font-mono font-bold text-amber-400">{avgFAT}<span className="text-sm text-white/30">/100</span></p>
        </div>
        <div className="p-4 rounded-2xl bg-black/40 border border-red-500/20">
          <h3 className="text-[10px] text-red-400/60 uppercase tracking-widest font-semibold mb-1">Failing (&lt;50%)</h3>
          <p className="text-3xl font-mono font-bold text-red-400">{failingCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/20">
          <h3 className="text-[10px] text-emerald-400/60 uppercase tracking-widest font-semibold mb-1">Total Students</h3>
          <p className="text-3xl font-mono font-bold text-emerald-400">{studentsData.length}</p>
        </div>
      </div>

      {/* Topper Card */}
      {topStudent && topStudent.student && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/20 flex items-center gap-4">
          <Award className="text-amber-400 flex-shrink-0" size={28} />
          <div>
            <p className="text-xs text-amber-400/60 uppercase tracking-widest font-semibold">Class Topper</p>
            <p className="text-lg font-bold text-amber-300">{topStudent.student.personalInfo.fullName} <span className="text-sm font-mono text-white/40">({topStudent.student.id})</span> — {topStudent.percentage}%</p>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="rounded-2xl border border-white/[0.05] bg-black/40 overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[900px]">
          <thead className="bg-white/[0.02] border-b border-white/[0.05]">
            <tr>
              <th className="p-4 font-semibold text-white/60 w-12">#</th>
              <th className="p-4 font-semibold text-white/60">Reg No</th>
              <th className="p-4 font-semibold text-white/60">Student Name</th>
              <th className="p-4 font-semibold text-cyan-400/80 text-center">CAT 1 (50)</th>
              <th className="p-4 font-semibold text-purple-400/80 text-center">CAT 2 (50)</th>
              <th className="p-4 font-semibold text-amber-400/80 text-center">FAT (100)</th>
              <th className="p-4 font-semibold text-blue-400/80 text-center">Total</th>
              <th className="p-4 font-semibold text-white/60 text-center">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {studentsData.map(({ student, cat1, cat2, fat, totalMarks, maxTotal, percentage }, index) => {
              if (!student) return null;
              const isFailing = percentage < 50;
              const isTopper = topStudent && student.id === topStudent.student?.id;

              return (
                <tr key={student.id} className={`transition-colors ${
                  isTopper ? 'bg-amber-500/[0.05]' : isFailing ? 'bg-red-500/[0.03]' : 'hover:bg-white/[0.02]'
                }`}>
                  <td className="p-4 text-white/30 font-mono text-xs">{index + 1}</td>
                  <td className="p-4 font-mono text-white/70">{student.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {isTopper && <Award size={14} className="text-amber-400" />}
                      <span className="font-medium text-white">{student.personalInfo.fullName}</span>
                    </div>
                  </td>
                  
                  <td className="p-4 text-center font-mono">
                    <span className={`px-2 py-1 rounded-lg ${
                      (cat1?.marksObtained || 0) < 25 ? 'bg-red-500/10 text-red-400' : 'text-cyan-300'
                    }`}>
                      {cat1?.marksObtained ?? '—'}
                    </span>
                  </td>
                  <td className="p-4 text-center font-mono">
                    <span className={`px-2 py-1 rounded-lg ${
                      (cat2?.marksObtained || 0) < 25 ? 'bg-red-500/10 text-red-400' : 'text-purple-300'
                    }`}>
                      {cat2?.marksObtained ?? '—'}
                    </span>
                  </td>
                  <td className="p-4 text-center font-mono">
                    <span className={`px-2 py-1 rounded-lg ${
                      (fat?.marksObtained || 0) < 40 ? 'bg-red-500/10 text-red-400' : 'text-amber-300'
                    }`}>
                      {fat?.marksObtained ?? '—'}
                    </span>
                  </td>
                  <td className="p-4 text-center font-mono font-bold text-white/80">
                    {totalMarks}<span className="text-white/30 font-normal">/{maxTotal}</span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`font-mono font-bold ${
                        isFailing ? 'text-red-400' : percentage >= 90 ? 'text-emerald-400' : 'text-blue-300'
                      }`}>
                        {percentage}%
                      </span>
                      {isFailing && <AlertTriangle size={12} className="text-red-400" />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Average Row */}
          <tfoot className="bg-white/[0.03] border-t-2 border-white/10">
            <tr>
              <td className="p-4" colSpan={3}>
                <span className="font-bold text-white/60 uppercase text-xs tracking-wider">Class Average</span>
              </td>
              <td className="p-4 text-center font-mono font-bold text-cyan-400">{avgCAT1}</td>
              <td className="p-4 text-center font-mono font-bold text-purple-400">{avgCAT2}</td>
              <td className="p-4 text-center font-mono font-bold text-amber-400">{avgFAT}</td>
              <td className="p-4 text-center font-mono font-bold text-white">{avgCAT1 + avgCAT2 + avgFAT}</td>
              <td className="p-4 text-center font-mono font-bold text-blue-400">{classAverage}%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
