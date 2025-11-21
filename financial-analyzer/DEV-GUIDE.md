# 🚀 Guide de Développement Simple - Financial Analyzer

## 🎯 Workflow Ultra-Simple

### Sur Mac :
1. **Double-clic** sur `launch-mac.command`
2. L'app s'ouvre automatiquement dans le navigateur
3. **Modifier le code** dans VS Code / votre éditeur
4. **Rafraîchir le navigateur** (Cmd+R) pour voir les changements
5. **Ctrl+C** dans le terminal pour arrêter

### Sur Windows :
1. **Double-clic** sur `launch-windows.bat`
2. L'app s'ouvre automatiquement dans le navigateur
3. **Modifier le code** dans VS Code / votre éditeur
4. **Rafraîchir le navigateur** (F5) pour voir les changements
5. **Fermer les fenêtres** de terminal pour arrêter

---

## 📁 Fichiers Importants à Modifier

### **Frontend (Interface)** - `frontend/src/`

- **`App.tsx`** - Logique principale de l'application
- **`index.css`** - Tous les styles (couleurs, animations, etc.)
- **`components/`** - Composants réutilisables
  - `FileUploadZone.tsx` - Zone d'upload
  - `FileInfo.tsx` - Info fichier uploadé
  - `AnalysisResult.tsx` - Affichage résultats
  - `HistoryPanel.tsx` - Panneau historique

### **Backend (Serveur)** - `backend/`

- **`main.py`** - API endpoints
- **`services/claude_service.py`** - Configuration Claude
- **`services/file_handler.py`** - Traitement fichiers
- **`config.py`** - Configuration générale
- **`.env`** - Clé API Anthropic (⚠️ NE PAS COMMIT)

---

## 🎨 Modifier le Design

### Changer les Couleurs
Éditez `frontend/src/index.css` (lignes 1-20) :
```css
:root {
  --primary: #2563eb;        /* Couleur principale */
  --primary-hover: #1d4ed8;  /* Couleur au survol */
  --success: #10b981;        /* Vert succès */
  --error: #ef4444;          /* Rouge erreur */
}
```

### Changer le Texte
Éditez `frontend/src/App.tsx` (lignes 172-177) :
```tsx
<h1 className="app-title">💼 Financial Analyzer</h1>
<p className="app-subtitle">
  AI-powered financial opportunity analysis with Claude
</p>
```

---

## 🔧 Modifier le Comportement

### Changer le Prompt Claude
Éditez `backend/services/claude_service.py` (lignes 6-18) :
```python
SYSTEM_PROMPT = """Ton prompt personnalisé ici..."""
```

### Ajouter des Formats de Fichiers
Éditez `backend/config.py` (lignes 12-15) :
```python
SUPPORTED_AUDIO = ["mp3", "wav", "m4a", ...]
SUPPORTED_VIDEO = ["mp4", "avi", "mov", ...]
SUPPORTED_IMAGE = ["jpg", "jpeg", "png", ...]
```

---

## 🔄 Passer du Mac au PC (et vice-versa)

### **Depuis Mac vers PC :**

1. **Sur Mac** : Commit et push vos changements
   ```bash
   git add .
   git commit -m "Description de vos changements"
   git push
   ```

2. **Sur PC** : Pull les changements
   ```bash
   git pull
   ```

3. **Lancez** : Double-clic sur `launch-windows.bat`

### **Depuis PC vers Mac :**

1. **Sur PC** : Commit et push
2. **Sur Mac** : Pull et lancez `launch-mac.command`

---

## 🐛 Debugging Simple

### Voir les Logs

**Mac :**
```bash
tail -f /tmp/financial-analyzer-backend.log
tail -f /tmp/financial-analyzer-frontend.log
```

**Windows :**
Les logs sont dans les fenêtres de terminal qui s'ouvrent

### Console Navigateur
- **F12** ou **Cmd+Option+I** (Mac) pour ouvrir DevTools
- Onglet **Console** pour voir les erreurs JavaScript

---

## 💡 Tips de Développement

### Hot Reload Automatique
✅ Le frontend se recharge automatiquement quand vous sauvegardez
❌ Le backend nécessite un redémarrage manuel

### Tester Rapidement
1. Gardez un fichier test (image/vidéo) à portée de main
2. Utilisez toujours la même question pour comparer les résultats
3. Vérifiez l'historique pour voir les différences

### Éviter les Erreurs
- ⚠️ Ne modifiez jamais `.env` dans Git
- ⚠️ Assurez-vous que les ports 8000 et 5173 sont libres
- ⚠️ Activez toujours le venv avant d'installer des packages Python

---

## 🔥 Commandes Utiles (Optionnel)

### Installer un nouveau package Python
```bash
cd backend
source venv/bin/activate          # Mac
# ou
venv\Scripts\activate              # Windows
pip install nom-du-package
pip freeze > requirements.txt
```

### Installer un nouveau package npm
```bash
cd frontend
npm install nom-du-package
```

---

## 📦 Structure Complète

```
financial-analyzer/
├── launch-mac.command     ← DOUBLE-CLIC (Mac)
├── launch-windows.bat     ← DOUBLE-CLIC (Windows)
├── DEV-GUIDE.md          ← Ce fichier
├── README.md             ← Documentation complète
│
├── backend/
│   ├── main.py           ← API principale
│   ├── .env              ← Clé API (secret)
│   ├── config.py         ← Configuration
│   ├── requirements.txt  ← Dépendances Python
│   └── services/         ← Logique métier
│
└── frontend/
    ├── src/
    │   ├── App.tsx       ← App principale
    │   ├── index.css     ← Styles globaux
    │   ├── components/   ← Composants UI
    │   └── services/     ← API calls
    └── package.json      ← Dépendances npm
```

---

## 🎓 Prochaines Étapes

1. **Testez le launcher** sur votre Mac
2. **Faites quelques modifications** simples (couleurs, textes)
3. **Commit et push** quand vous êtes satisfait
4. **Répétez** sur votre PC Windows dans quelques jours

Bon développement ! 🚀
