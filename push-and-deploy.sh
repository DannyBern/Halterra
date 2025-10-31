#!/bin/bash

# Script pour pousser et déployer Halterra sur GitHub
# Exécutez ce script après avoir créé le repository sur GitHub

echo "🪷 Pushing Halterra to GitHub..."

# Ajouter le remote (si pas déjà fait)
git remote add origin https://github.com/DannyBern/halterra.git 2>/dev/null || echo "Remote already exists"

# Pousser le code
echo "📤 Pushing code to GitHub..."
git push -u origin main

# Déployer sur GitHub Pages
echo "🚀 Deploying to GitHub Pages..."
npm run deploy

echo ""
echo "✅ Done! Your app will be available at:"
echo "🌐 https://dannybern.github.io/halterra/"
echo ""
echo "⚠️  Don't forget to:"
echo "1. Go to https://github.com/DannyBern/halterra/settings/pages"
echo "2. Set the source to 'gh-pages' branch"
echo "3. Wait 2-3 minutes for deployment"
