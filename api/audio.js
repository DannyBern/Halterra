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
   * Convert text to SSML for meditation - SIMPLIFIED VERSION
   * Uses only essential SSML to avoid conflicts with remixed voice
   */
  function convertToMeditationSSML(text, speed = 'normal') {
    // Simple text replacements without complex SSML nesting
    // Add pauses for meditation pacing
    text = text.replace(/\.\.\./g, '... '); // Keep ellipsis natural
    text = text.replace(/\n\n+/g, '. '); // Paragraph breaks become natural pauses
    text = text.replace(/\n/g, ', '); // Line breaks become slight pauses

    // Vitesses ajustées: normale = 0.68
    const speedMap = {
      'fast': 0.80,
      'normal': 0.68,
      'slow': 0.55,
      'very-slow': 0.45
    };
    const rate = speedMap[speed] || 0.68;

    // Simple SSML - just rate control, no pitch adjustment for remixed voice
    return `<speak><prosody rate="${rate}">${text}</prosody></speak>`;
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
    // Méditation = Voix féminine Iza (remixée pour méditation), Réflexion = Voix masculine Dann
    const voiceId = guideType === 'reflection'
      ? '93nuHbke4dTER9x2pDwE'  // Voix masculine Dann pour réflexion
      : 'GiS6AIV70BEfI1ncL4Vg';  // Voix féminine Iza remixée pour méditation

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
          // OPTIMISÉ 2025-12-04 - Stabilité pour voix remixée
          stability: 0.70,               // Équilibré: stable mais naturel
          similarity_boost: 0.85,        // AUGMENTÉ: Meilleure fidélité au remix
          style: 0.20,                   // RÉDUIT: Expressivité modérée pour éviter artifacts
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
