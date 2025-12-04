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
   * Convert text to SSML for meditation (Iza) - SIMPLIFIED VERSION
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

  /**
   * Convert text to SSML for reflection (Dann)
   * More conversational pace with slower questions to invite reflection
   */
  function convertToReflectionSSML(text) {
    // Nettoyage similaire à méditation
    text = text.replace(/\.\.\./g, '... '); // Keep ellipsis natural
    text = text.replace(/\n\n+/g, '. '); // Paragraph breaks become natural pauses
    text = text.replace(/\n/g, ', '); // Line breaks become slight pauses

    // Questions → plus lentes (0.62) pour inviter à réfléchir
    // Le reste sera au rythme de base (0.72, plus vif qu'Iza)
    text = text.replace(/([^.!?]*\?)/g, '<prosody rate="0.62">$1</prosody>');

    // Rythme conversationnel de base (plus vif que méditation)
    return `<speak><prosody rate="0.72">${text}</prosody></speak>`;
  }

  try {
    const { text, guideType } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Missing text field' });
    }

    // Apply SSML for both guides with appropriate pacing
    const processedText = guideType === 'meditation'
      ? convertToMeditationSSML(text)
      : convertToReflectionSSML(text);

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

    // Voice settings optimisés par guide
    // Iza: voix remixée → besoin de plus de stabilité, moins de style
    // Dann: voix native → plus de liberté, plus expressif pour les questions
    const voiceSettings = guideType === 'reflection'
      ? {
          // DANN - Voix native, plus conversationnel et expressif
          stability: 0.65,           // Plus naturel/conversationnel
          similarity_boost: 0.75,    // Standard
          style: 0.30,               // Plus expressif (questions, emphase)
          use_speaker_boost: true
        }
      : {
          // IZA - Voix remixée, besoin de stabilité pour éviter artifacts
          stability: 0.78,           // AUGMENTÉ pour stabilité
          similarity_boost: 0.80,    // Légèrement réduit
          style: 0.15,               // RÉDUIT pour moins d'artifacts
          use_speaker_boost: true
        };

    // ElevenLabs API - avec SSML pour contrôle du rythme
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
        model_id: 'eleven_multilingual_v2',  // ✅ OPTIMAL - Meilleur modèle multilingue
        language_code: 'fr',                 // Force la langue française
        voice_settings: voiceSettings,       // Settings conditionnels par guide
        seed: 42,                            // Seed fixe pour génération déterministe
        pronunciation_dictionary_locators: [],
        output_format: 'mp3_44100_192'       // Qualité maximale MP3 (192kbps)
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
