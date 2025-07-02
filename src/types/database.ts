export interface Planning {
    id: string;
    user_id: string;
    title: string;
    target_date: string;
    sessions_json: Session[];
    created_at: string;
  }
  
  export interface Session {
    id: string;
    subject: string;
    duration: number;
    date: string;
    time: string;
    type: 'revision' | 'exercise' | 'course';
  }
  
  export interface Flashcard {
    id: string;
    user_id: string;
    question: string;
    answer: string;
    created_at: string;
  }
  
  export interface User {
    id: string;
    email: string;
  }