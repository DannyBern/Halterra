#!/bin/bash

echo "========================================="
echo "  Financial Analyzer - Configuration"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running on macOS or Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "✓ Detected macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "✓ Detected Linux"
fi

echo ""
echo "========================================="
echo "  Étape 1: Configuration Backend"
echo "========================================="
echo ""

# Navigate to backend
cd backend

# Check if .env already exists
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Le fichier .env existe déjà.${NC}"
    read -p "Voulez-vous le reconfigurer? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Configuration .env ignorée."
    else
        rm .env
    fi
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Configuration de votre clé API Anthropic..."
    echo ""
    echo -e "${YELLOW}IMPORTANT:${NC} Votre clé API ne sera JAMAIS partagée."
    echo "Elle sera stockée localement dans .env (ignoré par Git)"
    echo ""

    # Prompt for API key (hidden input)
    read -sp "Entrez votre clé API Anthropic (sk-ant-...): " API_KEY
    echo ""

    # Validate key format
    if [[ ! $API_KEY == sk-ant-* ]]; then
        echo -e "${RED}✗ Format de clé invalide. Elle doit commencer par 'sk-ant-'${NC}"
        exit 1
    fi

    # Create .env file
    cat > .env << EOF
ANTHROPIC_API_KEY=$API_KEY
MAX_FILE_SIZE_MB=500
TEMP_UPLOAD_DIR=/tmp/uploads
EOF

    echo -e "${GREEN}✓ Fichier .env créé avec succès${NC}"
else
    echo -e "${GREEN}✓ Fichier .env déjà configuré${NC}"
fi

echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Création de l'environnement virtuel Python..."
    python3 -m venv venv
    echo -e "${GREEN}✓ Environnement virtuel créé${NC}"
else
    echo -e "${GREEN}✓ Environnement virtuel déjà existant${NC}"
fi

echo ""

# Activate virtual environment
echo "Activation de l'environnement virtuel..."
source venv/bin/activate

echo ""

# Install Python dependencies
echo "Installation des dépendances Python..."
echo "(Cela peut prendre 5-10 minutes pour Whisper et PyTorch...)"
pip install -q --upgrade pip
pip install -q -r requirements.txt

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dépendances Python installées${NC}"
else
    echo -e "${RED}✗ Erreur lors de l'installation des dépendances${NC}"
    exit 1
fi

cd ..

echo ""
echo "========================================="
echo "  Étape 2: Configuration Frontend"
echo "========================================="
echo ""

cd frontend

# Install npm dependencies
if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances npm..."
    npm install

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Dépendances npm installées${NC}"
    else
        echo -e "${RED}✗ Erreur lors de l'installation npm${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Dépendances npm déjà installées${NC}"
fi

cd ..

echo ""
echo "========================================="
echo "  Configuration Terminée! 🎉"
echo "========================================="
echo ""
echo "Pour lancer l'application:"
echo ""
echo "  Terminal 1 (Backend):"
echo -e "    ${GREEN}cd backend${NC}"
echo -e "    ${GREEN}source venv/bin/activate${NC}"
echo -e "    ${GREEN}python main.py${NC}"
echo ""
echo "  Terminal 2 (Frontend):"
echo -e "    ${GREEN}cd frontend${NC}"
echo -e "    ${GREEN}npm run dev${NC}"
echo ""
echo "  Puis ouvrez: ${YELLOW}http://localhost:5173${NC}"
echo ""
echo "========================================="
