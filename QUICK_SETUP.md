# 🪷 Setup Rapide Halterra sur GitHub

## Méthode 1 : Création manuelle (RECOMMANDÉ - 2 minutes)

### Étape 1 : Créer le repository sur GitHub (via navigateur)
1. Ouvrez https://github.com/new
2. Remplissez :
   - Repository name: `halterra`
   - Description: `🪷 Application de méditation zen pour entrepreneurs`
   - Visibilité: Public
   - **NE COCHEZ RIEN D'AUTRE** (pas de README, .gitignore, etc.)
3. Cliquez "Create repository"

### Étape 2 : Pousser le code (dans PowerShell/Terminal)
```bash
cd C:\Users\Danny\halterra
git remote add origin https://github.com/DannyBern/halterra.git
git push -u origin main
```

### Étape 3 : Déployer sur GitHub Pages
```bash
npm run deploy
```

### Étape 4 : Activer GitHub Pages
1. Allez sur https://github.com/DannyBern/halterra/settings/pages
2. Sous "Branch", sélectionnez `gh-pages` et `/ (root)`
3. Cliquez "Save"

⏰ Attendez 2-3 minutes, puis votre app sera disponible à :
**https://dannybern.github.io/halterra/**

---

## Méthode 2 : Création automatique (via script)

Si le repository existe déjà sur GitHub :

```bash
cd C:\Users\Danny\halterra
git remote add origin https://github.com/DannyBern/halterra.git
git push -u origin main
npm run deploy
```

---

## Commandes pour mises à jour futures

```bash
cd C:\Users\Danny\halterra

# Commit vos changements
git add .
git commit -m "Description des changements"
git push

# Déployer la nouvelle version
npm run deploy
```

---

## ✅ Vérification

Après le déploiement, vérifiez que tout fonctionne :
- Code source : https://github.com/DannyBern/halterra
- App en ligne : https://dannybern.github.io/halterra/

## ⚠️ Important

- Vous aurez besoin de vos clés API Anthropic et ElevenLabs
- Les clés sont stockées localement dans le navigateur
- Partagez le lien avec vos utilisateurs !
