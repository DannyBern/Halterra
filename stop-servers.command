#!/bin/bash

# ============================================
# Financial Analyzer - Stop Servers Script
# ============================================
# Double-clic pour arrêter les serveurs

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "============================================"
echo "🛑 Arrêt des serveurs Financial Analyzer"
echo "============================================"
echo ""

# Stop Backend (port 8000)
echo -e "${BLUE}Arrêt du Backend...${NC}"
BACKEND_PID=$(lsof -ti:8000 2>/dev/null || echo "")

if [ -n "$BACKEND_PID" ]; then
    kill $BACKEND_PID
    echo -e "${GREEN}✓ Backend arrêté (PID: $BACKEND_PID)${NC}"
else
    echo -e "${YELLOW}⚠ Backend n'était pas en cours d'exécution${NC}"
fi

# Stop Frontend (port 5173)
echo -e "${BLUE}Arrêt du Frontend...${NC}"
FRONTEND_PID=$(lsof -ti:5173 2>/dev/null || echo "")

if [ -n "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID
    echo -e "${GREEN}✓ Frontend arrêté (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${YELLOW}⚠ Frontend n'était pas en cours d'exécution${NC}"
fi

# Kill any remaining vite/uvicorn processes
echo ""
echo -e "${BLUE}Nettoyage des processus restants...${NC}"

pkill -f "uvicorn" 2>/dev/null && echo -e "${GREEN}✓ Processus uvicorn arrêtés${NC}" || echo -e "${YELLOW}⚠ Aucun processus uvicorn${NC}"
pkill -f "vite" 2>/dev/null && echo -e "${GREEN}✓ Processus vite arrêtés${NC}" || echo -e "${YELLOW}⚠ Aucun processus vite${NC}"

echo ""
echo "============================================"
echo -e "${GREEN}✅ Tous les serveurs sont arrêtés!${NC}"
echo "============================================"
echo ""
echo "Appuyez sur Entrée pour fermer..."
read

exit 0
