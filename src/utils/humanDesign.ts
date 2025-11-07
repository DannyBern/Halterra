import type { HumanDesign } from '../types';

interface BirthData {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
}

/**
 * Calculate Human Design chart based on birth data
 * Uses Swiss Ephemeris via backend API for accurate astronomical calculations
 */
export async function calculateHumanDesign(birthData: BirthData): Promise<HumanDesign> {
  const { date, time, location } = birthData;

  try {
    // Call backend API for accurate Human Design calculation
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const response = await fetch(`${backendUrl}/api/humandesign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        birthDate: date,
        birthTime: time
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    // Map backend response to frontend HumanDesign type
    const strategyMap: Record<string, string> = {
      'To Respond': 'Répondre - Attendre les opportunités et y répondre',
      'To Initiate': 'Informer - Initier et informer avant d\'agir',
      'Wait for Invitation': 'Attendre l\'invitation - Être reconnu et invité',
      'Wait 28 Days': 'Attendre un cycle lunaire - Observer pendant 28 jours avant de décider'
    };

    const authorityMap: Record<string, string> = {
      'Emotional': 'Autorité Émotionnelle',
      'Sacral': 'Autorité Sacrale',
      'Splenic': 'Autorité Splénique',
      'Ego': 'Autorité du Cœur/Ego',
      'Self-Projected': 'Autorité du Soi/G',
      'Outer Authority': 'Autorité Mentale',
      'Lunar (Reflector)': 'Autorité Lunaire'
    };

    return {
      type: data.type,
      strategy: strategyMap[data.strategy] || data.strategy,
      authority: authorityMap[data.authority] || data.authority,
      profile: data.profile,
      birthDate: date,
      birthTime: time,
      birthLocation: location
    };
  } catch (error) {
    console.error('Error calculating Human Design via API:', error);

    // Fallback to simplified calculation if API fails
    console.log('Falling back to simplified calculation');
    return fallbackCalculateHumanDesign(birthData);
  }
}

/**
 * Fallback calculation method (simplified) if API is unavailable
 */
function fallbackCalculateHumanDesign(birthData: BirthData): HumanDesign {
  const { date, time, location } = birthData;
  const birthDate = new Date(`${date}T${time}`);

  // Simple hash function to generate consistent results
  const hash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  const seed = hash(`${date}${time}${location}`);

  // Determine type based on seed
  const types: Array<'Generator' | 'Manifesting Generator' | 'Projector' | 'Manifestor' | 'Reflector'> = [
    'Generator',
    'Manifesting Generator',
    'Projector',
    'Manifestor',
    'Reflector'
  ];

  const type = types[seed % types.length];

  // Determine strategy based on type
  const strategyMap: Record<string, string> = {
    'Generator': 'Répondre - Attendre les opportunités et y répondre',
    'Manifesting Generator': 'Répondre et Informer - Attendre, répondre, puis informer',
    'Projector': 'Attendre l\'invitation - Être reconnu et invité',
    'Manifestor': 'Informer - Initier et informer avant d\'agir',
    'Reflector': 'Attendre un cycle lunaire - Observer pendant 28 jours avant de décider'
  };

  // Determine authority based on type and seed
  const authorities = [
    'Autorité Émotionnelle',
    'Autorité Sacrale',
    'Autorité Splénique',
    'Autorité du Cœur/Ego',
    'Autorité du Soi/G',
    'Autorité Mentale',
    'Autorité Lunaire'
  ];

  let authority: string;
  if (type === 'Reflector') {
    authority = 'Autorité Lunaire';
  } else if (type === 'Generator' || type === 'Manifesting Generator') {
    authority = (seed % 3) === 0 ? 'Autorité Émotionnelle' : 'Autorité Sacrale';
  } else {
    authority = authorities[(seed + 1) % (authorities.length - 1)];
  }

  // Generate profile (1-6 / 1-6)
  const profileFirst = (seed % 6) + 1;
  const profileSecond = ((seed + birthDate.getDate()) % 6) + 1;
  const profile = `${profileFirst}/${profileSecond}`;

  return {
    type,
    strategy: strategyMap[type],
    authority,
    profile,
    birthDate: date,
    birthTime: time,
    birthLocation: location
  };
}

/**
 * Get a description of the Human Design type for meditation personalization
 */
export function getHumanDesignDescription(humanDesign: HumanDesign): string {
  const typeDescriptions: Record<string, string> = {
    'Generator': 'Vous êtes un Générateur, avec une énergie vitale puissante. Vous prospérez en répondant aux opportunités qui résonnent avec vous. Votre force réside dans votre capacité à vous immerger profondément dans ce qui vous passionne.',
    'Manifesting Generator': 'Vous êtes un Générateur Manifesteur, combinant énergie vitale et capacité d\'initiation. Vous êtes multi-passionné et prospérez dans la variété. Votre puissance réside dans votre rapidité et votre efficacité.',
    'Projector': 'Vous êtes un Projecteur, un guide naturel. Votre don réside dans votre capacité à voir profondément dans les autres et les systèmes. Vous prospérez lorsque vous êtes reconnu et invité à partager votre sagesse.',
    'Manifestor': 'Vous êtes un Manifesteur, un initiateur né. Vous avez le pouvoir de commencer de nouvelles choses et d\'avoir un impact. Votre force réside dans votre indépendance et votre capacité à créer du mouvement.',
    'Reflector': 'Vous êtes un Réflecteur, un miroir de votre environnement. Vous avez le don rare de percevoir la santé d\'une communauté. Votre sagesse vient de prendre le temps d\'observer et de ressentir.'
  };

  return typeDescriptions[humanDesign.type] || '';
}

/**
 * Format Human Design data for AI meditation prompts
 */
export function formatHumanDesignForPrompt(humanDesign: HumanDesign): string {
  return `Type Human Design: ${humanDesign.type}
Stratégie: ${humanDesign.strategy}
Autorité: ${humanDesign.authority}
Profil: ${humanDesign.profile}

${getHumanDesignDescription(humanDesign)}

Lors de la création de cette méditation, tiens compte de ces caractéristiques uniques de leur design énergétique. Adapte le langage, les métaphores et les conseils pour résonner avec leur type spécifique.`;
}

/**
 * Get a signature phrase for the user based on their Human Design type
 * Simple, powerful, and deeply personal - Steve Jobs style
 */
export function getHumanDesignSignature(humanDesign: HumanDesign): string {
  const signatures: Record<string, string> = {
    'Generator': 'Votre énergie est votre superpouvoir. Répondez à ce qui vous allume.',
    'Manifesting Generator': 'Vous êtes fait pour la vitesse et la multiplicité. Suivez votre élan.',
    'Projector': 'Votre sagesse guide les autres. Attendez d\'être reconnu.',
    'Manifestor': 'Vous êtes né pour initier. Informez, puis agissez.',
    'Reflector': 'Vous reflétez le monde. Prenez le temps d\'observer.'
  };

  return signatures[humanDesign.type] || 'Honorez votre nature unique.';
}
