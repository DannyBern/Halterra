export interface User {
  name: string;
  createdAt: string;
}

export interface Mood {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
}

export interface MoodQuestionnaire {
  moodId: string;
  questions: Question[];
}

export interface UserResponse {
  questionId: string;
  answer: string;
}

export interface MeditationSession {
  id: string;
  date: string;
  userName: string;
  mood: string;
  responses: UserResponse[];
  meditationText: string;
  audioUrl?: string;
  timestamp: number;
}
