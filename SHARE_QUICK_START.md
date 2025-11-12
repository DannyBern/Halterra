# 🚀 Quick Start - Intégration Rapide du Partage Social

Guide pratique pour intégrer la fonctionnalité de partage en **moins de 30 minutes**.

## 📋 Prérequis

```bash
# Vérifier que vous avez bien:
- Node.js 18+
- npm ou yarn
- Compte Vercel (pour backend)
```

## ⚡ Installation Express (5 min)

### 1. Copier les fichiers dans votre projet

```bash
# Déjà créés dans votre projet:
src/types/share.ts                  ✅
src/services/shareService.ts        ✅
src/components/ShareModal.tsx       ✅
src/components/ShareModal.css       ✅
```

### 2. Ajouter le bouton de partage (3 endroits)

#### A. Dans SessionView.tsx

```tsx
import { useState } from 'react';
import ShareModal from './ShareModal';
import { getMoodById } from '../data/moods';

// Dans votre composant SessionView
function SessionView({ session }: { session: MeditationSession }) {
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const shareableSession = {
    id: session.id,
    meditationText: session.meditationText,
    mood: getMoodById(session.mood),
    category: session.category,
    intention: session.intention,
    userName: session.userName,
    date: session.date,
    guideType: session.guideType,
    duration: session.duration,
  };

  return (
    <div className="session-view">
      {/* Votre contenu existant */}

      {/* AJOUTER CE BOUTON */}
      <button
        className="btn-share"
        onClick={() => setShareModalOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50px',
          color: 'white',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '500',
          transition: 'all 0.2s ease',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 15.2499 15.0227 15.3727L8.08259 19.187C7.54305 18.4928 6.81567 18 6 18C4.34315 18 3 19.3431 3 21C3 22.6569 4.34315 24 6 24C7.65685 24 9 22.6569 9 21C9 20.8745 8.99231 20.7501 8.97733 20.6273L15.9174 16.813C16.4569 17.5072 17.1843 18 18 18C19.6569 18 21 16.6569 21 15C21 13.3431 19.6569 12 18 12C17.1843 12 16.4569 12.4928 15.9174 13.187L8.97733 9.37274C8.99231 9.24991 9 9.12548 9 9C9 7.34315 7.65685 6 6 6C4.34315 6 3 7.34315 3 9C3 10.6569 4.34315 12 6 12C6.81567 12 7.54305 11.5072 8.08259 10.813L15.0227 14.6273C15.0077 14.7501 15 14.8745 15 15C15 15.1255 15.0077 15.2499 15.0227 15.3727L8.08259 19.187Z"
            fill="currentColor"
          />
        </svg>
        Partager
      </button>

      {/* AJOUTER LE MODAL */}
      <ShareModal
        session={shareableSession}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
}
```

#### B. Dans Meditation.tsx (après sauvegarde)

```tsx
import { useState } from 'react';
import ShareModal from './ShareModal';

function Meditation() {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [showSharePrompt, setShowSharePrompt] = useState(false);

  const handleSave = async () => {
    // ... votre code de sauvegarde existant ...

    // AJOUTER APRÈS SAUVEGARDE RÉUSSIE:
    setTimeout(() => {
      setShowSharePrompt(true);
    }, 2000); // Attendre 2s pour laisser l'utilisateur savourer
  };

  return (
    <div className="meditation">
      {/* Votre contenu existant */}

      {/* AJOUTER CE PROMPT */}
      {showSharePrompt && (
        <div
          className="share-prompt"
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            animation: 'slideUp 0.4s ease-out',
          }}
        >
          <p style={{ margin: 0, color: 'white', fontSize: '0.95rem' }}>
            ✨ Envie de partager cette méditation?
          </p>
          <button
            onClick={() => {
              setShowSharePrompt(false);
              setShareModalOpen(true);
            }}
            style={{
              padding: '0.5rem 1.25rem',
              background: 'white',
              color: '#0A0E1A',
              border: 'none',
              borderRadius: '50px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Partager
          </button>
          <button
            onClick={() => setShowSharePrompt(false)}
            style={{
              padding: '0.5rem',
              background: 'transparent',
              color: 'rgba(255, 255, 255, 0.6)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* AJOUTER LE MODAL */}
      <ShareModal
        session={shareableSession}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
}
```

#### C. Dans History.tsx (sur chaque card)

```tsx
import { useState } from 'react';
import ShareModal from './ShareModal';

function History() {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sessionToShare, setSessionToShare] = useState<MeditationSession | null>(null);

  const handleShare = (session: MeditationSession) => {
    setSessionToShare(session);
    setShareModalOpen(true);
  };

  return (
    <div className="history">
      {sessions.map((session) => (
        <div key={session.id} className="session-card">
          {/* Votre contenu existant */}

          {/* AJOUTER CE BOUTON D'ACTION */}
          <button
            className="session-action-share"
            onClick={(e) => {
              e.stopPropagation(); // Empêcher ouverture session
              handleShare(session);
            }}
            aria-label="Partager"
            style={{
              padding: '0.5rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 15.2499 15.0227 15.3727L8.08259 19.187C7.54305 18.4928 6.81567 18 6 18C4.34315 18 3 19.3431 3 21C3 22.6569 4.34315 24 6 24C7.65685 24 9 22.6569 9 21C9 20.8745 8.99231 20.7501 8.97733 20.6273L15.9174 16.813C16.4569 17.5072 17.1843 18 18 18C19.6569 18 21 16.6569 21 15C21 13.3431 19.6569 12 18 12C17.1843 12 16.4569 12.4928 15.9174 13.187L8.97733 9.37274C8.99231 9.24991 9 9.12548 9 9C9 7.34315 7.65685 6 6 6C4.34315 6 3 7.34315 3 9C3 10.6569 4.34315 12 6 12C6.81567 12 7.54305 11.5072 8.08259 10.813L15.0227 14.6273C15.0077 14.7501 15 14.8745 15 15C15 15.1255 15.0077 15.2499 15.0227 15.3727L8.08259 19.187Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      ))}

      {/* AJOUTER LE MODAL */}
      {sessionToShare && (
        <ShareModal
          session={{
            id: sessionToShare.id,
            meditationText: sessionToShare.meditationText,
            mood: getMoodById(sessionToShare.mood),
            category: sessionToShare.category,
            intention: sessionToShare.intention,
            userName: sessionToShare.userName,
            date: sessionToShare.date,
            guideType: sessionToShare.guideType,
            duration: sessionToShare.duration,
          }}
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setSessionToShare(null);
          }}
        />
      )}
    </div>
  );
}
```

## 🎨 Animations CSS à Ajouter

Ajoutez ces keyframes dans votre fichier CSS global ou dans App.css:

```css
/* Animation pour le prompt de partage */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Styles du bouton de partage (optionnel si vous voulez styliser) */
.btn-share:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-share:active {
  transform: translateY(0);
}
```

## 🔧 Configuration Backend (IMPORTANT)

### Option 1: Sans Backend (Mode Dégradé)

Si vous n'avez pas encore de backend, le partage fonctionnera en mode "copie de texte" uniquement:

```typescript
// Dans shareService.ts, modifier temporairement:

export async function createShareLink(session: ShareableSession): Promise<string> {
  // Version temporaire sans backend
  const params = new URLSearchParams({
    mood: session.mood.id,
    intention: session.intention || '',
    date: session.date,
  });

  return `https://halterra.app?${params.toString()}`;
}

export async function generateShareImage(
  session: ShareableSession,
  options: any
): Promise<GeneratedMedia> {
  // Retourner une URL placeholder pour l'instant
  return {
    url: `https://via.placeholder.com/1080x1080/0A0E1A/FFFFFF?text=Halterra`,
    type: 'image',
    width: 1080,
    height: 1080,
    format: 'png',
    size: 0,
  };
}
```

### Option 2: Avec Backend Vercel (Recommandé)

Créez ces 3 fichiers dans votre projet backend:

#### `api/share/link.ts`

```typescript
import { NextRequest } from 'next/server';

export const config = { runtime: 'edge' };

let linkCounter = 1000; // Compteur simple pour demo

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await req.json();
  const shortId = (linkCounter++).toString(36); // Convertir en base36

  // TODO: Stocker dans une vraie DB (Vercel KV, Supabase, etc.)

  return Response.json({
    success: true,
    shortUrl: `https://halterra.app/s/${shortId}`,
    shortId,
  });
}
```

#### `api/share/generate.ts`

```typescript
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const config = { runtime: 'edge' };

export default async function handler(req: NextRequest) {
  const { session, format } = await req.json();

  const { width, height } =
    format === 'story' ? { width: 1080, height: 1920 } : { width: 1080, height: 1080 };

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${session.mood.color}40, #0A0E1A)`,
          padding: '80px',
        }}
      >
        <div style={{ fontSize: '120px' }}>{session.mood.icon}</div>
        <div
          style={{
            fontSize: '36px',
            color: session.mood.color,
            textAlign: 'center',
            marginTop: '40px',
          }}
        >
          {session.intention}
        </div>
        <div
          style={{
            fontSize: '28px',
            color: 'white',
            textAlign: 'center',
            marginTop: '32px',
            maxWidth: '800px',
          }}
        >
          "{session.excerpt}"
        </div>
      </div>
    ),
    { width, height }
  );
}
```

#### `api/analytics/share.ts`

```typescript
import { NextRequest } from 'next/server';

export const config = { runtime: 'edge' };

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await req.json();

  // TODO: Envoyer vers votre solution analytics (Plausible, Mixpanel, etc.)
  console.log('Share event:', body);

  return Response.json({ success: true });
}
```

## 🧪 Tester Localement

### 1. Lancer le frontend

```bash
npm run dev
```

### 2. Tester le partage

1. Ouvrir http://localhost:5173
2. Compléter une méditation
3. Cliquer "Partager"
4. Essayer différentes plateformes
5. Vérifier que le modal s'ouvre correctement

### 3. Tester sur mobile (Important!)

```bash
# Exposer votre localhost
npx localtunnel --port 5173

# OU avec ngrok
ngrok http 5173

# Puis scanner le QR code avec votre téléphone
```

## 📊 Vérifier que Ça Marche

### Checklist Fonctionnelle

- [ ] Le bouton "Partager" s'affiche bien
- [ ] Le modal s'ouvre au clic
- [ ] Toutes les plateformes sont visibles
- [ ] Le clic sur Instagram copie le texte
- [ ] Le clic sur Facebook ouvre une fenêtre
- [ ] Le clic sur "Copier le lien" copie
- [ ] Le modal se ferme correctement
- [ ] Pas d'erreurs dans la console
- [ ] Fonctionne sur mobile
- [ ] Fonctionne sur desktop

### Tests de Performance

```javascript
// Dans la console du navigateur
console.time('shareModal');
// Cliquer sur Partager
console.timeEnd('shareModal'); // Devrait être < 100ms

console.time('generateImage');
// Cliquer sur Instagram
console.timeEnd('generateImage'); // Devrait être < 2000ms
```

## 🐛 Problèmes Fréquents

### Le modal ne s'ouvre pas

```typescript
// Vérifier que ShareModal.css est bien importé
import './ShareModal.css';

// Vérifier l'état
console.log('Modal open:', shareModalOpen);

// Vérifier z-index
// Le z-index du modal doit être > que tout le reste (10000)
```

### Les liens ne fonctionnent pas

```typescript
// Vérifier l'URL de l'API
console.log('API URL:', import.meta.env.VITE_API_URL);

// Tester manuellement
fetch('https://halterra-backend.vercel.app/api/share/link', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionId: 'test' }),
})
  .then((r) => r.json())
  .then(console.log);
```

### Instagram ne copie pas le texte

```typescript
// Vérifier les permissions clipboard
navigator.permissions.query({ name: 'clipboard-write' }).then((result) => {
  console.log('Clipboard permission:', result.state);
});

// Fallback manuel
if (!navigator.clipboard) {
  // Créer un textarea temporaire
  const textarea = document.createElement('textarea');
  textarea.value = textToCopy;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}
```

## 🚀 Déploiement Production

### 1. Build

```bash
npm run build
```

### 2. Variables d'environnement

Ajouter dans Vercel (ou votre hosting):

```env
VITE_API_URL=https://votre-backend.vercel.app
VITE_APP_URL=https://halterra.app
```

### 3. Déployer

```bash
# Frontend
vercel --prod

# Backend
cd backend
vercel --prod
```

### 4. Tester en production

- Partager une vraie méditation
- Vérifier que les liens fonctionnent
- Tester sur plusieurs devices
- Monitorer les analytics

## 📈 Suivre les Performances

### Ajouter ce code dans App.tsx

```typescript
useEffect(() => {
  // Track les partages réussis
  window.addEventListener('share-success', ((e: CustomEvent) => {
    console.log('Share success:', e.detail);

    // TODO: Envoyer à votre analytics
    if (window.plausible) {
      window.plausible('Share Success', {
        props: {
          platform: e.detail.platform,
          mood: e.detail.mood,
        },
      });
    }
  }) as EventListener);
}, []);
```

### Dashboard Simple

Créer une page `/admin/shares` pour voir:

```typescript
interface ShareStats {
  totalShares: number;
  sharesByPlatform: Record<string, number>;
  topMoods: Array<{ mood: string; count: number }>;
  conversionRate: number;
}

function SharesDashboard() {
  const [stats, setStats] = useState<ShareStats | null>(null);

  useEffect(() => {
    fetch('/api/analytics/shares')
      .then((r) => r.json())
      .then(setStats);
  }, []);

  return (
    <div>
      <h1>Statistiques de Partage</h1>
      <div>Total: {stats?.totalShares}</div>
      {/* Afficher le reste */}
    </div>
  );
}
```

## 🎉 C'est Fait!

Vous avez maintenant un système de partage social fonctionnel!

### Prochaines étapes recommandées:

1. ✅ Tester pendant 1 semaine
2. 📊 Analyser les métriques
3. 🎨 Améliorer les visuels selon feedback
4. 🎁 Ajouter la gamification (badges)
5. 🤖 Implémenter l'AI pour timing optimal

---

**Questions?** Voir `SHARE_FEATURE_COMPLETE.md` pour plus de détails!
