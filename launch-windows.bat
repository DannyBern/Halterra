@echo off
REM ============================================
REM Financial Analyzer - Windows Launcher
REM ============================================

setlocal enabledelayedexpansion

echo.
echo ============================================
echo Financial Analyzer Launcher (Windows)
echo ============================================
echo.

REM Get script directory
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM ============================================
REM 1. GIT - Pull latest updates
REM ============================================
echo [INFO] Verification des mises a jour GitHub...

if exist ".git" (
    for /f "tokens=*" %%i in ('git rev-parse --abbrev-ref HEAD') do set CURRENT_BRANCH=%%i
    echo Branche actuelle: !CURRENT_BRANCH!

    echo Recuperation des dernieres modifications...
    git fetch origin

    echo Mise a jour de la branche...
    git pull origin !CURRENT_BRANCH!
    echo [OK] Mise a jour completee!
) else (
    echo [WARN] Pas un depot Git. Ignorer les mises a jour.
)

echo.

REM ============================================
REM 2. BACKEND - Check and start
REM ============================================
echo [INFO] Verification du Backend (Python/FastAPI)...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python n'est pas installe!
    pause
    exit /b 1
)

REM Check if backend is running (port 8000)
netstat -ano | findstr ":8000" >nul 2>&1
if errorlevel 1 (
    echo [WARN] Backend non demarre. Demarrage...

    cd "%SCRIPT_DIR%\financial-analyzer\backend"

    REM Create venv if not exists
    if not exist "venv\" (
        echo Creation de l'environnement virtuel...
        python -m venv venv
    )

    REM Activate venv
    call venv\Scripts\activate.bat

    REM Install dependencies
    if exist "requirements.txt" (
        echo Installation des dependances...
        pip install -q --upgrade pip
        pip install -q -r requirements.txt
        pip install -q "numpy<2" --upgrade
        pip install -q --upgrade anthropic
        echo [OK] Dependances installees
    )

    REM Start backend in background
    echo Demarrage du serveur backend...
    start /B python main.py > backend.log 2>&1

    REM Wait for backend
    timeout /t 5 /nobreak >nul
    echo [OK] Backend demarre!

    cd "%SCRIPT_DIR%"
) else (
    echo [OK] Backend deja en cours d'execution
)

echo.

REM ============================================
REM 3. FRONTEND - Check and start
REM ============================================
echo [INFO] Verification du Frontend (React/Vite)...

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm n'est pas installe!
    pause
    exit /b 1
)

REM Check if frontend is running (port 5173)
netstat -ano | findstr ":5173" >nul 2>&1
if errorlevel 1 (
    echo [WARN] Frontend non demarre. Demarrage...

    cd "%SCRIPT_DIR%\financial-analyzer\frontend"

    REM Install dependencies
    if not exist "node_modules\" (
        echo Installation des dependances npm...
        call npm install
        echo [OK] Dependances npm installees
    )

    REM Start frontend in background
    echo Demarrage du serveur frontend...
    start /B npm run dev > frontend.log 2>&1

    REM Wait for frontend
    timeout /t 10 /nobreak >nul
    echo [OK] Frontend demarre!

    cd "%SCRIPT_DIR%"
) else (
    echo [OK] Frontend deja en cours d'execution
)

echo.

REM ============================================
REM 4. OPEN BROWSER
REM ============================================
echo [INFO] Ouverture de l'application dans le navigateur...
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo ============================================
echo [OK] Application lancee avec succes!
echo ============================================
echo.
echo URLs:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo.
echo Pour arreter: double-clic sur stop-servers.bat
echo.
pause
