# Halterra - Contexte Projet pour Claude

## Description
Application de méditation personnalisée avec IA (Claude) et narration vocale (ElevenLabs).
PWA React déployée sur Vercel.

## Architecture: MONOREPO
```
Halterra/
├── api/                 # Serverless functions Vercel
│   ├── audio.js         # TTS ElevenLabs (segmentation + concaténation)
│   ├── silence.js       # Buffer MP3 silence 2s (base64)
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

### Architecture de Segmentation (NOUVEAU)
Pour éviter la dérive d'accent/ton sur les longs textes, l'audio est généré par segments:
1. **Découpage**: Texte divisé en 2-3 paragraphes
2. **Génération**: Chaque segment généré séparément avec contexte émotionnel
3. **Silences**: 4 secondes de pause entre segments (fichier `silence.js`)
4. **Concaténation**: Buffers MP3 concaténés après retrait des ID3 tags

### Fichiers clés
- `api/audio.js` - Logique de segmentation et génération
- `api/silence.js` - Buffer MP3 de silence 2s en base64

### Voix
- **Méditation**: Iza - Voice ID `xsNzdCmWJpYoa80FaXJi` (québécoise)
- **Réflexion**: Dann - Voice ID `93nuHbke4dTER9x2pDwE`

### Settings ElevenLabs (voix Iza)
- **Qualité**: MP3 44.1kHz 192kbps
- **Modèle**: ElevenLabs Multilingual V2 + `language_code: 'fr'`
- **Stability**: 0.95 (MAXIMUM - accent ultra-stable)
- **Similarity Boost**: 0.95 (fidélité totale)
- **Style**: 0.0 (ZÉRO - aucune variation)
- **Speed**: 0.72 (lent et posé)
- **Speaker Boost**: enabled

### Technique de stabilisation
- **Texte entre guillemets**: Simule un dialogue lu ("texte")
- **previous_text**: "La guide québécoise ferme les yeux..."
- **next_text**: ", murmure-t-elle tout bas, gardant son calme..."
- **NOTE**: Ne PAS utiliser `previous_request_ids` avec `previous_text/next_text` (conflit API)

## Dernière mise à jour
- **Date**: 2025-12-05
- **Session**: Architecture de segmentation audio
- **Changements**:
  - **Segmentation audio**: Découpage en 2-3 paragraphes pour éviter dérive accent/ton
  - **Fichier silence.js**: Buffer MP3 2s en base64 pour pauses entre segments
  - **Concaténation MP3**: Retrait ID3 tags + Buffer.concat()
  - **Stabilité augmentée**: 0.95 stability, 0.95 similarity_boost
  - **Vitesse réduite**: 0.72 pour éviter accélération en fin de texte
  - **Logs détaillés**: Chaque segment loggé pour diagnostic
  - **Fix conflit API**: Suppression previous_request_ids (conflit avec previous_text)
