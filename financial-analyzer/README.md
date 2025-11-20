# Financial Analyzer

Application web d'analyse financière avec architecture backend/frontend séparée, utilisant FastAPI, React, TypeScript, et l'API Claude d'Anthropic.

## Stack Technique

- **Backend**: Python FastAPI
- **Frontend**: React + TypeScript + Vite
- **IA**: Claude (Anthropic API)
- **Traitement**: Whisper (transcription), OpenCV (frames vidéo), Tesseract (OCR)

## Structure du Projet

```
financial-analyzer/
├── backend/
│   ├── main.py                 # FastAPI app
│   ├── config.py               # Configuration
│   ├── requirements.txt        # Dépendances Python
│   ├── .env.example            # Template de configuration
│   └── services/
│       ├── file_handler.py     # Extraction audio/vidéo/image
│       └── claude_service.py   # Service d'analyse Claude
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Interface principale
│   │   ├── main.tsx            # Point d'entrée
│   │   └── services/
│   │       └── api.ts          # Communication avec backend
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md
```

## Fonctionnalités

### Backend

- **Upload de fichiers** (audio, vidéo, image) jusqu'à 500MB
- **Extraction automatique** :
  - Audio/Vidéo → Transcription via Whisper
  - Vidéo → Extraction de frames (1 fps, max 20 frames)
  - Image → OCR via Tesseract
- **Analyse financière** via Claude avec prompt spécialisé

### Frontend

- Interface drag-and-drop pour upload
- Support de tous les formats audio, vidéo, image
- Zone de question pour l'analyse
- Affichage de l'analyse structurée
- Indicateur de chargement

## Installation

### Prérequis

- Python 3.8+
- Node.js 16+
- Tesseract OCR installé sur le système

#### Installation de Tesseract

**macOS:**
```bash
brew install tesseract
```

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr
```

**Windows:**
Téléchargez depuis: https://github.com/UB-Mannheim/tesseract/wiki

### 1. Backend

```bash
cd backend

# Créer un environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditez .env et ajoutez votre ANTHROPIC_API_KEY
```

### 2. Frontend

```bash
cd frontend

# Installer les dépendances
npm install
```

## Lancement

### Démarrer le Backend

```bash
cd backend
source venv/bin/activate  # Si pas déjà activé
python main.py
```

Le backend sera disponible sur: **http://localhost:8000**

### Démarrer le Frontend

```bash
cd frontend
npm run dev
```

Le frontend sera disponible sur: **http://localhost:5173**

## Utilisation

1. Ouvrez http://localhost:5173 dans votre navigateur
2. Glissez-déposez un fichier (audio, vidéo, ou image) dans la zone de drop
3. Attendez que le fichier soit uploadé
4. Entrez votre question d'analyse (ex: "Ce duplex à 450k$ est-il un bon investissement?")
5. Cliquez sur "Analyser"
6. L'analyse structurée apparaîtra avec:
   - Synthèse des données
   - Analyse des risques
   - Analyse des opportunités
   - Recommandation (Acheter/Ne pas acheter/Négocier)
   - Actions concrètes

## Formats Supportés

### Audio
mp3, wav, m4a, aac, flac, ogg, wma, aiff, opus, webm

### Vidéo
mp4, avi, mov, mkv, webm, flv, wmv, m4v, mpeg, mpg

### Images
jpg, jpeg, png, gif, bmp, tiff, webp, svg, heic, ico

## API Endpoints

### POST /api/upload
Upload un fichier

**Request:** `multipart/form-data` avec fichier

**Response:**
```json
{
  "file_id": "uuid",
  "file_type": "video",
  "file_size": 1234567,
  "original_filename": "video.mp4"
}
```

### POST /api/analyze
Analyse un fichier uploadé

**Request:**
```json
{
  "file_id": "uuid",
  "user_query": "Question d'analyse"
}
```

**Response:**
```json
{
  "analysis": "Analyse détaillée...",
  "processing_time": 15.34
}
```

## Configuration

### Variables d'environnement (.env)

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
MAX_FILE_SIZE_MB=500
TEMP_UPLOAD_DIR=/tmp/uploads
```

## Limitations

- Taille maximale de fichier: 500MB
- Frames vidéo: 20 frames maximum (1 par seconde)
- Pas de persistence (fichiers stockés temporairement)
- Pas d'authentification
- Un seul fichier analysable à la fois

## Troubleshooting

**Erreur Tesseract:**
Vérifiez que Tesseract est installé: `tesseract --version`

**Erreur Whisper:**
Le premier lancement peut prendre du temps (téléchargement du modèle ~140MB)

**Erreur CORS:**
Vérifiez que le frontend tourne sur http://localhost:5173

**Erreur API Key:**
Assurez-vous que `ANTHROPIC_API_KEY` est défini dans `.env`

## Développement

Pour activer le mode verbose:
```bash
# Backend
uvicorn main:app --reload --log-level debug

# Frontend
npm run dev
```

## License

MIT
