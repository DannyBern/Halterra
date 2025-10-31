# Halterra 🪷

Une application de méditation zen et sophistiquée pour entrepreneurs, offrant des méditations guidées personnalisées basées sur votre état d'esprit matinal.

## ✨ Fonctionnalités

- **Page d'accueil zen** : Une introduction apaisante dans le style yoga
- **Onboarding personnalisé** : Configuration simple avec votre nom
- **Affichage élégant de la date** : Date du jour présentée de manière claire et sophistiquée
- **Sélection de mood** : 8 états d'esprit pour entrepreneurs
  - Énergisé
  - Anxieux
  - Inspiré
  - Fatigué
  - Déterminé
  - Incertain
  - Reconnaissant
  - Débordé
- **Questionnaire dynamique** : 5-8 questions adaptées à chaque mood avec option de réponse libre
- **Méditation générée par IA** : Utilise Claude Sonnet 4.5 pour créer des méditations personnalisées
- **Narration audio** : Intégration ElevenLabs pour écouter vos méditations
- **Historique local** : Toutes vos méditations sont sauvegardées localement
- **Interface responsive** : Optimisée pour tous les appareils

## 🚀 Installation

```bash
# Cloner le projet
cd halterra

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

## 🔑 Configuration des API

L'application nécessite une clé API Anthropic pour fonctionner. L'API ElevenLabs est optionnelle.

### Obtenir une clé API Anthropic
1. Créez un compte sur [console.anthropic.com](https://console.anthropic.com)
2. Générez une clé API
3. Entrez-la dans l'application lors de la première méditation

### Obtenir une clé API ElevenLabs (optionnel)
1. Créez un compte sur [elevenlabs.io](https://elevenlabs.io)
2. Obtenez votre clé API
3. Entrez-la dans l'application pour activer la narration audio

Les clés sont stockées localement dans votre navigateur et ne sont jamais envoyées ailleurs que vers les APIs respectives.

## 🛠️ Technologies utilisées

- **React** + **TypeScript** : Framework principal
- **Vite** : Build tool rapide
- **Anthropic Claude API** : Génération de méditations personnalisées
- **ElevenLabs API** : Synthèse vocale pour narration audio
- **Local Storage** : Stockage des données utilisateur et historique
- **CSS personnalisé** : Design zen et sophistiqué

## 📱 Utilisation

1. **Première visite** : Entrez votre prénom pour personnaliser l'expérience
2. **Chaque matin** :
   - Sélectionnez votre mood
   - Répondez aux questions de réflexion
   - Recevez votre méditation personnalisée
   - Écoutez-la ou lisez-la
3. **Historique** : Accédez à vos méditations passées via le bouton "Historique"

## 🎨 Design

L'application utilise une palette de couleurs apaisantes inspirée du yoga :
- Palette zen avec tons beiges, roses pâles et gris doux
- Typographie élégante avec Crimson Pro (serif) et Inter (sans-serif)
- Animations douces et transitions fluides
- Interface épurée et méditative

## 🔒 Confidentialité

- Toutes les données sont stockées localement dans votre navigateur
- Aucune donnée n'est envoyée à des serveurs tiers (sauf les APIs Anthropic et ElevenLabs)
- Vos clés API sont stockées uniquement dans votre localStorage
- Aucun tracking, aucune analytics

## 📝 Notes de développement

### Structure du projet

```
halterra/
├── src/
│   ├── components/         # Composants React
│   │   ├── Landing.tsx     # Page d'accueil
│   │   ├── Onboarding.tsx  # Configuration initiale
│   │   ├── DateDisplay.tsx # Affichage de la date
│   │   ├── MoodSelector.tsx # Sélection du mood
│   │   ├── Questionnaire.tsx # Questions
│   │   ├── Meditation.tsx   # Méditation générée
│   │   ├── History.tsx      # Historique
│   │   └── SessionView.tsx  # Vue d'une session
│   ├── data/
│   │   └── moods.ts        # Données des moods et questions
│   ├── services/
│   │   └── api.ts          # Intégration APIs
│   ├── utils/
│   │   └── storage.ts      # Gestion localStorage
│   ├── types.ts            # Types TypeScript
│   ├── App.tsx             # Composant principal
│   └── index.css           # Styles globaux
```

## 🚧 Améliorations futures possibles

- Backend optionnel pour sync entre appareils
- Plus de voix pour la narration
- Statistiques et insights sur vos moods
- Rappels et notifications
- Partage de méditations
- Mode sombre

## 📄 Licence

Ce projet est créé pour un usage personnel.

---

Créé avec 🤍 pour votre bien-être entrepreneurial
