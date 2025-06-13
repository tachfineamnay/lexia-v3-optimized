#!/bin/bash

echo "🔍 Test de déploiement LexiaV3"
echo "================================"

# Test de connectivité MongoDB
echo "📊 Test MongoDB..."
if docker ps | grep -q mongo; then
    echo "✅ Container MongoDB trouvé"
    docker logs $(docker ps -q --filter ancestor=mongo:7.0) --tail 20
else
    echo "❌ Container MongoDB non trouvé"
fi

echo ""

# Test de connectivité Backend
echo "🖥️ Test Backend..."
if docker ps | grep -q backend; then
    echo "✅ Container Backend trouvé"
    docker logs $(docker ps -q --filter name=backend) --tail 20
    
    # Test de la route health
    echo ""
    echo "🏥 Test du health check..."
    BACKEND_CONTAINER=$(docker ps -q --filter name=backend)
    if [ ! -z "$BACKEND_CONTAINER" ]; then
        docker exec $BACKEND_CONTAINER curl -f http://localhost:8089/api/health || echo "❌ Health check échoué"
    fi
else
    echo "❌ Container Backend non trouvé"
fi

echo ""

# Test de connectivité Frontend
echo "🌐 Test Frontend..."
if docker ps | grep -q frontend; then
    echo "✅ Container Frontend trouvé"
    docker logs $(docker ps -q --filter name=frontend) --tail 10
else
    echo "❌ Container Frontend non trouvé"
fi

echo ""
echo "📋 Résumé des containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🔧 Variables d'environnement (si .env existe):"
if [ -f .env ]; then
    echo "Fichier .env trouvé"
    cat .env | grep -E '^[A-Z]' | head -10
else
    echo "Pas de fichier .env - utilisation des valeurs par défaut"
fi 