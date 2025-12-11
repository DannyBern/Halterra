import { checkRateLimit, addRateLimitHeaders } from '../lib/rateLimit.js';
import { handleCORS } from '../lib/corsConfig.js';

/**
 * ELEVENLABS V3 AVEC AUDIO TAGS POUR MÉDITATIONS EXPRESSIVES
 *
 * Utilise le modèle eleven_v3 (alpha) avec insertion automatique de:
 * - [breath] - respiration naturelle
 * - [sigh] - soupir apaisé
 * - [softly] - ton doux
 * - [pause] - pause naturelle
 *
 * Le modèle V3 interprète ces tags pour produire des vocalisations
 * naturelles et expressives, idéales pour les méditations guidées.
 *
 * Sources:
 * - https://elevenlabs.io/blog/v3-audiotags
 * - https://elevenlabs.io/blog/eleven-v3-alpha-now-available-in-the-api
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

// Voix ElevenLabs
const VOICE_IDS = {
  meditation: 'xsNzdCmWJpYoa80FaXJi',  // Iza - voix féminine québécoise
  reflection: '93nuHbke4dTER9x2pDwE'   // Dann - voix masculine
};

// Voice settings optimisés pour V3
// IMPORTANT: V3 accepte seulement stability: 0.0 (Creative), 0.5 (Natural), 1.0 (Robust)
const VOICE_SETTINGS = {
  meditation: {
    stability: 0.5,            // Natural - bon équilibre pour méditation
    similarity_boost: 0.90,    // Haute fidélité à la voix
    style: 0.0,                // Pas de style pour V3
    speed: 0.75,               // Lent pour méditation
    use_speaker_boost: true
  },
  reflection: {
    stability: 0.5,            // Natural
    similarity_boost: 0.85,
    style: 0.0,
    speed: 0.85,
    use_speaker_boost: true
  }
};

// ============================================================================
// AUDIO TAGS POUR V3
// ============================================================================

/**
 * Insère automatiquement des audio tags V3 dans le texte de méditation
 *
 * Tags utilisés:
 * - [breath] - respiration naturelle (après les phrases d'inspiration)
 * - [sigh] - soupir apaisé (moments de relâchement)
 * - [softly] - ton doux (passages intimes)
 * - [calmly] - ton calme (instructions)
 * - [gently] - ton doux et bienveillant
 * - [slowly] - ralentissement naturel
 *
 * Stratégie: Insertion contextuelle basée sur le contenu du texte
 */
function insertAudioTags(text, isMeditation = true) {
  let processed = text;

  // Patterns pour méditation - insertion de [breath] après phrases de respiration
  const breathPatterns = [
    /(\brespire[zs]?\b[^.]*\.)/gi,
    /(\binspire[zs]?\b[^.]*\.)/gi,
    /(\bexpire[zs]?\b[^.]*\.)/gi,
    /(\bsouffle\b[^.]*\.)/gi,
    /(\bprofondément\b[^.]*\.)/gi
  ];

  breathPatterns.forEach(pattern => {
    processed = processed.replace(pattern, '$1 [breath]');
  });

  // Patterns pour [sigh] - moments de relâchement
  const sighPatterns = [
    /(\brelâche[zs]?\b[^.]*\.)/gi,
    /(\blâche[zs]?\b[^.]*\.)/gi,
    /(\bdétend[s]?[^.]*\.)/gi,
    /(\blaisse[zs]? aller\b[^.]*\.)/gi,
    /(\babandonne[zs]?\b[^.]*\.)/gi
  ];

  sighPatterns.forEach(pattern => {
    processed = processed.replace(pattern, '[sigh] $1');
  });

  // Ajouter [softly] au début des paragraphes intimes
  const softPatterns = [
    /(\bDoucement\b)/gi,
    /(\bTout doucement\b)/gi,
    /(\bAvec douceur\b)/gi,
    /(\bTendrement\b)/gi
  ];

  softPatterns.forEach(pattern => {
    processed = processed.replace(pattern, '[softly] $1');
  });

  // Ajouter [calmly] pour les instructions calmes
  const calmPatterns = [
    /(\bMaintenant\b)/gi,
    /(\bÀ présent\b)/gi,
    /(\bPrenez le temps\b)/gi,
    /(\bPrends le temps\b)/gi
  ];

  calmPatterns.forEach(pattern => {
    processed = processed.replace(pattern, '[calmly] $1');
  });

  // Ajouter [gently] pour les phrases bienveillantes
  const gentlePatterns = [
    /(\bAccueille[zs]?\b)/gi,
    /(\bPermets-toi\b)/gi,
    /(\bPermettez-vous\b)/gi,
    /(\bOffre[zs]?-toi\b)/gi,
    /(\bSois\b[^.]*bienveillant)/gi
  ];

  gentlePatterns.forEach(pattern => {
    processed = processed.replace(pattern, '[gently] $1');
  });

  // Ajouter [slowly] pour les moments de pause
  const slowPatterns = [
    /(\bPause\b)/gi,
    /(\bSilence\b)/gi,
    /(\bPrends? un moment\b)/gi,
    /(\bPrenez un moment\b)/gi
  ];

  slowPatterns.forEach(pattern => {
    processed = processed.replace(pattern, '[slowly] $1');
  });

  // Remplacer les ... par une pause naturelle
  processed = processed.replace(/\.\.\./g, '... [breath]');

  // Ajouter des respirations entre les paragraphes (doubles sauts de ligne)
  processed = processed.replace(/\n\n+/g, '\n\n[breath]\n\n');

  // Nettoyer les tags en double
  processed = processed.replace(/\[breath\]\s*\[breath\]/g, '[breath]');
  processed = processed.replace(/\[sigh\]\s*\[sigh\]/g, '[sigh]');

  console.log(`🏷️ Audio tags inserted. Original: ${text.length} chars, With tags: ${processed.length} chars`);

  return processed;
}

/**
 * Prépare le texte pour ElevenLabs V3
 * - Insère les audio tags appropriés
 * - Nettoie le formatage
 * - Ajoute un contexte québécois pour ancrer l'accent
 */
function prepareTextForV3(text, isMeditation = true) {
  // Insérer les audio tags
  let processed = insertAudioTags(text, isMeditation);

  // Nettoyer les sauts de ligne multiples
  processed = processed.replace(/\n{3,}/g, '\n\n');

  // Ajouter un préambule québécois invisible pour ancrer l'accent
  // Cette technique utilise previous_text conceptuellement via le texte lui-même
  const quebecPrimer = isMeditation
    ? '[softly] '
    : '[warmly] ';

  processed = `${quebecPrimer}${processed}`;

  return processed.trim();
}

// ============================================================================
// GÉNÉRATION AUDIO V3
// ============================================================================

/**
 * Génère l'audio avec ElevenLabs V3
 *
 * Le modèle V3 est conçu pour:
 * - Interpréter les audio tags [breath], [sigh], [softly], etc.
 * - Maintenir une meilleure cohérence sur les longs textes
 * - Produire des vocalisations naturelles et expressives
 *
 * @param text - Texte avec audio tags insérés
 * @param voiceId - ID de la voix ElevenLabs
 * @param voiceSettings - Paramètres de la voix
 * @returns Buffer audio MP3
 */
async function generateAudioV3(text, voiceId, voiceSettings) {
  console.log(`  📤 Calling ElevenLabs V3 API...`);
  console.log(`  📝 Text length: ${text.length} chars`);

  // Utilise fr-CA pour forcer l'accent québécois
  // fr-CA = français canadien (québécois) vs fr-FR = français de France
  const requestBody = {
    text: text,
    model_id: 'eleven_v3',
    // language_code retiré - eleven_v3 ne le supporte pas, la voix Iza a déjà l'accent québécois
    // language_code: 'fr', // RETIRÉ - forçait l'accent français de France
    voice_settings: voiceSettings,
    output_format: 'mp3_44100_192'
  };

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': process.env.ELEVENLABS_API_KEY
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`  ❌ ElevenLabs V3 API error:`, response.status, errorBody);
    throw new Error(`ElevenLabs V3 API error: ${response.status} - ${errorBody}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  console.log(`  ✅ Audio generated: ${audioBuffer.length} bytes (${(audioBuffer.length / 1024).toFixed(1)} KB)`);

  return audioBuffer;
}

/**
 * Génère l'audio complet avec ElevenLabs V3 et audio tags
 *
 * ARCHITECTURE V3:
 * 1. Insère automatiquement les audio tags dans le texte
 * 2. Envoie le texte complet en un seul appel API
 * 3. V3 interprète les tags pour expressivité naturelle
 *
 * Cette approche garantit:
 * - Respirations naturelles aux bons moments
 * - Soupirs apaisés pour le relâchement
 * - Ton doux et calme pour la méditation
 * - Cohérence vocale sur toute la durée
 */
async function generateMeditationAudio(text, guideType) {
  const isMeditation = guideType !== 'reflection';
  const type = isMeditation ? 'meditation' : 'reflection';

  const voiceId = VOICE_IDS[type];
  const voiceSettings = VOICE_SETTINGS[type];

  console.log(`📝 Original text length: ${text.length} chars`);
  console.log(`🎭 Voice type: ${type}`);
  console.log(`🤖 Model: eleven_v3`);

  // Préparer le texte avec audio tags
  const preparedText = prepareTextForV3(text, isMeditation);
  console.log(`🏷️ Prepared text with audio tags: ${preparedText.length} chars`);

  // Log un aperçu du texte préparé (premiers 500 chars)
  console.log(`📄 Preview: ${preparedText.substring(0, 500)}...`);

  // Générer l'audio avec V3
  const audioBuffer = await generateAudioV3(preparedText, voiceId, voiceSettings);

  console.log(`✅ Final audio: ${audioBuffer.length} bytes (${(audioBuffer.length / 1024).toFixed(1)} KB)`);

  return audioBuffer;
}

// ============================================================================
// HANDLER PRINCIPAL
// ============================================================================

export default async function handler(req, res) {
  // 🔐 CORS SÉCURISÉ
  if (!handleCORS(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ⚡ RATE LIMITING
  const rateLimit = checkRateLimit(req, '/api/audio');
  addRateLimitHeaders(res, { ...rateLimit, endpoint: '/api/audio' });

  if (!rateLimit.allowed) {
    console.warn(`🚫 Rate limit exceeded for audio`);
    return res.status(429).json({
      error: 'Too Many Requests',
      message: rateLimit.message,
      retryAfter: rateLimit.retryAfter
    });
  }

  try {
    const { text, guideType } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Missing text field' });
    }

    console.log('=== ELEVENLABS V3 AUDIO GENERATION ===');
    console.log('Guide Type:', guideType);
    console.log('Text length:', text.length, 'characters');

    // Générer l'audio avec V3 et audio tags
    const audioBuffer = await generateMeditationAudio(text, guideType);

    // Convertir en base64
    const base64Audio = audioBuffer.toString('base64');

    console.log('=== GENERATION COMPLETE ===');

    res.status(200).json({ audio: base64Audio });

  } catch (error) {
    console.error('Error generating audio:', error);
    res.status(500).json({ error: 'Failed to generate audio', details: error.message });
  }
}
