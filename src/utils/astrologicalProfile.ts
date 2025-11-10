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
 * Crée une description surprenante et fluide de l'utilisateur sans nommer les signes
 */
export function generateSignature(profile: AstrologicalProfile): string {
  const {
    dominantElement,
    dominantQuality,
    energyType,
    yinYang,
    lifePath
  } = profile;

  // Signatures complexes basées sur la combinaison de TOUS les attributs
  // Format: Element-Quality-Energy-YinYang-LifePath

  // Descriptions de personnalité basées sur l'élément + énergie + yin/yang
  const personalityCore: Record<string, string> = {
    // FEU
    'Feu-Extravertie-Yang': 'Vous êtes un catalyseur naturel qui transforme l\'énergie collective en action concrète',
    'Feu-Extravertie-Yin': 'Votre flamme intérieure rayonne subtilement, inspirant les autres sans les consumer',
    'Feu-Introvertie-Yang': 'Vous portez une forge intérieure qui forge vos convictions en acier trempé',
    'Feu-Introvertie-Yin': 'Comme une braise qui couve, votre intensité se révèle dans la durée et la profondeur',
    'Feu-Ambivertie-Yang': 'Vous alternez entre l\'éclair qui frappe et le feu qui réchauffe, selon le besoin du moment',
    'Feu-Ambivertie-Yin': 'Votre chaleur s\'adapte : brasier collectif ou flamme solitaire, vous maîtrisez les deux',

    // TERRE
    'Terre-Extravertie-Yang': 'Vous êtes un bâtisseur de ponts, créant des structures tangibles qui relient les gens',
    'Terre-Extravertie-Yin': 'Tel un jardin partagé, vous cultivez la croissance collective avec patience et douceur',
    'Terre-Introvertie-Yang': 'Vous êtes la montagne silencieuse dont la présence solide façonne le paysage',
    'Terre-Introvertie-Yin': 'Comme une graine qui germe en secret, votre force se développe dans le silence fertile',
    'Terre-Ambivertie-Yang': 'Vous savez quand planter en communauté et quand labourer votre propre terre',
    'Terre-Ambivertie-Yin': 'Votre sagesse s\'ancre dans l\'équilibre entre enracinement solitaire et croissance partagée',

    // AIR
    'Air-Extravertie-Yang': 'Vous êtes le vent qui propage les idées et fait danser les esprits ensemble',
    'Air-Extravertie-Yin': 'Tel un murmure qui porte loin, vos pensées circulent et touchent avec subtilité',
    'Air-Introvertie-Yang': 'Vous êtes l\'architecte de cathédrales mentales, construisant en altitude et en solitude',
    'Air-Introvertie-Yin': 'Comme l\'air rare des sommets, votre clarté d\'esprit se nourrit d\'espace et de silence',
    'Air-Ambivertie-Yang': 'Vous oscillez entre le tourbillon social et l\'œil du cyclone, maître des deux altitudes',
    'Air-Ambivertie-Yin': 'Votre intelligence navigue entre la légèreté du partage et la profondeur de la contemplation',

    // EAU
    'Eau-Extravertie-Yang': 'Vous êtes la vague qui porte les autres, créant des courants d\'empathie collective',
    'Eau-Extravertie-Yin': 'Tel un lac qui reflète chaque visage, vous absorbez et rendez la beauté émotionnelle',
    'Eau-Introvertie-Yang': 'Vous plongez dans vos propres abysses avec le courage d\'un explorateur solitaire',
    'Eau-Introvertie-Yin': 'Comme une source cachée, votre profondeur émotionnelle irrigue votre monde intérieur',
    'Eau-Ambivertie-Yang': 'Vous êtes à la fois la rivière qui rejoint l\'océan et le puits qui creuse en soi',
    'Eau-Ambivertie-Yin': 'Votre sensibilité fluide sait quand se répandre et quand se recueillir'
  };

  // Style d'action basé sur la qualité
  const actionStyle: Record<string, string> = {
    'Cardinal': 'Vous êtes celui qui ouvre les portes que les autres hésitent à pousser',
    'Fixe': 'Vous transformez l\'intention en réalité par la force tranquille de la persistance',
    'Mutable': 'Vous dansez avec le changement, transformant chaque obstacle en opportunité'
  };

  // Mission de vie basée sur le chemin de vie (sans le nommer)
  const lifeMission: Record<number, string> = {
    1: 'Votre destinée vous appelle à tracer de nouveaux chemins là où d\'autres voient des impasses',
    2: 'Vous êtes né pour tisser des liens là où règne la division',
    3: 'Votre essence même est de transformer la vie en art et l\'ordinaire en célébration',
    4: 'Vous êtes ici pour ériger ce qui durera bien après votre passage',
    5: 'Votre âme réclame l\'exploration perpétuelle et la libération des conventions',
    6: 'Vous portez le don de guérir les cœurs et d\'harmoniser les dissonances',
    7: 'Vous êtes appelé à percer les mystères que d\'autres effleurent à peine',
    8: 'Votre chemin consiste à maîtriser les forces du monde matériel et spirituel',
    9: 'Vous êtes ici pour servir une cause plus grande que votre propre existence',
    11: 'Vous portez une lumière qui peut éveiller la conscience collective',
    22: 'Votre mission est de matérialiser des visions que d\'autres jugent impossibles',
    33: 'Vous incarnez l\'amour en action et la sagesse au service de tous'
  };

  // Construction de la signature fluide
  const coreKey = `${dominantElement}-${energyType}-${yinYang}`;
  const core = personalityCore[coreKey] || 'Vous portez en vous une alchimie unique qui défie les catégories';
  const action = actionStyle[dominantQuality];
  const mission = lifeMission[lifePath] || 'Votre chemin se révèle à chaque pas conscient';

  return `${core}. ${action}. ${mission}.`;
}

/**
 * Génère une description détaillée du profil
 */
export function generateDescription(profile: AstrologicalProfile): string {
  const parts: string[] = [];

  // Intro avec les 3 signes principaux - ton pragmatique
  parts.push(`Votre profil: ${profile.sunSign} (personnalité), ${profile.moonSign} (émotions), ${profile.ascendant} (apparence sociale).`);

  // Animal chinois + élément - explication concrète
  parts.push(`Né sous le signe du ${profile.chineseZodiac} ${profile.chineseElement}, vous avez une approche ${profile.yinYang === 'Yang' ? 'active et directe' : 'réflexive et réceptive'}.`);

  // Élément dominant - traits de personnalité concrets
  const elementDescriptions = {
    'Feu': 'de l\'initiative, de l\'optimisme et de la spontanéité dans vos actions',
    'Terre': 'du pragmatisme, de la constance et une approche méthodique',
    'Air': 'de la curiosité intellectuelle, des compétences sociales et de l\'adaptabilité',
    'Eau': 'de l\'empathie, de l\'intuition et une conscience émotionnelle développée'
  };
  parts.push(`Votre tendance dominante ${profile.dominantElement} vous apporte ${elementDescriptions[profile.dominantElement]}.`);

  // Qualité dominante - comportements observables
  const qualityDescriptions = {
    'Cardinal': 'Vous prenez naturellement l\'initiative et aimez démarrer de nouveaux projets.',
    'Fixe': 'Vous êtes persévérant et apportez de la stabilité dans ce que vous entreprenez.',
    'Mutable': 'Vous vous adaptez facilement aux changements et restez flexible.'
  };
  parts.push(qualityDescriptions[profile.dominantQuality]);

  // Énergie - préférences sociales concrètes
  const energyDescriptions = {
    'Extravertie': 'Vous vous ressourcez dans les interactions sociales et aimez partager vos expériences.',
    'Introvertie': 'Vous préférez la réflexion personnelle et avez besoin de moments seul pour vous ressourcer.',
    'Ambivertie': 'Vous appréciez autant les moments sociaux que la solitude, selon vos besoins du moment.'
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
  return `Profil de personnalité de l'utilisateur:

Signes astrologiques:
- Soleil (personnalité): ${profile.sunSign}
- Lune (émotions): ${profile.moonSign}
- Ascendant (apparence sociale): ${profile.ascendant}

Astrologie chinoise:
- Signe: ${profile.chineseZodiac}
- Élément: ${profile.chineseElement}
- Polarité: ${profile.yinYang}

Numérologie:
- Chemin de vie: ${profile.lifePath}

Traits dominants:
- Tempérament: ${profile.dominantElement}
- Style d'action: ${profile.dominantQuality}
- Préférence sociale: ${profile.energyType}

${profile.description}

Utilise ces informations pour adapter le ton, les exemples et le style de la méditation à sa personnalité. Par exemple: une personne Feu-Extravertie appréciera un langage dynamique et motivant, tandis qu'une personne Eau-Introvertie préférera un ton plus doux et introspectif.`;
}
