
export interface CFATopic {
  id: string;
  name: string;
  category: 'Ethics' | 'Investment Tools' | 'Asset Classes' | 'Portfolio Management';
  weightMin: number;
  weightMax: number;
  description: string;
  difficulty: 'Low' | 'Medium' | 'High';
  estimatedHours: number;
}

export interface StudySession {
  id: string;
  topicId: string;
  date: string;
  hoursSpent: number;
  notes?: string;
}

export interface StudySettings {
  startDate: string;
  examDate: string;
  hoursPerWeek: number;
  hasBackground: boolean;
}

export interface UserProgress {
  topicProgress: Record<string, number>; // topicId to percentage
  overallHours: number;
  sessions: Record<string, StudySession[]>; // topicId to sessions
  reviewNotes: Record<string, string>; // topicId to user-written review notes
  savedPlan?: any; // The generated AI plan object
}

export interface Flashcard {
  id: string;
  topicId: string;
  front: string;
  back: string;
}

export interface Question {
  id: string;
  topicId: string;
  text: string;
  options: [string, string, string];
  correctIndex: number;
  explanation: string;
}
