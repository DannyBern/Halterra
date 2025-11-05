import type { Mood, UserResponse } from '../types';

// URL du backend Vercel sécurisé
const BACKEND_URL = 'https://halterra-backend-bxiixq4i1-dannys-projects-ff6db2ea.vercel.app';

export async function generateMeditation(
  _apiKey: string, // Paramètre conservé pour compatibilité mais non utilisé
  userName: string,
  mood: Mood,
  responses: UserResponse[],
  guideType: 'meditation' | 'reflection' = 'meditation'
): Promise<{ displayText: string; audioText: string }> {
  // Appel au backend Vercel qui gère les clés API de manière sécurisée
  const response = await fetch(`${BACKEND_URL}/api/meditation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userName,
      mood,
      responses,
      guideType
    })
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la génération de la méditation');
  }

  const data = await response.json();
  return {
    displayText: data.meditationText,  // Version propre pour l'affichage
    audioText: data.audioText || data.meditationText  // Version SSML pour audio (fallback si pas présent)
  };
}

export async function generateAudio(
  _apiKey: string, // Paramètre conservé pour compatibilité mais non utilisé
  text: string,
  _voiceId: string = 'xsNzdCmWJpYoa80FaXJi', // Voix personnalisée Danny
  guideType: 'meditation' | 'reflection' = 'meditation'
): Promise<string> {
  // Appel au backend Vercel qui gère les clés API de manière sécurisée
  // Le backend utilise ElevenLabs v3 avec qualité maximale : 44.1kHz, 128kbps
  // La voix change selon le guide: féminine pour méditation, masculine pour réflexion
  const response = await fetch(`${BACKEND_URL}/api/audio`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      guideType
    })
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la génération audio');
  }

  const data = await response.json();

  // Retourner directement le base64 comme data URL
  return `data:audio/mpeg;base64,${data.audio}`;
}
