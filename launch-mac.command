#!/bin/bash

# ============================================
# Financial Analyzer - Launcher Script
# ============================================
# Double-clic sur ce fichier pour lancer l'application
# avec les dernières mises à jour de GitHub

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo ""
echo "============================================"
echo "🚀 Financial Analyzer Launcher"
echo "============================================"
echo ""

# ============================================
# 1. GIT - Pull latest updates
# ============================================
echo -e "${BLUE}📥 Vérification des mises à jour GitHub...${NC}"

# Check if git repo
if [ -d ".git" ]; then
    # Get current branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo -e "${YELLOW}Branche actuelle: $CURRENT_BRANCH${NC}"

    # Fetch latest changes
    echo "Récupération des dernières modifications..."
    git fetch origin

    # Check if there are updates
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u})

    if [ $LOCAL = $REMOTE ]; then
        echo -e "${GREEN}✓ Déjà à jour!${NC}"
    else
        echo -e "${YELLOW}⚠ Mises à jour disponibles! Téléchargement...${NC}"
        git pull origin $CURRENT_BRANCH
        echo -e "${GREEN}✓ Mise à jour complétée!${NC}"
    fi
else
    echo -e "${RED}⚠ Pas un dépôt Git. Ignorer les mises à jour.${NC}"
fi

echo ""

# ============================================
# 2. BACKEND - Check and start
# ============================================
echo -e "${BLUE}🔧 Vérification du Backend (Python/FastAPI)...${NC}"

# Check if backend is already running
BACKEND_PID=$(lsof -ti:8000 2>/dev/null || echo "")

if [ -n "$BACKEND_PID" ]; then
    echo -e "${GREEN}✓ Backend déjà en cours d'exécution (PID: $BACKEND_PID)${NC}"
else
    echo -e "${YELLOW}⚠ Backend non démarré. Démarrage...${NC}"

    cd "$SCRIPT_DIR/financial-analyzer/backend"

    # Check Python version
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python 3 n'est pas installé!${NC}"
        exit 1
    fi

    PYTHON_VERSION=$(python3 --version)
    echo -e "${YELLOW}Python: $PYTHON_VERSION${NC}"

    # Check/Install dependencies
    echo "Vérification des dépendances Python..."

    # Check if venv exists
    if [ ! -d "venv" ]; then
        echo "Création de l'environnement virtuel..."
        python3 -m venv venv
    fi

    # Activate venv
    source venv/bin/activate

    # Install/Update dependencies
    if [ -f "requirements.txt" ]; then
        echo "Installation des dépendances..."
        pip install -q --upgrade pip
        pip install -q -r requirements.txt

        # Fix NumPy compatibility with OpenCV
        pip install -q "numpy<2" --upgrade

        # Upgrade Anthropic SDK
        pip install -q --upgrade anthropic

        echo -e "${GREEN}✓ Dépendances installées${NC}"
    fi

    # Start backend in background
    echo "Démarrage du serveur backend..."
    nohup python3 main.py > backend.log 2>&1 &
    BACKEND_PID=$!

    # Wait for backend to start
    echo -n "Attente du démarrage du backend"
    for i in {1..15}; do
        if lsof -ti:8000 &> /dev/null; then
            echo ""
            echo -e "${GREEN}✓ Backend démarré avec succès! (PID: $BACKEND_PID)${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done

    if ! lsof -ti:8000 &> /dev/null; then
        echo ""
        echo -e "${RED}❌ Échec du démarrage du backend. Vérifiez backend.log${NC}"
        tail -n 20 backend.log
        exit 1
    fi

    cd "$SCRIPT_DIR"
fi

echo ""

# ============================================
# 3. FRONTEND - Check and start
# ============================================
echo -e "${BLUE}🎨 Vérification du Frontend (React/Vite)...${NC}"

# Check if frontend is already running
FRONTEND_PID=$(lsof -ti:5173 2>/dev/null || echo "")

if [ -n "$FRONTEND_PID" ]; then
    echo -e "${GREEN}✓ Frontend déjà en cours d'exécution (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${YELLOW}⚠ Frontend non démarré. Démarrage...${NC}"

    cd "$SCRIPT_DIR/financial-analyzer/frontend"

    # Check Node/npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm n'est pas installé!${NC}"
        exit 1
    fi

    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    echo -e "${YELLOW}Node: $NODE_VERSION${NC}"
    echo -e "${YELLOW}npm: $NPM_VERSION${NC}"

    # Install/Update dependencies
    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        echo "Installation des dépendances npm..."
        npm install
        echo -e "${GREEN}✓ Dépendances npm installées${NC}"
    else
        echo -e "${GREEN}✓ Dépendances npm déjà à jour${NC}"
    fi

    # Start frontend in background
    echo "Démarrage du serveur frontend..."
    nohup npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!

    # Wait for frontend to start
    echo -n "Attente du démarrage du frontend"
    for i in {1..20}; do
        if lsof -ti:5173 &> /dev/null; then
            echo ""
            echo -e "${GREEN}✓ Frontend démarré avec succès! (PID: $FRONTEND_PID)${NC}"
            break
        fi
        echo -n "."
        sleep 1
    done

    if ! lsof -ti:5173 &> /dev/null; then
        echo ""
        echo -e "${RED}❌ Échec du démarrage du frontend. Vérifiez frontend.log${NC}"
        tail -n 20 frontend.log
        exit 1
    fi

    cd "$SCRIPT_DIR"
fi

echo ""

# ============================================
# 4. OPEN BROWSER
# ============================================
echo -e "${BLUE}🌐 Ouverture de l'application dans le navigateur...${NC}"

# Wait a bit to ensure everything is ready
sleep 2

# Open browser (macOS)
if command -v open &> /dev/null; then
    open "http://localhost:5173"
    echo -e "${GREEN}✓ Application ouverte dans le navigateur!${NC}"
else
    echo -e "${YELLOW}⚠ Commande 'open' non disponible. Ouvrez manuellement: http://localhost:5173${NC}"
fi

echo ""
echo "============================================"
echo -e "${GREEN}✅ Application lancée avec succès!${NC}"
echo "============================================"
echo ""
echo "📊 URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo ""
echo "📝 Logs:"
echo "   Backend:  $SCRIPT_DIR/financial-analyzer/backend/backend.log"
echo "   Frontend: $SCRIPT_DIR/financial-analyzer/frontend/frontend.log"
echo ""
echo "🛑 Pour arrêter l'application:"
echo "   Backend:  kill $BACKEND_PID"
echo "   Frontend: kill $FRONTEND_PID"
echo ""
echo "Ou utilisez le script: ./stop-servers.command"
echo ""
echo "Appuyez sur Entrée pour fermer cette fenêtre..."
read

# Keep terminal open on macOS
exit 0
