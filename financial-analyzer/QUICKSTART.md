# 🚀 Démarrage Rapide - Financial Analyzer

## Installation Automatique en 3 Commandes

### 1️⃣ Cloner le projet

```bash
git clone https://github.com/DannyBern/Halterra.git
cd Halterra/financial-analyzer
```

### 2️⃣ Lancer le script de configuration

```bash
./setup.sh
```

Le script va :
- ✅ Vous demander votre clé API Anthropic (de manière **sécurisée**)
- ✅ Créer l'environnement virtuel Python
- ✅ Installer toutes les dépendances backend
- ✅ Installer toutes les dépendances frontend

**⏱️ Temps estimé :** 5-10 minutes (dépend de votre connexion)

### 3️⃣ Lancer l'application

Ouvrez **2 terminaux** :

**Terminal 1 - Backend :**
```bash
cd backend
source venv/bin/activate
python main.py
```

**Terminal 2 - Frontend :**
```bash
cd frontend
npm run dev
```

### 4️⃣ Utiliser l'application

Ouvrez votre navigateur : **http://localhost:5173**

---

## 📝 Obtenir une clé API Anthropic

Si vous n'avez pas encore de clé :

1. Allez sur : https://console.anthropic.com/
2. Créez un compte (carte de crédit requise)
3. Naviguez vers "API Keys"
4. Cliquez sur "Create Key"
5. Copiez la clé (elle commence par `sk-ant-...`)

**💡 Note :** Claude offre généralement des crédits gratuits pour commencer.

---

## ❓ Problèmes Courants

### Tesseract non installé

```bash
# macOS
brew install tesseract

# Ubuntu/Debian
sudo apt-get install tesseract-ocr
```

### Python 3.8+ requis

Vérifiez votre version :
```bash
python3 --version
```

### Node.js 16+ requis

Vérifiez votre version :
```bash
node --version
```

---

## 🎯 Utilisation

1. **Glissez-déposez** votre fichier (vidéo, audio, ou image)
2. **Attendez** l'upload
3. **Posez votre question** (ex: "Ce duplex à 450k$ est-il un bon investissement?")
4. **Cliquez** sur "Analyser"
5. **Recevez** l'analyse détaillée !

---

## 📚 Documentation Complète

Consultez **README.md** pour plus de détails.
