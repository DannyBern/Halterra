# Halterra - Sync Check & Session Start

## Projet
- **Type**: MONOREPO (frontend React + API serverless Vercel)
- **GitHub**: https://github.com/DannyBern/Halterra
- **Production**: https://halterra.vercel.app
- **Local**: c:\Users\danny\Documents\Projets\Halterra

## IMPORTANT
- Le repo `halterra-backend` est ARCHIVE - ne plus utiliser
- Toutes les API sont dans `/api/` du monorepo principal

## Actions à exécuter automatiquement

### 1. Synchronisation Git (AUTOMATIQUE)
Exécute ces commandes dans l'ordre:
```bash
git fetch origin
git pull origin main
git status
git log --oneline -3
```

### 2. Vérification Vercel
```bash
vercel ls | head -5
```

### 3. Pull des variables d'environnement si nécessaire
```bash
vercel env pull
```

## Structure du projet
```
Halterra/
├── api/          ← Serverless functions (audio.js, meditation.js, etc.)
├── lib/          ← Middleware (corsConfig.js, rateLimit.js)
├── src/          ← Frontend React
├── vercel.json   ← Config unifiée
└── .env.local    ← Variables locales (ne pas commiter)
```

## Variables d'environnement requises
Vercel: `ANTHROPIC_API_KEY`, `ELEVENLABS_API_KEY` (Production + Development + Preview)

## Rapport attendu
Après exécution, fournis un rapport concis:
- Sync status: Local/GitHub/Vercel
- Dernier commit local et déployé
- Prêt à travailler ou problèmes détectés
