# Guide de Déploiement LexiaV3 sur VPS

Ce guide détaille les étapes nécessaires pour déployer LexiaV3 sur un VPS sous AlmaLinux ou CentOS avec Docker et Nginx.

## Prérequis

- Un serveur VPS avec AlmaLinux 9+ ou CentOS 8+
- Accès SSH en tant que root ou utilisateur avec privilèges sudo
- Un nom de domaine pointant vers votre serveur (app.ialexia.fr)

## 1. Mise à jour du système

```bash
sudo dnf update -y
sudo dnf upgrade -y
```

## 2. Installation de Docker et Docker Compose

```bash
# Installation des packages requis
sudo dnf install -y dnf-plugins-core

# Ajout du dépôt Docker
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Installation de Docker
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Démarrage et activation du service Docker
sudo systemctl start docker
sudo systemctl enable docker

# Vérification de l'installation
docker --version
docker compose version
```

## 3. Installation de Nginx

```bash
# Installation de Nginx
sudo dnf install -y nginx

# Démarrage et activation du service Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Ouverture des ports dans le pare-feu
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 4. Installation de Certbot pour les certificats SSL

```bash
# Installation de Certbot
sudo dnf install -y epel-release
sudo dnf install -y certbot python3-certbot-nginx

# Obtention d'un certificat SSL
sudo certbot --nginx -d app.ialexia.fr
```

## 5. Clonage du dépôt

```bash
# Installation de Git
sudo dnf install -y git

# Clonage du dépôt
mkdir -p /var/www
cd /var/www
git clone https://github.com/tachfineamnay/LexiaV3.git
cd LexiaV3
```

## 6. Configuration de l'environnement

```bash
# Création du fichier .env
cat > .env << EOF
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
```

## 7. Configuration de Nginx

```bash
# Création du fichier de configuration Nginx
sudo tee /etc/nginx/conf.d/app.ialexia.fr.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name app.ialexia.fr;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.ialexia.fr;

    ssl_certificate /etc/letsencrypt/live/app.ialexia.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.ialexia.fr/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://localhost:8083;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8089/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Vérification de la configuration Nginx
sudo nginx -t

# Redémarrage de Nginx
sudo systemctl restart nginx
```

## 8. Déploiement de l'application

```bash
# Rendre le script de déploiement exécutable
chmod +x deploy-lexiav3.sh

# Exécution du script de déploiement
./deploy-lexiav3.sh
```

## 9. Configuration du renouvellement automatique des certificats SSL

```bash
# Vérification que le renouvellement automatique est configuré
sudo systemctl status certbot-renew.timer

# Si nécessaire, activation du timer
sudo systemctl enable certbot-renew.timer
sudo systemctl start certbot-renew.timer
```

## 10. Vérification du déploiement

Ouvrez votre navigateur et accédez à https://app.ialexia.fr pour vérifier que l'application fonctionne correctement.

Pour vérifier l'API, accédez à https://app.ialexia.fr/api/health et vérifiez que vous recevez une réponse "OK".

## 11. Mise en place d'un déploiement automatique (optionnel)

Pour configurer un déploiement automatique lorsque vous poussez sur GitHub, configurez les secrets GitHub suivants:

- `SSH_PRIVATE_KEY`: La clé privée SSH pour se connecter au serveur
- `SERVER_IP`: L'adresse IP de votre serveur
- `SSH_USER`: Le nom d'utilisateur SSH
- `APP_PATH`: Le chemin vers le répertoire de l'application (/var/www/LexiaV3)

Le workflow GitHub Actions se chargera du déploiement automatique.

## 12. Sécurisation du serveur (recommandé)

```bash
# Installation de fail2ban pour protéger contre les attaques par force brute
sudo dnf install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Configuration du pare-feu
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## Dépannage

- **Problème d'accès à l'application** : Vérifiez les logs Docker avec `docker logs LexiaV3-frontend` et `docker logs LexiaV3-backend`
- **Problème de certificat SSL** : Vérifiez les logs de Certbot avec `sudo certbot certificates` et `sudo tail -f /var/log/letsencrypt/letsencrypt.log`
- **Problème de proxy Nginx** : Vérifiez les logs Nginx avec `sudo tail -f /var/log/nginx/error.log` 