# ⚡ Test Local - Démarrage Rapide (5 minutes)

Guide ultra-rapide pour tester la fonctionnalité de partage social en local.

## 🎯 Objectif

Tester le partage social **avant déploiement** avec:
- ✅ Mock backend intégré (pas besoin de serveur)
- ✅ Accès mobile via WiFi
- ✅ Toutes les plateformes fonctionnelles

---

## 📦 Prérequis

- Node.js installé
- Le projet Halterra Lite cloné
- Terminal ouvert dans `C:\Users\Danny\halterra`

---

## 🚀 Étape 1: Lancer le Frontend (1 min)

```bash
npm run dev
```

**Résultat attendu:**
```
VITE v5.x.x  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.10:5173/
```

✅ Le mode **mock** est **automatiquement activé** en développement.

---

## 🧪 Étape 2: Tester sur Desktop (2 min)

### A. Ouvrir l'app

Navigateur → `http://localhost:5173`

### B. Créer une session de méditation

1. Aller sur la page **Méditation**
2. Choisir un mood (ex: Calme)
3. Générer une méditation
4. Sauvegarder

### C. Tester le partage

1. Cliquer sur le bouton **"Partager"**
2. Le modal s'ouvre ✨
3. Tester les plateformes:
   - **Instagram**: Copie le texte, ouvre Instagram
   - **Facebook**: Ouvre popup de partage
   - **Twitter**: Ouvre popup de tweet
   - **Copier le lien**: Copie dans le presse-papiers
4. Vérifier les messages de succès

### D. Vérifier les logs

Ouvrir la console navigateur (`F12` → Console):

```
🔗 [MOCK] Creating share link for session: abc123...
✅ [MOCK] Short link created: http://localhost:5173/share/abc12345

🎨 [MOCK] Generating image: { format: 'square', mood: 'Calme' }
✅ [MOCK] Image generated: https://via.placeholder.com/1080x1080/...

📊 [MOCK] Share tracked: { platform: 'instagram', sessionId: 'abc123', ... }
```

✅ Si tu vois ces logs, **tout fonctionne** !

---

## 📱 Étape 3: Tester sur Mobile (2 min)

### A. Trouver ton IP locale

**Windows:**
```bash
ipconfig
```

Chercher `Carte réseau sans fil Wi-Fi` → `Adresse IPv4`:
```
Adresse IPv4. . . . . . . . : 192.168.1.10
```

**Mac/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### B. Configurer le Firewall (Windows uniquement)

Si tu ne peux pas accéder depuis le mobile:

1. Windows Defender Firewall → Paramètres avancés
2. Règles de trafic entrant → Nouvelle règle
3. Type: **Port** → TCP → **5173**
4. Action: **Autoriser**
5. Profils: **Privé** + Domaine
6. Nom: "Vite Dev Server"

### C. Accéder depuis le mobile

Sur ton smartphone (même réseau WiFi):

Navigateur → `http://192.168.1.10:5173`

(Remplace `192.168.1.10` par ton IP)

### D. Tester le partage natif

1. Créer/ouvrir une session
2. Cliquer sur **"Partager"**
3. Tu verras un bouton **"Partager"** (📤) en haut de la grille
4. Cliquer → Le picker natif iOS/Android s'ouvre ✨
5. Choisir WhatsApp, Instagram, Messages, etc.

✅ Le partage natif ne fonctionne que sur **mobile** (Web Share API)

---

## 🎯 Checklist de Test Rapide

Cocher ce qui fonctionne:

### Desktop
- [ ] Modal s'ouvre au clic sur "Partager"
- [ ] Aperçu de session affiché (mood + titre)
- [ ] Instagram copie le texte
- [ ] Facebook ouvre popup
- [ ] Twitter ouvre popup
- [ ] WhatsApp ouvre wa.me
- [ ] LinkedIn ouvre popup
- [ ] "Copier le lien" copie dans le presse-papiers
- [ ] Messages de succès affichés
- [ ] Logs visibles dans la console

### Mobile
- [ ] App accessible via IP locale
- [ ] Modal responsive (bottom sheet)
- [ ] Bouton "Partager" (natif) visible
- [ ] Picker natif s'ouvre
- [ ] Peut partager sur WhatsApp
- [ ] Peut partager sur Instagram
- [ ] Animations fluides

---

## 🐛 Problèmes Courants

### ❌ "Failed to fetch" dans la console

**Cause**: Le mock n'est pas activé

**Solution**:
Vérifier `src/services/shareService.mock.ts`:
```typescript
export const USE_MOCK = import.meta.env.DEV; // ✅ Doit être true en dev
```

Si ça ne marche pas, forcer:
```typescript
export const USE_MOCK = true;
```

### ❌ Modal ne s'ouvre pas

**Cause**: État React non géré

**Solution**: Vérifier dans la console:
```javascript
// Ajouter temporairement des logs
<button onClick={() => {
  console.log('Bouton cliqué');
  setShareModalOpen(true);
}}>
```

### ❌ "Clipboard API not available"

**Cause**: Nécessite HTTPS ou localhost

**Solution**:
- Sur desktop via `localhost` → ✅ Fonctionne
- Sur mobile via IP → Utiliser ngrok (voir LOCAL_TEST_SETUP.md)

### ❌ Mobile ne peut pas se connecter

**Cause**: Firewall bloque ou mauvaise IP

**Solution**:
1. Vérifier que PC et mobile sont sur le **même WiFi**
2. Ping depuis le mobile (via une app)
3. Configurer le firewall (voir Étape 3B)
4. Désactiver temporairement le firewall pour tester

### ❌ Vite ne démarre pas

**Cause**: Port 5173 déjà utilisé

**Solution**:
```bash
npx kill-port 5173
npm run dev
```

Ou utiliser un autre port:
```bash
npm run dev -- --port 3000
```

---

## 🎨 Personnaliser les Tests

### Désactiver le mock (utiliser le vrai backend)

1. **Modifier `src/services/shareService.mock.ts`:**
   ```typescript
   export const USE_MOCK = false;
   ```

2. **Configurer l'API URL dans `.env.local`:**
   ```env
   VITE_API_URL=http://localhost:3001
   ```

3. **Lancer le serveur de test (optionnel):**
   ```bash
   cd server-test
   npm install
   npm start
   ```

4. **Relancer Vite:**
   ```bash
   npm run dev
   ```

### Tester avec de vraies images

Par défaut, le mock génère des placeholders.

Pour générer de vraies images localement:
1. Utiliser le serveur de test Express (voir `server-test/README.md`)
2. Ou implémenter la génération Canvas côté client (voir SHARE_FEATURE_COMPLETE.md)

### Simuler des erreurs

Dans `src/services/shareService.mock.ts`:

```typescript
export async function mockCreateShareLink(session: ShareableSession): Promise<string> {
  // Simuler une erreur 50% du temps
  if (Math.random() > 0.5) {
    throw new Error('Network error simulated');
  }

  // Code normal...
}
```

---

## 📊 Métriques à Observer

Pendant les tests, noter:

| Métrique | Target | Ton Résultat |
|----------|--------|--------------|
| Temps ouverture modal | < 100ms | _____ ms |
| Génération lien mock | ~500ms | _____ ms |
| Génération image mock | ~800ms | _____ ms |
| Copie dans clipboard | < 50ms | _____ ms |
| Ouverture popup social | < 200ms | _____ ms |

**Astuce**: Utiliser l'onglet Performance dans DevTools pour mesurer.

---

## ✅ Validation Complète

Si tous les points suivants sont OK, tu es prêt pour la production:

- [ ] Le modal s'ouvre rapidement (< 100ms)
- [ ] Tous les boutons de plateforme fonctionnent
- [ ] Les messages de succès/erreur s'affichent
- [ ] Le design est cohérent (desktop + mobile)
- [ ] Les animations sont fluides
- [ ] Le partage natif fonctionne sur mobile
- [ ] Aucune erreur dans la console
- [ ] Les logs mock s'affichent correctement

---

## 🚀 Prochaines Étapes

Une fois les tests locaux validés:

1. **Lire le guide complet**: `LOCAL_TEST_SETUP.md`
2. **Configurer le backend réel**: `SHARE_FEATURE_COMPLETE.md`
3. **Intégrer dans l'app**: `SHARE_QUICK_START.md`
4. **Déployer sur Vercel**: Voir section déploiement

---

## 📞 Besoin d'Aide ?

- **Guide complet**: `LOCAL_TEST_SETUP.md` (30+ pages)
- **Documentation technique**: `SHARE_FEATURE_COMPLETE.md`
- **Guide intégration**: `SHARE_QUICK_START.md`
- **Serveur de test**: `server-test/README.md`

---

**Temps total**: ~5 minutes ⚡
**Difficulté**: Facile 🟢
**Prérequis**: Aucun (mock intégré)

Bon test ! 🎉
