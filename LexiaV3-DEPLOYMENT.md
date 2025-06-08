# Guide de Déploiement LexiaV3 sur CyberPanel avec Docker

## 🚀 Déploiement Rapide

Ce projet a été optimisé pour un déploiement simple et sécurisé sur CyberPanel avec Docker.

### Prérequis

- Serveur AlmaLinux 9 / CentOS / RHEL avec accès root
- CyberPanel installé
- Nom de domaine configuré (ex: app.lexiav3.ai)
- Au moins 2GB de RAM et 20GB d'espace disque

### Installation

1. **Connectez-vous en tant que root sur votre serveur**
```bash
ssh root@168.231.86.146
```

2. **Téléchargez et exécutez le script de déploiement**
```bash
wget https://raw.githubusercontent.com/tachfineamnay/LexiaV3/main/LexiaV3-deploy.sh
chmod +x LexiaV3-deploy.sh
./LexiaV3-deploy.sh
```

Le script va automatiquement :
- ✅ Installer Docker et Docker Compose
- ✅ Créer l'utilisateur système `LexiaV3`
- ✅ Configurer la structure des dossiers
- ✅ Nettoyer tous les fichiers inutiles
- ✅ Générer les clés de sécurité
- ✅ Configurer MongoDB, Backend et Frontend
- ✅ Mettre en place les sauvegardes automatiques
- ✅ Configurer le monitoring
- ✅ Sécuriser avec un firewall

### Configuration Post-Installation

1. **Modifier le fichier .env**
```bash
nano /home/LexiaV3/public_html/.env
```

Remplacez les valeurs suivantes :
- `EMAIL_USER` : Votre email Gmail
- `EMAIL_PASS` : Mot de passe d'application Gmail
- `STRIPE_SECRET_KEY` : Votre clé secrète Stripe
- `STRIPE_WEBHOOK_SECRET` : Votre secret webhook Stripe

2. **Configurer SSL dans CyberPanel**
- Connectez-vous à CyberPanel (https://votre-serveur:8090)
- Allez dans "Websites" > "List Websites"
- Cliquez sur "Manage" pour votre domaine
- Activez SSL avec Let's Encrypt

### Commandes Utiles

#### Monitoring
```bash
# Voir l'état des conteneurs
docker ps

# Voir les logs en temps réel
cd /home/LexiaV3/public_html
docker-compose logs -f

# Script de monitoring complet
/home/LexiaV3/monitor.sh
```

#### Maintenance
```bash
# Faire un backup manuel
/home/LexiaV3/backup.sh

# Mettre à jour l'application
/home/LexiaV3/update.sh

# Redémarrer les services
cd /home/LexiaV3/public_html
docker-compose restart
```

#### Dépannage
```bash
# Vérifier les logs d'erreur
docker-compose logs backend --tail=50
docker-compose logs frontend --tail=50

# Reconstruire un service spécifique
docker-compose up -d --build backend

# Accéder à MongoDB
docker exec -it LexiaV3-mongodb mongosh -u admin -p
```

### Structure des Dossiers

```
/home/LexiaV3/
├── public_html/          # Code source de l'application
│   ├── backend/         # API Node.js
│   ├── frontend/        # Application React
│   ├── .env            # Variables d'environnement
│   └── LexiaV3-docker-compose.yml
├── backups/            # Sauvegardes automatiques
├── logs/               # Logs de l'application
└── ssl/                # Certificats SSL
```

### Sauvegardes Automatiques

Les sauvegardes sont effectuées automatiquement chaque nuit à 2h00 et incluent :
- Base de données MongoDB
- Fichiers uploadés
- Configuration (.env)

Les sauvegardes sont conservées pendant 30 jours.

### Sécurité

- ✅ Firewall configuré
- ✅ Conteneurs Docker isolés
- ✅ Utilisateurs non-root dans les conteneurs
- ✅ Mots de passe générés aléatoirement
- ✅ HTTPS obligatoire
- ✅ Headers de sécurité configurés

### Support

En cas de problème :
1. Consultez les logs : `docker-compose logs`
2. Vérifiez l'état des services : `docker ps`
3. Consultez la documentation complète dans le dossier du projet

### Mise à Jour

Pour mettre à jour l'application :
```bash
/home/LexiaV3/update.sh
```

Ce script va :
1. Récupérer les dernières modifications depuis Git
2. Reconstruire les images Docker
3. Redémarrer les services
4. Nettoyer les anciennes images

---

**Note importante** : N'oubliez pas de modifier le fichier `.env` avec vos vraies valeurs avant de mettre l'application en production ! 