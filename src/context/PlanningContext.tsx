import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GeneratedPlanning {
  id: string;
  name: string;
  createdAt: string;
  sessions: any[];
  totalHours: number;
  subjects: any[];
  explanation: string;
}

interface PlanningContextType {
  generatedPlanning: GeneratedPlanning | null;
  setGeneratedPlanning: (planning: GeneratedPlanning | null) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
}

const PlanningContext = createContext<PlanningContextType | undefined>(undefined);

export function PlanningProvider({ children }: { children: ReactNode }) {
  const [generatedPlanning, setGeneratedPlanning] = useState<GeneratedPlanning | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <PlanningContext.Provider value={{
      generatedPlanning,
      setGeneratedPlanning,
      isGenerating,
      setIsGenerating
    }}>
      {children}
    </PlanningContext.Provider>
  );
}

export function usePlanning() {
  const context = useContext(PlanningContext);
  if (context === undefined) {
    throw new Error('usePlanning must be used within a PlanningProvider');
  }
  return context;
}