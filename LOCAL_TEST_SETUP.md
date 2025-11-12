# 🧪 Configuration de Test Local - Fonctionnalité de Partage

## 🎯 Objectif

Tester complètement la fonctionnalité de partage social en local **avant déploiement**, avec un mock du backend et accès mobile.

---

## 📋 Table des Matières

1. [Configuration Backend Mock](#1-configuration-backend-mock)
2. [Serveur de Développement Local](#2-serveur-de-développement-local)
3. [Test sur Mobile (même réseau WiFi)](#3-test-sur-mobile-même-réseau-wifi)
4. [Test des Fonctionnalités](#4-test-des-fonctionnalités)
5. [Debugging et Logs](#5-debugging-et-logs)

---

## 1. Configuration Backend Mock

### Option A: Mock complet (sans backend réel)

Créer un fichier mock pour simuler les API calls pendant le développement.

**Créer `src/services/shareService.mock.ts`:**

```typescript
import type { ShareableSession, GeneratedMedia } from '../types/share';

// Mode mock activé par défaut en local
export const USE_MOCK = import.meta.env.DEV;

/**
 * Mock de génération d'image
 */
export async function mockGenerateImage(
  session: ShareableSession,
  options: { format: 'square' | 'story' }
): Promise<GeneratedMedia> {
  // Simuler un délai réseau
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Retourner une URL de placeholder
  const dimension = options.format === 'story' ? '1080x1920' : '1080x1080';

  return {
    url: `https://via.placeholder.com/${dimension}/667eea/ffffff?text=${encodeURIComponent(session.mood.name)}`,
    type: 'image',
    width: options.format === 'story' ? 1080 : 1080,
    height: options.format === 'story' ? 1920 : 1080,
    format: 'png',
    size: 125000,
  };
}

/**
 * Mock de création de lien court
 */
export async function mockCreateShareLink(session: ShareableSession): Promise<string> {
  // Simuler un délai réseau
  await new Promise((resolve) => setTimeout(resolve, 500));

  // En local, utiliser localhost avec un ID mockable
  const mockId = session.id.substring(0, 8);
  return `http://localhost:5173/share/${mockId}`;
}

/**
 * Mock de tracking analytics
 */
export async function mockTrackShare(platform: string, sessionId: string): Promise<void> {
  console.log('📊 [MOCK] Share tracked:', { platform, sessionId, timestamp: new Date().toISOString() });
}
```

**Modifier `src/services/shareService.ts` pour utiliser les mocks:**

Ajouter en haut du fichier après les imports:

```typescript
import { USE_MOCK, mockGenerateImage, mockCreateShareLink, mockTrackShare } from './shareService.mock';
```

Modifier la fonction `generateShareImage`:

```typescript
export async function generateShareImage(
  session: ShareableSession,
  options: { format: 'square' | 'story'; includeQuote?: boolean } = { format: 'square' }
): Promise<GeneratedMedia> {
  // Utiliser le mock en développement
  if (USE_MOCK) {
    return mockGenerateImage(session, options);
  }

  // Code production existant...
  const response = await fetch(`${API_BASE_URL}/api/share/generate`, {
    // ...
  });
}
```

Modifier la fonction `createShareLink`:

```typescript
export async function createShareLink(session: ShareableSession): Promise<string> {
  // Utiliser le mock en développement
  if (USE_MOCK) {
    return mockCreateShareLink(session);
  }

  // Code production existant...
  const response = await fetch(`${API_BASE_URL}/api/share/link`, {
    // ...
  });
}
```

Modifier la fonction `trackShare`:

```typescript
export async function trackShare(result: ShareResult, session: ShareableSession): Promise<void> {
  if (!result.success) return;

  // Utiliser le mock en développement
  if (USE_MOCK) {
    return mockTrackShare(result.platform, session.id);
  }

  // Code production existant...
  try {
    await fetch(`${API_BASE_URL}/api/analytics/share`, {
      // ...
    });
  } catch (error) {
    console.error('Failed to track share:', error);
  }
}
```

### Option B: Backend local Express (API réel)

Si tu veux tester avec un vrai backend local.

**Créer `server-test/index.js`:**

```javascript
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Stockage en mémoire pour les liens courts
const shortLinks = new Map();

// Stockage des analytics
const analytics = [];

/**
 * Génération d'image (simulée)
 */
app.post('/api/share/generate', async (req, res) => {
  const { session, format, includeQuote } = req.body;

  console.log('🎨 Generate image request:', { format, includeQuote });

  // Simuler un délai de génération
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const dimension = format === 'story' ? '1080x1920' : '1080x1080';
  const mood = session.mood.name.replace(/\s+/g, '+');

  res.json({
    success: true,
    media: {
      url: `https://via.placeholder.com/${dimension}/667eea/ffffff?text=${mood}`,
      type: 'image',
      width: format === 'story' ? 1080 : 1080,
      height: format === 'story' ? 1920 : 1080,
      format: 'png',
      size: 125000,
    },
  });
});

/**
 * Création de lien court
 */
app.post('/api/share/link', async (req, res) => {
  const { sessionId, excerpt, mood, intention } = req.body;

  // Générer un ID court
  const shortId = crypto.randomBytes(4).toString('hex');

  // Stocker le mapping
  shortLinks.set(shortId, {
    sessionId,
    excerpt,
    mood,
    intention,
    createdAt: Date.now(),
    clicks: 0,
  });

  const shortUrl = `http://localhost:${PORT}/s/${shortId}`;

  console.log('🔗 Short link created:', shortUrl);

  res.json({
    success: true,
    shortUrl,
    shortId,
  });
});

/**
 * Redirection depuis lien court
 */
app.get('/s/:shortId', (req, res) => {
  const { shortId } = req.params;
  const link = shortLinks.get(shortId);

  if (!link) {
    return res.status(404).send('Link not found');
  }

  // Incrémenter les clics
  link.clicks++;

  console.log('👆 Link clicked:', shortId, 'Total clicks:', link.clicks);

  // Rediriger vers l'app avec l'ID de session
  res.redirect(`http://localhost:5173/session/${link.sessionId}`);
});

/**
 * Open Graph metadata
 */
app.get('/api/share/og/:shortId', (req, res) => {
  const { shortId } = req.params;
  const link = shortLinks.get(shortId);

  if (!link) {
    return res.status(404).json({ error: 'Link not found' });
  }

  res.json({
    title: `${link.intention || 'Ma méditation'} - Halterra`,
    description: link.excerpt,
    image: `https://via.placeholder.com/1200x630/667eea/ffffff?text=${link.mood.name}`,
    url: `http://localhost:${PORT}/s/${shortId}`,
  });
});

/**
 * Analytics tracking
 */
app.post('/api/analytics/share', (req, res) => {
  const { platform, sessionId, mood, category, timestamp } = req.body;

  analytics.push({
    platform,
    sessionId,
    mood,
    category,
    timestamp,
  });

  console.log('📊 Share tracked:', platform, sessionId);

  res.json({ success: true });
});

/**
 * Dashboard analytics (bonus)
 */
app.get('/api/analytics/dashboard', (req, res) => {
  const summary = {
    totalShares: analytics.length,
    byPlatform: {},
    byMood: {},
    recentShares: analytics.slice(-10),
  };

  analytics.forEach((share) => {
    summary.byPlatform[share.platform] = (summary.byPlatform[share.platform] || 0) + 1;
    summary.byMood[share.mood] = (summary.byMood[share.mood] || 0) + 1;
  });

  res.json(summary);
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log(`📊 Analytics dashboard: http://localhost:${PORT}/api/analytics/dashboard`);
});
```

**Créer `server-test/package.json`:**

```json
{
  "name": "halterra-test-server",
  "version": "1.0.0",
  "description": "Backend mock pour tester le partage social",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

**Installer et lancer:**

```bash
cd server-test
npm install
npm start
```

**Modifier `.env.local` dans le projet React:**

```env
VITE_API_URL=http://localhost:3001
```

---

## 2. Serveur de Développement Local

### Étape 1: Lancer le frontend

```bash
cd C:\Users\Danny\halterra
npm run dev
```

Par défaut, Vite démarre sur **http://localhost:5173**

### Étape 2: Obtenir l'IP locale pour accès mobile

**Sur Windows:**

```bash
ipconfig
```

Chercher l'adresse IPv4 du réseau WiFi, par exemple: `192.168.1.10`

**Sur Mac/Linux:**

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Étape 3: Configurer Vite pour accepter les connexions externes

**Modifier `vite.config.ts`:**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Écouter sur toutes les interfaces (0.0.0.0)
    port: 5173,
    strictPort: true,
  },
});
```

**Relancer le serveur:**

```bash
npm run dev
```

Tu verras maintenant:

```
VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.10:5173/
```

---

## 3. Test sur Mobile (même réseau WiFi)

### Prérequis

- Smartphone connecté au **même réseau WiFi** que ton PC
- Firewall Windows configuré pour autoriser les connexions entrantes sur le port 5173

### Configurer le Firewall Windows

1. Ouvrir **Windows Defender Firewall**
2. Cliquer sur **"Paramètres avancés"**
3. Cliquer sur **"Règles de trafic entrant"** → **"Nouvelle règle"**
4. Sélectionner **"Port"** → Suivant
5. Protocole: **TCP**, Port: **5173** → Suivant
6. Action: **Autoriser la connexion** → Suivant
7. Profils: Cocher **"Privé"** et **"Domaine"** → Suivant
8. Nom: **"Vite Dev Server"** → Terminer

### Accéder depuis le mobile

Sur ton smartphone, ouvrir le navigateur et aller sur:

```
http://192.168.1.10:5173
```

(Remplacer `192.168.1.10` par ton IP locale)

### Tester le Web Share API (natif mobile)

Le bouton **"Partager"** avec l'option **"Native"** ouvrira le picker de partage natif du système (iOS/Android).

---

## 4. Test des Fonctionnalités

### Checklist de Test Complète

#### ✅ Modal de Partage

- [ ] Le bouton "Partager" ouvre le modal
- [ ] Le modal affiche l'aperçu de la session (mood + titre + couleur)
- [ ] La grille affiche 7 plateformes (8 avec Native sur mobile)
- [ ] Le bouton de fermeture (X) fonctionne
- [ ] Cliquer en dehors du modal le ferme

#### ✅ Partage par Plateforme

**Instagram:**
- [ ] Cliquer copie le texte dans le presse-papiers
- [ ] Message de succès: "Texte copié! Ouvre Instagram pour partager."
- [ ] L'app Instagram s'ouvre (mobile) ou la page web (desktop)

**Facebook:**
- [ ] Ouvre une popup Facebook Sharer
- [ ] Le lien et la quote sont pré-remplis
- [ ] Message de succès affiché

**X (Twitter):**
- [ ] Ouvre une popup Twitter intent
- [ ] Le texte + hashtags + lien sont pré-remplis
- [ ] Le paramètre "via" est présent (@HalterraApp)

**LinkedIn:**
- [ ] Ouvre une popup LinkedIn share
- [ ] Le lien est pré-rempli

**WhatsApp:**
- [ ] Ouvre WhatsApp Web (desktop) ou l'app (mobile)
- [ ] Le texte + lien sont pré-remplis

**Copier le lien:**
- [ ] Copie le lien dans le presse-papiers
- [ ] Message de succès: "Lien copié!"

**Native (mobile uniquement):**
- [ ] Ouvre le picker de partage du système
- [ ] Toutes les apps installées sont disponibles

#### ✅ Génération de Contenu

- [ ] L'extrait généré est < 200 caractères
- [ ] L'extrait se termine par une phrase complète (ou "...")
- [ ] Les hashtags sont générés selon le mood
- [ ] Le lien court est unique par session

#### ✅ États de Chargement

- [ ] Pendant le partage, le bouton de la plateforme pulse
- [ ] Les autres boutons restent cliquables
- [ ] Le modal reste ouvert pendant le chargement

#### ✅ Gestion d'Erreurs

**Simuler une erreur:**

Modifier temporairement `shareService.ts` pour forcer une erreur:

```typescript
export async function createShareLink(session: ShareableSession): Promise<string> {
  throw new Error('Network error simulated');
}
```

- [ ] Message d'erreur affiché en rouge
- [ ] Icône ⚠ visible
- [ ] Le modal reste ouvert pour réessayer

#### ✅ Responsive Design

**Desktop (> 768px):**
- [ ] Modal centré avec max-width 540px
- [ ] Grille 3 colonnes
- [ ] Icônes de mood 56x56px

**Mobile (< 768px):**
- [ ] Modal en bas de l'écran (bottom sheet)
- [ ] Grille 3 colonnes
- [ ] Icônes de mood 48x48px

**Très petit mobile (< 380px):**
- [ ] Grille passe en 2 colonnes

#### ✅ Performance

- [ ] Ouverture du modal < 100ms
- [ ] Génération de lien < 1s (mock: 500ms)
- [ ] Génération d'image < 2s (mock: 800ms)
- [ ] Pas de lag pendant les animations

---

## 5. Debugging et Logs

### Console Logs Utiles

**Ajouter des logs temporaires dans `ShareModal.tsx`:**

```typescript
const handleShare = async (platform: SharePlatform) => {
  console.log('🚀 Starting share:', platform);
  setSharing(true);
  setShareStatus({});

  try {
    const result = await shareSession(session, {
      platform,
      format: platform === 'instagram' ? 'image' : 'link',
      includeQuote: true,
    });

    console.log('✅ Share result:', result);

    if (result.success) {
      // ...
    }
  } catch (error) {
    console.error('❌ Share error:', error);
  }
};
```

### Outils de Debug Mobile

**Sur iOS (Safari):**
1. Sur iPhone: Réglages → Safari → Avancé → Activer **"Inspecteur Web"**
2. Sur Mac: Safari → Préférences → Avancé → Cocher **"Afficher le menu Développement"**
3. Connecter l'iPhone au Mac
4. Safari Mac → Développement → [Ton iPhone] → localhost

**Sur Android (Chrome):**
1. Sur Android: Paramètres → À propos → Taper 7× sur "Numéro de build" (activer mode développeur)
2. Paramètres → Système → Options pour développeurs → Activer **"Débogage USB"**
3. Connecter au PC
4. Chrome Desktop → `chrome://inspect` → Devices → Inspecter

### Test avec React DevTools

Installer l'extension React DevTools:
- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

Vérifier:
- État du composant `ShareModal` (isOpen, sharing, shareStatus)
- Props passées (session, onClose)

---

## 🎯 Scénario de Test Complet

### Test Flow Recommandé

1. **Setup:**
   - [ ] Lancer le backend mock (Option A ou B)
   - [ ] Lancer `npm run dev`
   - [ ] Ouvrir sur desktop: `http://localhost:5173`
   - [ ] Ouvrir sur mobile: `http://192.168.1.10:5173`

2. **Créer une session de méditation:**
   - [ ] Aller sur la page de méditation
   - [ ] Choisir un mood (ex: "Calme")
   - [ ] Générer une méditation
   - [ ] Sauvegarder la session

3. **Tester le partage depuis SessionView:**
   - [ ] Cliquer sur le bouton "Partager"
   - [ ] Vérifier que le modal s'ouvre
   - [ ] Tester Instagram (copie texte)
   - [ ] Tester "Copier le lien"
   - [ ] Vérifier les messages de succès

4. **Tester depuis History:**
   - [ ] Aller sur la page History
   - [ ] Cliquer sur l'icône de partage d'une session
   - [ ] Tester Facebook (popup)
   - [ ] Tester Twitter (popup)

5. **Tester sur Mobile:**
   - [ ] Répéter les étapes 3-4 sur mobile
   - [ ] Tester le partage **Native** (picker système)
   - [ ] Vérifier que WhatsApp ouvre l'app mobile

6. **Vérifier les Analytics:**
   - [ ] Ouvrir la console navigateur
   - [ ] Chercher les logs "📊 Share tracked"
   - [ ] Si backend Express: Visiter `http://localhost:3001/api/analytics/dashboard`

---

## 🔧 Troubleshooting

### Problème: "Failed to fetch" lors du partage

**Cause:** Le backend mock n'est pas lancé ou mauvaise URL.

**Solution:**
- Vérifier que `USE_MOCK = true` dans `shareService.mock.ts`
- Ou vérifier que le serveur Express tourne sur port 3001
- Vérifier `.env.local` contient `VITE_API_URL=http://localhost:3001`

### Problème: Modal ne s'ouvre pas

**Cause:** État `isOpen` non géré correctement.

**Solution:**
```typescript
// Ajouter des logs
const [shareModalOpen, setShareModalOpen] = useState(false);

const handleOpenShare = () => {
  console.log('Opening share modal');
  setShareModalOpen(true);
};

<button onClick={handleOpenShare}>Partager</button>
<ShareModal isOpen={shareModalOpen} onClose={() => setShareModalOpen(false)} />
```

### Problème: Clipboard API ne fonctionne pas

**Cause:** Nécessite HTTPS ou localhost.

**Solution:**
- En local, ça devrait fonctionner sur `localhost`
- Sur mobile via IP, créer un certificat SSL auto-signé (avancé)
- Ou utiliser ngrok (voir ci-dessous)

### Problème: Mobile ne peut pas accéder au serveur

**Cause:** Firewall bloque les connexions ou mauvaise IP.

**Solution:**
1. Vérifier l'IP avec `ipconfig`
2. Ping depuis le mobile: `ping 192.168.1.10`
3. Vérifier le firewall (voir section 3)
4. Désactiver temporairement le firewall pour tester

---

## 🌐 Alternative: Utiliser ngrok (Accès HTTPS)

Si tu as besoin d'un vrai domaine HTTPS pour tester (ex: Clipboard API sur mobile).

### Installation

```bash
# Télécharger depuis https://ngrok.com/download
# Ou avec Chocolatey
choco install ngrok

# Authentification (compte gratuit sur ngrok.com)
ngrok authtoken <TON_TOKEN>
```

### Utilisation

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - ngrok:**
```bash
ngrok http 5173
```

Tu obtiendras une URL publique:
```
Forwarding   https://abc123.ngrok.io -> http://localhost:5173
```

**Partager cette URL avec ton mobile ou n'importe qui pour tester.**

---

## 📊 Métriques à Surveiller

Pendant les tests, noter:

| Métrique | Target | Résultat |
|----------|--------|----------|
| Temps ouverture modal | < 100ms | _____ ms |
| Génération lien court | < 1s | _____ ms |
| Génération image | < 2s | _____ ms |
| Taux de succès partage | > 95% | _____ % |
| Erreurs Clipboard API | 0 | _____ |
| Temps chargement mobile | < 3s | _____ s |

---

## ✅ Validation Finale

Avant de passer en production, s'assurer que:

- [ ] Tous les tests de la checklist passent ✅
- [ ] Aucune erreur dans la console navigateur
- [ ] Le design est cohérent sur desktop et mobile
- [ ] Les animations sont fluides (60fps)
- [ ] Les liens courts sont uniques
- [ ] Les analytics sont trackées correctement
- [ ] Le partage fonctionne sur iOS et Android
- [ ] Le code est mergé sur la branche principale

---

## 🚀 Prêt pour la Production

Une fois tous les tests validés en local:

1. Désactiver le mode mock:
   ```typescript
   export const USE_MOCK = false;
   ```

2. Configurer les vraies variables d'environnement:
   ```env
   VITE_API_URL=https://halterra-backend.vercel.app
   ```

3. Déployer sur Vercel/Netlify

4. Tester une dernière fois sur l'URL de production

---

**Préparé pour**: Tests locaux complets
**Temps estimé**: 30-45 minutes de tests
**Date**: 2025-01-12
