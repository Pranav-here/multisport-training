"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AppMode } from '@/lib/discovery/types';

interface AppModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>('training');
  const pathname = usePathname();

  // Sync mode with current route
  useEffect(() => {
    const currentPath = pathname ?? '';

    if (currentPath === '/discovery') {
      setModeState('discovery');
    } else if (
      currentPath === '/dashboard' ||
      currentPath === '/training' ||
      currentPath === '/' ||
      currentPath.startsWith('/training/')
    ) {
      setModeState('training');
    } else {
      // For other routes, load from localStorage
      const savedMode = localStorage.getItem('athletiqs-app-mode') as AppMode;
      if (savedMode === 'training' || savedMode === 'discovery') {
        setModeState(savedMode);
      }
    }
  }, [pathname]);

  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
    localStorage.setItem('athletiqs-app-mode', newMode);
  };

  const toggleMode = () => {
    const newMode = mode === 'training' ? 'discovery' : 'training';
    setMode(newMode);
  };

  return (
    <AppModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return context;
}
