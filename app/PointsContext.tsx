// PointsContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PointsContextType {
  points: number;
  addPoints: (amount: number) => void;
  setPoints: (amount: number) => void;
  weight: number;
  addWeight: (amount: number) => void;
  setWeight: (amount: number) => void;
  impact: number;
  addImpact: (amount: number) => void;
  setImpact: (amount: number) => void;
  history: string[];
  addHistory: (message: string) => void;
  setHistory: (message: string[]) => void;
  chartHistory: Record<string, number>;
  addChartHistory: (itemName: string) => void;
  setChartHistory: (message: Record<string, number>) => void;
  username: string;
  setUsername: (name: string) => void;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

interface PointsProviderProps {
  children: ReactNode;
}

export const PointsProvider = ({ children }: PointsProviderProps) => {
  const [points, setPoints] = useState(0);
  const [weight, setWeight] = useState(0);
  const [impact, setImpact] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [chartHistory, setChartHistory] = useState<Record<string, number>>({});
  const [username, setUsername] = useState('');

  const addPoints = (amount: number) => {
    setPoints(prev => prev + amount);
  };

  const addWeight = (amount: number) => {
    setWeight(prev => parseFloat((prev + amount).toFixed(2)));
  }

  const addImpact = (amount: number) => {
    setImpact(prev => prev + amount);
  }

  const addHistory = (message: string) => {
    setHistory(prev => [...prev, message]);
  }

  const addChartHistory = (itemName: string) => {
    setChartHistory((prevHistory) => ({
      ...prevHistory,
      [itemName]: (prevHistory[itemName] || 0) + 1, // Equivalent to Python's .get(itemName, 0) + 1
    }));
  };

  return (
    <PointsContext.Provider value={{ points, addPoints, setPoints, weight, setWeight, addWeight, impact, setImpact, addImpact, history, addHistory, setHistory, chartHistory, addChartHistory, setChartHistory, username, setUsername }}>
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

export const useWeight = () => {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('useWeight must be used within a PointsProvider');
  }
  return context;
}

export const useImpact = () => {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('useImpact must be used within a PointsProvider');
  }
  return context;
}

export const useHistory = () => {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a PointsProvider');
  }
  return context;
}

export const useChartHistory = () => {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('useChartHistory must be used within a PointsProvider');
  }
  return context;
}

export const useUsername = () => {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('useUsername must be used within a PointsProvider');
  }
  return context;
}