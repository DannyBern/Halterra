/**
 * Mock du service de partage pour tests locaux
 * Active automatiquement en mode développement
 */

import type { ShareableSession, GeneratedMedia } from '../types/share';

// Mode mock activé par défaut en local
export const USE_MOCK = import.meta.env.DEV;

/**
 * Mock de génération d'image
 * Simule l'appel API avec un délai réaliste
 */
export async function mockGenerateImage(
  session: ShareableSession,
  options: { format: 'square' | 'story' }
): Promise<GeneratedMedia> {
  console.log('🎨 [MOCK] Generating image:', { format: options.format, mood: session.mood.name });

  // Simuler un délai réseau réaliste (500-1000ms)
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Dimensions selon le format
  const dimension = options.format === 'story' ? '1080x1920' : '1080x1080';
  const width = options.format === 'story' ? 1080 : 1080;
  const height = options.format === 'story' ? 1920 : 1080;

  // Créer une URL de placeholder avec le mood
  const moodText = encodeURIComponent(session.mood.name);
  const color = session.mood.color.replace('#', '');

  const placeholderUrl = `https://via.placeholder.com/${dimension}/${color}/ffffff?text=${moodText}`;

  console.log('✅ [MOCK] Image generated:', placeholderUrl);

  return {
    url: placeholderUrl,
    type: 'image',
    width,
    height,
    format: 'png',
    size: 125000, // ~125KB
  };
}

/**
 * Mock de création de lien court
 * Génère un lien localhost avec un ID unique
 */
export async function mockCreateShareLink(session: ShareableSession): Promise<string> {
  console.log('🔗 [MOCK] Creating share link for session:', session.id);

  // Simuler un délai réseau réaliste (300-500ms)
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Générer un ID court basé sur l'ID de session
  const shortId = session.id.substring(0, 8);

  // En local, utiliser localhost avec le port de dev
  const shortUrl = `http://localhost:5173/share/${shortId}`;

  console.log('✅ [MOCK] Short link created:', shortUrl);

  return shortUrl;
}

/**
 * Mock de tracking analytics
 * Log en console au lieu d'envoyer au backend
 */
export async function mockTrackShare(platform: string, sessionId: string): Promise<void> {
  console.log('📊 [MOCK] Share tracked:', {
    platform,
    sessionId,
    timestamp: new Date().toISOString(),
    location: 'local-test',
  });

  // Simuler un petit délai
  await new Promise((resolve) => setTimeout(resolve, 200));
}
