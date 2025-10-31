# Instructions de déploiement Halterra sur GitHub

## Étape 1 : Créer le repository sur GitHub

1. Allez sur [github.com](https://github.com) et connectez-vous
2. Cliquez sur le bouton "+" en haut à droite et sélectionnez "New repository"
3. Remplissez les informations :
   - **Repository name** : `halterra`
   - **Description** : `🪷 Application de méditation zen et sophistiquée pour entrepreneurs - Méditations guidées personnalisées générées par IA`
   - **Visibilité** : Public
   - **Ne cochez PAS** "Initialize this repository with a README" (le code est déjà prêt)
4. Cliquez sur "Create repository"

## Étape 2 : Connecter et pousser le code

Après avoir créé le repository, GitHub vous montrera des instructions. Utilisez celles pour "push an existing repository" :

```bash
cd halterra
git remote add origin https://github.com/VOTRE-USERNAME/halterra.git
git push -u origin main
```

Remplacez `VOTRE-USERNAME` par votre nom d'utilisateur GitHub.

## Étape 3 : Activer GitHub Pages

1. Sur la page du repository GitHub, allez dans **Settings**
2. Dans le menu de gauche, cliquez sur **Pages**
3. Sous "Source", sélectionnez :
   - **Branch** : `gh-pages`
   - **Folder** : `/ (root)`
4. Cliquez sur **Save**

## Étape 4 : Déployer l'application

Dans votre terminal, exécutez :

```bash
cd halterra
npm run deploy
```

Cette commande va :
1. Construire l'application (build)
2. Créer une branche `gh-pages`
3. Pousser le contenu du dossier `dist` vers cette branche
4. GitHub Pages déploiera automatiquement votre application

## Étape 5 : Accéder à votre application

Après quelques minutes, votre application sera disponible à :
```
https://VOTRE-USERNAME.github.io/halterra/
```

## Mises à jour futures

Pour déployer des mises à jour :

```bash
cd halterra
git add .
git commit -m "Description des changements"
git push origin main
npm run deploy
```

## Notes importantes

- La première fois, GitHub Pages peut prendre 5-10 minutes pour déployer
- Assurez-vous que dans Settings > Pages, la source est bien configurée sur `gh-pages`
- L'application utilisera le chemin `/halterra/` grâce à la configuration dans `vite.config.ts`
