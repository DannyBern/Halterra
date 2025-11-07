# Human Design Backend Integration Guide

## Overview
The frontend has been updated to collect Human Design information during onboarding and pass it to the backend. This document explains how to integrate Human Design data into the meditation generation prompts in the backend.

## Frontend Changes Completed

### 1. New Type Definitions (`src/types.ts`)
```typescript
export interface HumanDesign {
  type: 'Generator' | 'Manifesting Generator' | 'Projector' | 'Manifestor' | 'Reflector';
  strategy: string;
  authority: string;
  profile: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
}

export interface User {
  name: string;
  createdAt: string;
  humanDesign?: HumanDesign;
}
```

### 2. Human Design Calculation Utility (`src/utils/humanDesign.ts`)
A utility has been created with:
- `calculateHumanDesign(birthData)` - Calculates Human Design from birth data
- `getHumanDesignDescription(humanDesign)` - Returns type description
- `formatHumanDesignForPrompt(humanDesign)` - Formats HD data for AI prompts

### 3. Updated Onboarding Component
- Two-step onboarding: name entry, then birth data collection
- Fern leaf background image
- Users can skip Human Design data collection
- Premium UI with date/time pickers

### 4. API Updates
The frontend now passes `humanDesign` to the backend:
```typescript
{
  userName,
  mood,
  category,
  intention,
  guideType,
  duration,
  humanDesign  // <-- NEW FIELD
}
```

## Backend Integration Required

### Update Backend API Endpoint (`/api/meditation`)

The backend meditation generation endpoint needs to be updated to:

1. **Accept the `humanDesign` parameter** in the request body
2. **Add Human Design context to the meditation prompt** when present

### Sample Backend Implementation

```javascript
// api/meditation.js (or meditation.ts)

export default async function handler(req, res) {
  const {
    userName,
    mood,
    category,
    intention,
    guideType,
    duration,
    humanDesign  // <-- NEW PARAMETER
  } = req.body;

  // ... existing code ...

  // Build the prompt with Human Design context if available
  let prompt = buildBasePrompt(userName, mood, category, intention, guideType, duration);

  if (humanDesign) {
    const humanDesignContext = formatHumanDesignForPrompt(humanDesign);
    prompt += `\n\n${humanDesignContext}`;
  }

  // ... continue with Claude API call ...
}
```

### Human Design Prompt Formatting Function

Add this function to your backend to format Human Design data for the prompt:

```javascript
function formatHumanDesignForPrompt(humanDesign) {
  const typeDescriptions = {
    'Generator': 'Cette personne est un Générateur, avec une énergie vitale puissante. Elle prospère en répondant aux opportunités qui résonnent avec elle. Sa force réside dans sa capacité à s\'immerger profondément dans ce qui la passionne.',
    'Manifesting Generator': 'Cette personne est un Générateur Manifesteur, combinant énergie vitale et capacité d\'initiation. Elle est multi-passionnée et prospère dans la variété. Sa puissance réside dans sa rapidité et son efficacité.',
    'Projector': 'Cette personne est un Projecteur, un guide naturel. Son don réside dans sa capacité à voir profondément dans les autres et les systèmes. Elle prospère lorsqu\'elle est reconnue et invitée à partager sa sagesse.',
    'Manifestor': 'Cette personne est un Manifesteur, un initiateur né. Elle a le pouvoir de commencer de nouvelles choses et d\'avoir un impact. Sa force réside dans son indépendance et sa capacité à créer du mouvement.',
    'Reflector': 'Cette personne est un Réflecteur, un miroir de son environnement. Elle a le don rare de percevoir la santé d\'une communauté. Sa sagesse vient de prendre le temps d\'observer et de ressentir.'
  };

  return `
CONTEXTE HUMAN DESIGN DE L'UTILISATEUR:

Type Human Design: ${humanDesign.type}
Stratégie: ${humanDesign.strategy}
Autorité: ${humanDesign.authority}
Profil: ${humanDesign.profile}

${typeDescriptions[humanDesign.type] || ''}

INSTRUCTIONS: Lors de la création de cette méditation, tiens compte de ces caractéristiques uniques de leur design énergétique. Adapte le langage, les métaphores et les conseils pour résonner avec leur type spécifique.

Par exemple:
- Pour les Générateurs: Parle de répondre à la vie, d'énergie vitale, de satisfaction
- Pour les Projecteurs: Parle de reconnaissance, de guidance, de gestion de l'énergie
- Pour les Manifesteurs: Parle d'initiation, d'indépendance, d'informer les autres
- Pour les Réflecteurs: Parle d'observation, de cycles lunaires, de reflet de l'environnement
- Pour les Générateurs Manifesteurs: Parle de multi-passions, de rapidité, d'efficacité
`;
}
```

### Example Integration in Prompt

```javascript
function buildMeditationPrompt(userName, mood, category, intention, guideType, duration, humanDesign) {
  let prompt = `Tu es un guide spirituel expert en méditation et en pleine conscience.

Crée une méditation personnalisée pour ${userName}.

État d'esprit actuel: ${mood.name} - ${mood.description}
Catégorie: ${category}
Intention: ${intention}
Type de guide: ${guideType}
Durée: ${duration} minutes
`;

  // Add Human Design context if available
  if (humanDesign) {
    prompt += `\n${formatHumanDesignForPrompt(humanDesign)}\n`;
  }

  prompt += `
Crée une méditation guidée qui:
1. Honore leur état émotionnel actuel
2. Les guide vers leur intention
${humanDesign ? '3. Résonne avec leur type Human Design unique' : ''}

...
`;

  return prompt;
}
```

## Testing the Integration

### 1. Test Without Human Design
- User skips Human Design step
- `humanDesign` is undefined in backend
- Meditation generates normally without HD context

### 2. Test With Human Design
- User enters birth data: date, time, location
- Human Design is calculated and included in request
- Backend receives HD data and adds context to prompt
- Meditation should reference their HD type characteristics

### Example Test Data
```json
{
  "userName": "Danny",
  "mood": { "id": "calm", "name": "Calme", ... },
  "category": "sens-valeurs",
  "intention": "Trouver ma direction",
  "guideType": "meditation",
  "duration": 5,
  "humanDesign": {
    "type": "Projector",
    "strategy": "Attendre l'invitation - Être reconnu et invité",
    "authority": "Autorité Splénique",
    "profile": "3/5",
    "birthDate": "1990-01-15",
    "birthTime": "14:30",
    "birthLocation": "Montreal, Canada"
  }
}
```

Expected result: The meditation should acknowledge the user as a Projector and speak about waiting for invitations, being recognized, managing energy wisely, and the gift of seeing into systems.

## Deployment Checklist

- [ ] Update backend `/api/meditation` endpoint to accept `humanDesign` parameter
- [ ] Add `formatHumanDesignForPrompt()` function to backend
- [ ] Integrate Human Design context into meditation prompts
- [ ] Test with and without Human Design data
- [ ] Deploy backend changes to Vercel
- [ ] Verify end-to-end flow works on production

## Current Status

✅ Frontend deployed with Human Design collection
✅ Frontend sends `humanDesign` to backend API
⏳ Backend needs to be updated to process Human Design data

## Frontend Deployment

The frontend has been deployed to:
https://halterra-rb38vgzcg-dannys-projects-ff6db2ea.vercel.app

Backend URL:
https://halterra-backend-i3s4okq80-dannys-projects-ff6db2ea.vercel.app

## Notes

- Human Design calculation is simplified in frontend (deterministic based on birth data hash)
- For production, consider using a proper Human Design calculation API or library
- The current implementation provides consistent results for the same birth data
- Users can always skip Human Design collection
- Human Design data is stored locally with the user profile
- Privacy note already included in onboarding UI
