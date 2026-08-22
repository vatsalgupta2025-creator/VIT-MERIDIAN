'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRBAC } from '@/context/RBACContext';
import { useAuditLog } from '@/context/AuditLogContext';
import { ledgerEntries, canonicalStudents } from '@/data/canonicalData';
import { Wallet, CreditCard, Receipt, AlertCircle, Building2, BookOpen } from 'lucide-react';
import { LedgerEntry } from '@/types/canonical';

export default function FeesFinance() {
  const { activeRole, can } = useRBAC();
  const { logAction } = useAuditLog();
  const [ledgers, setLedgers] = useState<LedgerEntry[]>(ledgerEntries);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('21BCE0001');

  const studentLedger = ledgers.filter(l => l.studentId === selectedStudentId);
  const student = canonicalStudents[selectedStudentId];

  const canManageFees = can('write', 'fees');

  const handleMarkAsPaid = (entryId: string) => {
    if (!canManageFees) return;

    setLedgers(prev => prev.map(l => {
      if (l.id === entryId) {
        logAction({
          actorId: 'CURRENT_USER',
          actorRole: activeRole,
          action: 'UPDATE',
          resourceType: 'FEES',
          resourceId: entryId,
          oldValue: 'PENDING/OVERDUE',
          newValue: 'PAID'
        });
        return { ...l, status: 'PAID', amountPaid: l.amountDue };
      }
      return l;
    }));
  };

  const totalDue = studentLedger.reduce((acc, curr) => acc + (curr.amountDue - curr.amountPaid), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
          <Wallet className="text-amber-500" size={28} />
          Fees & Finance
        </h1>
        {canManageFees && (
          <select 
            value={selectedStudentId} 
            onChange={e => setSelectedStudentId(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white/90 outline-none focus:border-amber-500/50"
          >
            {Object.values(canonicalStudents).map(s => (
              <option key={s.id} value={s.id}>{s.id} - {s.personalInfo.fullName}</option>
            ))}
          </select>
        )}
      </div>

      {totalDue > 0 && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-4">
          <AlertCircle className="text-red-400 mt-1 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-semibold text-red-400">Outstanding Dues Detected</h3>
            <p className="text-sm text-red-400/80 mt-1">
              Outstanding dues of ₹{totalDue.toLocaleString('en-IN')} may affect exam hall ticket generation and hostel re-allotment.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {studentLedger.map((entry) => (
          <div key={entry.id} className="p-5 rounded-2xl bg-black/40 border border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${entry.category === 'TUITION' ? 'bg-cyan-500/20 text-cyan-400' : entry.category === 'HOSTEL' ? 'bg-violet-500/20 text-violet-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {entry.category === 'TUITION' ? <BookOpen size={24} /> : entry.category === 'HOSTEL' ? <Building2 size={24} /> : <Receipt size={24} />}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{entry.category} FEE</h3>
                <p className="text-sm text-white/50">Due Date: {new Date(entry.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-8 w-full md:w-auto">
              <div className="text-right flex-1 md:flex-none">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Amount Due</p>
                <p className="font-mono font-bold text-lg">₹{entry.amountDue.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right flex-1 md:flex-none">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  entry.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  entry.status === 'OVERDUE' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {entry.status}
                </span>
              </div>
              
              <div className="w-24 flex justify-end">
                {entry.status !== 'PAID' && canManageFees && (
                  <button 
                    onClick={() => handleMarkAsPaid(entry.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    <CreditCard size={16} />
                    Collect
                  </button>
                )}
                {entry.status !== 'PAID' && !canManageFees && (
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors">
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
