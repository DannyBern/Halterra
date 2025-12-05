import { checkRateLimit, addRateLimitHeaders } from '../lib/rateLimit.js';
import { handleCORS } from '../lib/corsConfig.js';

/**
 * TECHNIQUE D'INJECTION ÉMOTIONNELLE ELEVENLABS (CORRIGÉE)
 *
 * Le next_text doit être COURT - comme une didascalie de scénario.
 * Le texte principal est entre guillemets pour simuler un dialogue lu.
 * Ajout du language_code pour forcer le français canadien.
 *
 * Sources:
 * - https://elevenlabs.io/docs/api-reference/text-to-speech/convert
 * - https://elevenlabs.io/docs/best-practices/prompting/controls
 */

// Contexte émotionnel COURT pour méditation (voix Iza)
// Format: comme si on lisait un livre avec indication de jeu
// IMPORTANT: Mention explicite "québécoise" pour ancrer l'accent
const MEDITATION_EMOTIONAL_CONTEXT = {
  // Texte qui "précède" - établit le contexte émotionnel initial (COURT)
  // Mention "québécoise" pour ancrer l'accent dès le départ
  previous_text: `La guide québécoise ferme les yeux, respirant lentement.`,
  // Texte qui "suit" - indique COMMENT le texte est prononcé (COURT - clé!)
  // Ton calme et posé, sans énergie excessive
  next_text: `, murmure-t-elle tout bas, gardant son calme jusqu'à la fin.`
};

// Contexte émotionnel COURT pour réflexion (voix Dann)
const REFLECTION_EMOTIONAL_CONTEXT = {
  previous_text: `Il te regarde avec bienveillance.`,
  next_text: `, dit-il d'un ton posé et réfléchi.`
};

export default async function handler(req, res) {
  // 🔐 CORS SÉCURISÉ - Whitelist origines autorisées
  if (!handleCORS(req, res)) {
    return; // Bloqué ou OPTIONS traité
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ⚡ RATE LIMITING - Protection contre les abus
  const rateLimit = checkRateLimit(req, '/api/audio');
  addRateLimitHeaders(res, { ...rateLimit, endpoint: '/api/audio' });

  if (!rateLimit.allowed) {
    console.warn(`🚫 Rate limit exceeded for audio - IP: ${req.headers['x-forwarded-for'] || 'unknown'}`);
    return res.status(429).json({
      error: 'Too Many Requests',
      message: rateLimit.message,
      retryAfter: rateLimit.retryAfter
    });
  }

  console.log(`✅ Rate limit check passed - Remaining: ${rateLimit.remaining}/${15}`);

  /**
   * Prépare le texte pour la synthèse vocale
   * - Entoure de guillemets (technique dialogue lu)
   * - Ajoute VRAIES pauses SSML entre paragraphes (4s = 2x 2s car max 3s)
   * - Pauses courtes entre lignes
   */
  function prepareText(text, isMeditation) {
    // Nettoyage du texte
    text = text.replace(/\.\.\./g, '... '); // Ellipses naturelles

    // PAUSES SSML pour méditation (4 secondes entre paragraphes)
    // ElevenLabs max = 3s, donc on utilise 2x 2s pour 4 secondes
    if (isMeditation) {
      text = text.replace(/\n\n+/g, '. <break time="2s"/><break time="2s"/> ');
      text = text.replace(/\n/g, '. <break time="0.8s"/> ');
    } else {
      // Réflexion: pauses plus courtes
      text = text.replace(/\n\n+/g, '. <break time="1.5s"/> ');
      text = text.replace(/\n/g, '. <break time="0.5s"/> ');
    }

    // Entourer de guillemets pour simuler un dialogue lu
    // Cela permet au next_text d'agir comme une indication de jeu
    return `"${text}"`;
  }

  try {
    const { text, guideType } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Missing text field' });
    }

    const isMeditation = guideType !== 'reflection';

    // Préparer le texte
    const processedText = prepareText(text, isMeditation);

    // Log complet des paramètres envoyés à ElevenLabs
    console.log('=== ELEVENLABS REQUEST CONFIG ===');
    console.log('Guide Type:', guideType);
    console.log('Voice ID:', guideType === 'reflection' ? '93nuHbke4dTER9x2pDwE (Dann)' : 'xsNzdCmWJpYoa80FaXJi (Iza)');
    console.log('Emotional Injection: ENABLED (short format)');
    console.log('Text wrapped in quotes: YES');
    console.log('Language Code: fr');
    console.log('Text preview:', processedText.substring(0, 100) + '...');
    console.log('=== END CONFIG ===');

    // Choisir la voix selon le type de guide
    const voiceId = guideType === 'reflection'
      ? '93nuHbke4dTER9x2pDwE'  // Voix masculine Dann pour réflexion
      : 'xsNzdCmWJpYoa80FaXJi';  // Voix féminine Iza (voix personnalisée)

    // Sélectionner le contexte émotionnel approprié
    const emotionalContext = isMeditation
      ? MEDITATION_EMOTIONAL_CONTEXT
      : REFLECTION_EMOTIONAL_CONTEXT;

    // Voice settings optimisés pour STABILITÉ D'ACCENT MAXIMALE
    // La technique next_text + guillemets gère le ton méditatif
    // On peut donc pousser la stabilité au maximum pour l'accent
    const voiceSettings = guideType === 'reflection'
      ? {
          // DANN - Réflexion socratique, conversationnel mais posé
          stability: 0.70,           // Équilibré
          similarity_boost: 0.85,    // Bonne fidélité
          style: 0.05,               // Minimal - accent stable
          speed: 0.82,               // Légèrement ralenti
          use_speaker_boost: true
        }
      : {
          // IZA - Méditation calme, ACCENT QUÉBÉCOIS ULTRA-STABLE
          // Stabilité MAXIMALE pour éviter toute dérive d'accent ou de ton
          // Le ton méditatif vient du next_text + guillemets
          stability: 0.95,           // MAXIMUM - accent québécois ultra-stable
          similarity_boost: 0.95,    // MAXIMUM - fidélité totale à la voix originale
          style: 0.0,                // ZÉRO - aucune variation stylistique
          speed: 0.72,               // Plus lent pour éviter accélération en fin de texte
          use_speaker_boost: true    // Clarté vocale
        };

    // ElevenLabs API avec INJECTION ÉMOTIONNELLE + LANGUAGE CODE
    // Technique combinée: guillemets + next_text court + stabilité max
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: processedText,
        model_id: 'eleven_multilingual_v2',
        language_code: 'fr',           // Force le français (aide stabilité accent)
        voice_settings: voiceSettings,
        // 🎭 INJECTION ÉMOTIONNELLE - Didascalies courtes
        previous_text: emotionalContext.previous_text,
        next_text: emotionalContext.next_text,
        seed: 42,                       // Reproductibilité
        output_format: 'mp3_44100_192'
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('ElevenLabs API error:', response.status, errorBody);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorBody}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');

    res.status(200).json({ audio: base64Audio });

  } catch (error) {
    console.error('Error generating audio:', error);
    res.status(500).json({ error: 'Failed to generate audio', details: error.message });
  }
}
