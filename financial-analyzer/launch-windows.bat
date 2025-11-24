@echo off
REM Financial Analyzer - Windows Launcher
REM Double-click this file to launch the app

title Financial Analyzer Launcher

echo ========================================
echo   Financial Analyzer - Starting...
echo ========================================
echo.

cd /d %~dp0

REM Start Backend
echo [1/2] Starting Backend...
start "Financial Analyzer - Backend" cmd /k "cd backend && venv\Scripts\activate && python main.py"
timeout /t 3 /nobreak > nul

REM Start Frontend
echo [2/2] Starting Frontend...
start "Financial Analyzer - Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 5 /nobreak > nul

REM Open Browser
echo.
echo Opening browser...
start http://localhost:5173

echo.
echo ========================================
echo   Financial Analyzer is running!
echo ========================================
echo.
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo.
echo   Features:
echo   - 7-stage institutional analysis
echo   - Real-time progress tracking
echo   - Warren Buffett AI chat
echo   - Interactive financial charts
echo.
echo   Two windows have opened:
echo   - Backend server
echo   - Frontend server
echo.
echo   Close those windows to stop the app
echo ========================================
echo.
pause
