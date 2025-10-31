@echo off
echo 🪷 Pushing Halterra to GitHub...
echo.

cd /d "%~dp0"

echo Adding remote origin...
git remote add origin https://github.com/DannyBern/halterra.git 2>nul
if errorlevel 1 (
    echo Remote already exists
)

echo.
echo 📤 Pushing code to GitHub...
git push -u origin main

if errorlevel 1 (
    echo.
    echo ❌ Error pushing to GitHub. Please check:
    echo 1. Did you create the repository on GitHub?
    echo 2. Are you logged in to GitHub?
    echo 3. Do you have internet connection?
    pause
    exit /b 1
)

echo.
echo 🚀 Deploying to GitHub Pages...
call npm run deploy

if errorlevel 1 (
    echo.
    echo ❌ Error deploying. Check the error above.
    pause
    exit /b 1
)

echo.
echo ✅ Done! Your app will be available at:
echo 🌐 https://dannybern.github.io/halterra/
echo.
echo ⚠️  Don't forget to:
echo 1. Go to https://github.com/DannyBern/halterra/settings/pages
echo 2. Set the source to 'gh-pages' branch
echo 3. Wait 2-3 minutes for deployment
echo.
pause
