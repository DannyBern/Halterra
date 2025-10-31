# Script pour créer et pousser le repository Halterra sur GitHub
# Exécutez ce script dans PowerShell

Write-Host "🪷 Configuration du repository Halterra sur GitHub..." -ForegroundColor Cyan

# Votre username GitHub
$username = "DannyBern"
$repoName = "halterra"

Write-Host "`n1. Ajout du remote origin..." -ForegroundColor Yellow
git remote add origin "https://github.com/$username/$repoName.git"

Write-Host "`n2. Push vers GitHub..." -ForegroundColor Yellow
Write-Host "Note: Vous devrez peut-être entrer vos identifiants GitHub" -ForegroundColor Gray
git push -u origin main

Write-Host "`n✅ Code poussé sur GitHub!" -ForegroundColor Green
Write-Host "`nProchaines étapes:" -ForegroundColor Cyan
Write-Host "1. Allez sur https://github.com/$username/$repoName" -ForegroundColor White
Write-Host "2. Cliquez sur Settings > Pages" -ForegroundColor White
Write-Host "3. Sous 'Source', sélectionnez la branche 'gh-pages'" -ForegroundColor White
Write-Host "4. Exécutez 'npm run deploy' pour déployer l'application" -ForegroundColor White
Write-Host "`nVotre app sera disponible à: https://$username.github.io/$repoName/" -ForegroundColor Green
