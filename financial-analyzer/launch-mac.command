#!/bin/bash

# Financial Analyzer - Mac Launcher
# Double-click this file to launch the app

echo "🚀 Starting Financial Analyzer..."
echo ""

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup EXIT INT TERM

# Start Backend
echo -e "${BLUE}📦 Starting Backend...${NC}"
cd "$DIR/backend"
source venv/bin/activate
python main.py > /tmp/financial-analyzer-backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
sleep 3

# Start Frontend
echo -e "${BLUE}🎨 Starting Frontend...${NC}"
cd "$DIR/frontend"
npm run dev > /tmp/financial-analyzer-frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

# Wait for frontend to be ready
sleep 5

# Open browser
echo ""
echo -e "${GREEN}✨ Opening browser...${NC}"
open "http://localhost:5173"

echo ""
echo "================================================"
echo "  Financial Analyzer is running! 🎉"
echo "================================================"
echo ""
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo ""
echo "  Press Ctrl+C to stop"
echo ""
echo "  Logs:"
echo "  - Backend:  /tmp/financial-analyzer-backend.log"
echo "  - Frontend: /tmp/financial-analyzer-frontend.log"
echo "================================================"
echo ""

# Keep script running
wait
