
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { updatePeriodsValue } from '@/utils/algorithmMain';

interface AppConfigContextType {
  periods: number;
  samples: number;
  setPeriods: (value: number) => void;
  setSamples: (value: number) => void;
}

const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

export const AppConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [periods, setPeriods] = useState<number>(12);
  const [samples, setSamples] = useState<number>(20);

  // Update algorithm periods value when context periods changes
  useEffect(() => {
    updatePeriodsValue(periods);
  }, [periods]);

  return (
    <AppConfigContext.Provider value={{ periods, samples, setPeriods, setSamples }}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = (): AppConfigContextType => {
  const context = useContext(AppConfigContext);
  if (context === undefined) {
    throw new Error('useAppConfig must be used within an AppConfigProvider');
  }
  return context;
};
