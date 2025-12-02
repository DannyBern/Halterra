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
   */
  function convertToMeditationSSML(text) {
    // Wrap entire text in slow prosody for meditation
    return `<speak><prosody rate="0.80" pitch="-4%">${text}</prosody></speak>`;
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
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: processedText,
        model_id: 'eleven_multilingual_v2',  // ✅ OPTIMAL - Meilleur modèle pour méditations (richesse émotionnelle supérieure)
        language_code: 'fr',             // Force la langue française (évite auto-détection erronnée)
        voice_settings: {
          // OPTIMISÉ 2025-12-02 - Basé sur best practices ElevenLabs pour méditations
          // Recherche: plage optimale méditation 60-85% stability, 75-80% similarity
          stability: 0.72,               // OPTIMISÉ: 0.95→0.72 Sweet spot naturel/calme (vs robotique)
          similarity_boost: 0.78,        // OPTIMISÉ: 0.60→0.78 Fidélité maximale clone sans artefacts
          style: 0,                      // ✅ GARDER: Zéro style prévient variations émotionnelles
          use_speaker_boost: true        // ✅ GARDER: Améliore cohérence du clone vocal
        },
        seed: 42,                        // Seed fixe pour génération déterministe
        pronunciation_dictionary_locators: [],
        output_format: 'mp3_44100_128'   // Qualité audio maximale : 44.1kHz, 128kbps
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
