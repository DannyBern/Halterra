import { checkRateLimit, addRateLimitHeaders } from '../lib/rateLimit.js';
import { handleCORS } from '../lib/corsConfig.js';
import Anthropic from '@anthropic-ai/sdk';

// ============================================
// COSMIC CALCULATIONS (from dailyInsight.ts)
// ============================================

function calculateSunSign(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Bélier';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taureau';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gémeaux';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Lion';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Vierge';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Balance';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpion';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittaire';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorne';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Verseau';
  return 'Poissons';
}

function getMoonPhase() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  const c = Math.floor(365.25 * year);
  const e = Math.floor(30.6 * month);
  const jd = c + e + day - 694039.09;
  const phase = jd / 29.53058867;
  const phaseIndex = Math.floor((phase - Math.floor(phase)) * 8);

  return phaseIndex;
}

function getMoonPhaseName(phase) {
  const phases = [
    'nouvelle lune',
    'premier croissant',
    'premier quartier',
    'lune gibbeuse croissante',
    'pleine lune',
    'lune gibbeuse décroissante',
    'dernier quartier',
    'dernier croissant'
  ];
  return phases[phase % 8];
}

function getTodayPlanet() {
  const day = new Date().getDay();
  const planets = [
    { name: 'Soleil', theme: 'expression de soi' },
    { name: 'Lune', theme: 'intuition' },
    { name: 'Mars', theme: 'action' },
    { name: 'Mercure', theme: 'communication' },
    { name: 'Jupiter', theme: 'expansion' },
    { name: 'Vénus', theme: 'harmonie' },
    { name: 'Saturne', theme: 'structure' }
  ];
  return planets[day];
}

function getSignElement(sign) {
  const elements = {
    'Bélier': 'Feu', 'Lion': 'Feu', 'Sagittaire': 'Feu',
    'Taureau': 'Terre', 'Vierge': 'Terre', 'Capricorne': 'Terre',
    'Gémeaux': 'Air', 'Balance': 'Air', 'Verseau': 'Air',
    'Cancer': 'Eau', 'Scorpion': 'Eau', 'Poissons': 'Eau'
  };
  return elements[sign];
}

function getElementInteraction(natalElement, todayElement) {
  if (natalElement === todayElement) return 'même';

  const harmonies = {
    'Feu': 'Air', 'Air': 'Feu',
    'Terre': 'Eau', 'Eau': 'Terre'
  };

  const challenges = {
    'Feu': 'Eau', 'Eau': 'Feu',
    'Terre': 'Air', 'Air': 'Terre'
  };

  if (harmonies[natalElement] === todayElement) return 'harmonie';
  if (challenges[natalElement] === todayElement) return 'défi';
  return 'stimulation';
}

function getInsightLabel(moonPhase, planet) {
  if (moonPhase === 0) return 'En cette nouvelle lune';
  if (moonPhase === 4) return 'Sous la pleine lune';

  const labels = [
    'Selon les astres aujourd\'hui',
    'L\'énergie du jour suggère',
    'Votre ciel personnel',
    `Sous l'influence de ${planet.name}`,
    'Les astres murmurent'
  ];

  return labels[moonPhase % labels.length];
}

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

    // Calculate current cosmic energies
    const today = date ? new Date(date) : new Date();
    const currentSunSign = calculateSunSign(today);
    const currentElement = getSignElement(currentSunSign);
    const moonPhase = getMoonPhase();
    const moonPhaseName = getMoonPhaseName(moonPhase);
    const planet = getTodayPlanet();
    const interaction = getElementInteraction(profile.dominantElement, currentElement);

    // Initialize Anthropic client
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    // Build rich prompt with all cosmic data
    const prompt = `Tu es un guide de méditation perspicace. Génère un court message inspirant et personnalisé pour aujourd'hui.

DONNÉES COSMIQUES ACTUELLES:
- Soleil en: ${currentSunSign} (élément ${currentElement})
- Phase lunaire: ${moonPhaseName}
- Planète du jour: ${planet.name} (thème: ${planet.theme})
- Interaction élémentaire: ${interaction} (entre ${profile.dominantElement} natal et ${currentElement} actuel)

PROFIL NATAL DE LA PERSONNE:
- Élément dominant: ${profile.dominantElement || 'Non défini'}
- Qualité dominante: ${profile.dominantQuality || 'Non définie'}
- Type d'énergie: ${profile.energyType || 'Non défini'}
- Yin/Yang: ${profile.yinYang || 'Non défini'}
- Chemin de vie: ${profile.lifePath || 'Non défini'}
- Signe solaire natal: ${profile.sunSign || 'Non défini'}

INSTRUCTIONS CRITIQUES:
- Maximum 2 phrases courtes (20-30 mots total)
- Concret et actionnable (pas vague ou poétique)
- NE MENTIONNE PAS les termes astrologiques (pas de "Soleil en Sagittaire", "phase lunaire", etc.)
- Parle directement à la personne de manière pratique
- Utilise les données cosmiques pour informer le ton et le conseil, mais sans les nommer
- Ton calme et encourageant
- En français

Réponds UNIQUEMENT avec le message, sans introduction ni explication.`;

    // Call Claude Haiku 4.5
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      temperature: 0.8,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const insight = message.content[0].text.trim();
    const label = getInsightLabel(moonPhase, planet);

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
