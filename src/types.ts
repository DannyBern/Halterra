export interface AstrologicalProfile {
  // Astrologie Occidentale
  sunSign: string;
  moonSign: string;
  ascendant: string;

  // Astrologie Chinoise
  chineseZodiac: string;
  chineseElement: string;
  yinYang: 'Yin' | 'Yang';

  // Numérologie
  lifePath: number;

  // Analyse Croisée
  dominantElement: 'Feu' | 'Terre' | 'Air' | 'Eau';
  dominantQuality: 'Cardinal' | 'Fixe' | 'Mutable';
  energyType: 'Introvertie' | 'Extravertie' | 'Ambivertie';

  // Métadonnées
  birthDate: string;
  birthTime: string;
  birthLocation: string;

  // Signature personnalisée
  signature: string;
  description: string;
}

export interface User {
  name: string;
  createdAt: string;
  astrologicalProfile?: AstrologicalProfile;
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
