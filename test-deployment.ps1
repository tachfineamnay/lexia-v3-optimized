Write-Host "🔍 Test de déploiement LexiaV3" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

# Arrêter tous les containers existants
Write-Host "🛑 Arrêt des containers existants..." -ForegroundColor Blue
docker-compose down --remove-orphans -v

# Nettoyer les images
Write-Host "🧹 Nettoyage des images..." -ForegroundColor Blue
docker system prune -f

# Reconstruire et démarrer
Write-Host "🔨 Reconstruction et démarrage..." -ForegroundColor Green
docker-compose up --build -d

# Attendre un peu pour que les services démarrent
Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Vérifier le statut des containers
Write-Host "📋 Statut des containers:" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Test du backend
Write-Host "`n🖥️ Test du backend..." -ForegroundColor Blue
$backendContainer = docker ps -q --filter "name=backend"
if ($backendContainer) {
    Write-Host "✅ Container Backend trouvé" -ForegroundColor Green
    Write-Host "📜 Logs du backend:" -ForegroundColor Cyan
    docker logs $backendContainer --tail 20
    
    Write-Host "`n🏥 Test du health check..." -ForegroundColor Yellow
    try {
        docker exec $backendContainer curl -f http://localhost:8089/api/health
        Write-Host "✅ Health check réussi" -ForegroundColor Green
    } catch {
        Write-Host "❌ Health check échoué" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Container Backend non trouvé" -ForegroundColor Red
}

# Test de MongoDB
Write-Host "`n📊 Test MongoDB..." -ForegroundColor Blue
$mongoContainer = docker ps -q --filter "name=mongo"
if ($mongoContainer) {
    Write-Host "✅ Container MongoDB trouvé" -ForegroundColor Green
    Write-Host "📜 Logs MongoDB:" -ForegroundColor Cyan
    docker logs $mongoContainer --tail 10
} else {
    Write-Host "❌ Container MongoDB non trouvé" -ForegroundColor Red
}

# Test d'accès externe
Write-Host "`n🌐 Test d'accès externe..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8089/api/health" -TimeoutSec 10
    Write-Host "✅ Backend accessible depuis l'extérieur" -ForegroundColor Green
    Write-Host "Response: $($response.StatusCode)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Backend non accessible depuis l'extérieur" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Test de déploiement terminé!" -ForegroundColor Green 