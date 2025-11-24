#!/bin/bash

# Financial Analyzer - Mac Launcher (Enhanced with Auto-Cleanup & Update)
# Double-click this file to launch the app with latest changes

echo "🚀 Financial Analyzer - Starting with latest updates..."
echo ""

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================================
# STEP 0: GIT PULL - GET LATEST UPDATES
# ============================================================
echo -e "${YELLOW}🔄 Step 1/6: Downloading latest updates from Git...${NC}"

cd "$DIR"

# Check if we're in a git repository
if [ -d ".git" ]; then
    # Get current branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo "   • Current branch: $CURRENT_BRANCH"

    # Fetch latest changes
    echo "   • Fetching latest changes..."
    git fetch origin "$CURRENT_BRANCH" 2>/dev/null

    # Check if there are updates
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/"$CURRENT_BRANCH" 2>/dev/null)

    if [ "$LOCAL" != "$REMOTE" ]; then
        echo "   • New updates found! Pulling..."
        git pull origin "$CURRENT_BRANCH"
        echo -e "   ${GREEN}✓ Updates downloaded successfully${NC}"
    else
        echo -e "   ${GREEN}✓ Already up to date${NC}"
    fi
else
    echo "   • Not a git repository, skipping update check"
fi

echo ""

# ============================================================
# STEP 1: KILL OLD PROCESSES
# ============================================================
echo -e "${YELLOW}🔄 Step 2/6: Cleaning up old processes...${NC}"

# Kill backend (port 8000)
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   • Killing old backend process on port 8000..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    echo -e "   ${GREEN}✓ Old backend killed${NC}"
else
    echo "   • No old backend found"
fi

# Kill frontend (port 5173)
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "   • Killing old frontend process on port 5173..."
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    echo -e "   ${GREEN}✓ Old frontend killed${NC}"
else
    echo "   • No old frontend found"
fi

sleep 1
echo ""

# ============================================================
# STEP 2: CHECK PYTHON DEPENDENCIES
# ============================================================
echo -e "${YELLOW}🔄 Step 3/6: Checking backend dependencies...${NC}"

cd "$DIR/backend"

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
    echo -e "   ${GREEN}✓ Virtual environment activated${NC}"
else
    echo -e "   ${RED}✗ Virtual environment not found!${NC}"
    echo "   Please run: python3 -m venv venv"
    exit 1
fi

# Check if requirements need updating (simple check)
if [ -f "requirements.txt" ]; then
    echo "   • Verifying Python packages..."
    # Just check if anthropic is installed - if not, reinstall all
    python -c "import anthropic" 2>/dev/null
    if [ $? -ne 0 ]; then
        echo "   • Missing packages detected, installing..."
        pip install -q -r requirements.txt
        echo -e "   ${GREEN}✓ Python packages updated${NC}"
    else
        echo -e "   ${GREEN}✓ Python packages OK${NC}"
    fi
fi

echo ""

# ============================================================
# STEP 3: CHECK FRONTEND DEPENDENCIES
# ============================================================
echo -e "${YELLOW}🔄 Step 4/6: Checking frontend dependencies...${NC}"

cd "$DIR/frontend"

# Check if node_modules exists and has recharts
if [ ! -d "node_modules" ] || [ ! -d "node_modules/recharts" ]; then
    echo "   • Installing/updating npm packages..."
    npm install --silent
    echo -e "   ${GREEN}✓ npm packages installed${NC}"
else
    echo -e "   ${GREEN}✓ npm packages OK${NC}"
fi

echo ""

# ============================================================
# STEP 4: CLEAR CACHE
# ============================================================
echo -e "${YELLOW}🔄 Step 5/6: Clearing build cache...${NC}"

# Clear Vite cache
if [ -d "node_modules/.vite" ]; then
    echo "   • Removing Vite cache..."
    rm -rf node_modules/.vite
    echo -e "   ${GREEN}✓ Vite cache cleared${NC}"
else
    echo "   • No Vite cache to clear"
fi

# Clear dist folder
if [ -d "dist" ]; then
    echo "   • Removing old build..."
    rm -rf dist
    echo -e "   ${GREEN}✓ Old build cleared${NC}"
else
    echo "   • No old build found"
fi

echo ""

# ============================================================
# STEP 5: START SERVICES
# ============================================================
echo -e "${YELLOW}🔄 Step 6/6: Starting services...${NC}"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping servers...${NC}"
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
echo -e "   ${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
echo "   • Waiting for backend to initialize..."
sleep 3

# Verify backend is running
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "   ${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "   ${RED}✗ Backend failed to start!${NC}"
    echo "   Check logs: /tmp/financial-analyzer-backend.log"
    exit 1
fi

# Start Frontend
echo ""
echo -e "${BLUE}🎨 Starting Frontend...${NC}"
cd "$DIR/frontend"
npm run dev > /tmp/financial-analyzer-frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "   ${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

# Wait for frontend to be ready
echo "   • Waiting for frontend to build..."
sleep 5

# Verify frontend is running
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "   ${GREEN}✓ Frontend is healthy${NC}"
else
    echo -e "   ${RED}✗ Frontend failed to start!${NC}"
    echo "   Check logs: /tmp/financial-analyzer-frontend.log"
    exit 1
fi

# Open browser
echo ""
echo -e "${GREEN}✨ Opening browser...${NC}"
sleep 2
open "http://localhost:5173"

echo ""
echo "════════════════════════════════════════════════"
echo "  🎉 Financial Analyzer is running!"
echo "════════════════════════════════════════════════"
echo ""
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo ""
echo "  📋 Features:"
echo "  • 7-stage institutional analysis with real-time progress"
echo "  • Live progress tracker showing each analysis stage"
echo "  • Warren Buffett AI chat for post-analysis discussions"
echo "  • Interactive financial charts (Cash Flow, ROI, Risk)"
echo "  • Collapsible sections with smart navigation"
echo ""
echo "  ⌨️  Press Ctrl+C to stop"
echo ""
echo "  📝 Logs:"
echo "  • Backend:  /tmp/financial-analyzer-backend.log"
echo "  • Frontend: /tmp/financial-analyzer-frontend.log"
echo ""
echo "  💡 Tip: Hard refresh browser (Cmd+Shift+R)"
echo "     if you don't see latest changes"
echo ""
echo "════════════════════════════════════════════════"
echo ""

# Keep script running
wait
