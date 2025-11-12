# 🧪 Serveur de Test Halterra - Backend Mock

Serveur Express simple pour tester la fonctionnalité de partage social en local **sans déployer sur Vercel**.

## 🚀 Installation

```bash
cd server-test
npm install
```

## ▶️ Démarrage

```bash
npm start
```

Le serveur démarre sur **http://localhost:3001**

## 🔥 Mode Watch (auto-reload)

```bash
npm run dev
```

Utilise nodemon pour redémarrer automatiquement à chaque modification.

## 📡 Endpoints Disponibles

### POST `/api/share/generate`
Génère une image de partage (simulée avec placeholder)

**Body:**
```json
{
  "session": {
    "id": "abc123",
    "mood": { "name": "Calme", "color": "#667eea" },
    "excerpt": "Un moment de paix..."
  },
  "format": "square",
  "includeQuote": true
}
```

**Response:**
```json
{
  "success": true,
  "media": {
    "url": "https://via.placeholder.com/1080x1080/667eea/ffffff?text=Calme",
    "type": "image",
    "width": 1080,
    "height": 1080,
    "format": "png",
    "size": 125000
  }
}
```

### POST `/api/share/link`
Crée un lien court trackable

**Body:**
```json
{
  "sessionId": "abc123",
  "excerpt": "Un moment de paix...",
  "mood": { "id": "calm", "name": "Calme", "color": "#667eea" },
  "intention": "Se détendre"
}
```

**Response:**
```json
{
  "success": true,
  "shortUrl": "http://localhost:3001/s/a1b2c3d4",
  "shortId": "a1b2c3d4"
}
```

### GET `/s/:shortId`
Redirection depuis un lien court (compteur de clics)

Redirige vers: `http://localhost:5173/session/{sessionId}`

### GET `/api/share/og/:shortId`
Métadonnées Open Graph pour preview social

**Response:**
```json
{
  "title": "Ma méditation - Halterra",
  "description": "Un moment de paix...",
  "image": "https://via.placeholder.com/1200x630/667eea/ffffff",
  "url": "http://localhost:3001/s/a1b2c3d4",
  "type": "article",
  "site_name": "Halterra"
}
```

### POST `/api/analytics/share`
Track un partage

**Body:**
```json
{
  "platform": "instagram",
  "sessionId": "abc123",
  "mood": "calm",
  "category": "meditation",
  "timestamp": 1705073820000
}
```

### GET `/api/analytics/dashboard`
Dashboard analytics (BONUS)

**Response:**
```json
{
  "totalShares": 15,
  "totalLinks": 8,
  "totalClicks": 42,
  "byPlatform": {
    "instagram": 5,
    "facebook": 3,
    "twitter": 2
  },
  "byMood": {
    "calm": 8,
    "motivated": 4,
    "frustrated": 3
  },
  "recentShares": [...]
}
```

## 🔧 Configuration Frontend

Pour que le frontend utilise ce serveur:

1. **Option A: Désactiver le mode mock**

Modifier `src/services/shareService.mock.ts`:
```typescript
export const USE_MOCK = false;
```

2. **Configurer l'URL dans `.env.local`:**
```env
VITE_API_URL=http://localhost:3001
```

3. **Redémarrer Vite:**
```bash
npm run dev
```

## 🎯 Tester Rapidement

### Avec cURL

**Générer une image:**
```bash
curl -X POST http://localhost:3001/api/share/generate \
  -H "Content-Type: application/json" \
  -d '{
    "session": {
      "id": "test123",
      "mood": {"name": "Calme", "color": "#667eea"},
      "excerpt": "Test"
    },
    "format": "square"
  }'
```

**Créer un lien court:**
```bash
curl -X POST http://localhost:3001/api/share/link \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test123",
    "excerpt": "Un moment de méditation",
    "mood": {"id": "calm", "name": "Calme", "color": "#667eea"},
    "intention": "Se relaxer"
  }'
```

**Voir le dashboard:**
```bash
curl http://localhost:3001/api/analytics/dashboard
```

### Avec le navigateur

Ouvrir: **http://localhost:3001**

Tu verras une page d'accueil stylée avec:
- Statistiques en temps réel
- Liste des endpoints
- Lien vers le dashboard analytics

## 📊 Dashboard Analytics

Accéder à: **http://localhost:3001/api/analytics/dashboard**

Affiche en JSON:
- Nombre total de partages
- Nombre de liens créés
- Nombre total de clics
- Répartition par plateforme
- Répartition par mood
- 10 derniers partages

## 🔥 Logs en Temps Réel

Le serveur affiche des logs colorés dans le terminal:

```
✓ Test server running on http://localhost:3001
ℹ Frontend expected on http://localhost:5173
ℹ Analytics dashboard: http://localhost:3001/api/analytics/dashboard

ℹ Creating short link for session: abc123
✓ Short link created: http://localhost:3001/s/a1b2c3d4

✓ Share tracked: instagram (session: abc123)
```

## 🛑 Arrêter le Serveur

`Ctrl+C` dans le terminal

## 💡 Astuces

### Test avec Postman/Insomnia

Importer la collection (créer un fichier `postman-collection.json`):

```json
{
  "info": { "name": "Halterra Test Server", "schema": "..." },
  "item": [
    {
      "name": "Generate Image",
      "request": {
        "method": "POST",
        "url": "http://localhost:3001/api/share/generate",
        "body": { "mode": "raw", "raw": "{...}" }
      }
    }
  ]
}
```

### Simuler des Erreurs

Modifier `index.js` pour retourner des erreurs 500:

```javascript
app.post('/api/share/generate', (req, res) => {
  res.status(500).json({ error: 'Simulated error' });
});
```

### Réinitialiser les Données

Redémarrer le serveur (`Ctrl+C` puis `npm start`). Toutes les données en mémoire sont effacées.

## 🆚 Mock vs Serveur Test

| Feature | Mock (client-side) | Serveur Test |
|---------|-------------------|--------------|
| Installation | Aucune | `npm install` |
| Démarrage | Automatique | `npm start` |
| Logs | Console navigateur | Terminal serveur |
| Analytics | Simulés | Stockés en mémoire |
| Liens courts | Fake IDs | IDs cryptographiques |
| Redirections | N/A | Fonctionnelles |
| Dashboard | N/A | ✅ Disponible |

**Recommandation**: Utiliser le **mock** pour des tests rapides, et le **serveur test** pour des scénarios plus avancés (redirections, analytics).

## 📝 Notes

- Les données sont stockées en **mémoire** (Map/Array), donc perdues au redémarrage
- Pour une persistance, remplacer par Redis/MongoDB
- Les images sont des placeholders (via.placeholder.com)
- Les redirections pointent vers `localhost:5173` (Vite)

## 🔐 Sécurité

Ce serveur est **uniquement pour les tests locaux**. Ne jamais l'exposer sur Internet sans:
- Authentification
- Rate limiting
- Validation stricte des inputs
- HTTPS

## 🐛 Troubleshooting

**Port 3001 déjà utilisé:**
```bash
PORT=3002 npm start
```

**CORS errors:**
Le serveur autorise déjà tous les origins (`cors()` sans config). Si problème, vérifier la console navigateur.

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

Bon test ! 🚀
