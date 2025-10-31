import Anthropic from '@anthropic-ai/sdk';
import type { Mood, UserResponse } from '../types';

export async function generateMeditation(
  apiKey: string,
  userName: string,
  mood: Mood,
  responses: UserResponse[]
): Promise<string> {
  const client = new Anthropic({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Note: En production, utiliser un backend
  });

  const responsesText = responses
    .map((r, i) => `Question ${i + 1}: ${r.answer}`)
    .join('\n');

  const prompt = `Tu es un guide de méditation expert et bienveillant. ${userName} commence sa journée avec un état d'esprit "${mood.name}" (${mood.description}).

Voici les réponses de ${userName} aux questions de réflexion :
${responsesText}

Crée une méditation guidée personnalisée de 2-3 minutes (environ 300-400 mots) qui :
1. Accueille et valide son état émotionnel actuel
2. Offre des réflexions profondes et inspirantes adaptées à son mood
3. Propose des perspectives positives et actionnables pour sa journée
4. Utilise un ton apaisant, méditatif et authentique
5. S'adresse directement à ${userName} en utilisant "tu" ou "vous"
6. Termine par une intention ou affirmation puissante pour la journée

Le texte doit être écrit pour être lu à voix haute, avec des pauses naturelles. Utilise un français fluide et poétique.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  const textContent = message.content.find(block => block.type === 'text');
  return textContent && 'text' in textContent ? textContent.text : '';
}

export async function generateAudio(
  apiKey: string,
  text: string,
  voiceId: string = 'EXAVITQu4vr4xnSDxMaL' // Voix par défaut Sarah
): Promise<string> {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.3,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la génération audio');
  }

  const audioBlob = await response.blob();
  return URL.createObjectURL(audioBlob);
}
