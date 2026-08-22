'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { SystemEvent } from '@/types/canonical';

interface EventBusContextType {
  events: SystemEvent[];
  emitEvent: (event: Omit<SystemEvent, 'id' | 'timestamp'>) => void;
  getEventsByModule: (module: string) => SystemEvent[];
  getEventsByScope: (scope: string) => SystemEvent[];
  clearEvents: () => void;
}

const EventBusContext = createContext<EventBusContextType | undefined>(undefined);

export function EventBusProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<SystemEvent[]>([]);

  const emitEvent = useCallback((event: Omit<SystemEvent, 'id' | 'timestamp'>) => {
    const newEvent: SystemEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    
    // In a real app, this might also trigger websockets or server actions.
    // For the UI, we just push it to the state.
    setEvents(prev => [newEvent, ...prev]);
    
    console.log(`[EventBus] Emitted: ${event.type}`, newEvent);
  }, []);

  const getEventsByModule = useCallback((module: string) => {
    return events.filter(e => e.sourceModule === module);
  }, [events]);

  const getEventsByScope = useCallback((scope: string) => {
    return events.filter(e => e.targetScope === scope);
  }, [events]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return (
    <EventBusContext.Provider value={{ events, emitEvent, getEventsByModule, getEventsByScope, clearEvents }}>
      {children}
    </EventBusContext.Provider>
  );
}

export function useEventBus() {
  const context = useContext(EventBusContext);
  if (context === undefined) {
    throw new Error('useEventBus must be used within an EventBusProvider');
  }
  return context;
}
