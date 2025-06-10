#!/bin/bash
# Script de nettoyage et déploiement complet de LexiaV3
# Ce script nettoie complètement l'ancienne version et déploie la nouvelle

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] ${GREEN}$1${NC}"
}

error() {
    echo -e "${RED}[ERREUR] $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}[ATTENTION] $1${NC}" >&2
}

# Vérifier les permissions
if [ "$EUID" -ne 0 ]; then
    error "Ce script doit être exécuté en tant que root ou avec sudo."
    exit 1
fi

log "🧹 Début du nettoyage complet..."

# 1. Arrêter tous les conteneurs LexiaV3
log "Arrêt de tous les conteneurs LexiaV3..."
docker stop $(docker ps -q --filter "name=LexiaV3") 2>/dev/null || true

# 2. Supprimer tous les conteneurs LexiaV3
log "Suppression des conteneurs..."
docker rm $(docker ps -aq --filter "name=LexiaV3") 2>/dev/null || true

# 3. Supprimer toutes les images LexiaV3
log "Suppression des images Docker..."
docker rmi $(docker images -q --filter "reference=*lexiav3*") 2>/dev/null || true
docker rmi $(docker images -q --filter "reference=*frontend*") 2>/dev/null || true
docker rmi $(docker images -q --filter "reference=*backend*") 2>/dev/null || true

# 4. Nettoyer le cache Docker
log "Nettoyage du cache Docker..."
docker system prune -af --volumes

# 5. Nettoyer les volumes non utilisés
log "Nettoyage des volumes Docker..."
docker volume prune -f

# 6. Nettoyer le cache du navigateur côté serveur (si nginx est utilisé)
if [ -d "/var/cache/nginx" ]; then
    log "Nettoyage du cache nginx..."
    rm -rf /var/cache/nginx/*
fi

# 7. Nettoyer les fichiers temporaires
log "Nettoyage des fichiers temporaires..."
rm -rf /tmp/lexia* 2>/dev/null || true

# 8. Vérifier et créer les répertoires nécessaires
log "Création des répertoires nécessaires..."
mkdir -p backend/uploads
mkdir -p backend/exports
chmod -R 777 backend/uploads
chmod -R 777 backend/exports

# 9. Vérifier le fichier .env
if [ ! -f ".env" ]; then
    error "Le fichier .env n'existe pas!"
    exit 1
fi

# 10. Reconstruire et déployer
log "🚀 Reconstruction et déploiement de l'application..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 11. Attendre que les services soient prêts
log "Attente du démarrage des services..."
sleep 10

# 12. Vérifier le statut
if docker ps | grep -q "LexiaV3"; then
    log "✅ Déploiement réussi!"
    
    # Afficher les URLs
    echo ""
    echo "======================================"
    echo "🎉 LexiaV3 est maintenant accessible:"
    echo "======================================"
    echo "Frontend: http://localhost:8083"
    echo "Backend API: http://localhost:8089/api"
    echo "Health Check: http://localhost:8089/api/health"
    echo ""
    
    # Afficher les logs des conteneurs
    log "Logs des conteneurs:"
    docker-compose logs --tail=20
else
    error "❌ Le déploiement a échoué!"
    docker-compose logs
    exit 1
fi

# 13. Instructions pour forcer le rafraîchissement côté client
echo ""
echo "======================================"
echo "⚠️  IMPORTANT - Pour les utilisateurs:"
echo "======================================"
echo "1. Videz le cache de votre navigateur (Ctrl+F5 ou Cmd+Shift+R)"
echo "2. Ou ouvrez l'application en mode navigation privée"
echo "3. Si le problème persiste, videz complètement le cache du navigateur"
echo ""

log "✅ Script terminé avec succès!"
