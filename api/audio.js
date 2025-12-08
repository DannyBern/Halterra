import { checkRateLimit, addRateLimitHeaders } from '../lib/rateLimit.js';
import { handleCORS } from '../lib/corsConfig.js';
import { SILENCE_2S_BASE64 } from './silence.js';

/**
 * ARCHITECTURE DE SEGMENTATION AUDIO POUR STABILITÉ VOCALE
 *
 * Problème résolu: Sur les longs textes (>800 caractères), ElevenLabs peut:
 * - Changer d'accent (québécois → français)
 * - Modifier le ton (calme → énergique)
 * - Accélérer vers la fin
 *
 * Solution: Segmentation par paragraphes + Request Stitching + Concaténation
 *
 * 1. Découpe le texte en paragraphes (2-3 segments)
 * 2. Génère l'audio de chaque segment avec previous_request_ids
 * 3. Insère 4 secondes de silence entre chaque segment
 * 4. Concatène tous les buffers MP3
 *
 * Sources:
 * - https://elevenlabs.io/docs/cookbooks/text-to-speech/request-stitching
 * - https://help.elevenlabs.io/hc/en-us/articles/19631995406481
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

// Voix ElevenLabs
const VOICE_IDS = {
  meditation: 'xsNzdCmWJpYoa80FaXJi',  // Iza - voix féminine québécoise
  reflection: '93nuHbke4dTER9x2pDwE'   // Dann - voix masculine
};

// Contexte émotionnel pour ancrer l'accent et le ton
// IMPORTANT: Mention explicite "québécoise" pour stabiliser l'accent
const EMOTIONAL_CONTEXT = {
  meditation: {
    previous_text: `La guide québécoise ferme les yeux, respirant lentement.`,
    next_text: `, murmure-t-elle tout bas, gardant son calme jusqu'à la fin.`
  },
  reflection: {
    previous_text: `Il te regarde avec bienveillance.`,
    next_text: `, dit-il d'un ton posé et réfléchi.`
  }
};

// Voice settings optimisés pour stabilité maximale
const VOICE_SETTINGS = {
  meditation: {
    stability: 0.95,           // MAXIMUM - accent québécois ultra-stable
    similarity_boost: 0.95,    // MAXIMUM - fidélité totale à la voix originale
    style: 0.0,                // ZÉRO - aucune variation stylistique
    speed: 0.72,               // Lent pour méditation
    use_speaker_boost: true
  },
  reflection: {
    stability: 0.70,
    similarity_boost: 0.85,
    style: 0.05,
    speed: 0.82,
    use_speaker_boost: true
  }
};

// Durée du silence entre paragraphes (en secondes)
const SILENCE_DURATION_SECONDS = 4;

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Buffer de silence MP3 (2 secondes, 44.1kHz)
 * Stocké en base64 pour compatibilité Vercel Serverless
 */
const silenceBuffer = Buffer.from(SILENCE_2S_BASE64, 'base64');

// ============================================================================
// CONCATÉNATION MP3 PAR FRAMES
// ============================================================================

/**
 * Trouve le début des données audio MP3 (après les tags ID3v2)
 * Les frames MP3 commencent par le sync word 0xFF 0xFB/0xFA/0xF3/0xF2
 */
function findMP3DataStart(buffer) {
  let offset = 0;

  // Vérifier si ID3v2 tag présent
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) { // "ID3"
    // Lire la taille du tag ID3v2 (syncsafe integer sur 4 bytes)
    const size = (buffer[6] << 21) | (buffer[7] << 14) | (buffer[8] << 7) | buffer[9];
    offset = 10 + size;
  }

  // Chercher le premier frame sync (0xFF suivi de 0xFB, 0xFA, 0xF3, 0xF2, ou 0xE*)
  while (offset < buffer.length - 1) {
    if (buffer[offset] === 0xFF && (buffer[offset + 1] & 0xE0) === 0xE0) {
      return offset;
    }
    offset++;
  }

  return 0; // Fallback au début
}

/**
 * Trouve la fin des données audio MP3 (avant les tags ID3v1)
 */
function findMP3DataEnd(buffer) {
  let end = buffer.length;

  // Vérifier si ID3v1 tag présent (128 derniers bytes commençant par "TAG")
  if (end > 128) {
    const tagStart = end - 128;
    if (buffer[tagStart] === 0x54 && buffer[tagStart + 1] === 0x41 && buffer[tagStart + 2] === 0x47) {
      end = tagStart;
    }
  }

  return end;
}

/**
 * Extrait uniquement les frames audio MP3 (sans headers/tags)
 */
function extractMP3Frames(buffer) {
  const start = findMP3DataStart(buffer);
  const end = findMP3DataEnd(buffer);
  return buffer.slice(start, end);
}

/**
 * Concatène plusieurs buffers MP3 de manière propre
 *
 * IMPORTANT: Cette méthode fonctionne car ElevenLabs génère des MP3 avec
 * les mêmes paramètres (44.1kHz, 192kbps, stéréo). Les frames sont donc
 * compatibles et peuvent être concaténées directement.
 *
 * @param buffers - Array de buffers MP3
 * @returns Buffer MP3 concaténé
 */
function concatenateMP3Buffers(buffers) {
  if (buffers.length === 0) return Buffer.alloc(0);
  if (buffers.length === 1) return buffers[0];

  console.log(`🔗 Concatenating ${buffers.length} MP3 buffers...`);

  // Extraire les frames de chaque buffer
  const frameBuffers = buffers.map((buf, idx) => {
    const frames = extractMP3Frames(buf);
    console.log(`   Buffer ${idx + 1}: ${buf.length} bytes → ${frames.length} bytes (frames only)`);
    return frames;
  });

  // Concaténer tous les frames
  const result = Buffer.concat(frameBuffers);
  console.log(`   Total: ${result.length} bytes`);

  return result;
}

/**
 * Découpe le texte en segments pour la génération audio
 *
 * Stratégie: Regrouper les paragraphes en 3-5 segments pour:
 * - Éviter trop d'appels API (coûteux et lents)
 * - Garder des segments assez courts pour la stabilité vocale (~800-1200 chars)
 * - Permettre une concaténation propre
 *
 * MAX_SEGMENTS: 5 segments maximum
 * TARGET_SEGMENT_SIZE: ~1000 caractères par segment
 */
const MAX_SEGMENTS = 5;
const TARGET_SEGMENT_SIZE = 1000;

function splitIntoSegments(text) {
  // Séparer par double saut de ligne (paragraphes)
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());

  if (paragraphs.length === 0) {
    return [text];
  }

  // Si le texte est court, pas besoin de segmentation
  if (text.length < 800) {
    return [text];
  }

  // Calculer le nombre idéal de segments
  const idealSegments = Math.min(MAX_SEGMENTS, Math.ceil(text.length / TARGET_SEGMENT_SIZE));

  // Si on a peu de paragraphes, les garder tels quels
  if (paragraphs.length <= idealSegments) {
    return paragraphs;
  }

  // Regrouper les paragraphes pour avoir ~idealSegments segments
  const paragraphsPerSegment = Math.ceil(paragraphs.length / idealSegments);
  const segments = [];

  for (let i = 0; i < paragraphs.length; i += paragraphsPerSegment) {
    const segmentParagraphs = paragraphs.slice(i, i + paragraphsPerSegment);
    segments.push(segmentParagraphs.join('\n\n'));
  }

  return segments;
}

/**
 * Prépare un segment de texte pour ElevenLabs
 * - Nettoie les ellipses
 * - Entoure de guillemets (technique dialogue lu)
 */
function prepareSegment(text) {
  let processed = text.trim();
  processed = processed.replace(/\.\.\./g, '... ');
  processed = processed.replace(/\n/g, '. '); // Lignes simples → pause courte
  return `"${processed}"`;
}

// ============================================================================
// GÉNÉRATION AUDIO SEGMENTÉE
// ============================================================================

/**
 * Génère l'audio d'un segment avec ElevenLabs
 *
 * Utilise previous_request_ids pour le Request Stitching quand disponible.
 * Cela permet à ElevenLabs de maintenir la continuité vocale entre segments.
 *
 * @param previousRequestIds - Array des IDs de requêtes précédentes (max 3)
 * @returns {audioBuffer, requestId} - Buffer audio et ID de la requête
 */
async function generateSegmentAudio(
  text,
  voiceId,
  voiceSettings,
  emotionalContext,
  segmentIndex,
  totalSegments,
  previousRequestIds = []
) {
  console.log(`  📤 Calling ElevenLabs API for segment ${segmentIndex + 1}/${totalSegments}...`);
  console.log(`  📝 Text length: ${text.length} chars`);
  if (previousRequestIds.length > 0) {
    console.log(`  🔗 Using ${previousRequestIds.length} previous request ID(s) for stitching`);
  }

  const requestBody = {
    text: text,
    model_id: 'eleven_multilingual_v2',
    language_code: 'fr',
    voice_settings: voiceSettings,
    seed: 42,
    output_format: 'mp3_44100_192'
  };

  // Pour le premier segment, utiliser le contexte émotionnel
  // Pour les suivants, utiliser previous_request_ids pour le stitching
  if (segmentIndex === 0) {
    requestBody.previous_text = emotionalContext.previous_text;
    requestBody.next_text = emotionalContext.next_text;
  } else if (previousRequestIds.length > 0) {
    // Utiliser les 3 derniers IDs maximum
    requestBody.previous_request_ids = previousRequestIds.slice(-3);
  }

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
    console.error(`  ❌ ElevenLabs API error for segment ${segmentIndex + 1}:`, response.status, errorBody);
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorBody}`);
  }

  // Récupérer le request_id pour le stitching des segments suivants
  const requestId = response.headers.get('request-id');
  console.log(`  🆔 Request ID: ${requestId}`);

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  console.log(`  ✅ Segment ${segmentIndex + 1} generated: ${audioBuffer.length} bytes`);

  return { audioBuffer, requestId };
}

/**
 * Génère l'audio complet avec segmentation et concaténation MP3
 *
 * ARCHITECTURE:
 * 1. Découpe le texte en 3-5 segments (~800-1200 chars chacun)
 * 2. Génère chaque segment avec ElevenLabs (stabilité vocale)
 * 3. Utilise Request Stitching pour continuité entre segments
 * 4. Concatène les frames MP3 (sans les headers/tags)
 * 5. Ajoute des silences de 4s entre segments
 *
 * Cette approche garantit:
 * - Stabilité de l'accent québécois sur les longs textes
 * - Audio complet jouable sans coupure
 * - Pauses naturelles entre les sections
 */
async function generateSegmentedAudio(text, guideType) {
  const isMeditation = guideType !== 'reflection';
  const type = isMeditation ? 'meditation' : 'reflection';

  const voiceId = VOICE_IDS[type];
  const voiceSettings = VOICE_SETTINGS[type];
  const emotionalContext = EMOTIONAL_CONTEXT[type];

  console.log(`📝 Total text length: ${text.length} chars`);
  console.log(`🎭 Voice type: ${type}`);

  // Découper en segments (3-5 max pour stabilité vocale)
  const segments = splitIntoSegments(text);
  console.log(`📦 Split into ${segments.length} segment(s)`);
  segments.forEach((s, i) => {
    console.log(`   Segment ${i + 1}: ${s.length} chars`);
  });

  // Si un seul segment court, génération directe
  if (segments.length === 1 && text.length < 1500) {
    console.log(`🎙️ Single segment mode - direct generation`);
    const preparedText = prepareSegment(segments[0]);
    const { audioBuffer } = await generateSegmentAudio(
      preparedText,
      voiceId,
      voiceSettings,
      emotionalContext,
      0,
      1,
      []
    );
    console.log(`✅ Audio generated: ${audioBuffer.length} bytes`);
    return audioBuffer;
  }

  // Génération multi-segments avec Request Stitching
  console.log(`🔊 Multi-segment generation with Request Stitching...`);

  const audioBuffers = [];
  const requestIds = [];
  const silenceFrames = extractMP3Frames(silenceBuffer);

  for (let i = 0; i < segments.length; i++) {
    console.log(`\n🎙️ === SEGMENT ${i + 1}/${segments.length} ===`);

    const preparedText = prepareSegment(segments[i]);
    console.log(`   Text: ${preparedText.length} chars`);

    try {
      const { audioBuffer, requestId } = await generateSegmentAudio(
        preparedText,
        voiceId,
        voiceSettings,
        emotionalContext,
        i,
        segments.length,
        requestIds
      );

      // Sauvegarder le requestId pour le stitching
      if (requestId) {
        requestIds.push(requestId);
      }

      // Ajouter les frames audio
      audioBuffers.push(audioBuffer);
      console.log(`   ✅ Generated: ${audioBuffer.length} bytes`);

      // Ajouter silence entre segments (sauf après le dernier)
      if (i < segments.length - 1) {
        // 4 secondes = 2x silence de 2s
        audioBuffers.push(silenceBuffer);
        audioBuffers.push(silenceBuffer);
        console.log(`   ⏸️ Added ${SILENCE_DURATION_SECONDS}s silence`);
      }

    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
      throw error;
    }
  }

  // Concaténer tous les buffers MP3 proprement
  console.log(`\n🔗 Final concatenation...`);
  const finalAudio = concatenateMP3Buffers(audioBuffers);
  console.log(`✅ Final audio: ${finalAudio.length} bytes (${(finalAudio.length / 1024).toFixed(1)} KB)`);

  return finalAudio;
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

    console.log('=== SEGMENTED AUDIO GENERATION ===');
    console.log('Guide Type:', guideType);
    console.log('Text length:', text.length, 'characters');

    // Générer l'audio avec segmentation
    const audioBuffer = await generateSegmentedAudio(text, guideType);

    // Convertir en base64
    const base64Audio = audioBuffer.toString('base64');

    console.log('=== GENERATION COMPLETE ===');

    res.status(200).json({ audio: base64Audio });

  } catch (error) {
    console.error('Error generating audio:', error);
    res.status(500).json({ error: 'Failed to generate audio', details: error.message });
  }
}
