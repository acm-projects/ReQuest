// PointsContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PointsContextType {
  points: number;
  addPoints: (amount: number) => void;
  setPoints: (amount: number) => void;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

interface PointsProviderProps {
  children: ReactNode;
}

export const PointsProvider = ({ children }: PointsProviderProps) => {
  const [points, setPoints] = useState(0);

  const addPoints = (amount: number) => {
    setPoints(prev => prev + amount);
  };

  return (
    <PointsContext.Provider value={{ points, addPoints, setPoints }}>
      {children}
    </PointsContext.Provider>
  );
};

export const usePoints = () => {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
};