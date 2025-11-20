#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================="
echo "  Financial Analyzer - Démarrage"
echo -e "=========================================${NC}"
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Configuration requise${NC}"
    echo "Lancez d'abord: ./setup.sh"
    exit 1
fi

echo "Ce script va ouvrir 2 terminaux:"
echo "  1. Backend (FastAPI sur :8000)"
echo "  2. Frontend (Vite sur :5173)"
echo ""
echo -e "${YELLOW}Note:${NC} Vous devrez lancer les commandes manuellement dans 2 terminaux séparés:"
echo ""
echo -e "${GREEN}Terminal 1:${NC}"
echo "  cd $(pwd)/backend"
echo "  source venv/bin/activate"
echo "  python main.py"
echo ""
echo -e "${GREEN}Terminal 2:${NC}"
echo "  cd $(pwd)/frontend"
echo "  npm run dev"
echo ""
echo -e "Puis ouvrez: ${BLUE}http://localhost:5173${NC}"
echo ""
