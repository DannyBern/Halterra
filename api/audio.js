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
 * On utilise 2x ce buffer pour créer 4 secondes de pause
 */
const silenceBuffer = Buffer.from(SILENCE_2S_BASE64, 'base64');

/**
 * Retire les ID3 tags d'un buffer MP3 pour permettre la concaténation
 * ID3v2 est au début (commence par "ID3")
 * ID3v1 est à la fin (128 derniers bytes commençant par "TAG")
 */
function stripID3Tags(buffer) {
  let start = 0;
  let end = buffer.length;

  // Retirer ID3v2 au début (si présent)
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) { // "ID3"
    // Lire la taille du tag ID3v2 (syncsafe integer sur 4 bytes)
    const size = (buffer[6] << 21) | (buffer[7] << 14) | (buffer[8] << 7) | buffer[9];
    start = 10 + size;
    console.log(`  → ID3v2 tag removed (${start} bytes)`);
  }

  // Retirer ID3v1 à la fin (si présent) - 128 bytes commençant par "TAG"
  if (end > 128) {
    const tagStart = end - 128;
    if (buffer[tagStart] === 0x54 && buffer[tagStart + 1] === 0x41 && buffer[tagStart + 2] === 0x47) { // "TAG"
      end = tagStart;
      console.log(`  → ID3v1 tag removed (128 bytes)`);
    }
  }

  return buffer.slice(start, end);
}

/**
 * Découpe le texte en paragraphes pour la segmentation
 *
 * Stratégie: Garder chaque paragraphe comme segment séparé pour:
 * - Maximiser la stabilité vocale (segments courts)
 * - Éviter les timeouts ElevenLabs sur segments longs
 * - Permettre des pauses naturelles entre paragraphes
 *
 * Limite: ~500 caractères par segment pour éviter la dérive d'accent
 */
function splitIntoParagraphs(text) {
  // Séparer par double saut de ligne (paragraphes)
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim());

  if (paragraphs.length === 0) {
    return [text];
  }

  // Si un seul paragraphe mais long, découper par phrases
  if (paragraphs.length === 1 && text.length > 500) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    if (sentences.length > 1) {
      // Regrouper les phrases en segments de ~400-500 caractères
      const segments = [];
      let currentSegment = '';

      for (const sentence of sentences) {
        if (currentSegment.length + sentence.length > 450 && currentSegment.length > 0) {
          segments.push(currentSegment.trim());
          currentSegment = sentence;
        } else {
          currentSegment += (currentSegment ? ' ' : '') + sentence;
        }
      }
      if (currentSegment.trim()) {
        segments.push(currentSegment.trim());
      }
      return segments;
    }
  }

  // Vérifier si des paragraphes sont trop longs et les découper
  const finalSegments = [];
  for (const paragraph of paragraphs) {
    if (paragraph.length > 600) {
      // Paragraphe trop long - découper par phrases
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      let currentSegment = '';

      for (const sentence of sentences) {
        if (currentSegment.length + sentence.length > 500 && currentSegment.length > 0) {
          finalSegments.push(currentSegment.trim());
          currentSegment = sentence;
        } else {
          currentSegment += (currentSegment ? ' ' : '') + sentence;
        }
      }
      if (currentSegment.trim()) {
        finalSegments.push(currentSegment.trim());
      }
    } else {
      finalSegments.push(paragraph);
    }
  }

  return finalSegments;
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
 * NOTE: On n'utilise PAS previous_request_ids car il entre en conflit
 * avec previous_text/next_text (quand les deux sont présents, previous_text est ignoré).
 * On préfère garder le contexte émotionnel pour stabiliser l'accent québécois.
 */
async function generateSegmentAudio(
  text,
  voiceId,
  voiceSettings,
  emotionalContext,
  segmentIndex,
  totalSegments
) {
  console.log(`  📤 Calling ElevenLabs API for segment ${segmentIndex + 1}/${totalSegments}...`);
  console.log(`  📝 Text length: ${text.length} chars`);

  const requestBody = {
    text: text,
    model_id: 'eleven_multilingual_v2',
    language_code: 'fr',
    voice_settings: voiceSettings,
    previous_text: emotionalContext.previous_text,
    next_text: emotionalContext.next_text,
    seed: 42,
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
    console.error(`  ❌ ElevenLabs API error for segment ${segmentIndex + 1}:`, response.status, errorBody);
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorBody}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  console.log(`  ✅ Segment ${segmentIndex + 1} generated: ${audioBuffer.length} bytes`);

  return { audioBuffer };
}

/**
 * Génère l'audio complet avec segmentation
 * - Découpe en paragraphes
 * - Génère chaque segment séparément (avec contexte émotionnel)
 * - Concatène avec silences de 4 secondes
 */
async function generateSegmentedAudio(text, guideType) {
  const isMeditation = guideType !== 'reflection';
  const type = isMeditation ? 'meditation' : 'reflection';

  const voiceId = VOICE_IDS[type];
  const voiceSettings = VOICE_SETTINGS[type];
  const emotionalContext = EMOTIONAL_CONTEXT[type];

  // Découper en paragraphes
  const paragraphs = splitIntoParagraphs(text);
  console.log(`📝 Text split into ${paragraphs.length} segment(s)`);
  paragraphs.forEach((p, i) => {
    console.log(`   Segment ${i + 1}: ${p.length} chars - "${p.substring(0, 50)}..."`);
  });

  // Si un seul segment court, pas besoin de segmentation
  if (paragraphs.length === 1 && text.length < 600) {
    console.log('📄 Single short segment - no segmentation needed');
    const preparedText = prepareSegment(paragraphs[0]);
    const { audioBuffer } = await generateSegmentAudio(
      preparedText,
      voiceId,
      voiceSettings,
      emotionalContext,
      0,
      1
    );
    return audioBuffer;
  }

  // Générer chaque segment séquentiellement
  const audioBuffers = [];
  const silence = silenceBuffer;
  const cleanSilence = stripID3Tags(silence);

  console.log(`🔊 Starting generation of ${paragraphs.length} segments...`);

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];
    console.log(`\n🎙️ === SEGMENT ${i + 1}/${paragraphs.length} ===`);
    console.log(`   Original length: ${paragraph.length} chars`);

    try {
      const preparedText = prepareSegment(paragraph);
      console.log(`   Prepared length: ${preparedText.length} chars`);

      const { audioBuffer } = await generateSegmentAudio(
        preparedText,
        voiceId,
        voiceSettings,
        emotionalContext,
        i,
        paragraphs.length
      );

      // Retirer les ID3 tags pour la concaténation
      const cleanBuffer = stripID3Tags(audioBuffer);
      console.log(`   Clean buffer: ${cleanBuffer.length} bytes`);
      audioBuffers.push(cleanBuffer);

      // Ajouter le silence entre les segments (sauf après le dernier)
      if (i < paragraphs.length - 1) {
        // 4 secondes = 2x le fichier de 2 secondes
        audioBuffers.push(cleanSilence);
        audioBuffers.push(cleanSilence);
        console.log(`   ⏸️ Added ${SILENCE_DURATION_SECONDS}s silence`);
      }

    } catch (error) {
      console.error(`   ❌ FAILED to generate segment ${i + 1}:`, error.message);
      throw error; // Re-throw pour arrêter la génération
    }
  }

  // Concaténer tous les buffers
  console.log(`\n🔗 Concatenating ${audioBuffers.length} audio chunks...`);
  const concatenated = Buffer.concat(audioBuffers);
  console.log(`✅ Final audio: ${concatenated.length} bytes (${(concatenated.length / 1024).toFixed(1)} KB)`);

  return concatenated;
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
