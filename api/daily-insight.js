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

// ============================================
// DAILY THEME SYSTEM (90 unique themes)
// ============================================

const dailyThemes = [
  // Introspection (15)
  { theme: 'Gratitude', focus: 'Reconnaître les petites bénédictions de votre quotidien' },
  { theme: 'Lâcher-prise', focus: 'Libérer ce qui ne vous sert plus' },
  { theme: 'Acceptation', focus: 'Accueillir ce qui est, sans résistance' },
  { theme: 'Pardon', focus: 'Alléger votre cœur en libérant les rancœurs' },
  { theme: 'Authenticité', focus: 'Honorer qui vous êtes vraiment' },
  { theme: 'Introspection', focus: 'Explorer votre monde intérieur' },
  { theme: 'Valeurs', focus: 'Reconnecter avec ce qui compte vraiment pour vous' },
  { theme: 'Bilan', focus: 'Observer votre chemin parcouru' },
  { theme: 'Intention', focus: 'Clarifier ce que vous souhaitez manifester' },
  { theme: 'Sagesse intérieure', focus: 'Écouter la voix de votre intuition profonde' },
  { theme: 'Vulnérabilité', focus: 'Trouver la force dans l\'ouverture' },
  { theme: 'Ombre', focus: 'Accueillir les parts de vous que vous cachez' },
  { theme: 'Héritage', focus: 'Réfléchir à ce que vous transmettez' },
  { theme: 'Silence', focus: 'Trouver la paix dans le calme intérieur' },
  { theme: 'Vérité', focus: 'Être honnête avec vous-même' },

  // Action & Motivation (15)
  { theme: 'Oser', focus: 'Faire un pas vers quelque chose qui vous fait peur' },
  { theme: 'Initiative', focus: 'Prendre les devants dans un domaine de votre vie' },
  { theme: 'Persévérance', focus: 'Continuer malgré les obstacles' },
  { theme: 'Discipline', focus: 'Cultiver la constance dans vos efforts' },
  { theme: 'Focus', focus: 'Concentrer votre énergie sur l\'essentiel' },
  { theme: 'Accomplissement', focus: 'Célébrer vos réussites, même petites' },
  { theme: 'Décision', focus: 'Trancher avec clarté et confiance' },
  { theme: 'Engagement', focus: 'Honorer vos promesses envers vous-même' },
  { theme: 'Transformation', focus: 'Embrasser le changement comme allié' },
  { theme: 'Momentum', focus: 'Utiliser l\'élan actuel pour avancer' },
  { theme: 'Risque calculé', focus: 'Sortir de votre zone de confort intelligemment' },
  { theme: 'Efficacité', focus: 'Faire plus avec moins d\'effort' },
  { theme: 'Priorités', focus: 'Distinguer l\'urgent de l\'important' },
  { theme: 'Proactivité', focus: 'Anticiper plutôt que réagir' },
  { theme: 'Détermination', focus: 'Renforcer votre volonté intérieure' },

  // Relations (15)
  { theme: 'Connexion', focus: 'Approfondir vos liens avec les autres' },
  { theme: 'Écoute', focus: 'Être pleinement présent pour quelqu\'un' },
  { theme: 'Générosité', focus: 'Donner sans attendre en retour' },
  { theme: 'Limites saines', focus: 'Protéger votre énergie avec bienveillance' },
  { theme: 'Empathie', focus: 'Se mettre à la place de l\'autre' },
  { theme: 'Communication', focus: 'Exprimer clairement vos besoins' },
  { theme: 'Réconciliation', focus: 'Réparer ce qui peut l\'être' },
  { theme: 'Solitude choisie', focus: 'Apprécier le temps avec vous-même' },
  { theme: 'Tribu', focus: 'Nourrir votre cercle de soutien' },
  { theme: 'Collaboration', focus: 'Créer ensemble plutôt que seul' },
  { theme: 'Reconnaissance', focus: 'Exprimer votre appréciation aux autres' },
  { theme: 'Présence', focus: 'Être vraiment là pour ceux qui comptent' },
  { theme: 'Harmonie', focus: 'Cultiver la paix dans vos relations' },
  { theme: 'Compassion', focus: 'Offrir de la douceur à ceux qui souffrent' },
  { theme: 'Authenticité relationnelle', focus: 'Être vrai dans vos interactions' },

  // Bien-être physique (15)
  { theme: 'Repos', focus: 'Honorer votre besoin de récupération' },
  { theme: 'Mouvement', focus: 'Célébrer votre corps en action' },
  { theme: 'Respiration', focus: 'Revenir à l\'ancre de votre souffle' },
  { theme: 'Alimentation consciente', focus: 'Nourrir votre corps avec attention' },
  { theme: 'Nature', focus: 'Vous ressourcer au contact du vivant' },
  { theme: 'Énergie vitale', focus: 'Préserver et cultiver votre vitalité' },
  { theme: 'Sommeil', focus: 'Préparer une nuit réparatrice' },
  { theme: 'Ancrage', focus: 'Vous enraciner dans le moment présent' },
  { theme: 'Détente', focus: 'Relâcher les tensions accumulées' },
  { theme: 'Hydratation', focus: 'Prendre soin de votre corps avec simplicité' },
  { theme: 'Posture', focus: 'Habiter votre corps avec conscience' },
  { theme: 'Rythme', focus: 'Respecter vos cycles naturels' },
  { theme: 'Sensorialité', focus: 'Éveiller vos sens au monde' },
  { theme: 'Légèreté corporelle', focus: 'Alléger votre corps et votre esprit' },
  { theme: 'Régénération', focus: 'Permettre à votre corps de se réparer' },

  // Mental & Créativité (15)
  { theme: 'Patience', focus: 'Cultiver l\'art d\'attendre avec sérénité' },
  { theme: 'Curiosité', focus: 'Explorer avec un regard neuf' },
  { theme: 'Créativité', focus: 'Laisser émerger votre expression unique' },
  { theme: 'Clarté mentale', focus: 'Dissiper le brouillard de l\'esprit' },
  { theme: 'Intuition', focus: 'Faire confiance à votre guidance intérieure' },
  { theme: 'Apprentissage', focus: 'Rester ouvert aux leçons de la vie' },
  { theme: 'Perspective', focus: 'Voir la situation sous un autre angle' },
  { theme: 'Imagination', focus: 'Visualiser vos possibilités' },
  { theme: 'Concentration', focus: 'Diriger votre attention avec intention' },
  { theme: 'Flexibilité mentale', focus: 'Adapter votre pensée aux circonstances' },
  { theme: 'Innovation', focus: 'Trouver de nouvelles solutions' },
  { theme: 'Discernement', focus: 'Distinguer le vrai du faux' },
  { theme: 'Mémoire', focus: 'Honorer les leçons du passé' },
  { theme: 'Détachement', focus: 'Observer sans vous identifier' },
  { theme: 'Vision', focus: 'Clarifier votre direction de vie' },

  // Émotions (15)
  { theme: 'Joie', focus: 'Cultiver les moments de bonheur simple' },
  { theme: 'Calme', focus: 'Trouver la paix au milieu du chaos' },
  { theme: 'Confiance', focus: 'Renforcer votre foi en vous-même' },
  { theme: 'Courage', focus: 'Affronter ce qui vous intimide' },
  { theme: 'Espoir', focus: 'Garder la lumière allumée dans l\'obscurité' },
  { theme: 'Sérénité', focus: 'Accéder à un espace de tranquillité' },
  { theme: 'Enthousiasme', focus: 'Raviver votre flamme intérieure' },
  { theme: 'Équilibre émotionnel', focus: 'Naviguer vos émotions avec grâce' },
  { theme: 'Libération', focus: 'Laisser partir ce qui vous alourdit' },
  { theme: 'Douceur', focus: 'Vous traiter avec tendresse' },
  { theme: 'Résilience', focus: 'Rebondir après les difficultés' },
  { theme: 'Contentement', focus: 'Apprécier ce que vous avez déjà' },
  { theme: 'Apaisement', focus: 'Calmer les tempêtes intérieures' },
  { theme: 'Émerveillement', focus: 'Retrouver votre regard d\'enfant' },
  { theme: 'Fierté saine', focus: 'Reconnaître votre propre valeur' }
];

function getDailyTheme(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Create a hash from the date that cycles through all 90 themes
  // Using a prime multiplier for better distribution
  const dateHash = (year * 367 + month * 31 + day) % dailyThemes.length;

  return dailyThemes[dateHash];
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
    const dailyTheme = getDailyTheme(today);

    // Initialize Anthropic client
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    // Build rich prompt with all cosmic data
    const prompt = `Tu es un guide de méditation perspicace. Génère un court message inspirant et personnalisé pour aujourd'hui.

THÈME DU JOUR (OBLIGATOIRE - base ton message sur ce thème):
- Thème: ${dailyTheme.theme}
- Focus: ${dailyTheme.focus}

DONNÉES COSMIQUES ACTUELLES (pour nuancer le ton):
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
- Le message DOIT être en lien direct avec le THÈME DU JOUR
- Concret et actionnable (pas vague ou poétique)
- NE MENTIONNE PAS les termes astrologiques (pas de "Soleil en Sagittaire", "phase lunaire", etc.)
- NE MENTIONNE PAS le nom du thème directement (pas "aujourd'hui est un jour de gratitude")
- Parle directement à la personne de manière pratique
- Utilise les données cosmiques pour informer le ton, mais sans les nommer
- Ton calme et encourageant
- En français
- N'UTILISE JAMAIS de tirets (-) ou de puces dans ta réponse
- Écris un texte fluide en prose, pas une liste

Réponds UNIQUEMENT avec le message (texte fluide sans tirets), sans introduction ni explication.`;

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
