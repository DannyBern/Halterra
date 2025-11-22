# 🚀 Financial Analyzer - Guide de Lancement

## Démarrage Rapide (Double-Clic)

### macOS / Linux

**Lancer l'application:**
```bash
Double-clic sur: launch-mac.command
```

**Arrêter l'application:**
```bash
Double-clic sur: stop-servers.command
```

### Windows

**Lancer l'application:**
```bash
Double-clic sur: launch-windows.bat
```

**Arrêter l'application:**
```bash
Double-clic sur: stop-servers.bat
```

---

## Ce que fait le script de lancement

Le script `launch-mac.command` effectue automatiquement:

### 1. 📥 Mise à jour GitHub
- Vérifie la branche actuelle
- Télécharge les dernières mises à jour
- Pull les changements si disponibles

### 2. 🔧 Backend (Python/FastAPI)
- **Vérifie** si le backend tourne déjà (port 8000)
- **Crée** un environnement virtuel Python si nécessaire
- **Installe/Met à jour** toutes les dépendances:
  - FastAPI, Uvicorn
  - Anthropic SDK (Claude AI)
  - OpenCV, Whisper, Tesseract
  - NumPy (<2.0 pour compatibilité OpenCV)
- **Démarre** le serveur backend sur `http://localhost:8000`

### 3. 🎨 Frontend (React/Vite)
- **Vérifie** si le frontend tourne déjà (port 5173)
- **Installe/Met à jour** les dépendances npm
- **Démarre** le serveur de développement Vite
- **Lance** sur `http://localhost:5173`

### 4. 🌐 Navigateur
- **Ouvre automatiquement** l'application dans votre navigateur par défaut
- Prêt à utiliser immédiatement!

---

## Logs et Débogage

Si quelque chose ne fonctionne pas:

**Logs Backend:**
```bash
cat financial-analyzer/backend/backend.log
```

**Logs Frontend:**
```bash
cat financial-analyzer/frontend/frontend.log
```

**Vérifier les ports:**
```bash
# Backend (doit être sur port 8000)
lsof -ti:8000

# Frontend (doit être sur port 5173)
lsof -ti:5173
```

---

## Arrêt Manuel

Si vous avez besoin d'arrêter manuellement:

**Trouver les PIDs:**
```bash
lsof -ti:8000  # Backend
lsof -ti:5173  # Frontend
```

**Tuer les processus:**
```bash
kill <PID_backend>
kill <PID_frontend>
```

**Ou tuer tous les processus:**
```bash
pkill -f uvicorn  # Backend
pkill -f vite     # Frontend
```

---

## Configuration Requise

### macOS / Linux
- Python 3.11+
- Node.js 18+
- npm 9+
- Git

### Installations Python Système
Certains packages nécessitent des dépendances système:

**macOS (via Homebrew):**
```bash
brew install ffmpeg tesseract
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install ffmpeg tesseract-ocr python3-dev
```

---

## URLs de l'Application

Une fois lancé:

- **Application Frontend:** http://localhost:5173
- **API Backend:** http://localhost:8000
- **Documentation API:** http://localhost:8000/docs

---

## Fonctionnalités de l'App

### 📊 Analyse Financière Multi-Étapes
1. Upload fichier (audio/vidéo/image)
2. Analyse automatique en 7 étapes:
   - Classification du type d'investissement
   - Extraction et validation des données
   - Due diligence quantitative
   - Due diligence qualitative
   - Analyse de risques
   - Évaluation comparative
   - Synthèse et décision finale

### 💬 Chat Warren Buffett
- Discute avec Warren Buffett AI après l'analyse
- Questions suggérées intelligentes
- Mémoire de conversation complète
- Calculs supplémentaires à la demande

### 🎯 Exactitude Maximale
- Transcription audio Whisper "medium" model
- Frames vidéo haute qualité (95% JPEG)
- Timestamps synchronisés audio-visuel
- Vérification croisée obligatoire
- Détection automatique d'incohérences

---

## Dépannage

### Le backend ne démarre pas

**Problème:** NumPy 2.x incompatible avec OpenCV
```bash
cd financial-analyzer/backend
source venv/bin/activate
pip install "numpy<2" --upgrade
```

**Problème:** Anthropic SDK incompatible
```bash
pip install --upgrade anthropic
```

### Le frontend ne démarre pas

**Problème:** Dépendances manquantes
```bash
cd financial-analyzer/frontend
rm -rf node_modules package-lock.json
npm install
```

**Problème:** Port 5173 déjà utilisé
```bash
# Tuer le processus existant
kill $(lsof -ti:5173)
```

### Mise à jour Git échoue

**Problème:** Conflits locaux
```bash
git stash  # Sauvegarde les changements locaux
./launch-mac.command  # Relancer
```

---

## Support

Pour des problèmes ou questions:
1. Vérifiez les logs (backend.log, frontend.log)
2. Consultez la documentation API: http://localhost:8000/docs
3. Vérifiez que tous les ports sont libres (8000, 5173)
4. Réinstallez les dépendances si nécessaire

---

**Version:** 1.0
**Dernière mise à jour:** 2025-11-22
**Powered by:** Claude AI (Sonnet 4.5)
