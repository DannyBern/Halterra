/**
 * Service de partage social pour Halterra Lite
 * Gère le partage sur différentes plateformes avec génération de contenu optimisé
 */

import type {
  SharePlatform,
  ShareContent,
  ShareOptions,
  ShareableSession,
  ShareResult,
  GeneratedMedia,
} from '../types/share';

// Import du système de mock pour tests locaux
import { USE_MOCK, mockGenerateImage, mockCreateShareLink, mockTrackShare } from './shareService.mock';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://halterra-backend.vercel.app';

/**
 * Génère un extrait optimisé du texte de méditation
 */
function generateExcerpt(text: string, maxLength: number = 200): string {
  // Nettoyer le texte (retirer les doubles espaces, newlines multiples)
  const cleaned = text.replace(/\s+/g, ' ').trim();

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  // Trouver la dernière phrase complète avant maxLength
  const excerpt = cleaned.substring(0, maxLength);
  const lastPeriod = excerpt.lastIndexOf('.');
  const lastQuestion = excerpt.lastIndexOf('?');
  const lastExclamation = excerpt.lastIndexOf('!');

  const lastSentence = Math.max(lastPeriod, lastQuestion, lastExclamation);

  if (lastSentence > maxLength * 0.6) {
    return excerpt.substring(0, lastSentence + 1);
  }

  // Sinon, couper au dernier mot
  const lastSpace = excerpt.lastIndexOf(' ');
  return excerpt.substring(0, lastSpace) + '...';
}

/**
 * Génère les hashtags appropriés
 */
function generateHashtags(session: ShareableSession): string[] {
  const hashtags = ['Halterra', 'Meditation', 'Mindfulness'];

  // Ajouter le mood
  const moodTag = session.mood.name
    .split('/')
    .map((part) => part.trim().replace(/\s+/g, ''))
    .join('');
  hashtags.push(moodTag);

  // Ajouter le type
  if (session.guideType === 'meditation') {
    hashtags.push('GuidedMeditation');
  } else if (session.guideType === 'reflection') {
    hashtags.push('Reflection', 'SelfCare');
  }

  return hashtags;
}

/**
 * Génère une image de partage pour la session
 */
export async function generateShareImage(
  session: ShareableSession,
  options: { format: 'square' | 'story'; includeQuote?: boolean } = { format: 'square' }
): Promise<GeneratedMedia> {
  // Utiliser le mock en développement
  if (USE_MOCK) {
    return mockGenerateImage(session, options);
  }

  const response = await fetch(`${API_BASE_URL}/api/share/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'image',
      format: options.format,
      session: {
        id: session.id,
        excerpt: generateExcerpt(session.meditationText, 280),
        mood: session.mood,
        category: session.category,
        intention: session.intention,
        userName: session.userName,
      },
      includeQuote: options.includeQuote,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate share image');
  }

  const data = await response.json();
  return data.media;
}

/**
 * Crée un lien de partage court et trackable
 */
export async function createShareLink(session: ShareableSession): Promise<string> {
  // Utiliser le mock en développement
  if (USE_MOCK) {
    return mockCreateShareLink(session);
  }

  const response = await fetch(`${API_BASE_URL}/api/share/link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: session.id,
      excerpt: generateExcerpt(session.meditationText, 200),
      mood: session.mood,
      intention: session.intention,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create share link');
  }

  const data = await response.json();
  return data.shortUrl;
}

/**
 * Prépare le contenu de partage selon la plateforme
 */
export async function prepareShareContent(
  session: ShareableSession,
  platform: SharePlatform
): Promise<ShareContent> {
  const excerpt = generateExcerpt(session.meditationText, 200);
  const shareLink = await createShareLink(session);
  const hashtags = generateHashtags(session);

  // Configuration spécifique par plateforme
  const configs: Record<SharePlatform, Partial<ShareContent>> = {
    instagram: {
      title: `${session.mood.icon} Moment de méditation`,
      description: excerpt,
      hashtags: hashtags.slice(0, 10), // Instagram limite à 30 hashtags total
    },
    facebook: {
      title: `Ma méditation avec Halterra`,
      description: `${session.intention ? `${session.intention}\n\n` : ''}${excerpt}`,
      hashtags: hashtags.slice(0, 3), // Facebook préfère moins de hashtags
    },
    twitter: {
      title: `✨ Méditation du jour`,
      description: generateExcerpt(session.meditationText, 240), // 280 - liens - hashtags
      hashtags: hashtags.slice(0, 2),
      via: 'HalterraApp',
    },
    linkedin: {
      title: `Prendre un moment pour soi avec Halterra`,
      description: excerpt,
      hashtags: ['Wellbeing', 'Mindfulness', 'MentalHealth'],
    },
    tiktok: {
      title: `${session.mood.icon} Ma méditation`,
      description: excerpt,
      hashtags: ['meditation', 'mindfulness', 'selfcare', 'wellness'],
    },
    whatsapp: {
      title: `Partage de méditation`,
      description: `${session.mood.icon} ${excerpt}`,
      hashtags: [],
    },
    'copy-link': {
      title: 'Lien copié!',
      description: shareLink,
      hashtags: [],
    },
    native: {
      title: `Ma méditation avec Halterra`,
      description: excerpt,
      hashtags: [],
    },
  };

  const config = configs[platform];

  return {
    text: config.description || excerpt,
    url: shareLink,
    title: config.title || 'Ma méditation Halterra',
    description: config.description || excerpt,
    hashtags: config.hashtags || [],
    via: config.via,
  };
}

/**
 * Partage natif (Web Share API)
 */
async function shareNative(content: ShareContent): Promise<ShareResult> {
  if (!navigator.share) {
    return {
      success: false,
      platform: 'native',
      error: 'Native sharing not supported',
    };
  }

  try {
    await navigator.share({
      title: content.title,
      text: content.description,
      url: content.url,
    });

    return {
      success: true,
      platform: 'native',
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      // User cancelled the share
      return {
        success: false,
        platform: 'native',
        error: 'Share cancelled',
      };
    }

    return {
      success: false,
      platform: 'native',
      error: error instanceof Error ? error.message : 'Share failed',
    };
  }
}

/**
 * Partage sur Instagram (via URL scheme ou copie)
 */
async function shareInstagram(
  content: ShareContent,
  mediaUrl?: string
): Promise<ShareResult> {
  // Instagram ne supporte pas le deep linking avec du texte
  // On copie le texte et on guide l'utilisateur
  const textToCopy = `${content.description}\n\n${content.hashtags?.map((h) => `#${h}`).join(' ')}\n\n${content.url}`;

  try {
    await navigator.clipboard.writeText(textToCopy);

    // Ouvrir Instagram (mobile) ou web
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile && mediaUrl) {
      window.open('instagram://app', '_blank');
    } else {
      window.open('https://www.instagram.com/', '_blank');
    }

    return {
      success: true,
      platform: 'instagram',
    };
  } catch (error) {
    return {
      success: false,
      platform: 'instagram',
      error: 'Failed to copy text',
    };
  }
}

/**
 * Partage sur Facebook
 */
function shareFacebook(content: ShareContent): ShareResult {
  const url = new URL('https://www.facebook.com/sharer/sharer.php');
  url.searchParams.set('u', content.url);
  url.searchParams.set('quote', content.description);

  if (content.hashtags && content.hashtags.length > 0) {
    url.searchParams.set('hashtag', `#${content.hashtags[0]}`);
  }

  window.open(url.toString(), '_blank', 'width=600,height=400');

  return {
    success: true,
    platform: 'facebook',
  };
}

/**
 * Partage sur Twitter/X
 */
function shareTwitter(content: ShareContent): ShareResult {
  const url = new URL('https://twitter.com/intent/tweet');

  let text = content.description;
  if (content.hashtags && content.hashtags.length > 0) {
    text += '\n\n' + content.hashtags.map((h) => `#${h}`).join(' ');
  }

  url.searchParams.set('text', text);
  url.searchParams.set('url', content.url);

  if (content.via) {
    url.searchParams.set('via', content.via);
  }

  window.open(url.toString(), '_blank', 'width=600,height=400');

  return {
    success: true,
    platform: 'twitter',
  };
}

/**
 * Partage sur LinkedIn
 */
function shareLinkedIn(content: ShareContent): ShareResult {
  const url = new URL('https://www.linkedin.com/sharing/share-offsite/');
  url.searchParams.set('url', content.url);

  window.open(url.toString(), '_blank', 'width=600,height=400');

  return {
    success: true,
    platform: 'linkedin',
  };
}

/**
 * Partage sur WhatsApp
 */
function shareWhatsApp(content: ShareContent): ShareResult {
  const text = `${content.description}\n\n${content.url}`;
  const url = new URL('https://wa.me/');
  url.searchParams.set('text', text);

  window.open(url.toString(), '_blank');

  return {
    success: true,
    platform: 'whatsapp',
  };
}

/**
 * Copier le lien dans le presse-papiers
 */
async function copyLink(content: ShareContent): Promise<ShareResult> {
  try {
    await navigator.clipboard.writeText(content.url);

    return {
      success: true,
      platform: 'copy-link',
    };
  } catch (error) {
    return {
      success: false,
      platform: 'copy-link',
      error: 'Failed to copy link',
    };
  }
}

/**
 * Fonction principale de partage
 */
export async function shareSession(
  session: ShareableSession,
  options: ShareOptions
): Promise<ShareResult> {
  try {
    // Préparer le contenu
    const content = await prepareShareContent(session, options.platform);

    // Générer une image si nécessaire
    let mediaUrl: string | undefined;
    if (['instagram', 'facebook', 'linkedin'].includes(options.platform)) {
      const format = options.platform === 'instagram' ? 'story' : 'square';
      const media = await generateShareImage(session, {
        format,
        includeQuote: options.includeQuote,
      });
      mediaUrl = media.url;
      content.imageUrl = mediaUrl;
    }

    // Partager selon la plateforme
    switch (options.platform) {
      case 'native':
        return await shareNative(content);
      case 'instagram':
        return await shareInstagram(content, mediaUrl);
      case 'facebook':
        return shareFacebook(content);
      case 'twitter':
        return shareTwitter(content);
      case 'linkedin':
        return shareLinkedIn(content);
      case 'whatsapp':
        return shareWhatsApp(content);
      case 'copy-link':
        return await copyLink(content);
      default:
        return {
          success: false,
          platform: options.platform,
          error: 'Platform not supported',
        };
    }
  } catch (error) {
    return {
      success: false,
      platform: options.platform,
      error: error instanceof Error ? error.message : 'Share failed',
    };
  }
}

/**
 * Vérifie si le partage natif est disponible
 */
export function isNativeShareAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

/**
 * Track le partage (analytics)
 */
export async function trackShare(result: ShareResult, session: ShareableSession): Promise<void> {
  if (!result.success) return;

  // Utiliser le mock en développement
  if (USE_MOCK) {
    return mockTrackShare(result.platform, session.id);
  }

  try {
    await fetch(`${API_BASE_URL}/api/analytics/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform: result.platform,
        sessionId: session.id,
        mood: session.mood.id,
        category: session.category,
        timestamp: Date.now(),
      }),
    });
  } catch (error) {
    console.error('Failed to track share:', error);
  }
}
