import type { Mood, AstrologicalProfile, MeditationSession } from '../types';
import { FALLBACK_LOADING_QUOTE } from '../constants/fallbackQuotes';

// URL du backend Vercel sécurisé - Utilise l'alias principal
const BACKEND_URL = 'https://halterra-backend.vercel.app';

/**
 * Audio Request Cache
 *
 * Prevents duplicate API calls when the same audio is requested multiple times.
 * Stores in-flight promises to deduplicate concurrent requests.
 * TTL: 5 minutes (after which cache entries are automatically cleared)
 */
const audioCache = new Map<string, Promise<string>>();

/**
 * Generates a cache key from audio generation parameters
 * Uses first 100 chars of text + guideType to balance uniqueness and key length
 */
function generateAudioCacheKey(text: string, guideType: string): string {
  return `${text.substring(0, 100)}_${guideType}`;
}

/**
 * Generates meditation content with progressive streaming
 * Provides real-time text rendering as tokens arrive from Claude
 *
 * @param onChunk - Callback invoked for each text chunk (progressive rendering)
 * @param onComplete - Callback invoked when generation completes with full text
 * @returns Promise that resolves when streaming completes
 */
export async function generateMeditationStreaming(
  userName: string,
  mood: Mood,
  category: string,
  intention: string,
  guideType: 'meditation' | 'reflection' = 'meditation',
  duration: 2 | 5 | 10 = 5,
  astrologicalProfile: AstrologicalProfile | undefined,
  sessionHistory: MeditationSession[] | undefined,
  onChunk: (chunk: string) => void,
  onComplete: (result: { displayText: string; audioText: string; dailyInspiration?: string }) => void
): Promise<void> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/meditation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userName,
        mood,
        category,
        intention,
        guideType,
        duration,
        astrologicalProfile,
        sessionHistory,
        stream: true  // Enable streaming mode
      })
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la génération de la méditation');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Streaming not supported');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages (delimited by \n\n)
      const messages = buffer.split('\n\n');
      buffer = messages.pop() || ''; // Keep incomplete message in buffer

      for (const message of messages) {
        if (!message.trim() || !message.startsWith('data: ')) {
          continue;
        }

        try {
          const jsonData = message.replace(/^data: /, '');
          const parsed = JSON.parse(jsonData);

          if (parsed.type === 'chunk') {
            // Progressive text chunk - send to UI
            onChunk(parsed.content);
          } else if (parsed.type === 'complete') {
            // Generation complete - send final data
            onComplete({
              displayText: parsed.displayText,
              audioText: parsed.audioText,
              dailyInspiration: parsed.dailyInspiration
            });
          } else if (parsed.type === 'error') {
            throw new Error(parsed.message || 'Streaming error');
          }
        } catch (parseError) {
          console.warn('Failed to parse SSE message:', message.substring(0, 100));
        }
      }
    }
  } catch (error) {
    console.error('Streaming error:', error);
    throw error;
  }
}

/**
 * Generates meditation content (non-streaming mode)
 * Maintained for backward compatibility and as fallback
 */
export async function generateMeditation(
  userName: string,
  mood: Mood,
  category: string,
  intention: string,
  guideType: 'meditation' | 'reflection' = 'meditation',
  duration: 2 | 5 | 10 = 5,
  astrologicalProfile?: AstrologicalProfile,
  sessionHistory?: MeditationSession[]
): Promise<{ displayText: string; audioText: string; dailyInspiration?: string }> {
  // Appel au backend Vercel qui gère les clés API de manière sécurisée
  const url = `${BACKEND_URL}/api/meditation`;
  console.log('🌐 [API] Preparing fetch to:', url);
  console.log('🌐 [API] Session history count:', sessionHistory?.length ?? 0);

  const requestBody = {
    userName,
    mood,
    category,
    intention,
    guideType,
    duration,
    astrologicalProfile,
    sessionHistory,
    stream: false  // Explicitly disable streaming
  };

  console.log('🌐 [API] Request body size:', JSON.stringify(requestBody).length, 'bytes');

  let response: Response;
  try {
    console.log('🌐 [API] Starting fetch...');
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    console.log('🌐 [API] Fetch completed, status:', response.status);
  } catch (fetchError) {
    console.error('🌐 [API] Fetch FAILED:', fetchError);
    console.error('🌐 [API] Error type:', (fetchError as Error).name);
    console.error('🌐 [API] Error message:', (fetchError as Error).message);
    throw fetchError;
  }

  if (!response.ok) {
    console.error('🌐 [API] Response not OK:', response.status, response.statusText);
    throw new Error('Erreur lors de la génération de la méditation');
  }

  console.log('🌐 [API] Parsing JSON response...');
  const data = await response.json();
  console.log('🌐 [API] Response received, text length:', data.meditationText?.length ?? 0);

  return {
    displayText: data.meditationText,  // Version propre pour l'affichage
    audioText: data.audioText || data.meditationText,  // Version SSML pour audio (fallback si pas présent)
    dailyInspiration: data.dailyInspiration  // Citation ZenQuotes utilisée pour la génération
  };
}

/**
 * Internal function that performs the actual audio generation API call
 * Separated to allow caching logic to wrap around it
 */
async function generateAudioInternal(
  text: string,
  guideType: 'meditation' | 'reflection'
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

/**
 * Generates audio narration with request deduplication
 *
 * If the same audio is requested multiple times (e.g., user navigates back/forth),
 * returns the cached promise instead of making duplicate API calls.
 *
 * Cache expires after 5 minutes to prevent stale data.
 *
 * @param text - The meditation text to narrate
 * @param guideType - The guide voice type (meditation = Iza, reflection = Dann)
 * @returns Promise resolving to audio data URL
 */
export async function generateAudio(
  text: string,
  guideType: 'meditation' | 'reflection' = 'meditation'
): Promise<string> {
  const cacheKey = generateAudioCacheKey(text, guideType);

  // Check if request is already in-flight or cached
  if (audioCache.has(cacheKey)) {
    console.log('🔄 Audio cache HIT - returning cached promise');
    return audioCache.get(cacheKey)!;
  }

  console.log('🆕 Audio cache MISS - generating new audio');

  // Create new promise and store it immediately (deduplicates concurrent requests)
  const promise = generateAudioInternal(text, guideType);
  audioCache.set(cacheKey, promise);

  // Clear cache entry after 5 minutes
  const timeoutId = setTimeout(() => {
    audioCache.delete(cacheKey);
    console.log('🧹 Audio cache entry expired and removed');
  }, 5 * 60 * 1000);

  // If promise fails, remove from cache immediately
  promise.catch(() => {
    clearTimeout(timeoutId);
    audioCache.delete(cacheKey);
    console.log('❌ Audio generation failed - removed from cache');
  });

  return promise;
}

/**
 * Daily Insight Cache
 * Stores the generated insight for the current day to avoid regeneration
 */
interface CachedInsight {
  insight: string;
  label: string;
  date: string; // YYYY-MM-DD format
}

let insightCache: CachedInsight | null = null;

/**
 * Generates a personalized daily insight using AI
 *
 * The insight is:
 * - Concrete and actionable (not vague or poetic)
 * - Based on personality profile + current cosmic factors
 * - Written in plain, direct language
 * - Cached for the entire day
 *
 * @param profile - User's astrological profile
 * @returns Promise with insight text and label
 */
export async function generateDailyInsightAI(
  profile: AstrologicalProfile
): Promise<{ insight: string; label: string }> {
  const today = new Date().toISOString().split('T')[0];

  // Return cached insight if same day
  if (insightCache && insightCache.date === today) {
    console.log('🔄 Daily insight cache HIT');
    return { insight: insightCache.insight, label: insightCache.label };
  }

  console.log('🆕 Generating new daily insight...');

  try {
    const response = await fetch(`${BACKEND_URL}/api/dailyInsight`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profile: {
          dominantElement: profile.dominantElement,
          dominantQuality: profile.dominantQuality,
          energyType: profile.energyType,
          yinYang: profile.yinYang,
          lifePath: profile.lifePath,
          sunSign: profile.sunSign
        },
        date: today
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate daily insight');
    }

    const data = await response.json();

    // Cache the result
    insightCache = {
      insight: data.insight,
      label: data.label,
      date: today
    };

    return { insight: data.insight, label: data.label };
  } catch (error) {
    console.error('Daily insight generation failed:', error);
    // Return fallback
    return {
      insight: "Prenez un moment pour vous recentrer aujourd'hui. Parfois, la meilleure action est simplement d'être présent.",
      label: "pour aujourd'hui"
    };
  }
}

/**
 * Clears the daily insight cache (useful for testing)
 */
export function clearDailyInsightCache(): void {
  insightCache = null;
}

export async function fetchLoadingQuote(): Promise<{ quote: string; author: string }> {
  // Récupère une citation inspirante pour l'écran de chargement
  try {
    const response = await fetch(`${BACKEND_URL}/api/quote`, {
      cache: 'no-cache'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch loading quote');
    }

    const data = await response.json();
    return data;
  } catch {
    // Erreur ignorée intentionnellement - fallback silencieux
    console.warn('Failed to fetch loading quote, using fallback');
    return FALLBACK_LOADING_QUOTE;
  }
}
