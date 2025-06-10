#!/bin/bash
# Script de diagnostic pour LexiaV3

echo "======================================"
echo "🔍 Diagnostic du déploiement LexiaV3"
echo "======================================"
echo ""

# 1. Vérifier les conteneurs Docker
echo "📦 Conteneurs Docker en cours d'exécution:"
docker ps --filter "name=LexiaV3" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# 2. Vérifier les images Docker
echo "🖼️  Images Docker LexiaV3:"
docker images | grep -E "(lexiav3|frontend|backend)" || echo "Aucune image trouvée"
echo ""

# 3. Vérifier les logs des conteneurs
echo "📋 Logs récents des conteneurs:"
for container in $(docker ps --filter "name=LexiaV3" --format "{{.Names}}"); do
    echo "--- Logs de $container ---"
    docker logs --tail 10 $container 2>&1
    echo ""
done

# 4. Vérifier l'accès aux services
echo "🌐 Test d'accès aux services:"
echo -n "Frontend (port 8083): "
curl -s -o /dev/null -w "%{http_code}" http://localhost:8083 || echo "ERREUR"
echo ""
echo -n "Backend API (port 8089): "
curl -s -o /dev/null -w "%{http_code}" http://localhost:8089/api/health || echo "ERREUR"
echo ""

# 5. Vérifier les volumes Docker
echo "💾 Volumes Docker:"
docker volume ls | grep lexia || echo "Aucun volume trouvé"
echo ""

# 6. Vérifier l'espace disque
echo "💽 Espace disque disponible:"
df -h | grep -E "(/$|/var/lib/docker)"
echo ""

# 7. Vérifier les processus nginx sur le système hôte
echo "🔧 Processus nginx sur le système hôte:"
ps aux | grep nginx | grep -v grep || echo "Nginx non trouvé sur le système hôte"
echo ""

# 8. Vérifier le cache du navigateur
echo "⚠️  Instructions pour le navigateur:"
echo "1. Ouvrez les outils de développement (F12)"
echo "2. Allez dans l'onglet Network/Réseau"
echo "3. Cochez 'Disable cache'"
echo "4. Rechargez la page avec Ctrl+F5"
echo ""

# 9. Vérifier la version déployée
echo "🏷️  Version déployée:"
if [ -f "frontend/package.json" ]; then
    echo -n "Frontend version: "
    grep '"version"' frontend/package.json | head -1 | awk -F'"' '{print $4}'
fi
if [ -f "backend/package.json" ]; then
    echo -n "Backend version: "
    grep '"version"' backend/package.json | head -1 | awk -F'"' '{print $4}'
fi
echo ""

# 10. Vérifier les fichiers dans les conteneurs
echo "📁 Vérification des fichiers dans le conteneur frontend:"
docker exec LexiaV3-frontend ls -la /usr/share/nginx/html 2>/dev/null | head -10 || echo "Impossible d'accéder au conteneur"
echo ""

echo "======================================"
echo "✅ Diagnostic terminé"
echo "======================================"
