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
vercel --prod        # Deploy production
vercel env pull      # Sync env vars locales
```

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

### Design de la carte de partage
- Hauteur dynamique selon la longueur du texte
- Fond gradient slate avec overlay coloré du mood
- Typographie Georgia pour le texte de méditation
- Éléments zen décoratifs (cercles, ligne verticale)
- Branding Halterra en footer

## Dernière mise à jour
- **Date**: 2025-12-03
- **Session**: Implémentation du partage Messenger fonctionnel avec carte premium
- **Changements**:
  - Ajout plateforme `messenger` distincte de `facebook`
  - Carte de partage affiche la méditation complète (pas juste un extrait)
  - Design premium zen avec hauteur dynamique
  - Web Share API pour partager l'image directement
