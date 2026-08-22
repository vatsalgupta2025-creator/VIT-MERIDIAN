'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuditLog, Role } from '@/types/canonical';

interface AuditLogContextType {
  logs: AuditLog[];
  logAction: (action: Omit<AuditLog, 'id' | 'timestamp'>) => void;
  getLogsByResource: (resourceId: string) => AuditLog[];
}

const AuditLogContext = createContext<AuditLogContextType | undefined>(undefined);

export function AuditLogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<AuditLog[]>([
    // Mock initial audit log
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      actorId: 'ADMIN001',
      actorRole: 'ADMIN',
      action: 'UPDATE',
      resourceType: 'FEES',
      resourceId: '21BCE0001',
      oldValue: 'PENDING',
      newValue: 'PAID'
    }
  ]);

  const logAction = (action: Omit<AuditLog, 'id' | 'timestamp'>) => {
    const newLog: AuditLog = {
      ...action,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const getLogsByResource = (resourceId: string) => {
    return logs.filter(log => log.resourceId === resourceId);
  };

  return (
    <AuditLogContext.Provider value={{ logs, logAction, getLogsByResource }}>
      {children}
    </AuditLogContext.Provider>
  );
}

export function useAuditLog() {
  const context = useContext(AuditLogContext);
  if (context === undefined) {
    throw new Error('useAuditLog must be used within an AuditLogProvider');
  }
  return context;
}
