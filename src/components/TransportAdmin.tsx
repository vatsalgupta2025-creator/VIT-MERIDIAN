'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRBAC } from '@/context/RBACContext';
import { transport } from '@/data/canonicalData';
import { Bus, MapPin, Clock, AlertTriangle, Lock, User, Phone } from 'lucide-react';

export default function TransportAdmin() {
  const { activeRole, can } = useRBAC();
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  const canView = activeRole === 'STUDENT' || activeRole === 'ADMIN' || activeRole === 'INSTITUTION_ADMIN' || activeRole === 'TRANSPORT_COORD' || activeRole === 'TRANSPORT_COORDINATOR';

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-zinc-500">
        <Lock className="w-12 h-12 mb-4 opacity-50" />
        <p>Transport data is not accessible for your role.</p>
      </div>
    );
  }

  const routes = transport?.routes || [];
  const studentAssignments = transport?.students || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <Bus className="w-8 h-8 text-indigo-400" />
          Transport Administration
        </h1>
        <p className="text-zinc-400 mt-1">Route management, vehicle tracking, and student assignments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5">
          <h3 className="text-sm font-medium text-zinc-400 mb-1">Active Routes</h3>
          <p className="text-3xl font-bold text-white">{routes.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5">
          <h3 className="text-sm font-medium text-zinc-400 mb-1">Students Assigned</h3>
          <p className="text-3xl font-bold text-indigo-400">{studentAssignments.length}</p>
        </div>
        <div className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5">
          <h3 className="text-sm font-medium text-zinc-400 mb-1">Active Alerts</h3>
          <p className="text-3xl font-bold text-emerald-400">0</p>
          <p className="text-xs text-zinc-500 mt-1">No delays or incidents</p>
        </div>
      </div>

      {/* Route Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Routes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routes.map(route => {
            const assignedStudents = studentAssignments.filter(sa => sa.routeId === route.id);
            const isSelected = selectedRoute === route.id;

            return (
              <motion.div
                key={route.id}
                className={`p-5 rounded-2xl border backdrop-blur-sm cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-indigo-500/10 border-indigo-500/30'
                    : 'bg-zinc-900/50 border-white/5 hover:border-white/10'
                }`}
                onClick={() => setSelectedRoute(isSelected ? null : route.id)}
                layout
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                      <Bus className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{route.id}</h3>
                      <p className="text-xs text-zinc-500">Vehicle: {route.vehicleId} · Driver: {route.driverId}</p>
                    </div>
                  </div>
                  <span className="text-sm text-indigo-400 font-medium">
                    {assignedStudents.length} riders
                  </span>
                </div>

                {/* Stops */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {route.stops.map((stop, i) => (
                    <span key={i} className="px-2 py-1 bg-zinc-950/50 border border-white/5 rounded-lg text-xs text-zinc-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-zinc-500" /> {stop}
                    </span>
                  ))}
                </div>

                {/* Expanded: Student Assignments */}
                {isSelected && assignedStudents.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-white/5"
                  >
                    <h4 className="text-sm font-medium text-zinc-400 mb-3">Assigned Students</h4>
                    <div className="space-y-2">
                      {assignedStudents.map(sa => (
                        <div key={sa.studentId} className="flex items-center justify-between py-2 px-3 bg-zinc-950/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-zinc-500" />
                            <span className="text-sm text-zinc-300 font-mono">{sa.studentId}</span>
                          </div>
                          <span className="text-xs text-zinc-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Stop: {sa.stopId}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {routes.length === 0 && (
        <div className="p-8 text-center text-zinc-500 border border-dashed border-white/10 rounded-2xl">
          No transport routes configured in seed data.
        </div>
      )}
    </div>
  );
}
