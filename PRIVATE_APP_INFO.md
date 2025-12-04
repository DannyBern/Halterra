# 🔒 Halterra - Application Privée

## ⚠️ IMPORTANT - Application Privée

Cette application est configurée avec **vos clés API privées** intégrées directement dans le build.

### 🔑 Clés API Configurées

Les clés suivantes sont intégrées dans l'application déployée :
- ✅ Anthropic API Key (Claude Sonnet 4.5)
- ✅ ElevenLabs API Key
- ✅ Voice ID personnalisé : `GiS6AIV70BEfI1ncL4Vg` (Iza - voix remixée pour méditation)

### 🌐 Accès à l'Application

**URL de l'app** : https://dannybern.github.io/Halterra/

**Qui peut l'utiliser ?**
- ✅ Vous, Danny
- ✅ Toute personne ayant le lien exact
- ❌ L'application n'est PAS listée publiquement
- ❌ Pas de recherche Google (non indexée)

### 🛡️ Sécurité

**Clés API protégées :**
- Les clés sont dans le fichier `.env` (local uniquement)
- Le fichier `.env` est dans `.gitignore` (jamais poussé sur GitHub)
- Les clés sont compilées dans le JavaScript lors du build
- Les clés sont visibles dans le code source de la page pour quelqu'un qui cherche

**⚠️ Considérations importantes :**
1. **Partage du lien** : Toute personne avec le lien peut utiliser l'app
2. **Usage des APIs** : Tous les appels comptent sur vos quotas/crédits API
3. **Coûts** : Vous payez pour chaque méditation générée
4. **Visibilité du code** : Les clés peuvent être extraites du code JavaScript

### 💡 Recommandations

**Pour usage personnel uniquement :**
- ✅ Utilisez librement l'application
- ✅ Partagez le lien avec des personnes de confiance
- ⚠️ Surveillez votre usage API sur les consoles Anthropic et ElevenLabs

**Si vous voulez partager publiquement :**
Il faudrait :
1. Créer un backend pour gérer les API keys
2. Implémenter une authentification
3. Mettre en place des limites d'usage
4. Utiliser des variables d'environnement côté serveur

### 📊 Surveillance des Coûts

**Anthropic Claude :**
- Console : https://console.anthropic.com
- Coût approximatif : ~$0.003 par méditation (300-400 mots)

**ElevenLabs :**
- Console : https://elevenlabs.io/app/usage
- Coût approximatif : ~1000 caractères par méditation

### 🔄 Mise à Jour des Clés

Si vous devez changer les clés API :

1. Éditez le fichier local `.env` :
```bash
cd C:\Users\Danny\halterra
notepad .env
```

2. Modifiez les clés :
```
VITE_ANTHROPIC_API_KEY=nouvelle_cle_ici
VITE_ELEVENLABS_API_KEY=nouvelle_cle_ici
```

3. Redéployez :
```bash
npm run build
npx gh-pages -d dist
```

**Note** : Les clés ne seront JAMAIS poussées sur GitHub grâce au `.gitignore`

### 📁 Fichiers Importants

- `C:\Users\Danny\halterra\.env` - Contient vos clés API (LOCAL UNIQUEMENT)
- `.gitignore` - Protège le fichier .env
- `src/App.tsx` - Utilise les clés via `import.meta.env`
- `src/services/api.ts` - Appels aux APIs

### 🎯 Usage Actuel

L'application est configurée pour :
- Générer des méditations personnalisées avec Claude
- Narration audio avec votre voix personnalisée ElevenLabs
- Sauvegarde locale de l'historique (dans le navigateur)
- Pas de limite d'usage côté app (limites = quotas API)

---

**Date de configuration** : 31 octobre 2025
**Version** : 1.0.0 (Privée)

🪷 Profitez de vos méditations en toute tranquillité !
