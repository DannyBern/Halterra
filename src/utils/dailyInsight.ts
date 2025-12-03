/**
 * Daily Insight Generator
 * Combines natal profile with current cosmic energies
 * Creates unique, personalized messages that change daily
 */

import type { AstrologicalProfile } from '../types';
import { calculateSunSign, type ZodiacSign } from './astrologicalProfile';

// ============================================
// CURRENT COSMIC ENERGIES
// ============================================

/**
 * Get the current Sun sign (where the Sun is today)
 */
function getCurrentSunSign(): ZodiacSign {
  return calculateSunSign(new Date());
}

/**
 * Calculate the current moon phase (0-7)
 * 0: New Moon, 2: First Quarter, 4: Full Moon, 6: Last Quarter
 */
function getMoonPhase(): number {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  // Simplified moon phase calculation
  // Based on the synodic month (~29.53 days)
  const c = Math.floor(365.25 * year);
  const e = Math.floor(30.6 * month);
  const jd = c + e + day - 694039.09; // Julian date approximation
  const phase = jd / 29.53058867; // Divide by synodic month
  const phaseIndex = Math.floor((phase - Math.floor(phase)) * 8);

  return phaseIndex;
}

/**
 * Get moon phase name in French
 */
function getMoonPhaseName(phase: number): string {
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

/**
 * Get the planetary ruler of today (based on day of week)
 */
function getTodayPlanet(): { name: string; theme: string } {
  const day = new Date().getDay();
  const planets = [
    { name: 'Soleil', theme: 'expression de soi' },      // Dimanche
    { name: 'Lune', theme: 'intuition' },                // Lundi
    { name: 'Mars', theme: 'action' },                   // Mardi
    { name: 'Mercure', theme: 'communication' },         // Mercredi
    { name: 'Jupiter', theme: 'expansion' },             // Jeudi
    { name: 'Vénus', theme: 'harmonie' },                // Vendredi
    { name: 'Saturne', theme: 'structure' }              // Samedi
  ];
  return planets[day];
}

// ============================================
// ELEMENT INTERACTIONS
// ============================================

type Element = 'Feu' | 'Terre' | 'Air' | 'Eau';

function getSignElement(sign: ZodiacSign): Element {
  const elements: Record<ZodiacSign, Element> = {
    'Bélier': 'Feu', 'Lion': 'Feu', 'Sagittaire': 'Feu',
    'Taureau': 'Terre', 'Vierge': 'Terre', 'Capricorne': 'Terre',
    'Gémeaux': 'Air', 'Balance': 'Air', 'Verseau': 'Air',
    'Cancer': 'Eau', 'Scorpion': 'Eau', 'Poissons': 'Eau'
  };
  return elements[sign];
}

/**
 * Get the interaction between natal element and today's element
 */
function getElementInteraction(natalElement: Element, todayElement: Element): 'harmonie' | 'défi' | 'stimulation' | 'même' {
  if (natalElement === todayElement) return 'même';

  const harmonies: Record<Element, Element> = {
    'Feu': 'Air', 'Air': 'Feu',
    'Terre': 'Eau', 'Eau': 'Terre'
  };

  const challenges: Record<Element, Element> = {
    'Feu': 'Eau', 'Eau': 'Feu',
    'Terre': 'Air', 'Air': 'Terre'
  };

  if (harmonies[natalElement] === todayElement) return 'harmonie';
  if (challenges[natalElement] === todayElement) return 'défi';
  return 'stimulation';
}

// ============================================
// DAILY MESSAGE GENERATION
// ============================================

interface DailyEnergy {
  currentSign: ZodiacSign;
  currentElement: Element;
  moonPhase: number;
  moonPhaseName: string;
  planet: { name: string; theme: string };
  elementInteraction: 'harmonie' | 'défi' | 'stimulation' | 'même';
}

function getDailyEnergy(natalElement: Element): DailyEnergy {
  const currentSign = getCurrentSunSign();
  const currentElement = getSignElement(currentSign);
  const moonPhase = getMoonPhase();

  return {
    currentSign,
    currentElement,
    moonPhase,
    moonPhaseName: getMoonPhaseName(moonPhase),
    planet: getTodayPlanet(),
    elementInteraction: getElementInteraction(natalElement, currentElement)
  };
}

/**
 * Generate a unique daily insight based on natal profile + current energies
 */
export function generateDailyInsight(profile: AstrologicalProfile): string {
  const energy = getDailyEnergy(profile.dominantElement as Element);
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);

  // Use day of year + profile to create variation
  const seed = (dayOfYear + profile.lifePath) % 100;

  // Different message templates based on element interaction
  const messages = generateMessagePool(profile, energy, seed);

  // Select message based on seed for daily variation
  const messageIndex = seed % messages.length;
  return messages[messageIndex];
}

function generateMessagePool(
  profile: AstrologicalProfile,
  energy: DailyEnergy,
  _seed: number
): string[] {
  const messages: string[] = [];
  const { dominantElement, energyType, dominantQuality, yinYang } = profile;
  const { moonPhase, planet, elementInteraction, currentSign } = energy;

  // Moon phase specific messages
  if (moonPhase === 0) {
    // New Moon - new beginnings
    messages.push(
      `Cette nouvelle lune vous invite à poser une intention qui résonne avec votre nature ${dominantElement.toLowerCase()}.`,
      `Un nouveau cycle commence. Votre énergie ${energyType.toLowerCase()} peut aujourd'hui se tourner vers l'intérieur pour clarifier vos désirs.`
    );
  } else if (moonPhase === 4) {
    // Full Moon - culmination
    messages.push(
      `La pleine lune illumine ce que vous avez cultivé. Votre tempérament ${dominantQuality.toLowerCase()} vous aide à récolter.`,
      `L'énergie lunaire est à son apogée. C'est un moment propice pour votre nature ${yinYang.toLowerCase()} de s'exprimer pleinement.`
    );
  }

  // Element interaction messages
  if (elementInteraction === 'harmonie') {
    messages.push(
      `L'énergie ${energy.currentElement.toLowerCase()} du moment soutient harmonieusement votre nature ${dominantElement.toLowerCase()}. Laissez-vous porter.`,
      `Les astres créent aujourd'hui un terrain favorable à votre tempérament. Votre intuition est votre meilleur guide.`
    );
  } else if (elementInteraction === 'défi') {
    messages.push(
      `L'énergie ambiante contraste avec votre nature ${dominantElement.toLowerCase()}. C'est une invitation à explorer une facette moins familière de vous-même.`,
      `Une tension créative se dessine aujourd'hui. Votre qualité ${dominantQuality.toLowerCase()} vous aide à transformer ce défi en croissance.`
    );
  } else if (elementInteraction === 'stimulation') {
    messages.push(
      `Une énergie stimulante colore cette journée. Votre approche ${energyType.toLowerCase()} saura en tirer le meilleur.`,
      `Le cosmos offre aujourd'hui une dynamique intéressante. Restez ouvert aux surprises que votre nature ${dominantElement.toLowerCase()} saura accueillir.`
    );
  } else {
    messages.push(
      `L'énergie du jour résonne profondément avec votre essence ${dominantElement.toLowerCase()}. Vous êtes dans votre élément.`,
      `Les astres amplifient aujourd'hui vos qualités naturelles. C'est le moment d'être pleinement vous-même.`
    );
  }

  // Planet of the day messages
  messages.push(
    `Sous l'influence de ${planet.name}, l'${planet.theme} est favorisée. Votre nature ${yinYang.toLowerCase()} peut s'exprimer à travers ce thème.`,
    `${planet.name} colore cette journée d'une énergie d'${planet.theme}. Votre tempérament ${dominantQuality.toLowerCase()} saura l'utiliser à bon escient.`
  );

  // Energy type specific messages
  if (energyType === 'Introvertie') {
    messages.push(
      `Honorez votre besoin de calme aujourd'hui. Votre monde intérieur riche a des messages pour vous.`,
      `Dans le silence, votre sagesse ${dominantElement.toLowerCase()} se révèle. Accordez-vous des moments de solitude.`
    );
  } else if (energyType === 'Extravertie') {
    messages.push(
      `Votre énergie rayonnante peut aujourd'hui inspirer ceux qui vous entourent.`,
      `Les connexions humaines nourrissent votre âme ${dominantElement.toLowerCase()}. Osez partager ce qui vous anime.`
    );
  } else {
    messages.push(
      `Écoutez ce dont vous avez besoin aujourd'hui - solitude ou connexion. Votre équilibre naturel sait.`,
      `Votre capacité à naviguer entre introspection et échange est un don. Faites-vous confiance.`
    );
  }

  // Quality specific messages
  if (dominantQuality === 'Cardinal') {
    messages.push(
      `Votre instinct d'initiateur peut aujourd'hui créer quelque chose de nouveau, même petit.`,
      `L'énergie du moment favorise les nouveaux départs. Votre nature pionnière est sollicitée.`
    );
  } else if (dominantQuality === 'Fixe') {
    messages.push(
      `Votre persévérance est votre force. Continuez ce que vous avez commencé avec confiance.`,
      `La stabilité que vous apportez au monde est précieuse. Ancrez-vous dans votre constance.`
    );
  } else {
    messages.push(
      `Votre adaptabilité est un atout aujourd'hui. Les changements peuvent être des opportunités.`,
      `Laissez votre flexibilité naturelle vous guider à travers les nuances de cette journée.`
    );
  }

  // Current zodiac season messages
  const seasonMessages = getZodiacSeasonMessage(currentSign, profile);
  messages.push(...seasonMessages);

  return messages;
}

function getZodiacSeasonMessage(currentSign: ZodiacSign, profile: AstrologicalProfile): string[] {
  const messages: string[] = [];

  // If current season matches natal sun sign
  if (currentSign === profile.sunSign) {
    messages.push(
      `Le Soleil traverse votre signe. C'est votre saison pour briller et vous renouveler.`,
      `L'énergie solaire actuelle amplifie votre essence. Célébrez qui vous êtes.`
    );
  }

  // Season-specific insights
  const seasonThemes: Record<ZodiacSign, string> = {
    'Bélier': 'nouveaux départs et courage',
    'Taureau': 'ancrage et plaisirs sensoriels',
    'Gémeaux': 'curiosité et communication',
    'Cancer': 'nurturance et émotions',
    'Lion': 'créativité et expression',
    'Vierge': 'organisation et service',
    'Balance': 'harmonie et relations',
    'Scorpion': 'transformation et profondeur',
    'Sagittaire': 'expansion et quête de sens',
    'Capricorne': 'ambition et structure',
    'Verseau': 'innovation et communauté',
    'Poissons': 'intuition et compassion'
  };

  messages.push(
    `La saison ${currentSign} invite aux ${seasonThemes[currentSign]}. Comment cela résonne-t-il avec votre nature ${profile.dominantElement.toLowerCase()}?`
  );

  return messages;
}

/**
 * Get a subtle label for the insight card
 */
export function getInsightLabel(): string {
  const moonPhase = getMoonPhase();
  const planet = getTodayPlanet();

  // Vary the label based on cosmic factors
  const labels = [
    'Selon les astres aujourd\'hui',
    'L\'énergie du jour suggère',
    'Votre ciel personnel',
    `Sous l\'influence de ${planet.name}`,
    'Les astres murmurent'
  ];

  // Use moon phase to vary
  if (moonPhase === 0) return 'En cette nouvelle lune';
  if (moonPhase === 4) return 'Sous la pleine lune';

  return labels[moonPhase % labels.length];
}
