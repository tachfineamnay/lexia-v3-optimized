#!/bin/bash
# Script de réinitialisation complète pour LexiaV3 sur AlmaLinux/CyberPanel
# Auteur: Assistant IA
# Date: $(date)

set -e

echo "================================================"
echo "🧹 RÉINITIALISATION COMPLÈTE DE LEXIAV3"
echo "🖥️  Système: AlmaLinux avec Docker et CyberPanel"
echo "================================================"

# Variables
PROJECT_DIR="/home/LexiaV3/public_html"
BACKUP_DIR="/root/lexiav3-backup-$(date +%Y%m%d-%H%M%S)"

# Créer un dossier de backup
echo "📦 Création du dossier de backup: $BACKUP_DIR"
mkdir -p $BACKUP_DIR

# Se placer dans le répertoire du projet
cd $PROJECT_DIR

# 1. SAUVEGARDER LES FICHIERS IMPORTANTS
echo ""
echo "💾 Sauvegarde des fichiers importants..."
if [ -f .env ]; then
    cp .env $BACKUP_DIR/.env
    echo "✅ .env sauvegardé"
fi

# 2. ARRÊTER ET NETTOYER DOCKER
echo ""
echo "🛑 Arrêt et nettoyage complet de Docker..."
docker-compose down -v 2>/dev/null || true
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true
docker rmi $(docker images -q) 2>/dev/null || true
docker volume prune -f
docker network prune -f
docker system prune -af
echo "✅ Docker nettoyé"

# 3. SUPPRIMER TOUT LE CONTENU DU RÉPERTOIRE
echo ""
echo "🗑️  Suppression complète du répertoire du projet..."
cd ..
rm -rf public_html
mkdir -p public_html
cd public_html
echo "✅ Répertoire nettoyé"

# 4. CLONER LE DÉPÔT GITHUB
echo ""
echo "📥 Clonage du dépôt GitHub..."
git clone https://github.com/tachfineamnay/LexiaV3.git .
echo "✅ Code source récupéré"

# 5. CRÉER LE FICHIER .ENV
echo ""
echo "📝 Création du fichier .env optimisé..."
JWT_SECRET="lexiav3_jwt_secret_almalinux_$(openssl rand -hex 16)"
REFRESH_TOKEN_SECRET="lexiav3_refresh_secret_almalinux_$(openssl rand -hex 16)"

cat > .env << EOF
# Configuration du serveur
PORT=5000
NODE_ENV=production

# Base de données MongoDB (Docker internal network)
MONGODB_URI=mongodb://mongodb:27017/LexiaV3

# Secrets JWT
JWT_SECRET=$JWT_SECRET
REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET

# CORS (à adapter selon votre domaine)
CORS_ORIGIN=http://localhost:3000

# Configuration des uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# Google Cloud / Vertex AI (optionnel)
GOOGLE_PROJECT_ID=
GOOGLE_CLOUD_PROJECT=
GOOGLE_CLOUD_LOCATION=us-central1
VERTEX_AI_LOCATION=us-central1
GOOGLE_CREDENTIALS_PATH=

# Configuration Docker
COMPOSE_PROJECT_NAME=lexiav3
EOF

# Si un ancien .env existait, proposer de le restaurer
if [ -f $BACKUP_DIR/.env ]; then
    echo ""
    echo "⚠️  Un ancien fichier .env a été trouvé."
    cp $BACKUP_DIR/.env .env
    echo "✅ Ancien .env restauré"
else
    echo "✅ Nouveau .env créé avec des secrets aléatoires"
fi

# 6. AJUSTER LES PERMISSIONS
echo ""
echo "🔐 Configuration des permissions..."
chown -R nobody:nobody $PROJECT_DIR || true
chmod -R 755 $PROJECT_DIR
echo "✅ Permissions configurées pour CyberPanel"

# 7. CRÉER LE FICHIER DOCKER-COMPOSE OPTIMISÉ POUR ALMALINUX
echo ""
echo "🐳 Vérification du docker-compose.yml..."
# S'assurer que les ports ne sont pas en conflit avec CyberPanel
sed -i 's/- "80:3000"/- "3000:3000"/' docker-compose.yml 2>/dev/null || true
sed -i 's/- "443:3000"/- "3000:3000"/' docker-compose.yml 2>/dev/null || true

# 8. CONSTRUIRE ET DÉMARRER LES CONTAINERS
echo ""
echo "🔨 Construction des images Docker..."
docker-compose build --no-cache

echo ""
echo "🚀 Démarrage des services..."
docker-compose up -d

# 9. ATTENDRE LE DÉMARRAGE
echo ""
echo "⏳ Attente du démarrage complet (30 secondes)..."
sleep 30

# 10. VÉRIFICATION DU DÉPLOIEMENT
echo ""
echo "🔍 Vérification du déploiement..."
echo ""

# Vérifier les containers
echo "📦 État des containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Test de santé
echo ""
echo "🏥 Tests de santé:"
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend API: OK (http://localhost:5000)"
else
    echo "❌ Backend API: ERREUR"
    echo "   Logs: docker logs LexiaV3-backend"
fi

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend: OK (http://localhost:3000)"
else
    echo "❌ Frontend: ERREUR"
    echo "   Logs: docker logs LexiaV3-frontend"
fi

# 11. CONFIGURATION NGINX POUR CYBERPANEL
echo ""
echo "📝 Configuration Nginx pour CyberPanel..."
cat > /tmp/lexiav3-nginx.conf << 'EOF'
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /api {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
EOF

echo ""
echo "================================================"
echo "✅ INSTALLATION TERMINÉE AVEC SUCCÈS!"
echo "================================================"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo "1. Configurez votre domaine dans CyberPanel"
echo "2. Ajoutez la configuration Nginx ci-dessus dans:"
echo "   /tmp/lexiav3-nginx.conf"
echo "3. Accédez à l'application:"
echo "   - Frontend: http://votre-ip:3000"
echo "   - Backend API: http://votre-ip:5000/api/health"
echo ""
echo "🔧 COMMANDES UTILES:"
echo "- Voir les logs: docker-compose logs -f"
echo "- Redémarrer: docker-compose restart"
echo "- Arrêter: docker-compose down"
echo "- État: docker ps"
echo ""
echo "💾 Backup sauvegardé dans: $BACKUP_DIR"
echo "================================================" 