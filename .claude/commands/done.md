# Halterra - Finalisation de session

## Actions à exécuter automatiquement

### 1. Vérifier les changements non commités
```bash
git status
git diff --stat
```

### 2. Si des changements existent, proposer un commit
Analyse les fichiers modifiés et propose un message de commit approprié.

### 3. Push vers GitHub
```bash
git push origin main
```

### 4. Déployer sur Vercel si nécessaire
```bash
vercel --prod --yes
```

### 5. Vérifier le déploiement
```bash
vercel ls | head -3
```

### 6. Mettre à jour CLAUDE.md
Analyse l'état actuel du projet et mets à jour le fichier CLAUDE.md si nécessaire:
- Nouveaux endpoints API ajoutés?
- Nouvelles fonctionnalités?
- Changements d'architecture?
- Nouvelles dépendances?

Lis le fichier CLAUDE.md actuel et propose des mises à jour si le projet a évolué.

### 7. Commit CLAUDE.md si modifié
Si CLAUDE.md a été mis à jour, commit et push les changements.

## Rapport final attendu
- Commits effectués pendant la session
- État du déploiement Vercel
- Changements apportés à CLAUDE.md (si applicable)
- Confirmation: Local = GitHub = Vercel
