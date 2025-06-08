#!/bin/bash
# Script de déploiement de LexiaV3 sur un serveur Linux
# Auteur: Tachfine Amnay
# Version: 1.2.0

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] ${GREEN}$1${NC}"
}

error() {
    echo -e "${RED}[ERREUR] $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}[ATTENTION] $1${NC}" >&2
}

# Vérifier si l'utilisateur est root ou a des droits sudo
if [ "$EUID" -ne 0 ]; then
    error "Ce script doit être exécuté en tant que root ou avec sudo."
    exit 1
fi

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    error "Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Répertoire courant
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Vérifier si le fichier .env existe
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    error "Le fichier .env n'existe pas. Veuillez le créer d'abord."
    echo "Exemple de contenu pour .env:"
    cat <<EOF
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=votre_mot_de_passe_securise

# Configuration Backend
NODE_ENV=production
JWT_SECRET=votre_cle_secrete_jwt
REFRESH_TOKEN_SECRET=votre_cle_secrete_refresh_token

# Configuration Frontend
VITE_API_URL=https://app.ialexia.fr/api
CORS_ORIGIN=https://app.ialexia.fr

# Configuration Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-app

# Configuration Stripe
STRIPE_SECRET_KEY=votre-cle-stripe
STRIPE_WEBHOOK_SECRET=votre-cle-webhook-stripe
EOF
    exit 1
fi

# Créer les répertoires nécessaires
log "Création des répertoires pour les uploads et exports..."
mkdir -p "$SCRIPT_DIR/backend/uploads"
mkdir -p "$SCRIPT_DIR/backend/exports"
chmod -R 777 "$SCRIPT_DIR/backend/uploads"
chmod -R 777 "$SCRIPT_DIR/backend/exports"

# Arrêter les conteneurs existants
log "Arrêt des conteneurs existants..."
docker-compose -f "$SCRIPT_DIR/docker-compose.yml" down || true

# Nettoyer les images Docker non utilisées
log "Nettoyage des images Docker non utilisées..."
docker system prune -af

# Construire et démarrer les conteneurs
log "Construction et démarrage des conteneurs..."
docker-compose -f "$SCRIPT_DIR/docker-compose.yml" up -d --build

# Vérifier si les conteneurs sont en cours d'exécution
log "Vérification du statut des conteneurs..."
if docker ps | grep -q "LexiaV3-mongodb" && docker ps | grep -q "LexiaV3-backend" && docker ps | grep -q "LexiaV3-frontend"; then
    log "Les conteneurs sont en cours d'exécution."
    log "🚀 LexiaV3 a été déployé avec succès!"
    log "Frontend: http://localhost:8083"
    log "Backend API: http://localhost:8089/api"
    log "Health check: http://localhost:8089/api/health"
else
    error "Un problème est survenu lors du démarrage des conteneurs."
    docker-compose -f "$SCRIPT_DIR/docker-compose.yml" logs
    exit 1
fi

# Afficher les instructions pour la configuration du proxy inverse
log "Pour configurer un proxy inverse, ajoutez les configurations suivantes :"
echo 
echo "Nginx :"
echo "========"
cat <<EOF
server {
    listen 80;
    server_name app.ialexia.fr;

    location / {
        proxy_pass http://localhost:8083;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api {
        proxy_pass http://localhost:8089;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

echo 
echo "Apache :"
echo "========"
cat <<EOF
<VirtualHost *:80>
    ServerName app.ialexia.fr

    ProxyPreserveHost On
    ProxyRequests Off

    <Location />
        ProxyPass http://localhost:8083/
        ProxyPassReverse http://localhost:8083/
    </Location>

    <Location /api>
        ProxyPass http://localhost:8089/api
        ProxyPassReverse http://localhost:8089/api
    </Location>
</VirtualHost>
EOF

exit 0 