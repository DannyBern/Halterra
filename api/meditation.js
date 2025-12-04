import Anthropic from '@anthropic-ai/sdk';
import { getIntentionDescription } from './intentionDescriptions.js';
import { checkRateLimit, addRateLimitHeaders } from '../lib/rateLimit.js';
import { handleCORS } from '../lib/corsConfig.js';

/**
 * Retry wrapper with exponential backoff for Claude API calls
 * Handles 529 (overloaded) and 5xx errors with automatic retry
 *
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} baseDelay - Base delay in ms (default: 1000)
 * @returns {Promise} - Result of the function or throws after all retries fail
 */
async function withRetry(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retryable (529 overloaded, 5xx server errors, or rate limit)
      const isRetryable =
        error.status === 529 || // Overloaded
        error.status === 503 || // Service unavailable
        error.status === 502 || // Bad gateway
        error.status === 500 || // Internal server error
        error.status === 429 || // Rate limited
        error.error?.type === 'overloaded_error';

      if (!isRetryable || attempt === maxRetries) {
        console.error(`❌ Claude API failed after ${attempt} attempt(s):`, error.message || error);
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s...
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`⚠️ Claude API error (attempt ${attempt}/${maxRetries}): ${error.status || 'unknown'} - ${error.message || 'Overloaded'}`);
      console.log(`🔄 Retrying in ${delay}ms...`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Calcule le pourcentage de métaphores adapté au profil astrologique
 * Retourne un score de 0-100 indiquant l'intensité métaphorique
 *
 * @param {Object} profile - Profil astrologique avec dominantElement, energyType, dominantQuality
 * @returns {number} Score 0-100 (0 = très expérientiel, 100 = très métaphorique)
 */
function calculateMetaphoricalIntensity(profile) {
  let score = 50; // Baseline neutre

  // ÉLÉMENT - Impact majeur (±25 points)
  const elementScores = {
    'Eau': +25,      // Imagination fertile, monde intérieur riche
    'Air': +15,      // Conceptuel, aime les symboles et idées
    'Feu': -15,      // Action directe, énergie immédiate
    'Terre': -25     // Concret, tangible, ancré dans le corps
  };
  score += elementScores[profile.dominantElement] || 0;

  // ÉNERGIE - Impact modéré (±15 points)
  if (profile.energyType === 'Introvertie') {
    score += 15;  // Préfère exploration intérieure, voyage mental
  } else if (profile.energyType === 'Extravertie') {
    score -= 15;  // Préfère expérience directe, action concrète
  }
  // Ambivertie: neutre (0)

  // QUALITÉ - Impact léger (±10 points)
  const qualityScores = {
    'Mutable': +10,   // Flexible, aime variation et exploration
    'Fixe': -5,       // Stable, préfère constance (mais Scorpion/Eau peut aimer métaphores)
    'Cardinal': -10   // Action, initiation, pragmatique
  };
  score += qualityScores[profile.dominantQuality] || 0;

  // Contraindre entre 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Génère les instructions narratives adaptées au score métaphorique
 *
 * @param {number} intensity - Score 0-100 de l'intensité métaphorique
 * @returns {string} Instructions pour le system prompt
 */
function getNarrativeInstructions(intensity) {
  if (intensity >= 70) {
    // TRÈS MÉTAPHORIQUE (70-100%) - Eau dominant, Introverti, Mutable
    return `APPROCHE TRÈS MÉTAPHORIQUE (${intensity}%):
Tu crées un voyage imaginaire riche et immersif. Les métaphores sont ton langage principal.

✅ Utilise 4-6 métaphores variées tout au long de la méditation
✅ Explore des univers sensoriels inattendus:
   - Phénomènes lumineux (aube, crépuscule, reflets, ombres portées)
   - Architecture intérieure (pièces, seuils, fenêtres, espaces)
   - Matières vivantes (tissus, verre, pierre, brume, cristaux)
   - Météo du dedans (vent intérieur, clarté, nuages qui passent)
   - Géométrie émotionnelle (cercles, spirales, expansion)
✅ Encourage visualisation détaillée et exploration symbolique
✅ Crée une narration avec début, voyage et retour
⚖️ Inclus sensations corporelles comme ancrage secondaire

L'image inattendue révèle des vérités profondes.`;
  } else if (intensity >= 50) {
    // MÉTAPHORIQUE LÉGER (50-69%) - Air, ou profils mixtes
    return `APPROCHE MÉTAPHORIQUE LÉGÈRE (${intensity}%):
Tu équilibres métaphores et expérience directe de façon harmonieuse.

✅ Utilise 2-3 métaphores bien choisies
✅ Métaphores simples et évocatrices (lumière, espace, mouvement)
✅ Alterne entre image poétique et sensation corporelle
✅ Introduction métaphorique → exploration sensorielle → clôture poétique
⚖️ 50% métaphores, 50% ancrage corporel direct

L'équilibre entre poésie et présence.`;
  } else if (intensity >= 30) {
    // EXPÉRIENTIEL AVEC TOUCHES POÉTIQUES (30-49%) - Profils équilibrés
    return `APPROCHE EXPÉRIENTIELLE AVEC TOUCHES POÉTIQUES (${intensity}%):
L'expérience directe prime, avec quelques images pour enrichir.

✅ PRIORITÉ: Sensations corporelles directes (poids, chaleur, texture, mouvement)
✅ 1-2 métaphores optionnelles maximum
✅ Métaphores courtes introduites par "peut-être comme..." ou "un peu comme si..."
✅ Retour rapide à l'expérience corporelle après chaque image
⚖️ 70% corps et présence, 30% touches poétiques

La présence peut s'habiller de poésie légère.`;
  } else {
    // TRÈS EXPÉRIENTIEL (0-29%) - Terre/Feu dominant, Extraverti, Cardinal
    return `APPROCHE TRÈS EXPÉRIENTIELLE (${intensity}%):
Ancrage corporel total. Les métaphores sont quasi absentes.

✅ FOCUS EXCLUSIF: Expérience sensorielle directe et immédiate
✅ Maximum 1 métaphore simple si vraiment nécessaire
✅ Langage concret: "sens", "remarque", "observe", "ressens"
✅ Sensations physiques précises:
   - Poids du corps, gravité, appui
   - Respiration naturelle (rythme, profondeur, pauses)
   - Température, texture, mouvement
   - Détente musculaire, contact avec le support
✅ Exemples concrets du quotidien (marcher, tenir un objet)
⚖️ 95% présence corporelle, 5% ou moins d'imagerie

La sensation directe est la transformation.`;
  }
}

export default async function handler(req, res) {
  // 🔐 CORS SÉCURISÉ - Whitelist origines autorisées
  if (!handleCORS(req, res)) {
    return; // Bloqué ou OPTIONS traité
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ⚡ RATE LIMITING - Protection contre les abus
  const rateLimit = checkRateLimit(req, '/api/meditation');
  addRateLimitHeaders(res, { ...rateLimit, endpoint: '/api/meditation' });

  if (!rateLimit.allowed) {
    console.warn(`🚫 Rate limit exceeded for meditation - IP: ${req.headers['x-forwarded-for'] || 'unknown'}`);
    return res.status(429).json({
      error: 'Too Many Requests',
      message: rateLimit.message,
      retryAfter: rateLimit.retryAfter
    });
  }

  console.log(`✅ Rate limit check passed - Remaining: ${rateLimit.remaining}/${10}`);

  try {
    const { userName, mood, category, intention, guideType = 'meditation', duration = 4, astrologicalProfile, sessionHistory, stream = false } = req.body;

    if (!userName || !mood || !category || !intention) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Log Astrological Profile data if present
    if (astrologicalProfile) {
      console.log('\n' + '🌟'.repeat(40));
      console.log('✨ ASTROLOGICAL PROFILE DATA RECEIVED:');
      console.log('  Soleil:', astrologicalProfile.sunSign);
      console.log('  Lune:', astrologicalProfile.moonSign);
      console.log('  Ascendant:', astrologicalProfile.ascendant);
      console.log('  Élément dominant:', astrologicalProfile.dominantElement);
      console.log('  Type d\'énergie:', astrologicalProfile.energyType);
      console.log('🌟'.repeat(40) + '\n');
    }

    // Récupérer le contexte temporel (fuseau horaire de l'Est - Québec/Montréal)
    const now = new Date();
    const timeZone = 'America/Montreal';
    const dateFormatter = new Intl.DateTimeFormat('fr-CA', {
      timeZone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeFormatter = new Intl.DateTimeFormat('fr-CA', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const currentDate = dateFormatter.format(now);
    const currentTime = timeFormatter.format(now);
    const hour = parseInt(currentTime.split(':')[0]);

    // Déterminer le moment de la journée
    let timeOfDay = '';
    if (hour >= 5 && hour < 12) {
      timeOfDay = 'matin';
    } else if (hour >= 12 && hour < 14) {
      timeOfDay = 'midi';
    } else if (hour >= 14 && hour < 17) {
      timeOfDay = 'après-midi';
    } else if (hour >= 17 && hour < 20) {
      timeOfDay = 'souper/début de soirée';
    } else if (hour >= 20 && hour < 23) {
      timeOfDay = 'soirée';
    } else {
      timeOfDay = 'nuit';
    }

    // Récupérer une pensée profonde de ZenQuotes pour influencer la méditation
    let dailyInspiration = '';
    try {
      const zenResponse = await fetch('https://zenquotes.io/api/random', {
        headers: {
          'User-Agent': 'Halterra-Meditation-App/1.0'
        }
      });

      console.log('ZenQuotes API Status:', zenResponse.status);

      if (!zenResponse.ok) {
        throw new Error(`ZenQuotes API returned ${zenResponse.status}`);
      }

      const zenData = await zenResponse.json();
      console.log('ZenQuotes Response:', JSON.stringify(zenData));

      if (zenData && zenData[0] && zenData[0].q && zenData[0].a) {
        dailyInspiration = `"${zenData[0].q}" - ${zenData[0].a}`;
        console.log('✅ ZenQuotes citation successfully fetched:', dailyInspiration);
      } else {
        throw new Error('Invalid ZenQuotes response structure');
      }
    } catch (zenError) {
      console.error('❌ Failed to fetch ZenQuote:', zenError.message);
      dailyInspiration = 'La conscience est le témoin silencieux de toute expérience.';
      console.log('⚠️ Using fallback inspiration');
    }

    // Vérifier que la clé API est définie
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('❌ ANTHROPIC_API_KEY is not defined!');
      throw new Error('API key not configured');
    }
    console.log(`✅ API Key présente: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);

    const client = new Anthropic({
      apiKey: apiKey,
    });

    const guideInstructions = guideType === 'meditation'
      ? buildIzaInstructions(userName, duration)
      : buildDannInstructions(userName, duration);

    // Construire la section astrologique si disponible
    let astrologicalSection = '';
    if (astrologicalProfile) {
      astrologicalSection = buildAstrologicalContext(astrologicalProfile, userName);
    }

    // NOUVEAU: Analyze mood patterns from session history
    let moodPatternContext = '';
    if (sessionHistory && sessionHistory.length > 0) {
      const moodAnalysis = analyzeMoodPatterns(sessionHistory, mood.id);
      if (moodAnalysis && moodAnalysis.isPattern) {
        moodPatternContext = `\n\nCONTEXTE D'ADAPTATION:\n${moodAnalysis.adaptationGuidance}\n`;
      }
    }

    // Lunar transit for daily personalization
    // TEMPORARILY DISABLED: astronomy-engine causes Vercel deployment issues
    // TODO: Fix ES6 import compatibility or use alternative lunar calculation
    let lunarContext = '';
    // const lunarTransit = await getCurrentLunarTransit(new Date());
    // if (lunarTransit) {
    //   lunarContext = `\n\nCONTEXTE LUNAIRE ACTUEL:\nLune en ${lunarTransit.moonSign} (${lunarTransit.moonElement})\nPhase: ${lunarTransit.phaseName}\n${lunarTransit.transitGuidance}\n`;
    // }

    // NOUVEAU: Get structural guidance
    const structuralGuide = getStructuralGuidance(guideType);

    // Récupérer la description enrichie de l'intention (si disponible)
    const intentionContext = getIntentionDescription(intention);

    const prompt = `🎯 INTENTION PRINCIPALE:
${userName} a choisi la catégorie "${category}" avec l'intention: "${intention}".
${intentionContext ? `\n📖 CONTEXTE PSYCHOLOGIQUE DE L'INTENTION:\n${intentionContext}` : ''}

💭 ÉTAT ÉMOTIONNEL ACTUEL:
${userName} se trouve dans un état "${mood.name}" (${mood.description}).
${astrologicalSection}${moodPatternContext}
CONTEXTE TEMPOREL:
📅 ${currentDate} | ⏰ ${currentTime} | 🌅 ${timeOfDay}
${lunarContext}
INSPIRATION SUBTILE (ne jamais citer explicitement):
${dailyInspiration}

${structuralGuide}

${guideInstructions}

FORMAT REQUIS - Deux versions du MÊME contenu:
1. displayText: Français standard écrit (paragraphes \\n\\n, lecture écran)
2. audioText: Québécois oral (tu/t'es, pauses "...", conversationnel)

Réponds en JSON${stream ? ' line-delimited (2 lignes)' : ''} SANS backticks:
${stream ? '{"key":"displayText","content":"..."}\n{"key":"audioText","content":"..."}' : '{"displayText":"...","audioText":"..."}'}`;

    // LOG COMPLET DU PROMPT POUR DEBUGGING
    console.log('\n' + '═'.repeat(100));
    console.log('📜 PROMPT COMPLET ENVOYÉ À CLAUDE:');
    console.log('═'.repeat(100));
    console.log(prompt);
    console.log('═'.repeat(100));
    console.log(`📊 Longueur du prompt: ${prompt.length} caractères`);
    console.log(`🤖 Modèle: claude-sonnet-4-5-20250929`);
    console.log(`🌡️ Temperature: 0.85 (optimisé)`);
    console.log(`🎯 Max tokens: 4000`);
    console.log('═'.repeat(100) + '\n');

    // 🎨 Calcul de l'intensité métaphorique selon le profil astrologique
    const metaphoricalIntensity = astrologicalProfile ? calculateMetaphoricalIntensity(astrologicalProfile) : 50;
    const narrativeInstructions = getNarrativeInstructions(metaphoricalIntensity);

    console.log(`🎨 Intensité métaphorique: ${metaphoricalIntensity}%`);
    if (astrologicalProfile) {
      console.log(`   Élément: ${astrologicalProfile.dominantElement} | Énergie: ${astrologicalProfile.energyType} | Qualité: ${astrologicalProfile.dominantQuality}`);
    }

    const systemPrompt = guideType === 'meditation'
      ? `Tu es Iza, guide de méditation transformatrice.

PHILOSOPHIE - Méditation Transformatrice:
Tu intègres PNL, hypnose Ericksonienne et sagesse moderne pour créer une transformation authentique. Principes: les croyances créent la réalité, le présent est le point de pouvoir, la transformation vient de l'expérience, chaque état émotionnel contient une sagesse, l'acceptation précède le changement. Ne console pas - transforme les croyances racines via langage permissif, suggestions indirectes, expériences sensorielles ancrées.

FORMAT AUDIOTEXT - Québécois Élégant:
✅ TOUJOURS: "tu/t'es/ton/prends/laisse/ressens"
✅ Pauses naturelles: "..."
✅ Contractions: "t'es" jamais "tu es"
❌ JAMAIS: "vous", "là" en fin de phrase, familier (toé/mwé/astheure)

${narrativeInstructions}`
      : `Tu es Dann, guide de réflexion socratique.

PHILOSOPHIE - Réflexion Profonde:
Tu t'inspires de psychologie adlérienne, philosophie stoïcienne et responsabilité radicale. Principes: les émotions servent un but, le changement n'attend pas la guérison, la responsabilité est pouvoir, les "problèmes" sont des solutions déguisées, l'action imparfaite vaut mieux que l'attente parfaite. Pose des questions révélatrices, challenge avec compassion, expose les contradictions, invite au courage d'agir maintenant.

FORMAT AUDIOTEXT - Québécois Élégant:
✅ TOUJOURS: "tu/t'es/ton" avec questions directes
✅ Pauses naturelles: "..."
✅ Ton de réflexion avec QUESTIONS ouvertes, pas directives guidées
❌ JAMAIS: "vous", "là" en fin de phrase, familier (toé/mwé/astheure)

CRÉATIVITÉ TOTALE: Chaque réflexion est unique, adaptée au contexte émotionnel et à l'intention.`;

    // 🌊 STREAMING MODE - Progressive rendering for instant UX
    if (stream) {
      console.log('🌊 STREAMING MODE ENABLED');

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let accumulatedText = '';
      let displayText = '';
      let audioText = '';

      try {
        const streamResponse = await client.messages.stream({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 4000,
          temperature: 0.85,
          messages: [{
            role: 'user',
            content: prompt
          }],
          system: systemPrompt
        });

        // Process streaming chunks
        for await (const chunk of streamResponse) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            const text = chunk.delta.text;
            accumulatedText += text;

            // Send chunk to client via SSE
            res.write(`data: ${JSON.stringify({ type: 'chunk', content: text })}\n\n`);
          }
        }

        // Parse the complete line-delimited JSON response
        const lines = accumulatedText.trim().split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            let cleanedLine = line.trim();
            // Remove markdown backticks if present
            if (cleanedLine.startsWith('```json')) {
              cleanedLine = cleanedLine.replace(/^```json\s*/, '');
            }
            if (cleanedLine.endsWith('```')) {
              cleanedLine = cleanedLine.replace(/\s*```$/, '');
            }

            const parsed = JSON.parse(cleanedLine);
            if (parsed.key === 'displayText') {
              displayText = parsed.content;
            } else if (parsed.key === 'audioText') {
              audioText = parsed.content;
            }
          } catch (lineError) {
            console.warn('Failed to parse line:', line.substring(0, 100), lineError);
          }
        }

        // Fallback: if line-delimited parsing failed, try regular JSON
        if (!displayText && !audioText) {
          try {
            let cleanedText = accumulatedText.trim();
            if (cleanedText.startsWith('```json')) {
              cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '');
            } else if (cleanedText.startsWith('```')) {
              cleanedText = cleanedText.replace(/^```\n/, '').replace(/\n```$/, '');
            }
            const parsed = JSON.parse(cleanedText);
            displayText = parsed.displayText || accumulatedText;
            audioText = parsed.audioText || accumulatedText;
          } catch (fallbackError) {
            console.warn('Fallback JSON parsing also failed, using raw text');
            displayText = accumulatedText;
            audioText = accumulatedText;
          }
        }

        // Send completion event with metadata
        res.write(`data: ${JSON.stringify({
          type: 'complete',
          displayText,
          audioText,
          dailyInspiration
        })}\n\n`);

        console.log(`✅ Streaming completed - Display: ${displayText.length} chars, Audio: ${audioText.length} chars`);

      } catch (streamError) {
        console.error('❌ Streaming error:', streamError);
        res.write(`data: ${JSON.stringify({ type: 'error', message: 'Streaming failed' })}\n\n`);
      } finally {
        res.end();
      }

      return; // Exit early for streaming mode
    }

    // 📦 REGULAR MODE - Traditional complete response with retry logic
    const message = await withRetry(() => client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4000,
      temperature: 0.85,
      messages: [{
        role: 'user',
        content: prompt
      }],
      system: systemPrompt
    }), 3, 2000); // 3 retries with 2s base delay (2s, 4s, 8s)

    const textContent = message.content.find(block => block.type === 'text');
    const responseText = textContent && 'text' in textContent ? textContent.text : '';

    let displayText = '';
    let audioText = '';

    try {
      // Nettoyer les backticks markdown si présents
      let cleanedText = responseText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      const parsed = JSON.parse(cleanedText);
      displayText = parsed.displayText || responseText;
      audioText = parsed.audioText || responseText;

      // Log pour debugging avec informations complètes
      console.log('\n' + '='.repeat(80));
      console.log('📖 MEDITATION GENERATED');
      console.log('='.repeat(80));
      console.log('\n⏰ TEMPORAL CONTEXT:');
      console.log(`   Date: ${currentDate}`);
      console.log(`   Time: ${currentTime}`);
      console.log(`   Moment: ${timeOfDay}`);
      console.log('\n💭 DAILY INSPIRATION (ZenQuotes):');
      console.log(dailyInspiration);

      if (astrologicalProfile) {
        console.log('\n🌟 ASTROLOGICAL CONTEXT:');
        console.log(`   Soleil: ${astrologicalProfile.sunSign}`);
        console.log(`   Lune: ${astrologicalProfile.moonSign}`);
        console.log(`   Ascendant: ${astrologicalProfile.ascendant}`);
        console.log(`   Élément dominant: ${astrologicalProfile.dominantElement}`);
        console.log(`   ✅ Astrological Profile WAS INCLUDED in prompt`);
      } else {
        console.log('\n🌟 ASTROLOGICAL CONTEXT:');
        console.log('   ❌ No Astrological Profile data provided');
      }

      console.log('\n🎭 USER CONTEXT:');
      console.log(`   User: ${userName}`);
      console.log(`   Mood: ${mood.name} - ${mood.description}`);
      console.log(`   Intention: ${intention}`);
      console.log(`   Category: ${category}`);
      console.log(`   Guide Type: ${guideType}`);
      console.log(`   Duration: ${duration} minutes`);
      console.log('\n📝 DISPLAY TEXT (first 200 chars):');
      console.log(displayText.substring(0, 200) + '...');
      console.log('\n🎙️ AUDIO TEXT (first 200 chars):');
      console.log(audioText.substring(0, 200) + '...');
      console.log(`\n📏 TEXT LENGTHS:`);
      console.log(`   Display: ${displayText.length} chars`);
      console.log(`   Audio: ${audioText.length} chars`);
      console.log('\n' + '='.repeat(80) + '\n');
    } catch (parseError) {
      console.warn('Failed to parse JSON response, using raw text:', parseError);
      displayText = responseText;
      audioText = responseText;
    }

    res.status(200).json({
      meditationText: displayText,
      audioText: audioText,
      dailyInspiration: dailyInspiration  // Include the ZenQuotes inspiration used
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to generate meditation' });
  }
}

/**
 * Analyze mood patterns from recent session history
 * Returns subtle adaptation guidance without revealing pattern to user
 */
function analyzeMoodPatterns(sessionHistory, currentMood) {
  if (!sessionHistory || sessionHistory.length === 0) {
    return null;
  }

  // Get last 7 days of sessions
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const recentSessions = sessionHistory.filter(s => s.timestamp >= sevenDaysAgo);

  if (recentSessions.length === 0) {
    return null;
  }

  // Count mood occurrences
  const moodCounts = {};
  recentSessions.forEach(session => {
    moodCounts[session.mood] = (moodCounts[session.mood] || 0) + 1;
  });

  const currentMoodFrequency = moodCounts[currentMood] || 0;

  // Pattern detection (4+ times in 7 days = pattern)
  if (currentMoodFrequency >= 4) {
    return {
      isPattern: true,
      frequency: currentMoodFrequency,
      adaptationGuidance: getMoodPatternAdaptation(currentMood, currentMoodFrequency)
    };
  }

  return null;
}

/**
 * Provides subtle adaptation guidance for repeated moods
 * NEVER mentions the pattern to user - only influences style/approach
 */
function getMoodPatternAdaptation(mood, frequency) {
  const adaptations = {
    anxious: `ADAPTATION SUBTILE: L'utilisateur traverse une période prolongée.
      - Priorité absolue: ANCRAGE CORPOREL concret (sensations physiques, poids, contact)
      - Rythme TRÈS LENT avec pauses fréquentes
      - Éviter visualisations complexes, favoriser le sensoriel immédiat
      - Ton: présence solide, voix comme une main sur l'épaule
      - Ne JAMAIS mentionner "cette période difficile" ou "depuis quelques jours"`,

    sad: `ADAPTATION SUBTILE: Tristesse récurrente détectée.
      - Validation émotionnelle PROFONDE sans minimiser
      - Métaphores: cycles naturels (saisons, marées), transformation organique
      - Acceptation complète avant tout mouvement
      - Ton: douceur inconditionnelle, comme eau qui enveloppe
      - Ne JAMAIS mentionner la durée ou fréquence`,

    frustrated: `ADAPTATION SUBTILE: Frustration répétée.
      - Reconnaître l'énergie sans jugement
      - Canalisation plutôt que suppression (mouvement, respiration active)
      - Métaphores: feu qui se transforme, énergie qui trouve sa voie
      - Ton: respectueux de l'intensité, invitation à la redirection
      - Ne JAMAIS mentionner "encore" ou patterns`,

    exhausted: `ADAPTATION SUBTILE: Épuisement prolongé.
      - Permission TOTALE de ne rien faire, d'être fatigué
      - Micro-pratiques (une respiration consciente suffit)
      - Pas de "motivation", juste présence douce
      - Ton: acceptation totale, zéro performance
      - Ne JAMAIS mentionner durée ou accumulation`,

    overwhelmed: `ADAPTATION SUBTILE: Submersion récurrente.
      - Simplification extrême (un point focal, une sensation)
      - Réduction de stimuli mentaux
      - Ancrage dans l'instant le plus simple possible
      - Ton: calme absolu, minimalisme verbal
      - Ne JAMAIS mentionner complexité ou charge`,

    alone: `ADAPTATION SUBTILE: Solitude fréquente.
      - Connexion à quelque chose de plus grand (nature, humanité, univers)
      - Sentiment d'appartenance subtil
      - Présence intérieure comme compagnie
      - Ton: chaleur humaine, universalité
      - Ne JAMAIS mentionner isolement ou manque`,

    lost: `ADAPTATION SUBTILE: Confusion récurrente.
      - OK de ne pas savoir, validation du flou
      - Une toute petite clarté suffit (pas besoin de vision complète)
      - Confiance dans le processus plutôt que destination
      - Ton: acceptation de l'incertitude, guidance douce
      - Ne JAMAIS mentionner perte de direction`
  };

  return adaptations[mood] || `ADAPTATION SUBTILE: Mood récurrent détecté.
    - Approche respectueuse et adaptée à cette émotion
    - Profondeur appropriée sans mention de patterns
    - Ton stable et présent`;
}

/**
 * Calculate current Moon position and phase using astronomy-engine
 * Returns subtle astrological influence for meditation tone
 */
async function getCurrentLunarTransit(currentDateTime) {
  try {
    // Dynamic import - astronomy-engine exports functions directly (no default export)
    const Astronomy = await import('astronomy-engine');

    // Create AstroTime from current date
    const now = new Astronomy.AstroTime(currentDateTime);

    // Get Moon phase (0 = new moon, 0.5 = full moon, 1 = new moon)
    const phase = Astronomy.MoonPhase(now);

    // Get Moon's ecliptic longitude to determine zodiac sign
    const moonEcliptic = Astronomy.Ecliptic(Astronomy.GeoVector('Moon', now, true));
    const moonLongitude = moonEcliptic.elon; // 0-360 degrees

    // Determine Moon sign (each sign is 30 degrees)
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const moonSignIndex = Math.floor(moonLongitude / 30);
    const moonSign = signs[moonSignIndex];

    // Determine element (Fire/Earth/Air/Water)
    const elementMap = {
      Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
      Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
      Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
      Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water'
    };
    const moonElement = elementMap[moonSign];

    // Determine Moon phase name
    let phaseName;
    if (phase < 0.125) phaseName = 'Nouvelle Lune';
    else if (phase < 0.375) phaseName = 'Premier Croissant';
    else if (phase < 0.625) phaseName = 'Pleine Lune';
    else if (phase < 0.875) phaseName = 'Dernier Croissant';
    else phaseName = 'Nouvelle Lune';

    return {
      moonSign,
      moonElement,
      phaseName,
      phaseValue: phase,
      transitGuidance: getLunarTransitGuidance(moonElement, phaseName)
    };

  } catch (error) {
    console.error('Lunar transit calculation failed:', error);
    return null;
  }
}

/**
 * Provides subtle guidance based on current Moon transit
 * Influences metaphor selection and energy tone
 */
function getLunarTransitGuidance(moonElement, phaseName) {
  const elementGuidance = {
    Fire: `INFLUENCE LUNAIRE (Feu):
      - Métaphores: flamme, lumière, chaleur, énergie montante
      - Rythme: plus vif et dynamique
      - Ton: motivant, vivifiant, invitation à l'action intérieure`,

    Earth: `INFLUENCE LUNAIRE (Terre):
      - Métaphores: racines, pierre, montagne, terre ferme, croissance
      - Rythme: stable et ancré
      - Ton: solide, concret, sensoriel et tangible`,

    Air: `INFLUENCE LUNAIRE (Air):
      - Métaphores: vent, souffle, espace, légèreté, circulation
      - Rythme: fluide et aérien
      - Ton: clarté mentale, perspective, observation`,

    Water: `INFLUENCE LUNAIRE (Eau):
      - Métaphores: océan, vague, pluie, ruisseau, profondeur
      - Rythme: coulant et ondulant
      - Ton: émotionnel, intuitif, fluide et enveloppant`
  };

  const phaseGuidance = {
    'Nouvelle Lune': `PHASE: Introspection, nouveaux départs intérieurs, potentiel non manifesté`,
    'Premier Croissant': `PHASE: Croissance, émergence, construction progressive`,
    'Pleine Lune': `PHASE: Plénitude, illumination, apogée émotionnel`,
    'Dernier Croissant': `PHASE: Lâcher-prise, libération, préparation au renouveau`
  };

  return `${elementGuidance[moonElement]}\n${phaseGuidance[phaseName]}`;
}

/**
 * Structural differentiation between Iza and Dann
 * Iza = Guided experience | Dann = Socratic dialogue
 */
function getStructuralGuidance(guideType) {
  if (guideType === 'meditation') {
    // IZA - Structure de guidage immersif
    return `STRUCTURE NARRATIVE IZA (Méditation Guidée):

MODE: EXPÉRIENCE ACCOMPAGNÉE
- Tu guides l'utilisateur à TRAVERS une expérience
- Voix narrative: "Tu remarques... tu peux sentir... tu explores..."
- Affirmations douces: "Tu es en sécurité... c'est OK... tu mérites..."
- Métaphores sensorielles riches
- Rythme hypnotique avec pauses ("...")

ARCHITECTURE:
[Invitation] → [Immersion sensorielle] → [Transformation] → [Ancrage]

OUTILS LINGUISTIQUES:
- Suggestions permissives: "Tu peux...", "Peut-être tu remarques...", "Comme si..."
- Présent continu: "Tu sens... tu observes... tu découvres..."
- Descriptions sensorielles: couleurs, textures, températures, sons
- Répétitions rythmiques subtiles (PNL)
- Pauses intégrées pour absorption ("...")

INTERDICTIONS:
❌ Questions directes type Socratic
❌ Confrontations ou challenges
❌ Ton didactique ou professoral
❌ Analyse logique

TON GÉNÉRAL: Enveloppant, sécurisant, présent, doux mais profond`;
  }

  // DANN - Structure socratique confrontante
  return `STRUCTURE NARRATIVE DANN (Réflexion Socratique):

MODE: DIALOGUE INTÉRIEUR RÉVÉLATEUR
- Tu QUESTIONNES l'utilisateur pour révéler ses propres insights
- Voix narrative: Questions directes, affirmations franches
- Challenges bienveillants mais directs
- Logique et lucidité plutôt que métaphores
- Rythme vif, présent, engageant

ARCHITECTURE:
[Question initiale] → [Déconstruction] → [Révélation] → [Action]

OUTILS LINGUISTIQUES:
- Questions socratiques: "Et si... ?", "Qu'est-ce qui t'empêche vraiment de... ?"
- Confrontations douces: "Tu dis X, mais..."
- Reformulations miroir: "Alors tu choisis de..."
- Invitations à la responsabilité: "Que vas-tu faire maintenant ?"
- Pas de pauses longues - rythme conversationnel

EXEMPLES DE QUESTIONS:
- "Quelle part de cette situation contrôles-tu vraiment ?"
- "Si ce problème disparaissait demain, qui serais-tu ?"
- "Qu'est-ce que cette émotion essaie de te dire ?"
- "Combien de temps encore vas-tu attendre ?"

INTERDICTIONS:
❌ Langage hypnotique ou vague
❌ "Tu peux sentir..." (trop passif)
❌ Métaphores élaborées (sauf très brèves)
❌ Répétitions rythmiques

TON GÉNÉRAL: Direct mais bienveillant, lucide, responsabilisant, parfois provocateur avec compassion`;
}

// Fonctions buildIzaPhilosophy et buildDannPhilosophy supprimées - optimisation
// Les philosophies sont maintenant intégrées directement dans le systemPrompt

function buildIzaInstructions(userName, duration) {
  const baseTools = `Boîte à outils PNL/Ericksonian (utilisés avec fluidité, JAMAIS nommés):
- Suggestions permissives et indirectes
- Ancrage corporel sensoriel
- Visualisation incarnée
- Recadrage cognitif subtil
- Dissociation / association
- Travail sur la ligne du temps intérieure`;

  if (duration === 2) {
    return `DURÉE: 2 MINUTES (~240-300 mots)
STYLE: ULTRA-PRAGMATIQUE ET DIRECT

STRUCTURE OBLIGATOIRE:
1. ANCRAGE IMMÉDIAT (20 secondes)
   - Une instruction corporelle concrète (respiration OU sensation)
   - Zéro fluff, direct au cœur

2. TECHNIQUE UNIQUE (60 secondes)
   - UNE SEULE pratique puissante, pas plus
   - Instructions claires et actionnables
   - Exemple: Recadrage en 3 respirations, Ancrage sensoriel express, Dissociation rapide

3. INTÉGRATION ÉCLAIR (20 secondes)
   - Une phrase d'ancrage pour emporter
   - Permission de revenir à la vie

RÈGLES STRICTES:
- Aucune introduction poétique
- Aucune métaphore élaborée (MAX une image simple si vraiment utile)
- Vocabulaire simple et direct
- Phrases courtes et rythmées
- Zéro répétition
- Efficacité maximale
- Utilise le prénom ${userName} 1-2 fois maximum

TON: Calme mais efficace, comme un coach bienveillant qui respecte ton temps

${baseTools}

CRÉATIVITÉ: Même en 2 minutes, chaque méditation est unique. Change la technique choisie selon l'intention.`;
  }

  if (duration === 6) {
    return `DURÉE: 6 MINUTES (~720-900 mots)
STYLE: VOYAGE IMMERSIF ET COMPLET

STRUCTURE NARRATIVE RECOMMANDÉE:
1. SEUIL D'ENTRÉE (60 secondes)
   - Transition douce du monde extérieur
   - Établissement d'un espace intérieur
   - Invitation sensorielle

2. EXPLORATION PROFONDE (2-3 minutes)
   - Développement d'un univers métaphorique cohérent
   - Voyage à travers différents niveaux (corporel → émotionnel → mental)
   - Techniques entrelacées avec fluidité
   - Moments de silence intégrés ("...")

3. TRANSFORMATION (90 secondes)
   - Travail sur plusieurs dimensions
   - Recadrage progressif
   - Expériences sensorielles détaillées

4. INTÉGRATION ET ANCRAGE (60 secondes)
   - Consolidation des insights
   - Création d'un pont vers le quotidien
   - Fermeture en douceur avec ouverture

OUTILS NARRATIFS DISPONIBLES:
- Architecture narrative (début/milieu/fin avec arc transformationnel)
- Métaphores cohérentes (développer UN univers complet)
- Symbolisme naturel
- Rythme variable (accélération/ralentissement)
- Silences stratégiques pour absorption
- Utilise le prénom ${userName} naturellement 3-4 fois

${baseTools}

PROFONDEUR:
- Plusieurs couches de sens (littéral, métaphorique)
- Connexion à des thèmes universels
- Espace pour réflexion personnelle

CRÉATIVITÉ TOTALE: Invente un voyage complet, original, une expérience sensorielle et psychologique riche.`;
  }

  // Duration 4 (default)
  return `DURÉE: 4 MINUTES (~480-600 mots)
STYLE: ÉQUILIBRÉ ET TRANSFORMATEUR

STRUCTURE ORGANIQUE:
- Ouverture naturelle (ancrage initial)
- Développement fluide de la pratique
- Transformation progressive
- Intégration et fermeture

APPROCHE:
- Balance entre guidage et autonomie
- Métaphores pertinentes mais pas envahissantes
- Rythme naturel avec pauses ("...")
- Profondeur sans surcharge
- Utilise le prénom ${userName} naturellement 2-3 fois

${baseTools}

TON: Voix douce et hypnotique, présence bienveillante, rythme lent et naturel.

CRÉATIVITÉ RADICALE: Chaque méditation émerge de l'intersection unique mood + intention + moment + contexte astral. Pas de formules préfabriquées.`;
}

function buildDannInstructions(userName, duration) {
  const baseTools = `BOÎTE À OUTILS RÉFLEXIVE (utilisés avec fluidité, JAMAIS nommés):
- Psychologie adlérienne: responsabilité, choix, but caché des comportements
- Philosophie stoïcienne: dichotomie du contrôle, acceptation active
- Responsabilité radicale: tout ce qui arrive est une opportunité
- Dialogue socratique: questions révélatrices, non-jugement`;

  if (duration === 2) {
    return `DURÉE: 2 MINUTES (~250-300 mots)
STYLE: RÉFLEXION ÉCLAIR - Direct et percutant

STRUCTURE OBLIGATOIRE:
1. QUESTION PERCUTANTE (30 secondes)
   - UNE seule question qui va droit au cœur
   - Pas d'introduction, pas de contexte
   - La question doit provoquer un déclic immédiat

2. DÉCLIC (60 secondes)
   - Court développement qui amplifie la question
   - Reformulation miroir: "Tu dis X, mais..."
   - Révéler la contradiction ou l'évidence cachée

3. ACTION IMMÉDIATE (30 secondes)
   - Une invitation concrète, actionnable maintenant
   - "Qu'est-ce que tu vas faire dans les 5 prochaines minutes?"

RÈGLES STRICTES:
- Zéro métaphore, zéro poésie
- Langage direct, phrases courtes
- Maximum 2-3 questions au total
- Utilise le prénom ${userName} 1-2 fois maximum
- Respecte le temps: va à l'essentiel

TON: Comme un ami lucide qui n'a que 2 minutes et refuse de les perdre

${baseTools}

CRÉATIVITÉ: Même en 2 minutes, chaque réflexion est unique. La question centrale émerge de l'intention spécifique.`;
  }

  if (duration === 6) {
    return `DURÉE: 6 MINUTES (~720-900 mots)
STYLE: RÉFLEXION PROFONDE - Exploration multi-angles

STRUCTURE NARRATIVE RECOMMANDÉE:
1. MISE EN CONTEXTE (45 secondes)
   - Reconnaissance de l'état émotionnel actuel
   - Première question d'ouverture (large)

2. EXPLORATION MULTI-ANGLES (2-3 minutes)
   - Questions en cascade: surface → profondeur
   - Explorer 2-3 perspectives différentes sur le même sujet
   - Reformulations miroir fréquentes
   - Laisser de l'espace entre les questions ("...")

3. CONFRONTATION DOUCE (90 secondes)
   - Révéler les contradictions avec compassion
   - "D'un côté tu dis... de l'autre tu fais..."
   - Questions qui exposent les croyances limitantes

4. SYNTHÈSE ET ENGAGEMENT (90 secondes)
   - Reformuler l'insight principal
   - Invitation à un engagement concret
   - Question finale orientée action

OUTILS NARRATIFS:
- Questions socratiques profondes
- Reformulations paradoxales
- Silences stratégiques ("...")
- Confrontation bienveillante
- Utilise le prénom ${userName} naturellement 3-4 fois

${baseTools}

PROFONDEUR:
- Plusieurs couches de questionnement
- Connexion entre l'intention et les patterns de vie
- Espace pour que ${userName} "entende" ses propres contradictions

CRÉATIVITÉ TOTALE: Invente un dialogue intérieur révélateur, unique à cette combinaison mood + intention + contexte.`;
  }

  // Duration 4 (default)
  return `DURÉE: 4 MINUTES (~480-600 mots)
STYLE: RÉFLEXION ÉQUILIBRÉE - Conversationnel et challengeant

STRUCTURE ORGANIQUE:
1. QUESTION D'OUVERTURE (45 secondes)
   - Une question qui ouvre le sujet
   - Contextualise l'intention choisie

2. DÉCONSTRUCTION (90 secondes)
   - 1-2 questions de suivi qui creusent
   - Explorer UN angle spécifique en profondeur
   - Reformulation miroir pour ancrer

3. INSIGHT (60 secondes)
   - Révéler ce qui était caché
   - Challenge bienveillant: "Et si...?"
   - Retourner la perspective

4. ACTION (45 secondes)
   - Invitation concrète
   - Question orientée vers le prochain pas

APPROCHE:
- Équilibre entre écoute et challenge
- 4-5 questions maximum
- Rythme conversationnel avec pauses ("...")
- Utilise le prénom ${userName} naturellement 2-3 fois

${baseTools}

TON: Comme un coach-ami qui pose les questions que personne n'ose poser, avec bienveillance.

CRÉATIVITÉ RADICALE: Chaque réflexion émerge de l'intersection unique mood + intention + moment + contexte astral. Pas de formules préfabriquées.`;
}

function buildAstrologicalContext(profile, userName) {
  const elementTone = {
    'Feu': 'dynamique, motivant, action, confiance',
    'Terre': 'ancré, concret, patient, stable',
    'Air': 'clair, intellectuel, perspectif, fluide',
    'Eau': 'doux, émotionnel, intuitif, enveloppant'
  };

  const energyFocus = {
    'Extravertie': 'connexion, partage, impact social',
    'Introvertie': 'introspection, monde intérieur, réflexion',
    'Ambivertie': 'équilibre introspection-connexion'
  };

  const qualityStyle = {
    'Cardinal': 'initiation, premier pas, démarrage',
    'Fixe': 'persévérance, engagement, stabilité',
    'Mutable': 'flexibilité, adaptation, ouverture'
  };

  return `
PROFIL ASTROLOGIQUE (${userName}):
☉ ${profile.sunSign} | ☽ ${profile.moonSign} | ASC ${profile.ascendant}
Élément ${profile.dominantElement} | Énergie ${profile.energyType} | Qualité ${profile.dominantQuality}

Adapte TON et MÉTAPHORES selon ces archétypes:
- Langage: ${elementTone[profile.dominantElement] || 'adapté'}
- Focus: ${energyFocus[profile.energyType] || 'équilibré'}
- Style: ${qualityStyle[profile.dominantQuality] || 'fluide'}

Infuse ces qualités de façon organique (jamais explicite).
`;
}

// Fonctions supprimées - optimisation: getMoodToneGuidance, getElementGuidance, getEnergyGuidance, getQualityGuidance
// Ces guidances sont redondantes avec les données mood.description et le profil astrologique
// Sonnet 4.5 adapte naturellement le ton depuis ces informations
