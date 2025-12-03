# Halterra - Sync Check & Session Start

## Projet
- **Type**: MONOREPO (frontend React + API serverless Vercel)
- **GitHub**: https://github.com/DannyBern/Halterra
- **Production**: https://halterra.vercel.app
- **Local**: c:\Users\danny\Documents\Projets\Halterra

## IMPORTANT
- Le repo `halterra-backend` est ARCHIVE - ne plus utiliser
- Toutes les API sont dans `/api/` du monorepo principal

## Actions requises

### 1. Vérification de synchronisation
Exécute ces commandes et analyse les résultats:
- `git fetch origin && git status` - Vérifie si local est à jour avec GitHub
- `git log --oneline -3` vs `git log origin/main --oneline -3` - Compare les commits
- `vercel ls | head -5` - Vérifie le dernier déploiement Vercel

### 2. Structure à valider
```
Halterra/
├── api/          ← Serverless functions (audio.js, meditation.js, etc.)
├── lib/          ← Middleware (corsConfig.js, rateLimit.js)
├── src/          ← Frontend React
├── vercel.json   ← Config unifiée
└── .env.local    ← Variables locales (ne pas commiter)
```

### 3. Variables d'environnement
Vercel doit avoir: `ANTHROPIC_API_KEY`, `ELEVENLABS_API_KEY` (Production + Development + Preview)

### 4. Si désynchronisation détectée
- Pull GitHub: `git pull origin main`
- Pull env vars: `vercel env pull`
- Redeploy si nécessaire: `vercel --prod --yes`

## Rapport attendu
Après vérification, indique:
- État sync Local/GitHub/Vercel (OK ou actions requises)
- Dernier commit déployé
- Prêt à travailler ou problèmes à résoudre
