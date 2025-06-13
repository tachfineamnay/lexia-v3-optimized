#!/bin/bash

echo "🔍 Diagnostic du déploiement LexiaV3"
echo "===================================="

# Vérifier si les conteneurs sont en cours d'exécution
echo -e "\n📦 Conteneurs Docker:"
docker ps -a | grep -E "(lexia|frontend|backend|mongodb)"

# Vérifier les logs du frontend
echo -e "\n📄 Logs du frontend (dernières 20 lignes):"
docker logs $(docker ps -aq -f name=frontend) 2>&1 | tail -20

# Vérifier le contenu du frontend
echo -e "\n📁 Contenu du répertoire nginx dans le conteneur frontend:"
docker exec $(docker ps -q -f name=frontend) ls -la /usr/share/nginx/html/ 2>&1

# Vérifier le contenu de index.html
echo -e "\n📄 Contenu de index.html (premières 10 lignes):"
docker exec $(docker ps -q -f name=frontend) head -10 /usr/share/nginx/html/index.html 2>&1

# Vérifier l'accès à l'application
echo -e "\n🌐 Test d'accès à l'application:"
curl -s http://localhost:8083 | head -20

# Vérifier l'API backend
echo -e "\n🔌 Test de l'API backend:"
curl -s http://localhost:8089/api/health

echo -e "\n✅ Diagnostic terminé" 