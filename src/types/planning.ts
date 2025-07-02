export interface Subject {
    id: string;
    name: string;
    coefficient: number;
    examDate: string;
    estimatedHours: number;
    currentProgress: number; // 0-100%
    type: 'revision' | 'redaction' | 'retapage' | 'exercices';
  }
  
  export interface TimeSlot {
    id: string;
    dayOfWeek: number; // 1-7 (Lundi-Dimanche)
    startTime: string; // "09:00"
    endTime: string;   // "11:00"
    available: boolean;
  }
  
  export interface GeneratedSession {
    id: string;
    subjectId: string;
    subjectName: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number; // en minutes
    type: 'revision' | 'redaction' | 'retapage' | 'exercices';
    priority: 'high' | 'medium' | 'low';
    description: string;
  }
  
  export interface PlanningRequest {
    subjects: Subject[];
    availableSlots: TimeSlot[];
    preferences: {
      preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'flexible';
      maxSessionDuration: number; // en minutes
      breakBetweenSessions: number; // en minutes
      weekendStudy: boolean;
    };
  }
  
  export interface GeneratedPlanning {
    id: string;
    name: string;
    createdAt: string;
    sessions: GeneratedSession[];
    totalHours: number;
    subjects: Subject[];
  }