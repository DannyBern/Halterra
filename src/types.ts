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

export interface MeditationSession {
  id: string;
  date: string;
  userName: string;
  mood: string;
  guideType?: 'meditation' | 'reflection';
  duration?: 2 | 5 | 10;
  category?: string;
  intention?: string;
  meditationText: string;
  audioUrl?: string;
  timestamp: number;
}
