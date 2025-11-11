/**
 * Mood Background Images Mapping
 *
 * Centralizes the mapping between mood IDs and their corresponding background images.
 * Used across DurationSelection and CategorySelection components.
 */

export const MOOD_IMAGE_MAP: Record<string, string> = {
  'aligned': 'Aligné  En flow.jpeg',
  'motivated': 'Motivé  Inspiré.jpeg',
  'anxious': 'Anxieux  Inquiet.jpeg',
  'exhausted': 'Épuisé  Vidé.jpeg',
  'sad': 'Triste  Découragé.jpeg',
  'frustrated': 'Frustré  En colère.jpeg',
  'lost': 'Perdu  Confus.jpeg',
  'alone': 'Seul  Isolé.jpeg',
  'overwhelmed': 'Submergé  Sous pression.jpeg',
  'calm': 'Calme  Serein.jpeg'
};

/**
 * Helper function to get the background image URL for a given mood
 * @param moodId - The mood identifier
 * @param baseUrl - The base URL from import.meta.env.BASE_URL
 * @returns The complete background image URL, or empty string if mood not found
 */
export function getMoodBackgroundUrl(moodId: string, baseUrl: string = ''): string {
  const imageName = MOOD_IMAGE_MAP[moodId];
  return imageName ? `${baseUrl}${encodeURIComponent(imageName)}` : '';
}
