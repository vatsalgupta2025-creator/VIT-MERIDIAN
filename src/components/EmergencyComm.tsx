'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRBAC } from '@/context/RBACContext';
import { useAuditLog } from '@/context/AuditLogContext';
import { useEventBus } from '@/context/EventBusContext';
import { ShieldAlert, AlertTriangle, XCircle, CheckCircle, Radio, BellRing, MapPin } from 'lucide-react';

export default function EmergencyComm() {
  const { activeRole, can } = useRBAC();
  const { logAction } = useAuditLog();
  const { emitEvent } = useEventBus();
  
  const [panicActive, setPanicActive] = useState(false);
  const [cancelCountdown, setCancelCountdown] = useState(10);
  
  const [broadcastScope, setBroadcastScope] = useState('CAMPUS_WIDE');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Gating
  const canTriggerBroadcast = can('write', 'emergency'); // Security / Admins
  const canTriggerPanic = activeRole === 'STUDENT' || activeRole === 'FACULTY'; // Users

  // Panic Cancel Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (panicActive && cancelCountdown > 0) {
      timer = setTimeout(() => setCancelCountdown(c => c - 1), 1000);
    } else if (panicActive && cancelCountdown === 0) {
      // Timer expired, alert goes through
      emitEvent({
        type: 'EMERGENCY_TRIGGERED',
        sourceModule: 'EmergencyComm',
        targetScope: 'SECURITY',
        payload: { type: 'PANIC', severity: 'CRITICAL', userRole: activeRole }
      });
      logAction({
        actorId: 'CURRENT_USER',
        actorRole: activeRole,
        action: 'CREATE',
        resourceType: 'EMERGENCY',
        resourceId: `EMG-${Date.now()}`,
        newValue: 'Panic Alert Triggered'
      });
    }
    return () => clearTimeout(timer);
  }, [panicActive, cancelCountdown, emitEvent, activeRole, logAction]);

  const handleTriggerPanic = () => {
    setPanicActive(true);
    setCancelCountdown(10);
  };

  const handleCancelPanic = () => {
    setPanicActive(false);
    logAction({
      actorId: 'CURRENT_USER',
      actorRole: activeRole,
      action: 'UPDATE',
      resourceType: 'EMERGENCY',
      resourceId: `EMG-${Date.now()}`,
      newValue: 'Panic Alert Cancelled (False Alarm)'
    });
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setIsBroadcasting(true);
    setTimeout(() => {
      emitEvent({
        type: 'EMERGENCY_BROADCAST',
        sourceModule: 'EmergencyComm',
        targetScope: broadcastScope,
        payload: { message: broadcastMessage }
      });
      
      logAction({
        actorId: 'CURRENT_USER',
        actorRole: activeRole,
        action: 'CREATE',
        resourceType: 'COMMUNICATION',
        resourceId: `ANN-${Date.now()}`,
        newValue: `Broadcasted Emergency to ${broadcastScope}`
      });

      setIsBroadcasting(false);
      setBroadcastMessage('');
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <Radio className="w-8 h-8 text-rose-500" />
          Emergency Response
        </h1>
        <p className="text-zinc-400 mt-1">Rapid response and broadcast systems</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* User Panic Button */}
        {canTriggerPanic && (
          <motion.div 
            className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm flex flex-col items-center justify-center text-center relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h2 className="text-xl font-bold text-white mb-2">Personal Panic Alarm</h2>
            <p className="text-sm text-zinc-400 mb-8 max-w-sm">
              Pressing this will instantly alert Campus Security and your designated emergency contacts with your last known location.
            </p>

            <AnimatePresence mode="wait">
              {!panicActive ? (
                <motion.button
                  key="idle"
                  onClick={handleTriggerPanic}
                  className="w-48 h-48 rounded-full bg-rose-500 hover:bg-rose-600 flex flex-col items-center justify-center gap-3 shadow-[0_0_50px_rgba(244,63,94,0.3)] hover:shadow-[0_0_70px_rgba(244,63,94,0.5)] transition-all border-4 border-rose-400"
                  whileTap={{ scale: 0.9 }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                >
                  <BellRing className="w-12 h-12 text-white" />
                  <span className="text-white font-bold text-xl uppercase tracking-widest">SOS</span>
                </motion.button>
              ) : (
                <motion.div
                  key="active"
                  className="w-full h-48 flex flex-col items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {cancelCountdown > 0 ? (
                    <div className="space-y-4 w-full">
                      <div className="text-rose-400 text-lg font-bold flex items-center justify-center gap-2">
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                        Alerting Security in {cancelCountdown}s
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                        <motion.div 
                          className="h-full bg-rose-500"
                          initial={{ width: "100%" }}
                          animate={{ width: "0%" }}
                          transition={{ duration: 10, ease: "linear" }}
                        />
                      </div>
                      <button
                        onClick={handleCancelPanic}
                        className="mt-4 px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-medium transition-colors border border-white/10"
                      >
                        Cancel False Alarm
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="w-8 h-8 text-rose-500" />
                      </div>
                      <h3 className="text-xl font-bold text-rose-500">Alert Broadcasted</h3>
                      <p className="text-sm text-zinc-400">Security has been dispatched to your location.</p>
                      <button
                        onClick={() => setPanicActive(false)}
                        className="mt-2 text-sm text-zinc-500 hover:text-zinc-300 underline"
                      >
                        Reset System
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Security Broadcast Module */}
        {canTriggerBroadcast && (
          <motion.div 
            className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 backdrop-blur-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              Emergency Broadcast
            </h2>
            <p className="text-sm text-zinc-400 mb-6">
              Push mass notifications bypassing standard DND settings.
            </p>

            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Target Scope</label>
                <select 
                  value={broadcastScope}
                  onChange={(e) => setBroadcastScope(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="CAMPUS_WIDE">Campus Wide (All Users)</option>
                  <option value="HOSTEL_BLOCKS">All Hostel Blocks</option>
                  <option value="ACADEMIC_BLOCKS">Academic Blocks Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Message</label>
                <textarea 
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="E.g., Severe weather warning. Remain indoors immediately."
                  rows={4}
                  className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 resize-none"
                  required
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isBroadcasting || !broadcastMessage.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {isBroadcasting ? 'Broadcasting...' : 'INITIATE BROADCAST'}
                  <Radio className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
