import type { AstrologicalProfile } from '../types';
import { calculateAstrologicalProfile as calcAstro, formatProfileForMeditation } from './astrologicalProfile';

interface BirthData {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
}

/**
 * Calculate Astrological Profile with complete cross-analysis
 * Includes: Sun/Moon/Ascendant, Chinese Zodiac, Numerology, Energy analysis
 */
export async function calculateHumanDesign(birthData: BirthData): Promise<AstrologicalProfile> {
  // Utiliser le nouveau système astrologique complet
  const profile = await calcAstro(birthData);

  // Convert to the expected type (string-based for compatibility)
  return {
    sunSign: profile.sunSign,
    moonSign: profile.moonSign,
    ascendant: profile.ascendant,
    chineseZodiac: profile.chineseZodiac,
    chineseElement: profile.chineseElement,
    yinYang: profile.yinYang,
    lifePath: profile.lifePath,
    dominantElement: profile.dominantElement,
    dominantQuality: profile.dominantQuality,
    energyType: profile.energyType,
    birthDate: profile.birthDate,
    birthTime: profile.birthTime,
    birthLocation: profile.birthLocation,
    signature: profile.signature,
    description: profile.description
  };
}

/**
 * Get a description of the Astrological Profile for meditation personalization
 */
export function getHumanDesignDescription(profile: AstrologicalProfile): string {
  return profile.description;
}

/**
 * Format Astrological Profile data for AI meditation prompts
 */
export function formatHumanDesignForPrompt(profile: AstrologicalProfile): string {
  return formatProfileForMeditation(profile);
}

/**
 * Get a signature phrase for the user based on their Astrological Profile
 * Simple, powerful, and deeply personal - Steve Jobs style
 */
export function getHumanDesignSignature(profile: AstrologicalProfile): string {
  return profile.signature;
}
