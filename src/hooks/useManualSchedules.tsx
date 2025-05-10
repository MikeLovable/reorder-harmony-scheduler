
import React, { createContext, useContext, useState } from 'react';
import { OrderSchedule } from '@/types';

interface ManualSchedulesContextType {
  schedules: OrderSchedule[];
  setSchedules: React.Dispatch<React.SetStateAction<OrderSchedule[]>>;
}

const ManualSchedulesContext = createContext<ManualSchedulesContextType | undefined>(undefined);

export const ManualSchedulesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schedules, setSchedules] = useState<OrderSchedule[]>([]);

  return (
    <ManualSchedulesContext.Provider value={{ schedules, setSchedules }}>
      {children}
    </ManualSchedulesContext.Provider>
  );
};

export const useManualSchedules = () => {
  const context = useContext(ManualSchedulesContext);
  if (context === undefined) {
    throw new Error('useManualSchedules must be used within a ManualSchedulesProvider');
  }
  return context;
};
