import { checkRateLimit, addRateLimitHeaders } from '../lib/rateLimit.js';
import { handleCORS } from '../lib/corsConfig.js';

/**
 * TECHNIQUE D'INJECTION ÉMOTIONNELLE ELEVENLABS
 *
 * Utilise previous_text et next_text pour injecter un contexte émotionnel
 * sans que ce texte soit prononcé. C'est comme si on lisait un livre
 * avec des didascalies/indications de jeu.
 *
 * Sources:
 * - https://elevenlabs.io/docs/capabilities/text-to-speech
 * - https://medium.com/@tommywilczek/how-to-add-emotion-to-ai-voices-elevenlabs-2025
 */

// Contexte émotionnel pour méditation (voix Iza)
const MEDITATION_EMOTIONAL_CONTEXT = {
  // Texte qui "précède" - établit le ton initial
  previous_text: `Elle ferme les yeux, inspire profondément, et commence à parler d'une voix douce,
    calme et apaisante. Son ton est celui d'une guide de méditation expérimentée,
    chaleureux et rassurant. Elle parle lentement, avec des pauses naturelles,
    comme si chaque mot était une caresse pour l'âme. Sa voix québécoise est
    enveloppante et maternelle.`,

  // Texte qui "suit" - renforce l'intention tout au long
  next_text: `murmure-t-elle doucement, sa voix restant calme et méditative jusqu'à la fin,
    comme une berceuse pour adulte. Elle maintient ce ton apaisant et bienveillant,
    guidant l'auditeur vers un état de paix intérieure.`
};

// Contexte émotionnel pour réflexion (voix Dann)
const REFLECTION_EMOTIONAL_CONTEXT = {
  previous_text: `Il s'adresse à toi comme un ami sage et bienveillant. Sa voix est
    posée, réfléchie, avec une pointe de curiosité sincère. Il pose des questions
    qui invitent à l'introspection, sans jugement.`,

  next_text: `dit-il d'un ton encourageant mais direct, t'invitant à réfléchir
    avec lui plutôt que de te donner des réponses toutes faites.`
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
   * Ajoute des indices de ton via la ponctuation
   */
  function prepareText(text, isMeditation) {
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

    const isMeditation = guideType !== 'reflection';

    // Préparer le texte
    const processedText = prepareText(text, isMeditation);

    // Log du texte complet envoyé à ElevenLabs
    console.log('=== FULL TEXT SENT TO ELEVENLABS ===');
    console.log('Guide Type:', guideType);
    console.log('Emotional Context: ENABLED');
    console.log(processedText);
    console.log('=== END TEXT ===');

    // Choisir la voix selon le type de guide
    const voiceId = guideType === 'reflection'
      ? '93nuHbke4dTER9x2pDwE'  // Voix masculine Dann pour réflexion
      : 'xsNzdCmWJpYoa80FaXJi';  // Voix féminine Iza (voix personnalisée)

    // Sélectionner le contexte émotionnel approprié
    const emotionalContext = isMeditation
      ? MEDITATION_EMOTIONAL_CONTEXT
      : REFLECTION_EMOTIONAL_CONTEXT;

    // Voice settings optimisés pour TON MÉDITATIF STABLE
    // Équilibre entre stabilité d'accent et expressivité minimale
    const voiceSettings = guideType === 'reflection'
      ? {
          // DANN - Réflexion socratique, conversationnel mais posé
          stability: 0.65,           // Équilibré
          similarity_boost: 0.80,    // Bonne fidélité
          style: 0.10,               // Très peu - évite variations excessives
          speed: 0.82,               // Légèrement ralenti
          use_speaker_boost: true
        }
      : {
          // IZA - Méditation calme, douce, stable
          // L'injection émotionnelle via previous_text/next_text
          // permet de réduire la stability tout en gardant le bon ton
          stability: 0.75,           // RÉDUIT - le contexte émotionnel compense
          similarity_boost: 0.85,    // Bonne fidélité à la voix
          style: 0.12,               // LÉGÈREMENT AUGMENTÉ - pour douceur
          speed: 0.78,               // Lent et posé
          use_speaker_boost: true
        };

    // ElevenLabs API avec INJECTION ÉMOTIONNELLE
    // previous_text et next_text donnent le contexte sans être prononcés
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
        voice_settings: voiceSettings,
        // 🎭 INJECTION ÉMOTIONNELLE - Le secret pour un ton consistant
        previous_text: emotionalContext.previous_text,
        next_text: emotionalContext.next_text,
        seed: 42,
        pronunciation_dictionary_locators: [],
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
