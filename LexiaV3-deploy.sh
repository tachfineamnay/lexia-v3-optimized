#!/bin/bash

# Script de déploiement pour LexiaV3 sur CyberPanel avec Docker
# Exécution en tant que root avec gestion complète des utilisateurs et permissions

set -e

# Configuration
APP_NAME="LexiaV3"
DOMAIN="app.lexiav3.ai"
APP_DIR="/home/${APP_NAME}/public_html"
DOCKER_COMPOSE_VERSION="2.23.0"
OLD_APP_NAME="ialexia"
OLD_APP_DIR="/home/${OLD_APP_NAME}/public_html"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fonction pour afficher les messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERREUR]${NC} $1" >&2
    exit 1
}

warning() {
    echo -e "${YELLOW}[ATTENTION]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Vérifier que le script est exécuté en tant que root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "Ce script doit être exécuté en tant que root"
    fi
}

# Corriger un fichier .env existant si nécessaire
fix_env_file() {
    log "Vérification et correction des fichiers .env existants..."
    
    # Vérifier si le fichier .env existe dans l'ancien répertoire
    if [ -f "${OLD_APP_DIR}/.env" ]; then
        log "Fichier .env trouvé dans ${OLD_APP_DIR}/.env"
        
        # Sauvegarder l'ancien fichier
        cp "${OLD_APP_DIR}/.env" "${OLD_APP_DIR}/.env.bak"
        
        # Vérifier s'il y a une erreur dans le format JWT_SECRET
        if grep -q "^[^=]*$" "${OLD_APP_DIR}/.env"; then
            warning "Format incorrect détecté dans ${OLD_APP_DIR}/.env"
            
            # Corriger la ligne 8 (JWT_SECRET) si elle ne commence pas par JWT_SECRET=
            sed -i '8s/^[^J][^W]/JWT_SECRET=&/' "${OLD_APP_DIR}/.env"
            
            # Corriger la ligne 9 (REFRESH_TOKEN_SECRET) si elle ne commence pas par REFRESH_TOKEN_SECRET=
            sed -i '9s/^[^R][^E]/REFRESH_TOKEN_SECRET=&/' "${OLD_APP_DIR}/.env"
            
            log "Fichier .env corrigé"
        else
            log "Le fichier .env semble correctement formaté"
        fi
        
        # Créer un symlink pour que le nouveau déploiement puisse utiliser l'ancien .env
        if [ ! -f "${APP_DIR}/.env" ] && [ "${OLD_APP_DIR}" != "${APP_DIR}" ]; then
            # S'assurer que le répertoire existe complètement (et pas juste le parent)
            mkdir -p "${APP_DIR}"
            
            # Vérifier si le répertoire a été créé avec succès
            if [ -d "${APP_DIR}" ]; then
                ln -sf "${OLD_APP_DIR}/.env" "${APP_DIR}/.env"
                log "Symlink créé de ${OLD_APP_DIR}/.env vers ${APP_DIR}/.env"
            else
                warning "Impossible de créer le répertoire ${APP_DIR}"
                # Alternative: copier le fichier au lieu de créer un symlink
                mkdir -p $(dirname "${APP_DIR}")
                cp "${OLD_APP_DIR}/.env" "${APP_DIR}/.env" 2>/dev/null || true
                log "Tentative de copie directe du fichier .env"
            fi
        fi
    fi
    
    # Vérifier si le fichier .env existe dans le nouveau répertoire
    if [ -f "${APP_DIR}/.env" ]; then
        log "Fichier .env trouvé dans ${APP_DIR}/.env"
        
        # Sauvegarder l'ancien fichier
        cp "${APP_DIR}/.env" "${APP_DIR}/.env.bak"
        
        # Vérifier s'il y a une erreur dans le format JWT_SECRET
        if grep -q "^[^=]*$" "${APP_DIR}/.env"; then
            warning "Format incorrect détecté dans ${APP_DIR}/.env"
            
            # Corriger la ligne 8 (JWT_SECRET) si elle ne commence pas par JWT_SECRET=
            sed -i '8s/^[^J][^W]/JWT_SECRET=&/' "${APP_DIR}/.env"
            
            # Corriger la ligne 9 (REFRESH_TOKEN_SECRET) si elle ne commence pas par REFRESH_TOKEN_SECRET=
            sed -i '9s/^[^R][^E]/REFRESH_TOKEN_SECRET=&/' "${APP_DIR}/.env"
            
            log "Fichier .env corrigé"
        else
            log "Le fichier .env semble correctement formaté"
        fi
    fi
}

# Créer des liens symboliques pour la compatibilité
create_symlinks() {
    log "Création des liens symboliques pour la compatibilité..."
    
    # Créer un lien symbolique de LexiaV3-deploy.sh vers deploy-now.sh
    if [ -f "${APP_DIR}/LexiaV3-deploy.sh" ] && [ ! -f "${APP_DIR}/deploy-now.sh" ]; then
        ln -sf "${APP_DIR}/LexiaV3-deploy.sh" "${APP_DIR}/deploy-now.sh"
        chmod +x "${APP_DIR}/deploy-now.sh"
        log "Lien symbolique créé: ${APP_DIR}/deploy-now.sh -> ${APP_DIR}/LexiaV3-deploy.sh"
    fi
    
    # Si nous sommes dans /root/LexiaV3 et que le script n'y est pas déjà
    if [ "$(pwd)" = "/root/LexiaV3" ] && [ ! -f "/root/LexiaV3/LexiaV3-deploy.sh" ]; then
        cp "$0" "/root/LexiaV3/LexiaV3-deploy.sh"
        chmod +x "/root/LexiaV3/LexiaV3-deploy.sh"
        ln -sf "/root/LexiaV3/LexiaV3-deploy.sh" "/root/LexiaV3/deploy-now.sh"
        chmod +x "/root/LexiaV3/deploy-now.sh"
        log "Script copié et liens créés dans /root/LexiaV3"
    fi
}

# Fonction pour détecter une installation existante (ialexia ou LexiaV3)
detect_existing_installation() {
    log "Recherche d'une installation existante..."
    
    # Vérifier si l'ancien répertoire existe
    if [ -d "${OLD_APP_DIR}" ]; then
        warning "Installation précédente détectée: ${OLD_APP_DIR}"
        
        # Si l'ancien répertoire existe mais pas le nouveau, proposer la migration
        if [ ! -d "${APP_DIR}" ] && [ "${OLD_APP_DIR}" != "${APP_DIR}" ]; then
            log "Migration depuis ${OLD_APP_DIR} vers ${APP_DIR}"
            
            # Créer les répertoires nécessaires et s'assurer qu'ils existent
            mkdir -p "${APP_DIR}"
            mkdir -p /home/${APP_NAME}/logs
            mkdir -p /home/${APP_NAME}/backups
            mkdir -p /home/${APP_NAME}/ssl
            
            # Définir les permissions
            chown -R root:root /home/${APP_NAME} 2>/dev/null || true
            chmod -R 755 /home/${APP_NAME} 2>/dev/null || true
            
            # Créer l'utilisateur si nécessaire
            if ! id -u ${APP_NAME} >/dev/null 2>&1; then
                useradd -m -s /bin/bash ${APP_NAME} 2>/dev/null || true
                usermod -aG docker ${APP_NAME} 2>/dev/null || true
                log "Utilisateur ${APP_NAME} créé"
                
                # Mettre à jour les permissions
                chown -R ${APP_NAME}:${APP_NAME} /home/${APP_NAME} 2>/dev/null || true
            fi
            
            # Copier les fichiers importants
            if [ -f "${OLD_APP_DIR}/.env" ]; then
                cp "${OLD_APP_DIR}/.env" "${APP_DIR}/.env" 2>/dev/null || true
                log "Fichier .env copié"
            fi
            
            # Copier le docker-compose.yml
            if [ -f "${OLD_APP_DIR}/docker-compose.yml" ]; then
                cp "${OLD_APP_DIR}/docker-compose.yml" "${APP_DIR}/docker-compose.yml" 2>/dev/null || true
                log "Fichier docker-compose.yml copié"
            fi
            
            # Définir les permissions finales
            chown -R ${APP_NAME}:${APP_NAME} ${APP_DIR} 2>/dev/null || true
        fi
    fi
    
    # Vérifier si le nouveau répertoire existe
    if [ -d "${APP_DIR}" ]; then
        log "Installation LexiaV3 détectée: ${APP_DIR}"
    else
        # Créer les répertoires de base si aucune installation n'est détectée
        log "Aucune installation existante détectée, création des répertoires de base"
        mkdir -p "${APP_DIR}" 2>/dev/null || true
        chown -R root:root /home/${APP_NAME} 2>/dev/null || true
    fi
}

# Détecter le gestionnaire de paquets
detect_package_manager() {
    if command -v dnf &> /dev/null; then
        PKG_MANAGER="dnf"
    elif command -v yum &> /dev/null; then
        PKG_MANAGER="yum"
    elif command -v apt-get &> /dev/null; then
        PKG_MANAGER="apt-get"
    else
        error "Aucun gestionnaire de paquets compatible trouvé (dnf, yum ou apt-get)"
    fi
    log "Gestionnaire de paquets détecté: ${PKG_MANAGER}"
}

# Installer les dépendances système
install_dependencies() {
    log "Installation des dépendances système..."
    
    # Mise à jour du système
    if [ "$PKG_MANAGER" = "dnf" ] || [ "$PKG_MANAGER" = "yum" ]; then
        $PKG_MANAGER update -y
        
        # Installation des paquets nécessaires
        $PKG_MANAGER install -y \
            curl \
            git \
            wget \
            unzip \
            ca-certificates \
            gnupg \
            redhat-lsb-core \
            htop \
            nano \
            vim \
            net-tools \
            firewalld
    else
        # Pour les systèmes basés sur Debian/Ubuntu
        $PKG_MANAGER update -y
        $PKG_MANAGER upgrade -y
        
        # Installation des paquets nécessaires
        $PKG_MANAGER install -y \
            curl \
            git \
            wget \
            unzip \
            software-properties-common \
            apt-transport-https \
            ca-certificates \
            gnupg \
            lsb-release \
            htop \
            nano \
            vim \
            net-tools \
            ufw
    fi
}

# Installer Docker et Docker Compose
install_docker() {
    log "Installation de Docker..."
    
    if [ "$PKG_MANAGER" = "dnf" ] || [ "$PKG_MANAGER" = "yum" ]; then
        # Supprimer les anciennes versions
        $PKG_MANAGER remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine || true
        
        # Ajouter le repository Docker
        $PKG_MANAGER -y install dnf-plugins-core
        $PKG_MANAGER config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
        
        # Installer Docker
        $PKG_MANAGER install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    else
        # Pour les systèmes basés sur Debian/Ubuntu
        # Supprimer les anciennes versions
        $PKG_MANAGER remove -y docker docker-engine docker.io containerd runc || true
        
        # Ajouter le repository Docker
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        # Installer Docker
        $PKG_MANAGER update -y
        $PKG_MANAGER install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    fi
    
    # Démarrer et activer Docker
    systemctl start docker
    systemctl enable docker
    
    # Installer Docker Compose standalone
    log "Installation de Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Vérifier l'installation
    docker --version
    docker-compose --version
}

# Créer l'utilisateur et la structure des dossiers
setup_user_and_directories() {
    log "Configuration de l'utilisateur et des répertoires..."
    
    # Créer l'utilisateur si nécessaire
    if ! id -u ${APP_NAME} >/dev/null 2>&1; then
        useradd -m -s /bin/bash ${APP_NAME}
        usermod -aG docker ${APP_NAME}
        log "Utilisateur ${APP_NAME} créé"
    fi
    
    # Créer la structure des dossiers
    mkdir -p ${APP_DIR}
    mkdir -p /home/${APP_NAME}/logs
    mkdir -p /home/${APP_NAME}/backups
    mkdir -p /home/${APP_NAME}/ssl
    
    # Définir les permissions
    chown -R ${APP_NAME}:${APP_NAME} /home/${APP_NAME}
    chmod -R 755 /home/${APP_NAME}
}

# Cloner ou mettre à jour le repository
setup_repository() {
    log "Configuration du repository..."
    
    cd ${APP_DIR}
    
    # Si le dossier .git existe, faire un pull, sinon cloner
    if [ -d ".git" ]; then
        log "Mise à jour du repository existant..."
        git pull origin main || git pull origin master
    else
        log "Clonage du repository..."
        # Remplacer par votre URL de repository
        git clone https://github.com/tachfineamnay/LexiaV3.git .
    fi
    
    # Définir les permissions
    chown -R ${APP_NAME}:${APP_NAME} ${APP_DIR}
}

# Nettoyer les fichiers inutiles
cleanup_files() {
    log "Nettoyage des fichiers inutiles..."
    
    cd ${APP_DIR}
    
    # Liste des fichiers et dossiers à supprimer
    FILES_TO_DELETE=(
        "deploy-cyberpanel-docker.sh"
        "deploy-cyberpanel-docker.sh.bak"
        "fix-frontend-deployment.ps1"
        "deploy-vps.sh"
        "deploy-hostinger.sh"
        "ecosystem.config.js"
        "deploy-files"
        "scripts/deploy-check.js"
        "logs"
        "LexiaV3"
        "*.log"
        "*.bak"
        "*.tmp"
        ".env.local"
        ".env.development"
    )
    
    for file in "${FILES_TO_DELETE[@]}"; do
        if [ -e "$file" ]; then
            rm -rf "$file"
            log "Supprimé: $file"
        fi
    done
    
    # Nettoyer les node_modules si présents (ils seront reconstruits dans Docker)
    find . -name "node_modules" -type d -prune -exec rm -rf '{}' + 2>/dev/null || true
    find . -name "dist" -type d -prune -exec rm -rf '{}' + 2>/dev/null || true
    find . -name ".next" -type d -prune -exec rm -rf '{}' + 2>/dev/null || true
}

# Créer le fichier .env
create_env_file() {
    log "Création du fichier .env..."
    
    # Générer des mots de passe et secrets sans caractères spéciaux
    MONGO_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=' | head -c 32)
    JWT_SECRET=$(openssl rand -base64 64 | tr -d '/+=' | head -c 64)
    REFRESH_TOKEN_SECRET=$(openssl rand -base64 64 | tr -d '/+=' | head -c 64)
    
    cat > ${APP_DIR}/.env << EOF
# Configuration MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=${MONGO_PASSWORD}

# Configuration Backend
NODE_ENV=production
JWT_SECRET=${JWT_SECRET}
REFRESH_TOKEN_SECRET=${REFRESH_TOKEN_SECRET}

# Configuration Frontend
VITE_API_URL=https://${DOMAIN}/api
CORS_ORIGIN=https://${DOMAIN}

# Configuration Email (à personnaliser)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Configuration Stripe (à personnaliser)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
EOF
    
    chmod 600 ${APP_DIR}/.env
    chown ${APP_NAME}:${APP_NAME} ${APP_DIR}/.env
}

# Créer un nouveau docker-compose.yml optimisé
create_docker_compose() {
    log "Création du fichier docker-compose.yml optimisé..."
    
    cat > ${APP_DIR}/docker-compose.yml << 'EOF'
version: '3.8'

services:
  # MongoDB Database
  mongodb:
    image: mongo:7.0
    container_name: LexiaV3-mongodb
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: LexiaV3
    volumes:
      - mongodb_data:/data/db
      - ./backend/init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro
    networks:
      - lexiav3-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: LexiaV3-backend
    restart: always
    user: "1000:1000"
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: mongodb://${MONGO_ROOT_USERNAME}:${MONGO_ROOT_PASSWORD}@mongodb:27017/LexiaV3?authSource=admin
      JWT_SECRET: ${JWT_SECRET}
      REFRESH_TOKEN_SECRET: ${REFRESH_TOKEN_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN}
      EMAIL_HOST: ${EMAIL_HOST}
      EMAIL_PORT: ${EMAIL_PORT}
      EMAIL_USER: ${EMAIL_USER}
      EMAIL_PASS: ${EMAIL_PASS}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
    volumes:
      - ./backend/uploads:/usr/src/app/uploads
      - ./backend/exports:/usr/src/app/exports
    ports:
      - "127.0.0.1:5000:5000"
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - lexiav3-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: ${VITE_API_URL}
    container_name: LexiaV3-frontend
    restart: always
    user: "1000:1000"
    ports:
      - "127.0.0.1:3000:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - lexiav3-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 5
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  mongodb_data:
    driver: local

networks:
  lexiav3-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
EOF
}

# Optimiser les Dockerfiles
optimize_dockerfiles() {
    log "Optimisation des Dockerfiles..."
    
    # Backend Dockerfile
    cat > ${APP_DIR}/backend/Dockerfile << 'EOF'
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Stage de production
FROM node:18-alpine

# Installer dumb-init pour une meilleure gestion des signaux
RUN apk add --no-cache dumb-init

# Créer un utilisateur non-root
RUN addgroup -g 1000 -S nodejs && \
    adduser -S nodejs -u 1000

WORKDIR /usr/src/app

# Copier depuis le builder
COPY --from=builder --chown=nodejs:nodejs /usr/src/app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Créer les dossiers nécessaires
RUN mkdir -p uploads exports && \
    chown -R nodejs:nodejs uploads exports

USER nodejs

EXPOSE 5000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
EOF

    # Frontend Dockerfile
    cat > ${APP_DIR}/frontend/Dockerfile << 'EOF'
FROM node:18-alpine AS builder

WORKDIR /app

# Arguments de build
ARG VITE_API_URL

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Build de l'application
RUN npm run build

# Stage de production avec Nginx
FROM nginx:alpine

# Installer les outils nécessaires
RUN apk add --no-cache curl

# Copier la configuration Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers buildés
COPY --from=builder /app/dist /usr/share/nginx/html

# Créer un utilisateur non-root pour Nginx
RUN addgroup -g 1000 -S nginx && \
    adduser -S nginx -u 1000 -G nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF
}

# Configurer Nginx pour CyberPanel
configure_nginx_cyberpanel() {
    log "Configuration de Nginx pour CyberPanel..."
    
    # Créer la configuration Nginx pour le frontend
    cat > ${APP_DIR}/frontend/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;

        # Gestion des routes React
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache pour les assets statiques
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Désactiver le cache pour index.html
        location = /index.html {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            add_header Expires "0";
        }

        # Health check
        location /health {
            access_log off;
            return 200 "OK\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF
}

# Configurer le firewall
configure_firewall() {
    log "Configuration du firewall..."
    
    if [ "$PKG_MANAGER" = "dnf" ] || [ "$PKG_MANAGER" = "yum" ]; then
        # Utiliser firewalld pour CentOS/RHEL
        systemctl start firewalld
        systemctl enable firewalld
        
        # Règles par défaut
        firewall-cmd --permanent --add-service=ssh
        firewall-cmd --permanent --add-service=http
        firewall-cmd --permanent --add-service=https
        
        # Autoriser les ports Docker (uniquement en local)
        firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="127.0.0.1" port protocol="tcp" port="3000" accept'
        firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="127.0.0.1" port protocol="tcp" port="5000" accept'
        
        # Recharger firewalld
        firewall-cmd --reload
    else
        # Utiliser UFW pour Ubuntu/Debian
        ufw --force enable
        
        # Règles par défaut
        ufw default deny incoming
        ufw default allow outgoing
        
        # Autoriser SSH
        ufw allow 22/tcp
        
        # Autoriser HTTP et HTTPS
        ufw allow 80/tcp
        ufw allow 443/tcp
        
        # Autoriser les ports Docker (uniquement en local)
        ufw allow from 127.0.0.1 to any port 3000
        ufw allow from 127.0.0.1 to any port 5000
        
        # Recharger UFW
        ufw reload
    fi
    
    log "Firewall configuré"
}

# Créer les scripts de maintenance
create_maintenance_scripts() {
    log "Création des scripts de maintenance..."
    
    # Script de backup
    cat > /home/${APP_NAME}/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/LexiaV3/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/LexiaV3_backup_${DATE}.tar.gz"

# Créer le dossier de backup si nécessaire
mkdir -p ${BACKUP_DIR}

# Backup de la base de données
docker exec LexiaV3-mongodb mongodump --archive=/tmp/mongodb_backup.gz --gzip
docker cp LexiaV3-mongodb:/tmp/mongodb_backup.gz ${BACKUP_DIR}/mongodb_${DATE}.gz

# Backup des uploads
tar -czf ${BACKUP_DIR}/uploads_${DATE}.tar.gz -C /home/LexiaV3/public_html/backend uploads/

# Backup des variables d'environnement
cp /home/LexiaV3/public_html/.env ${BACKUP_DIR}/env_${DATE}.bak

# Nettoyer les backups de plus de 30 jours
find ${BACKUP_DIR} -name "*.gz" -mtime +30 -delete
find ${BACKUP_DIR} -name "*.bak" -mtime +30 -delete

echo "Backup terminé: ${DATE}"
EOF

    # Script de monitoring
    cat > /home/${APP_NAME}/monitor.sh << 'EOF'
#!/bin/bash
# Vérifier l'état des conteneurs
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Vérifier l'utilisation des ressources
echo -e "\n=== Utilisation des ressources ==="
docker stats --no-stream

# Vérifier l'espace disque
echo -e "\n=== Espace disque ==="
df -h | grep -E "^/dev|Filesystem"

# Vérifier les logs récents
echo -e "\n=== Logs récents (erreurs) ==="
docker-compose logs --tail=20 | grep -i error || echo "Aucune erreur récente"
EOF

    # Script de mise à jour
    cat > /home/${APP_NAME}/update.sh << 'EOF'
#!/bin/bash
cd /home/LexiaV3/public_html

# Pull les dernières modifications
git pull origin main || git pull origin master

# Rebuild et redémarrer les conteneurs
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Nettoyer les images Docker inutilisées
docker image prune -f

echo "Mise à jour terminée"
EOF

    # Rendre les scripts exécutables
    chmod +x /home/${APP_NAME}/backup.sh
    chmod +x /home/${APP_NAME}/monitor.sh
    chmod +x /home/${APP_NAME}/update.sh
    
    # Définir les permissions
    chown ${APP_NAME}:${APP_NAME} /home/${APP_NAME}/*.sh
}

# Configurer les tâches cron
setup_cron() {
    log "Configuration des tâches cron..."
    
    # Créer le fichier crontab pour l'utilisateur
    cat > /tmp/LexiaV3-cron << EOF
# Backup quotidien à 2h du matin
0 2 * * * /home/LexiaV3/backup.sh >> /home/LexiaV3/logs/backup.log 2>&1

# Monitoring toutes les 5 minutes
*/5 * * * * /home/LexiaV3/monitor.sh >> /home/LexiaV3/logs/monitor.log 2>&1

# Nettoyage des logs tous les dimanches
0 3 * * 0 find /home/LexiaV3/logs -name "*.log" -mtime +7 -delete

# Redémarrage automatique des conteneurs en cas d'arrêt
*/5 * * * * docker ps | grep -q LexiaV3 || (cd /home/LexiaV3/public_html && docker-compose up -d)
EOF

    # Installer le crontab
    crontab -u ${APP_NAME} /tmp/LexiaV3-cron
    rm /tmp/LexiaV3-cron
    
    log "Tâches cron configurées"
}

# Démarrer l'application
start_application() {
    log "Démarrage de l'application..."
    
    cd ${APP_DIR}
    
    # Build des images
    docker-compose build --no-cache
    
    # Démarrer les conteneurs
    docker-compose up -d
    
    # Attendre que les services soient prêts
    log "Attente du démarrage des services..."
    sleep 30
    
    # Vérifier l'état des conteneurs
    docker-compose ps
}

# Configuration pour CyberPanel
configure_cyberpanel() {
    log "Configuration spécifique pour CyberPanel..."
    
    # Créer le fichier de configuration pour OpenLiteSpeed
    cat > /usr/local/lsws/conf/vhosts/${APP_NAME}/vhconf.conf << EOF
docRoot                   /home/LexiaV3/public_html
vhDomain                  ${DOMAIN}
enableGzip                1
enableBr                  1

index  {
  useServer               0
  indexFiles              index.html
}

scripthandler  {
  add                     lsapi:lsphp74 php
}

extprocessor lsphp74 {
  type                    lsapi
  address                 uds://tmp/lshttpd/lsphp.sock
  maxConns                35
  env                     PHP_LSAPI_MAX_REQUESTS=500
  env                     PHP_LSAPI_CHILDREN=35
  initTimeout             60
  retryTimeout            0
  pcKeepAliveTimeout      5
  respBuffer              0
  autoStart               1
  path                    lsphp74/bin/lsphp
  backlog                 100
  instances               1
}

rewrite  {
  enable                  1
  autoLoadHtaccess        1
  
  rules                   <<<END_rules
# Proxy vers le frontend
RewriteEngine On
RewriteCond %{REQUEST_URI} !^/api
RewriteRule ^(.*)$ http://127.0.0.1:3000/\$1 [P,L]

# Proxy vers le backend
RewriteRule ^/api/(.*)$ http://127.0.0.1:5000/api/\$1 [P,L]
END_rules
}

context /api/ {
  type                    proxy
  handler                 http://127.0.0.1:5000
  addDefaultCharset       off
}

accesslog /home/LexiaV3/logs/access.log {
  useServer               0
  logFormat               "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\""
  logHeaders              5
  rollingSize             10M
  keepDays                30
  compressArchive         1
}

errorlog /home/LexiaV3/logs/error.log {
  useServer               0
  logLevel                ERROR
  rollingSize             10M
  keepDays                30
  compressArchive         1
}
EOF

    # Redémarrer OpenLiteSpeed
    systemctl restart lsws
}

# Afficher les informations de connexion
display_info() {
    log "Installation terminée avec succès!"
    
    echo -e "\n${GREEN}=== Informations de connexion ===${NC}"
    echo -e "URL de l'application: ${BLUE}https://${DOMAIN}${NC}"
    echo -e "Conteneurs Docker: ${BLUE}docker ps${NC}"
    echo -e "Logs: ${BLUE}docker-compose logs -f${NC}"
    echo -e "\n${YELLOW}=== Commandes utiles ===${NC}"
    echo -e "Backup: ${BLUE}/home/${APP_NAME}/backup.sh${NC}"
    echo -e "Monitoring: ${BLUE}/home/${APP_NAME}/monitor.sh${NC}"
    echo -e "Mise à jour: ${BLUE}/home/${APP_NAME}/update.sh${NC}"
    echo -e "\n${YELLOW}=== Fichiers importants ===${NC}"
    echo -e "Variables d'environnement: ${BLUE}${APP_DIR}/.env${NC}"
    echo -e "Docker Compose: ${BLUE}${APP_DIR}/docker-compose.yml${NC}"
    echo -e "Logs: ${BLUE}/home/${APP_NAME}/logs/${NC}"
    echo -e "\n${RED}IMPORTANT:${NC} Modifiez le fichier .env avec vos vraies valeurs!"
}

# Fonction principale
main() {
    log "Début du déploiement de LexiaV3 sur CyberPanel"
    
    # Vérifier si un paramètre a été passé (ex: backend)
    if [ "$1" = "backend" ]; then
        log "Mode déploiement backend uniquement"
        BACKEND_ONLY=true
    else
        BACKEND_ONLY=false
    fi
    
    check_root
    
    # Vérifier et corriger tout fichier .env existant
    fix_env_file
    
    # Détecter une installation existante
    detect_existing_installation
    
    # Créer des liens symboliques pour la compatibilité
    create_symlinks
    
    # Si on est en mode backend uniquement, démarrer seulement les services backend
    if [ "$BACKEND_ONLY" = true ]; then
        log "Démarrage des services backend uniquement..."
        
        detect_package_manager
        install_docker
        
        # Vérifier si le répertoire /root/LexiaV3 existe et l'utiliser
        if [ -d "/root/LexiaV3" ] && [ ! -d "${APP_DIR}" ]; then
            log "Utilisation du répertoire /root/LexiaV3"
            cd /root/LexiaV3
        else
            # Si le répertoire APP_DIR existe, l'utiliser
            if [ -d "${APP_DIR}" ]; then
                cd ${APP_DIR}
            else
                # Sinon, créer le répertoire APP_DIR
                setup_user_and_directories
                cd ${APP_DIR}
            fi
        fi
        
        # Démarrer l'application
        start_application
        
        log "Déploiement backend terminé!"
        exit 0
    fi
    
    # Déploiement complet
    detect_package_manager
    install_dependencies
    install_docker
    setup_user_and_directories
    setup_repository
    cleanup_files
    create_env_file
    create_docker_compose
    optimize_dockerfiles
    configure_nginx_cyberpanel
    configure_firewall
    create_maintenance_scripts
    setup_cron
    start_application
    configure_cyberpanel
    display_info
    
    log "Déploiement terminé!"
}

# Exécuter le script
main "$@"