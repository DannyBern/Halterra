@echo off
REM ============================================
REM Financial Analyzer - Stop Servers (Windows)
REM ============================================

echo.
echo ============================================
echo Arret des serveurs Financial Analyzer
echo ============================================
echo.

REM Stop processes on port 8000 (Backend)
echo [INFO] Arret du Backend (port 8000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000"') do (
    taskkill /PID %%a /F >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] Backend arrete (PID: %%a^)
    )
)

REM Stop processes on port 5173 (Frontend)
echo [INFO] Arret du Frontend (port 5173)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173"') do (
    taskkill /PID %%a /F >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] Frontend arrete (PID: %%a^)
    )
)

REM Kill remaining Python/Node processes
echo.
echo [INFO] Nettoyage des processus restants...
taskkill /F /IM python.exe /T >nul 2>&1
taskkill /F /IM node.exe /T >nul 2>&1

echo.
echo ============================================
echo [OK] Tous les serveurs sont arretes!
echo ============================================
echo.
pause
