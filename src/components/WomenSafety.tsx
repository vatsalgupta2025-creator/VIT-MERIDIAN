'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRBAC } from '@/context/RBACContext';
import { useAuditLog } from '@/context/AuditLogContext';
import { Shield, Lock, AlertCircle, Phone, Info, Send, EyeOff } from 'lucide-react';

export default function WomenSafety() {
  const { activeRole, can } = useRBAC();
  const { logAction } = useAuditLog();
  
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [category, setCategory] = useState('HARASSMENT');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Gating: Only Students (and specific roles) should see the reporting form.
  const canReport = can('write', 'safety_report');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call and encrypted storage
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      
      logAction({
        actorId: isAnonymous ? 'ANONYMOUS_USER' : 'CURRENT_USER',
        actorRole: activeRole,
        action: 'CREATE',
        resourceType: 'SAFETY_REPORT',
        resourceId: `SAF-NEW-${Date.now()}`,
        newValue: `Submitted ${category} report (Anonymous: ${isAnonymous})`
      });
      
      // Reset form after delay
      setTimeout(() => {
        setSubmitted(false);
        setDescription('');
        setCategory('HARASSMENT');
      }, 3000);
    }, 1500);
  };

  if (!canReport) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-zinc-500">
        <Lock className="w-12 h-12 mb-4 opacity-50" />
        <p>You do not have permission to access the reporting portal.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <Shield className="w-8 h-8 text-indigo-400" />
          Safety & Support Center
        </h1>
        <p className="text-zinc-400 mt-1">Confidential reporting and immediate assistance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Reporting Form */}
        <div className="md:col-span-2">
          <motion.div 
            className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Report Submitted Securely</h3>
                <p className="text-zinc-400 max-w-sm">
                  Your report has been encrypted and routed directly to the designated Safety Officer. 
                  {isAnonymous && " Your identity has been withheld."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="flex items-center gap-3">
                    <EyeOff className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="text-sm font-medium text-indigo-300">Anonymous Reporting</h4>
                      <p className="text-xs text-indigo-400/70">Your identity will be withheld from the assigned handler.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                  </label>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="HARASSMENT">Harassment or Inappropriate Behavior</option>
                      <option value="STALKING">Stalking or Unwanted Following</option>
                      <option value="UNSAFE_ENVIRONMENT">Unsafe Environment / Poor Lighting</option>
                      <option value="OTHER">Other Safety Concern</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please provide details about the incident, location, and time..."
                      rows={5}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 resize-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Lock className="w-4 h-4" />
                    End-to-end encrypted submission
                  </div>
                  <button 
                    type="submit" 
                    disabled={isSubmitting || !description.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Securing...' : 'Submit Report'}
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>

        {/* Quick Contacts Sidebar */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Emergency Contacts</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-rose-400">Campus Security</div>
                    <div className="text-xs text-rose-400/70">Available 24/7</div>
                  </div>
                </div>
                <Phone className="w-4 h-4 text-rose-400 opacity-50" />
              </button>
              
              <button className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-indigo-300">Women's Helpline</div>
                    <div className="text-xs text-indigo-400/70">National: 1091</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
            <div className="flex gap-3 text-sm text-zinc-400">
              <Info className="w-5 h-5 text-indigo-400 flex-shrink-0" />
              <p>
                Reports submitted here bypass general administration and are routed directly to specialized Safety Officers trained in confidentiality.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
