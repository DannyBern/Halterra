/**
 * Système Astrologique Complet
 * Calcule profil astrologique détaillé avec analyse croisée
 */

export interface AstrologicalProfile {
  // Astrologie Occidentale
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
  ascendant: ZodiacSign;

  // Astrologie Chinoise
  chineseZodiac: ChineseAnimal;
  chineseElement: ChineseElement;
  yinYang: 'Yin' | 'Yang';

  // Numérologie
  lifePath: number;

  // Analyse Croisée
  dominantElement: 'Feu' | 'Terre' | 'Air' | 'Eau';
  dominantQuality: 'Cardinal' | 'Fixe' | 'Mutable';
  energyType: 'Introvertie' | 'Extravertie' | 'Ambivertie';

  // Métadonnées
  birthDate: string;
  birthTime: string;
  birthLocation: string;

  // Signature personnalisée
  signature: string;
  description: string;
}

export type ZodiacSign =
  | 'Bélier' | 'Taureau' | 'Gémeaux' | 'Cancer'
  | 'Lion' | 'Vierge' | 'Balance' | 'Scorpion'
  | 'Sagittaire' | 'Capricorne' | 'Verseau' | 'Poissons';

export type ChineseAnimal =
  | 'Rat' | 'Buffle' | 'Tigre' | 'Lapin'
  | 'Dragon' | 'Serpent' | 'Cheval' | 'Chèvre'
  | 'Singe' | 'Coq' | 'Chien' | 'Cochon';

export type ChineseElement = 'Bois' | 'Feu' | 'Terre' | 'Métal' | 'Eau';

interface BirthData {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
}

/**
 * Calcule le signe du zodiaque basé sur la date de naissance
 */
export function calculateSunSign(date: Date): ZodiacSign {
  const month = date.getMonth() + 1; // 1-12
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
  return 'Poissons'; // (month === 2 && day >= 19) || (month === 3 && day <= 20)
}

/**
 * Calcule le signe lunaire (position de la Lune à la naissance)
 * Approximation basée sur l'heure de naissance
 * La Lune se déplace d'environ 13° par jour (environ 1 signe tous les 2.5 jours)
 */
export function calculateMoonSign(date: Date, timeHour: number): ZodiacSign {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);

  // La Lune fait un cycle complet (12 signes) en environ 27.3 jours
  const lunarCycleDays = 27.3;
  const signDuration = lunarCycleDays / 12; // ~2.275 jours par signe

  // Position approximative de la Lune basée sur le jour de l'année et l'heure
  const hourFraction = timeHour / 24;
  const totalDays = dayOfYear + hourFraction;
  const lunarPosition = (totalDays / signDuration) % 12;

  const signs: ZodiacSign[] = [
    'Bélier', 'Taureau', 'Gémeaux', 'Cancer',
    'Lion', 'Vierge', 'Balance', 'Scorpion',
    'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'
  ];

  return signs[Math.floor(lunarPosition)];
}

/**
 * Calcule l'ascendant (signe qui se levait à l'horizon Est à l'heure de naissance)
 * Approximation basée sur heure de naissance et signe solaire
 * Note: Un calcul précis nécessiterait latitude/longitude exactes
 */
export function calculateAscendant(_date: Date, timeHour: number, sunSign: ZodiacSign): ZodiacSign {
  const signs: ZodiacSign[] = [
    'Bélier', 'Taureau', 'Gémeaux', 'Cancer',
    'Lion', 'Vierge', 'Balance', 'Scorpion',
    'Sagittaire', 'Capricorne', 'Verseau', 'Poissons'
  ];

  const sunIndex = signs.indexOf(sunSign);

  // L'ascendant change environ toutes les 2 heures
  // À l'aube (6h), l'ascendant est généralement le même que le signe solaire
  const hourOffset = Math.floor((timeHour - 6 + 24) / 2) % 12;
  const ascendantIndex = (sunIndex + hourOffset) % 12;

  return signs[ascendantIndex];
}

/**
 * Calcule l'animal du zodiaque chinois basé sur l'année de naissance
 */
export function calculateChineseZodiac(year: number): ChineseAnimal {
  const animals: ChineseAnimal[] = [
    'Rat', 'Buffle', 'Tigre', 'Lapin',
    'Dragon', 'Serpent', 'Cheval', 'Chèvre',
    'Singe', 'Coq', 'Chien', 'Cochon'
  ];

  // Le cycle chinois a commencé en 1924 (année du Rat)
  // Formule: (année - 1924) % 12
  const index = (year - 1924) % 12;
  return animals[index < 0 ? index + 12 : index];
}

/**
 * Calcule l'élément chinois basé sur l'année de naissance
 */
export function calculateChineseElement(year: number): ChineseElement {
  // Chaque élément couvre 2 années consécutives
  // Le cycle a commencé en 1924 avec Métal
  const lastDigit = year % 10;

  if (lastDigit === 0 || lastDigit === 1) return 'Métal';
  if (lastDigit === 2 || lastDigit === 3) return 'Eau';
  if (lastDigit === 4 || lastDigit === 5) return 'Bois';
  if (lastDigit === 6 || lastDigit === 7) return 'Feu';
  return 'Terre'; // 8 ou 9
}

/**
 * Détermine Yin ou Yang basé sur l'année de naissance
 */
export function calculateYinYang(year: number): 'Yin' | 'Yang' {
  return year % 2 === 0 ? 'Yang' : 'Yin';
}

/**
 * Calcule le chemin de vie en numérologie
 */
export function calculateLifePath(date: Date): number {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const digits = dateStr.replace(/-/g, '').split('').map(Number);

  const reduceToSingleDigit = (num: number): number => {
    // Nombres maîtres: 11, 22, 33 ne sont pas réduits
    if (num === 11 || num === 22 || num === 33) return num;

    while (num > 9) {
      num = num.toString().split('').map(Number).reduce((a, b) => a + b, 0);
      if (num === 11 || num === 22 || num === 33) return num;
    }
    return num;
  };

  const sum = digits.reduce((a, b) => a + b, 0);
  return reduceToSingleDigit(sum);
}

/**
 * Obtient l'élément occidental d'un signe
 */
export function getWesternElement(sign: ZodiacSign): 'Feu' | 'Terre' | 'Air' | 'Eau' {
  const fireSigns = ['Bélier', 'Lion', 'Sagittaire'];
  const earthSigns = ['Taureau', 'Vierge', 'Capricorne'];
  const airSigns = ['Gémeaux', 'Balance', 'Verseau'];

  if (fireSigns.includes(sign)) return 'Feu';
  if (earthSigns.includes(sign)) return 'Terre';
  if (airSigns.includes(sign)) return 'Air';
  return 'Eau';
}

/**
 * Obtient la qualité (modalité) d'un signe
 */
export function getQuality(sign: ZodiacSign): 'Cardinal' | 'Fixe' | 'Mutable' {
  const cardinalSigns = ['Bélier', 'Cancer', 'Balance', 'Capricorne'];
  const fixedSigns = ['Taureau', 'Lion', 'Scorpion', 'Verseau'];

  if (cardinalSigns.includes(sign)) return 'Cardinal';
  if (fixedSigns.includes(sign)) return 'Fixe';
  return 'Mutable';
}

/**
 * Analyse croisée pour déterminer l'élément dominant
 */
export function calculateDominantElement(
  sunSign: ZodiacSign,
  moonSign: ZodiacSign,
  ascendant: ZodiacSign
): 'Feu' | 'Terre' | 'Air' | 'Eau' {
  const _elements = [
    getWesternElement(sunSign),
    getWesternElement(moonSign),
    getWesternElement(ascendant)
  ];

  // Compte les occurrences de chaque élément
  const count: Record<string, number> = {};
  _elements.forEach((el: string) => count[el] = (count[el] || 0) + 1);

  // Retourne l'élément le plus fréquent
  const dominant = Object.entries(count).sort((a, b) => b[1] - a[1])[0][0];
  return dominant as 'Feu' | 'Terre' | 'Air' | 'Eau';
}

/**
 * Analyse croisée pour déterminer la qualité dominante
 */
export function calculateDominantQuality(
  sunSign: ZodiacSign,
  moonSign: ZodiacSign,
  ascendant: ZodiacSign
): 'Cardinal' | 'Fixe' | 'Mutable' {
  const qualities = [
    getQuality(sunSign),
    getQuality(moonSign),
    getQuality(ascendant)
  ];

  const count: Record<string, number> = {};
  qualities.forEach(q => count[q] = (count[q] || 0) + 1);

  const dominant = Object.entries(count).sort((a, b) => b[1] - a[1])[0][0];
  return dominant as 'Cardinal' | 'Fixe' | 'Mutable';
}

/**
 * Détermine le type d'énergie basé sur l'analyse croisée
 */
export function calculateEnergyType(
  sunSign: ZodiacSign,
  moonSign: ZodiacSign,
  ascendant: ZodiacSign,
  yinYang: 'Yin' | 'Yang'
): 'Introvertie' | 'Extravertie' | 'Ambivertie' {
  const sunElement = getWesternElement(sunSign);
  const moonElement = getWesternElement(moonSign);
  const ascElement = getWesternElement(ascendant);

  // Feu et Air = Extraverti, Terre et Eau = Introverti
  const extravertElements = ['Feu', 'Air'];

  const extravertCount = [sunElement, moonElement, ascElement]
    .filter(el => extravertElements.includes(el)).length;

  // Yang = extraverti, Yin = introverti
  const yangBonus = yinYang === 'Yang' ? 0.5 : -0.5;
  const totalExtravert = extravertCount + yangBonus;

  if (totalExtravert >= 2.5) return 'Extravertie';
  if (totalExtravert <= 1) return 'Introvertie';
  return 'Ambivertie';
}

/**
 * Génère une signature personnalisée basée sur l'analyse croisée complète
 */
export function generateSignature(profile: AstrologicalProfile): string {
  const { sunSign, moonSign, ascendant, chineseZodiac, dominantElement, energyType } = profile;

  // Signatures uniques basées sur combinaisons
  const signatures: Record<string, string> = {
    // Feu dominant
    'Feu-Extravertie': 'Votre flamme intérieure illumine le chemin. Embrasez le monde de votre passion.',
    'Feu-Introvertie': 'Votre feu brûle en silence. Canalisez cette puissance vers vos rêves profonds.',
    'Feu-Ambivertie': 'Vous dansez entre flamme vive et braise calme. Votre feu s\'adapte à chaque moment.',

    // Terre dominant
    'Terre-Extravertie': 'Vos racines sont profondes, votre présence solide. Vous bâtissez avec les autres.',
    'Terre-Introvertie': 'Ancré dans votre essence, vous cultivez la patience. Votre force est tranquille.',
    'Terre-Ambivertie': 'Entre stabilité et mouvement, vous êtes la montagne qui respire.',

    // Air dominant
    'Air-Extravertie': 'Vos idées voyagent loin. Vous connectez les esprits et inspirez le changement.',
    'Air-Introvertie': 'Votre pensée plane dans les hauteurs. Observer le monde est votre méditation.',
    'Air-Ambivertie': 'Vous êtes la brise qui tantôt murmure, tantôt fait danser les feuilles.',

    // Eau dominant
    'Eau-Extravertie': 'Vos émotions nourrissent le monde. Vous êtes la rivière qui unit les âmes.',
    'Eau-Introvertie': 'Profond comme l\'océan, vous ressentez tout. Votre intuition est votre guide.',
    'Eau-Ambivertie': 'Vous êtes la vague qui caresse et se retire. Fluide et insaisissable.'
  };

  const key = `${dominantElement}-${energyType}`;
  return signatures[key] || `${sunSign} Soleil, ${moonSign} Lune, ${ascendant} Ascendant. ${chineseZodiac} de ${profile.chineseElement}. Honorez votre unicité.`;
}

/**
 * Génère une description détaillée du profil
 */
export function generateDescription(profile: AstrologicalProfile): string {
  const parts: string[] = [];

  // Intro avec les 3 signes principaux
  parts.push(`Vous êtes ${profile.sunSign} Soleil, ${profile.moonSign} Lune, et ${profile.ascendant} Ascendant.`);

  // Animal chinois + élément
  parts.push(`Le ${profile.chineseZodiac} de ${profile.chineseElement} en vous apporte une dimension ${profile.yinYang === 'Yang' ? 'Yang (active, expansive)' : 'Yin (réceptive, introspective)'}.`);

  // Élément dominant
  const elementDescriptions = {
    'Feu': 'passion, créativité et spontanéité',
    'Terre': 'stabilité, pragmatisme et persévérance',
    'Air': 'intellect, communication et curiosité',
    'Eau': 'émotion, intuition et sensibilité'
  };
  parts.push(`Votre élément dominant, le ${profile.dominantElement}, vous donne ${elementDescriptions[profile.dominantElement]}.`);

  // Qualité dominante
  const qualityDescriptions = {
    'Cardinal': 'Vous initiez le changement et ouvrez de nouveaux chemins.',
    'Fixe': 'Vous apportez stabilité et détermination à tout ce que vous entreprenez.',
    'Mutable': 'Vous vous adaptez avec grâce et fluidité aux changements de la vie.'
  };
  parts.push(qualityDescriptions[profile.dominantQuality]);

  // Énergie
  const energyDescriptions = {
    'Extravertie': 'Votre énergie rayonne vers l\'extérieur, vous nourrissant des interactions et des échanges.',
    'Introvertie': 'Vous puisez votre force dans l\'introspection et la connexion avec votre monde intérieur.',
    'Ambivertie': 'Vous naviguez naturellement entre solitude ressourçante et connexion sociale.'
  };
  parts.push(energyDescriptions[profile.energyType]);

  return parts.join(' ');
}

/**
 * Fonction principale: Calcule le profil astrologique complet
 */
export async function calculateAstrologicalProfile(birthData: BirthData): Promise<AstrologicalProfile> {
  const { date, time, location } = birthData;

  // Parse date et heure
  const birthDate = new Date(`${date}T${time}`);
  const [hours] = time.split(':').map(Number);
  const year = birthDate.getFullYear();

  // Calculs de base
  const sunSign = calculateSunSign(birthDate);
  const moonSign = calculateMoonSign(birthDate, hours);
  const ascendant = calculateAscendant(birthDate, hours, sunSign);

  const chineseZodiac = calculateChineseZodiac(year);
  const chineseElement = calculateChineseElement(year);
  const yinYang = calculateYinYang(year);

  const lifePath = calculateLifePath(birthDate);

  // Analyses croisées
  const dominantElement = calculateDominantElement(sunSign, moonSign, ascendant);
  const dominantQuality = calculateDominantQuality(sunSign, moonSign, ascendant);
  const energyType = calculateEnergyType(sunSign, moonSign, ascendant, yinYang);

  // Création du profil
  const profile: AstrologicalProfile = {
    sunSign,
    moonSign,
    ascendant,
    chineseZodiac,
    chineseElement,
    yinYang,
    lifePath,
    dominantElement,
    dominantQuality,
    energyType,
    birthDate: date,
    birthTime: time,
    birthLocation: location,
    signature: '', // Sera généré après
    description: '' // Sera généré après
  };

  // Génération de la signature et description
  profile.signature = generateSignature(profile);
  profile.description = generateDescription(profile);

  return profile;
}

/**
 * Formate le profil pour l'utilisation dans les prompts de méditation
 */
export function formatProfileForMeditation(profile: {
  sunSign: string;
  moonSign: string;
  ascendant: string;
  chineseZodiac: string;
  chineseElement: string;
  yinYang: string;
  lifePath: number;
  dominantElement: string;
  dominantQuality: string;
  energyType: string;
  description?: string;
}): string {
  return `Profil Astrologique:
☀️ Soleil: ${profile.sunSign}
🌙 Lune: ${profile.moonSign}
⬆️ Ascendant: ${profile.ascendant}
🐉 Zodiaque Chinois: ${profile.chineseZodiac} de ${profile.chineseElement} (${profile.yinYang})
🔢 Chemin de Vie: ${profile.lifePath}

Analyse Croisée:
🔥 Élément Dominant: ${profile.dominantElement}
⚡ Qualité Dominante: ${profile.dominantQuality}
💫 Énergie: ${profile.energyType}

${profile.description}

Lors de la création de cette méditation, tiens compte de ces archétypes astrologiques pour personnaliser le langage, les métaphores et les thèmes abordés.`;
}
