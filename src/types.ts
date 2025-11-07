export interface HumanDesign {
  type: 'Generator' | 'Manifesting Generator' | 'Projector' | 'Manifestor' | 'Reflector';
  strategy: string;
  authority: string;
  profile: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
}

export interface User {
  name: string;
  createdAt: string;
  humanDesign?: HumanDesign;
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
