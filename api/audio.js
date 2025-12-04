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
   * Prépare le texte pour la synthèse vocale (sans SSML)
   * On utilise le paramètre `speed` natif d'ElevenLabs pour plus de stabilité
   */
  function prepareText(text) {
    // Nettoyage du texte pour pauses naturelles via ponctuation
    text = text.replace(/\.\.\./g, '... '); // Ellipses naturelles
    text = text.replace(/\n\n+/g, '. ');    // Paragraphes → pause longue
    text = text.replace(/\n/g, ', ');       // Lignes → pause courte
    return text;
  }

  try {
    const { text, guideType } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Missing text field' });
    }

    // Préparer le texte (sans SSML - on utilise le speed natif d'ElevenLabs)
    const processedText = prepareText(text);

    // Log du texte complet envoyé à ElevenLabs
    console.log('=== FULL TEXT SENT TO ELEVENLABS ===');
    console.log('Guide Type:', guideType);
    console.log(processedText);
    console.log('=== END TEXT ===');

    // Choisir la voix selon le type de guide
    // Méditation = Voix féminine Iza, Réflexion = Voix masculine Dann
    const voiceId = guideType === 'reflection'
      ? '93nuHbke4dTER9x2pDwE'  // Voix masculine Dann pour réflexion
      : 'xsNzdCmWJpYoa80FaXJi';  // Voix féminine Iza (voix personnalisée)

    // Voice settings optimisés pour STABILITÉ D'ACCENT
    // Documentation ElevenLabs recommande:
    // - stability haute pour consistance
    // - style à 0 pour éviter instabilité
    // - speed natif (0.7-1.2) au lieu de SSML prosody
    const voiceSettings = guideType === 'reflection'
      ? {
          // DANN - Réflexion socratique, conversationnel
          stability: 0.60,           // Légèrement variable pour questions
          similarity_boost: 0.75,    // Standard
          style: 0.15,               // Peu de style pour stabilité
          speed: 0.85,               // Légèrement ralenti
          use_speaker_boost: true
        }
      : {
          // IZA - Méditation calme, lente, stable
          // Priorité: stabilité accent québécois > expressivité
          stability: 0.85,           // HAUTE - consistance accent
          similarity_boost: 0.90,    // HAUTE - fidélité à la voix originale
          style: 0.0,                // ZÉRO - recommandé par ElevenLabs pour stabilité
          speed: 0.75,               // LENT - méditation posée (min 0.7)
          use_speaker_boost: true
        };

    // ElevenLabs API - SANS SSML, avec speed natif
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
        model_id: 'eleven_multilingual_v2',  // Meilleur modèle multilingue
        voice_settings: voiceSettings,       // Settings avec speed natif
        seed: 42,                            // Seed fixe pour reproductibilité
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
