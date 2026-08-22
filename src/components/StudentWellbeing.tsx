'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRBAC } from '@/context/RBACContext';
import { wellbeingProfiles, canonicalStudents, attendanceRecords } from '@/data/canonicalData';
import { Heart, Lock, Eye, EyeOff, BookOpen, MessageSquare, ShieldCheck, TrendingDown, CheckCircle } from 'lucide-react';

export default function StudentWellbeing() {
  const { activeRole, can } = useRBAC();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [showOptInPanel, setShowOptInPanel] = useState(false);

  // Student self-view vs. Counselor view
  const isCounselor = activeRole === 'COUNSELOR' || activeRole === 'INSTITUTION_ADMIN';
  const isStudent = activeRole === 'STUDENT';
  const canView = can('read', 'wellbeing');

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-zinc-500">
        <Lock className="w-12 h-12 mb-4 opacity-50" />
        <p>Access restricted to counselors and students.</p>
      </div>
    );
  }

  // Find the student who opted-in
  const profile = wellbeingProfiles[0]; // Demo: first profile
  const student = profile ? canonicalStudents[profile.studentId] : null;
  const attendance = attendanceRecords.find(r => r.studentId === profile?.studentId);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <Heart className="w-8 h-8 text-pink-400" />
          Student Wellbeing
        </h1>
        <p className="text-zinc-400 mt-1">
          {isCounselor ? 'Confidential counselor dashboard' : 'Your wellbeing resources and self-referral'}
        </p>
      </div>

      {/* Student Self-View */}
      {isStudent && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Opt-In Controls */}
          <motion.div
            className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-400" />
              Signal Sharing Preferences
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              You control what information, if any, is visible to your assigned counselor. 
              Nothing is shared by default.
            </p>

            <div className="space-y-4">
              {['ATTENDANCE', 'ACADEMIC_PERFORMANCE', 'FEE_STATUS'].map(signal => {
                const isOptedIn = profile?.optedInSignals?.includes(signal);
                return (
                  <div key={signal} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-white/5">
                    <div className="flex items-center gap-3">
                      {isOptedIn ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-zinc-500" />}
                      <span className="text-sm text-zinc-300">
                        {signal.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={isOptedIn} />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Your counselor can only see signals you have explicitly opted in to share. You can revoke access at any time.</span>
            </div>
          </motion.div>

          {/* Self-Referral */}
          <motion.div
            className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-pink-400" />
              Self-Referral to Counseling
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              Request a confidential session with a campus counselor. This is not visible to any academic or administrative staff.
            </p>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">What would you like to talk about?</label>
                <select className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500">
                  <option>Academic Stress / Burnout</option>
                  <option>Anxiety or Depression</option>
                  <option>Relationship or Family Issues</option>
                  <option>Career Uncertainty</option>
                  <option>Something Else</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Additional Notes (optional)</label>
                <textarea
                  placeholder="Anything you'd like the counselor to know before the session..."
                  rows={3}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pink-500 resize-none"
                />
              </div>

              <button
                type="button"
                className="w-full px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-medium transition-colors"
              >
                Request Counseling Session
              </button>
            </form>

            {profile?.selfReferrals && profile.selfReferrals.length > 0 && (
              <div className="mt-6 pt-4 border-t border-white/5">
                <h4 className="text-sm font-medium text-zinc-400 mb-3">Previous Referrals</h4>
                {profile.selfReferrals.map(ref => (
                  <div key={ref.id} className="flex items-center justify-between text-sm text-zinc-400 py-2">
                    <span>{ref.reason}</span>
                    <span className="text-xs text-zinc-500">{new Date(ref.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Resources */}
          <motion.div
            className="md:col-span-2 p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Wellbeing Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Managing Exam Stress', desc: 'Evidence-based techniques for academic pressure', tag: 'GUIDE' },
                { title: 'Sleep Hygiene', desc: 'How to improve your sleep quality on campus', tag: 'ARTICLE' },
                { title: 'Crisis Helplines', desc: 'Vandrevala Foundation: 1860 2662 345 | iCALL: 9152987821', tag: 'EMERGENCY' },
              ].map((resource, i) => (
                <div key={i} className="p-4 rounded-xl bg-zinc-950/50 border border-white/5 hover:border-indigo-500/30 transition-colors cursor-pointer">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    resource.tag === 'EMERGENCY' ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'
                  }`}>{resource.tag}</span>
                  <h4 className="text-white font-medium mt-2">{resource.title}</h4>
                  <p className="text-zinc-500 text-sm mt-1">{resource.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Counselor View */}
      {isCounselor && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5">
              <h3 className="text-sm font-medium text-zinc-400 mb-1">Active Profiles</h3>
              <p className="text-3xl font-bold text-white">{wellbeingProfiles.length}</p>
              <p className="text-xs text-zinc-500 mt-1">Students with opted-in signals</p>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5">
              <h3 className="text-sm font-medium text-zinc-400 mb-1">Pending Referrals</h3>
              <p className="text-3xl font-bold text-amber-400">
                {wellbeingProfiles.reduce((acc, p) => acc + (p.selfReferrals?.length || 0), 0)}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Self-referral requests</p>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5">
              <h3 className="text-sm font-medium text-zinc-400 mb-1">Flagged Signals</h3>
              <p className="text-3xl font-bold text-rose-400">1</p>
              <p className="text-xs text-zinc-500 mt-1">Attendance drop detected (opted-in students only)</p>
            </div>
          </div>

          {/* Student Profiles (only those who opted in) */}
          <div className="rounded-2xl bg-zinc-900/50 border border-white/5 overflow-hidden">
            <div className="p-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">Opted-In Student Profiles</h2>
              <p className="text-sm text-zinc-500 mt-1">Only students who have explicitly shared signals appear here.</p>
            </div>
            <div className="divide-y divide-white/5">
              {wellbeingProfiles.map(wp => {
                const s = canonicalStudents[wp.studentId];
                const att = attendanceRecords.find(r => r.studentId === wp.studentId);
                if (!s) return null;

                return (
                  <div key={wp.studentId} className="p-5 hover:bg-white/[0.02] transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold">
                            {s.personalInfo.fullName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{s.personalInfo.fullName}</h4>
                            <p className="text-xs text-zinc-500">{s.id} · {s.enrollment.branch}</p>
                          </div>
                        </div>

                        {/* Opted-in signals */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {wp.optedInSignals.map(sig => (
                            <span key={sig} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> {sig.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>

                        {/* Show attendance signal if opted in */}
                        {wp.optedInSignals.includes('ATTENDANCE') && att && att.percentage < 75 && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-amber-400">
                            <TrendingDown className="w-4 h-4" />
                            Attendance at {att.percentage}% — below 75% threshold
                          </div>
                        )}
                      </div>

                      <div className="text-right space-y-2">
                        {wp.selfReferrals && wp.selfReferrals.length > 0 && (
                          <div className="text-sm text-pink-400">
                            {wp.selfReferrals.length} self-referral(s)
                          </div>
                        )}
                        <button className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg text-sm transition-colors">
                          Open Notes
                        </button>
                      </div>
                    </div>

                    {/* Counselor Notes */}
                    {wp.counselorNotes && (
                      <div className="mt-4 p-3 rounded-xl bg-zinc-950/50 border border-white/5">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Counselor Notes (Confidential)</p>
                        <p className="text-sm text-zinc-300">{wp.counselorNotes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
