import { checkRateLimit, addRateLimitHeaders } from '../lib/rateLimit.js';
import { handleCORS } from '../lib/corsConfig.js';
import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // 🔐 CORS SÉCURISÉ
  if (!handleCORS(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ⚡ RATE LIMITING
  const rateLimit = checkRateLimit(req, '/api/daily-insight');
  addRateLimitHeaders(res, { ...rateLimit, endpoint: '/api/daily-insight' });

  if (!rateLimit.allowed) {
    console.warn(`🚫 Rate limit exceeded for daily-insight - IP: ${req.headers['x-forwarded-for'] || 'unknown'}`);
    return res.status(429).json({
      error: 'Too Many Requests',
      message: rateLimit.message,
      retryAfter: rateLimit.retryAfter
    });
  }

  try {
    const { profile, date } = req.body;

    if (!profile) {
      return res.status(400).json({ error: 'Missing profile field' });
    }

    // Initialize Anthropic client
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    // Construire le prompt pour un insight quotidien personnalisé
    const prompt = `Tu es un guide de méditation perspicace. Génère un court message inspirant et personnalisé pour aujourd'hui (${date || new Date().toISOString().split('T')[0]}).

Profil de la personne:
- Élément dominant: ${profile.dominantElement || 'Non défini'}
- Qualité dominante: ${profile.dominantQuality || 'Non définie'}
- Type d'énergie: ${profile.energyType || 'Non défini'}
- Chemin de vie: ${profile.lifePath || 'Non défini'}
- Signe solaire: ${profile.sunSign || 'Non défini'}

INSTRUCTIONS:
- Maximum 2 phrases courtes (20-30 mots total)
- Concret et actionnable (pas vague ou poétique)
- Directement lié au profil de la personne
- Ton calme et encourageant
- En français

Réponds UNIQUEMENT avec le message, sans introduction ni explication.`;

    // Appel à Claude Haiku (rapide et économique)
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-20250514',
      max_tokens: 150,
      temperature: 0.8,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const insight = message.content[0].text.trim();

    // Label basé sur le moment de la journée
    const hour = new Date().getHours();
    let label = "pour aujourd'hui";
    if (hour < 12) {
      label = "pour ce matin";
    } else if (hour < 18) {
      label = "pour cet après-midi";
    } else {
      label = "pour ce soir";
    }

    res.status(200).json({
      insight,
      label
    });

  } catch (error) {
    console.error('Error generating daily insight:', error);
    res.status(500).json({
      error: 'Failed to generate daily insight',
      details: error.message
    });
  }
}
