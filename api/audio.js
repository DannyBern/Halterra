import { checkRateLimit, addRateLimitHeaders } from '../lib/rateLimit.js';
import { handleCORS } from '../lib/corsConfig.js';

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
   * Convert text to SSML for meditation - forces slow, calm delivery
   * Clone was created with normal conversation, so we force meditation pacing
   * Vitesse normale: 0.68 (15% plus lent que 0.80 précédent)
   */
  function convertToMeditationSSML(text, speed = 'normal') {
    // Vitesses ajustées: normale = 0.68, lente = 0.55, très lente = 0.45
    const speedMap = {
      'fast': 0.80,      // Vitesse rapide (ancienne normale)
      'normal': 0.68,    // Vitesse normale (-15% vs ancienne)
      'slow': 0.55,      // Vitesse lente
      'very-slow': 0.45  // Très lent pour méditations profondes
    };
    const rate = speedMap[speed] || 0.68;
    return `<speak><prosody rate="${rate}" pitch="-4%">${text}</prosody></speak>`;
  }

  try {
    const { text, guideType } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Missing text field' });
    }

    // Apply SSML for meditation voice (clone was trained on normal conversation)
    const processedText = guideType === 'meditation'
      ? convertToMeditationSSML(text)
      : text;

    // Log du texte complet envoyé à ElevenLabs
    console.log('=== FULL TEXT SENT TO ELEVENLABS ===');
    console.log('Guide Type:', guideType);
    console.log(processedText);
    console.log('=== END TEXT ===');

    // Choisir la voix selon le type de guide
    // Méditation = Voix féminine Iza, Réflexion = Voix masculine Dann
    const voiceId = guideType === 'reflection'
      ? '93nuHbke4dTER9x2pDwE'  // Voix masculine Dann pour réflexion
      : 'xsNzdCmWJpYoa80FaXJi';  // Voix féminine Iza pour méditation (clone conversation)

    // ElevenLabs API - avec SSML pour forcer rythme méditatif
    // Format mp3_44100_192 = meilleure qualité MP3 disponible (192kbps vs 128kbps)
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: processedText,
        model_id: 'eleven_multilingual_v2',  // ✅ OPTIMAL - Meilleur modèle pour méditations
        language_code: 'fr',                 // Force la langue française
        voice_settings: {
          // OPTIMISÉ 2025-12-03 - Clarté audio améliorée
          stability: 0.75,               // AUGMENTÉ: 0.72→0.75 Plus de clarté et moins d'artefacts
          similarity_boost: 0.80,        // AUGMENTÉ: 0.78→0.80 Meilleure fidélité au clone
          style: 0,                      // ✅ Zéro style = voix stable
          use_speaker_boost: true        // ✅ Améliore la clarté du clone vocal
        },
        seed: 42,                        // Seed fixe pour génération déterministe
        pronunciation_dictionary_locators: [],
        output_format: 'mp3_44100_192'   // AMÉLIORÉ: 128kbps→192kbps (qualité maximale MP3)
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
