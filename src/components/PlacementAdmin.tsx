'use client';

import React, { useState } from 'react';
import { useRBAC } from '@/context/RBACContext';
import { canonicalStudents, ledgerEntries } from '@/data/canonicalData';
import { Rocket, Briefcase, Filter, XCircle, CheckCircle } from 'lucide-react';
import { PlacementDrive } from '@/types/canonical';

const mockDrives: PlacementDrive[] = [
  {
    id: 'DRV-001',
    companyName: 'Google',
    role: 'Software Engineer',
    ctc: '32 LPA',
    eligibility: {
      minCgpa: 8.5,
      maxArrears: 0,
      branches: ['Computer Science'],
      noDisciplinaryFlags: true
    },
    deadline: '2024-08-30'
  },
  {
    id: 'DRV-002',
    companyName: 'Amazon',
    role: 'SDE-1',
    ctc: '28 LPA',
    eligibility: {
      minCgpa: 8.0,
      maxArrears: 1,
      branches: ['Computer Science', 'Electronics'],
      noDisciplinaryFlags: true
    },
    deadline: '2024-09-15'
  }
];

export default function PlacementAdmin() {
  const { can } = useRBAC();
  const [drives, setDrives] = useState<PlacementDrive[]>(mockDrives);
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(mockDrives[0]);

  const canManagePlacements = can('write', 'placement');

  // Compute eligible students for the selected drive
  const eligibleStudents = selectedDrive ? Object.values(canonicalStudents).filter(student => {
    // Basic Eligibility
    if (student.academicStanding.cgpa < selectedDrive.eligibility.minCgpa) return false;
    if (student.academicStanding.activeArrears > selectedDrive.eligibility.maxArrears) return false;
    if (selectedDrive.eligibility.noDisciplinaryFlags && student.academicStanding.disciplinaryFlags) return false;
    if (!selectedDrive.eligibility.branches.includes(student.enrollment.branch)) return false;

    return true;
  }) : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
          <Rocket className="text-pink-500" size={28} />
          Placement Cell
        </h1>
        {canManagePlacements && (
          <button className="px-4 py-2 bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 rounded-lg text-sm font-medium transition-colors">
            + New Drive
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Drive Selection Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Briefcase size={18} className="text-white/60" />
            Active Drives
          </h2>
          <div className="space-y-2">
            {drives.map(drive => (
              <button
                key={drive.id}
                onClick={() => setSelectedDrive(drive)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedDrive?.id === drive.id ? 'bg-pink-500/10 border-pink-500/30' : 'bg-black/40 border-white/[0.05] hover:bg-white/[0.05]'}`}
              >
                <h3 className={`font-semibold ${selectedDrive?.id === drive.id ? 'text-pink-400' : 'text-white'}`}>{drive.companyName}</h3>
                <p className="text-sm text-white/50">{drive.role} • {drive.ctc}</p>
                <div className="mt-2 text-xs text-white/40 flex items-center gap-1">
                  <Filter size={12} />
                  Min CGPA: {drive.eligibility.minCgpa}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Drive Details & Eligible Cohort */}
        <div className="lg:col-span-2">
          {selectedDrive ? (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-black/40 border border-white/[0.05]">
                <h2 className="text-2xl font-bold mb-2">{selectedDrive.companyName}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-white/60 mb-6">
                  <span>Role: {selectedDrive.role}</span>
                  <span>CTC: {selectedDrive.ctc}</span>
                  <span>Deadline: {new Date(selectedDrive.deadline).toLocaleDateString()}</span>
                </div>

                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-500" />
                    Auto-Computed Eligibility Cohort
                  </h3>
                  <p className="text-sm text-white/50 mb-4">
                    Students listed below meet the CGPA, arrears, and disciplinary criteria derived directly from the canonical academic record.
                  </p>

                  <div className="overflow-hidden rounded-lg border border-white/[0.05]">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/[0.05]">
                        <tr>
                          <th className="p-3 font-semibold text-white/60">Student ID</th>
                          <th className="p-3 font-semibold text-white/60">Name</th>
                          <th className="p-3 font-semibold text-white/60">Branch</th>
                          <th className="p-3 font-semibold text-white/60">CGPA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05]">
                        {eligibleStudents.length > 0 ? eligibleStudents.map(student => (
                          <tr key={student.id} className="hover:bg-white/[0.02]">
                            <td className="p-3 font-mono">{student.id}</td>
                            <td className="p-3 font-medium">{student.personalInfo.fullName}</td>
                            <td className="p-3">{student.enrollment.branch}</td>
                            <td className="p-3 font-mono text-emerald-400">{student.academicStanding.cgpa.toFixed(2)}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-white/40">
                              <XCircle className="mx-auto mb-2" size={24} />
                              No eligible students found in the canonical database.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-white/40">
              Select a drive to view details and eligibility.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
