/**
 * Types pour le système de partage social
 */

export type SharePlatform =
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'tiktok'
  | 'whatsapp'
  | 'copy-link'
  | 'native';

export type ShareFormat = 'image' | 'video' | 'text' | 'link';

export interface ShareContent {
  // Contenu de base
  text: string;
  url: string;

  // Métadonnées
  title: string;
  description: string;

  // Médias
  imageUrl?: string;
  videoUrl?: string;

  // Hashtags et mentions
  hashtags?: string[];
  via?: string;
}

export interface ShareOptions {
  platform: SharePlatform;
  format: ShareFormat;
  customMessage?: string;
  includeAudio?: boolean;
  includeQuote?: boolean;
}

export interface ShareableSession {
  id: string;
  meditationText: string;
  mood: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  category?: string;
  intention?: string;
  userName: string;
  date: string;
  guideType?: 'meditation' | 'reflection';
  duration?: number;
}

export interface ShareResult {
  success: boolean;
  platform: SharePlatform;
  shareId?: string;
  error?: string;
}

export interface GeneratedMedia {
  url: string;
  type: 'image' | 'video';
  width: number;
  height: number;
  format: string;
  size: number;
}
