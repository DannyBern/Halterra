# Halterra - Contexte Projet pour Claude

## Description
Application de méditation personnalisée avec IA (Claude) et narration vocale (ElevenLabs).
PWA React déployée sur Vercel.

## Architecture: MONOREPO
```
Halterra/
├── api/                 # Serverless functions Vercel
│   ├── audio.js         # TTS ElevenLabs (voix Iza/Dann)
│   ├── meditation.js    # Génération méditation (Claude)
│   ├── daily-insight.js # Insight quotidien (Claude Haiku)
│   ├── quote.js         # Citations inspirantes
│   └── humandesign.js   # Calculs Human Design
├── lib/                 # Middleware partagé
│   ├── corsConfig.js    # CORS sécurisé (whitelist)
│   └── rateLimit.js     # Rate limiting par IP
├── src/                 # Frontend React
│   ├── components/      # Composants UI
│   ├── services/        # API calls (api.ts)
│   ├── hooks/           # Custom hooks
│   └── types/           # TypeScript types
├── public/              # Assets statiques
├── vercel.json          # Config Vercel unifiée
└── .env.local           # Variables locales (non commitées)
```

## URLs
- **Production**: https://halterra.vercel.app
- **GitHub**: https://github.com/DannyBern/Halterra

## IMPORTANT - Ne plus utiliser
- `halterra-backend` est ARCHIVÉ - tout est dans le monorepo principal

## Variables d'environnement
- `ANTHROPIC_API_KEY` - Claude API
- `ELEVENLABS_API_KEY` - Text-to-Speech

## API Endpoints
| Endpoint | Méthode | Description |
|----------|---------|-------------|
| /api/meditation | POST | Génère une méditation personnalisée |
| /api/audio | POST | Convertit texte en audio (ElevenLabs) |
| /api/daily-insight | POST | Génère l'insight du jour |
| /api/quote | GET | Retourne une citation inspirante |
| /api/humandesign | POST | Calcule le profil Human Design |

## Commandes Claude Code
| Commande | Quand | Description |
|----------|-------|-------------|
| `/sync` | Début de session | Pull GitHub, sync Vercel, prépare l'environnement |
| `/done` | Fin de session | Commit, push, deploy, met à jour CLAUDE.md |

## Commandes Terminal
```bash
npm run dev          # Dev local (frontend seulement)
vercel dev           # Dev local (frontend + API)
npm run build        # Build production
vercel env pull      # Sync env vars locales
```

## Déploiement
**IMPORTANT**: Le push vers GitHub déclenche automatiquement le déploiement Vercel.
- NE PAS lancer `vercel --prod` après un push (cela créerait un double déploiement)
- Simplement faire `git push origin main` et attendre le déploiement automatique
- Le déploiement prend ~30-45 secondes après le push

## Stack technique
- React 19 + TypeScript
- Vite 7
- Vercel Serverless Functions
- Claude API (Anthropic)
- ElevenLabs TTS

## Workflow développement
1. `/sync` au début de chaque session
2. Développer localement avec `npm run dev` ou `vercel dev`
3. Commit + Push déclenche auto-deploy Vercel
4. `/done` à la fin de chaque session

## Fonctionnalité de partage
Le système de partage permet de partager les méditations sur différentes plateformes:
- **Messenger/Native**: Partage l'image de la carte de méditation via Web Share API
- **Instagram**: Copie le texte, l'utilisateur ouvre Instagram manuellement
- **Email/SMS**: Ouvre l'app native avec le contenu pré-rempli

### Composants clés
- `ShareModal.tsx` - Modal de sélection de plateforme
- `ShareCardPreview.tsx` - Génère une image Canvas avec la méditation complète
- `shareService.ts` - Logique de partage par plateforme

### Design de la carte de partage (Ultra Premium)
- **5 templates visuels**: Noir, Turquoise, Minuit, Pêche, Nuage
- Icône de catégorie d'intention (images .webp) au lieu d'emoji générique
- Typographie Georgia avec présence forte (34px, weight 500-600)
- En-tête harmonisé avec le texte principal (même poids de police)
- Paragraphes bien espacés (90px) préservant la structure originale
- Logo HALTERRA LITE minimaliste en footer (42px, weight 300, opacité 0.95)
- Hauteur dynamique selon la longueur du texte
- **Limitation intelligente**: Max 3 paragraphes avec note "Écoute la méditation complète avec narration vocale" pour inciter au téléchargement
- Adaptation automatique des couleurs: texte noir sur fonds clairs, blanc sur fonds sombres

### Sélecteur de templates
- 5 boutons miniatures avec aperçu du fond
- Grid responsive (5 colonnes sur mobile)
- Noms lisibles avec shadow sur tous les fonds

## Configuration Narration Audio
- **Voix principale (méditation)**: Iza - Voice ID `GiS6AIV70BEfI1ncL4Vg` (remix optimisé méditation)
- **Voix secondaire (réflexion)**: Dann - Voice ID `93nuHbke4dTER9x2pDwE`
- **Qualité audio**: MP3 44.1kHz 192kbps (qualité maximale)
- **Modèle TTS**: ElevenLabs Multilingual V2
- **Settings optimisés (voix Iza remixée)**:
  - Stability: 0.70 (équilibré stable/naturel)
  - Similarity Boost: 0.85 (fidélité au remix)
  - Style: 0.20 (expressivité modérée, évite artifacts)
  - Speaker Boost: enabled (clarté vocale)
- **SSML simplifié**: Prosody rate uniquement, pas de break/phoneme tags (prévient artifacts)
- **Pauses naturelles**: Ponctuation native (". " pour paragraphes, ", " pour lignes)

## Dernière mise à jour
- **Date**: 2025-12-04
- **Session**: Optimisation voix narration + fix artifacts audio
- **Changements**:
  - **Voice ID**: Migration vers voix Iza remixée (`GiS6AIV70BEfI1ncL4Vg`) optimisée pour méditation
  - **Prompt structure**: Réorganisé pour prioriser intention → émotion → astrologie → temporel
  - **Audio quality**: Fix artifacts critiques en simplifiant SSML (suppression `<phoneme>` et `<break>` tags)
  - **Voice settings**: Ajustés pour stability 0.70, similarity_boost 0.85, style 0.20
  - **Pauses**: Remplacé SSML breaks par ponctuation naturelle pour éviter sons étranges
