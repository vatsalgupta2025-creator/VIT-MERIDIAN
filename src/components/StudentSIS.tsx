'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRBAC } from '@/context/RBACContext';
import { useAuditLog } from '@/context/AuditLogContext';
import { canonicalStudents, ledgerEntries, examScores, classSchedules, safetyReports, wellbeingProfiles } from '@/data/canonicalData';
import { UserCheck, ShieldAlert, GraduationCap, MapPin, Database, Wallet, FileText, AlertCircle, CheckCircle, HeartPulse, Shield } from 'lucide-react';
import { CanonicalStudent } from '@/types/canonical';

export default function StudentSIS() {
  const { activeRole, can } = useRBAC();
  const { logAction } = useAuditLog();
  const [students, setStudents] = useState<Record<string, CanonicalStudent>>(canonicalStudents);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('25bce1458');

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const student = students[selectedStudentId];

  // Derived data
  const studentLedger = ledgerEntries.filter(l => l.studentId === selectedStudentId);
  const totalDue = studentLedger.reduce((sum, entry) => entry.status === 'OVERDUE' ? sum + entry.amountDue : sum, 0);
  const studentExams = examScores.filter(e => e.studentId === selectedStudentId);
  
  // Calculate average attendance based on the new classSchedules/attendanceLogs if we had them linked, 
  // but for StudentSIS display let's compute an average from class schedules assuming 90% for now
  const avgAttendance = 88.5; // Mock fixed avg for demo
    
  // Safety & Wellbeing
  const openSafetyReports = safetyReports.filter(r => r.status !== 'CLOSED' && r.reporterId === selectedStudentId);
  const wellbeingProfile = wellbeingProfiles.find(w => w.studentId === selectedStudentId);

  // RBAC Checks
  const canEditInfo = can('write', 'attendance'); // For demo
  const canViewDisciplinary = can('read', 'disciplinary');
  const canViewFees = can('read', 'fees');
  const canViewSafety = can('read', 'safety_report');
  const canViewWellbeing = can('read', 'wellbeing');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const uname = username.trim().toUpperCase();
    if (students[uname] && password === 'student123') {
      setIsAuthenticated(true);
      setSelectedStudentId(uname);
      setError('');
    } else {
      setError('Invalid student ID or password');
    }
  };

  const handleUpdateContact = (newContact: string) => {
    if (!canEditInfo) return;
    
    setStudents(prev => ({
      ...prev,
      [selectedStudentId]: {
        ...prev[selectedStudentId],
        personalInfo: {
          ...prev[selectedStudentId].personalInfo,
          guardianContact: newContact
        }
      }
    }));

    logAction({
      actorId: 'CURRENT_USER',
      actorRole: activeRole,
      action: 'UPDATE',
      resourceType: 'ATTENDANCE', // Mapped loosely
      resourceId: selectedStudentId,
      oldValue: student.personalInfo.guardianContact,
      newValue: newContact
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-sm max-w-md w-full"
        >
          <div className="flex justify-center mb-6">
            <Database className="w-12 h-12 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white text-center mb-2">Student Portal</h2>
          <p className="text-zinc-400 text-center mb-8">Sign in to access your 360° record</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Student ID (Username)</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. 21BCE0001"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            <button 
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition-colors mt-4"
            >
              Sign In
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Database className="w-8 h-8 text-indigo-400" />
            Student 360 View
          </h1>
          <p className="text-zinc-400 mt-1">Unified institutional record (Canonical Source)</p>
        </div>
        
        <div className="flex gap-2 items-center">
          <label className="text-sm text-zinc-400">Select Student:</label>
          <select 
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-zinc-900 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
          >
            {Object.values(students).map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} - {s.personalInfo.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                {student.personalInfo.avatarUrl ? (
                  <img 
                    src={student.personalInfo.avatarUrl} 
                    alt={student.personalInfo.fullName}
                    className="w-16 h-16 rounded-full object-cover border border-indigo-500/30 shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-2xl font-bold border border-indigo-500/30">
                    {student.personalInfo.fullName.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white">{student.personalInfo.fullName}</h2>
                  <div className="flex items-center gap-3 text-sm text-zinc-400 mt-1">
                    <span className="font-mono bg-zinc-950 px-2 py-0.5 rounded border border-white/10">{student.id}</span>
                    <span>{student.enrollment.program} in {student.enrollment.branch}</span>
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                student.enrollment.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {student.enrollment.status}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-zinc-950/50 border border-white/5">
                <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><GraduationCap className="w-3 h-3"/> CGPA</div>
                <div className="text-xl font-medium text-white">{student.academicStanding.cgpa.toFixed(2)}</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/50 border border-white/5">
                <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><FileText className="w-3 h-3"/> Arrears</div>
                <div className={`text-xl font-medium ${student.academicStanding.activeArrears > 0 ? 'text-rose-400' : 'text-white'}`}>
                  {student.academicStanding.activeArrears}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/50 border border-white/5">
                <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><UserCheck className="w-3 h-3"/> Attendance</div>
                <div className={`text-xl font-medium ${avgAttendance !== null && avgAttendance < 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {avgAttendance !== null ? `${avgAttendance.toFixed(1)}%` : 'N/A'}
                </div>
              </div>
              {canViewFees && (
                <div className="p-3 rounded-xl bg-zinc-950/50 border border-white/5">
                  <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Wallet className="w-3 h-3"/> Overdue Fees</div>
                  <div className={`text-xl font-medium ${totalDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    ₹{totalDue.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Hostel Allocation
              </h3>
              {student.hostelInfo ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-zinc-500">Block & Room</span>
                    <span className="text-white font-medium">{student.hostelInfo.block} - {student.hostelInfo.room}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-zinc-500">Room Type</span>
                    <span className="text-white font-medium">{student.hostelInfo.type}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-zinc-500">Mess Type</span>
                    <span className="text-white font-medium">{student.hostelInfo.messType}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-950/50 border border-white/5 text-center text-zinc-500 text-sm">
                  Day Scholar / No Hostel Allocated
                </div>
              )}
              {/* Team / Project Info (If Available) */}
              {student.projectInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 border border-zinc-800 rounded-xl bg-zinc-950/50 p-4"
                >
                  <h4 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
                    <Users size={16} className="text-zinc-400" />
                    Capstone Project Team
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Faculty Guide</p>
                      <p className="text-sm font-medium text-white flex items-center gap-2">
                        <GraduationCap size={14} className="text-emerald-500" />
                        {student.projectInfo.guideName}
                        <span className="text-xs text-zinc-400">({student.projectInfo.guideId})</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Team Members</p>
                      <div className="flex flex-wrap gap-2">
                        {student.projectInfo.teamMembers.map(reg => (
                          <span key={reg} className={`px-2 py-1 text-xs font-medium rounded-md ${reg === student.id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-900 text-zinc-300'}`}>
                            {reg}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            <motion.div 
              className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
                Guardian Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-zinc-500">Name</span>
                  <span className="text-white font-medium">{student.personalInfo.guardianName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-zinc-500">Contact</span>
                  {canEditInfo ? (
                    <input 
                      type="text" 
                      value={student.personalInfo.guardianContact}
                      onChange={(e) => handleUpdateContact(e.target.value)}
                      className="bg-zinc-950 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-500 w-32 text-right"
                    />
                  ) : (
                    <span className="text-white font-medium">{student.personalInfo.guardianContact}</span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Sidebar Gating & Flags Column */}
        <div className="space-y-6">
          <motion.div 
            className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              Eligibility & Gating Rules
            </h3>
            <div className="space-y-3">
              {/* Hall Ticket Gating */}
              <div className={`p-4 rounded-xl border ${totalDue > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {totalDue > 0 ? <AlertCircle className="w-5 h-5 text-rose-400" /> : <CheckCircle className="w-5 h-5 text-emerald-400" />}
                  <span className={`font-medium ${totalDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>Hall Ticket Status</span>
                </div>
                <p className="text-sm text-zinc-300">
                  {totalDue > 0 ? `BLOCKED — Overdue fees (₹${totalDue.toLocaleString()})` : 'CLEARED — No fee dues'}
                </p>
              </div>

              {/* Placement Gating */}
              <div className={`p-4 rounded-xl border ${(avgAttendance !== null && avgAttendance < 75) || student.academicStanding.activeArrears > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {(avgAttendance !== null && avgAttendance < 75) || student.academicStanding.activeArrears > 0 ? <AlertCircle className="w-5 h-5 text-rose-400" /> : <CheckCircle className="w-5 h-5 text-emerald-400" />}
                  <span className={`font-medium ${(avgAttendance !== null && avgAttendance < 75) || student.academicStanding.activeArrears > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>Placement Eligibility</span>
                </div>
                <p className="text-sm text-zinc-300">
                  {student.academicStanding.activeArrears > 0 ? 'BLOCKED — Active arrears' : 
                   (avgAttendance !== null && avgAttendance < 75) ? 'BLOCKED — Attendance < 75%' : 
                   'CLEARED — Eligible for drives'}
                </p>
              </div>

              {/* Disciplinary */}
              {canViewDisciplinary && (
                <div className={`p-4 rounded-xl border ${student.academicStanding.disciplinaryFlags ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {student.academicStanding.disciplinaryFlags ? <AlertCircle className="w-5 h-5 text-amber-400" /> : <CheckCircle className="w-5 h-5 text-emerald-400" />}
                    <span className={`font-medium ${student.academicStanding.disciplinaryFlags ? 'text-amber-400' : 'text-emerald-400'}`}>Disciplinary Standing</span>
                  </div>
                  <p className="text-sm text-zinc-300">
                    {student.academicStanding.disciplinaryFlags ? 'FLAGGED — Active history' : 'CLEARED — Good standing'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Safety & Wellbeing - Strictly gated */}
          {(canViewSafety || canViewWellbeing) && (
            <motion.div 
              className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <HeartPulse className="w-4 h-4" />
                Protected Flags
              </h3>
              
              <div className="space-y-4">
                {canViewSafety && openSafetyReports.length > 0 && (
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <div className="flex items-center gap-2 mb-2 text-indigo-400">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium text-sm">Active Safety Report</span>
                    </div>
                    <p className="text-xs text-indigo-200">
                      Student is associated with an active safety case. Proceed with caution.
                    </p>
                  </div>
                )}
                
                {canViewWellbeing && wellbeingProfile && wellbeingProfile.optedInSignals.includes('ATTENDANCE') && avgAttendance !== null && avgAttendance < 75 && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-2 text-amber-400">
                      <HeartPulse className="w-4 h-4" />
                      <span className="font-medium text-sm">Wellbeing Signal</span>
                    </div>
                    <p className="text-xs text-amber-200">
                      Sudden attendance drop flagged (opt-in enabled). Consider check-in.
                    </p>
                  </div>
                )}

                {(!canViewSafety || openSafetyReports.length === 0) && (!canViewWellbeing || !wellbeingProfile) && (
                  <div className="text-sm text-zinc-500 text-center py-2">
                    No active protected flags.
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
