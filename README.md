# LexiaV3 - Assistant IA pour les difficultés d'apprentissage en mathématiques

LexiaV3 est une application web conçue pour aider les élèves souffrant de dyscalculie et de difficultés d'apprentissage en mathématiques.

## Configuration du projet

### Prérequis
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# MongoDB credentials
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=votre_mot_de_passe_mongodb

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
```

## Déploiement

### Avec Docker Compose

1. Clonez le dépôt
   ```bash
   git clone https://github.com/username/LexiaV3.git
   cd LexiaV3
   ```

2. Créez le fichier `.env` avec vos variables d'environnement

3. Construisez et démarrez les conteneurs
   ```bash
   docker-compose up -d
   ```

4. L'application sera accessible aux adresses suivantes :
   - Frontend : http://localhost:8083
   - Backend API : http://localhost:8089/api

### Sur un serveur de production (Almalinux/CyberPanel)

1. Clonez le dépôt sur votre serveur
   ```bash
   git clone https://github.com/username/LexiaV3.git
   cd LexiaV3
   ```

2. Créez le fichier `.env` avec vos variables d'environnement

3. Exécutez le script de déploiement
   ```bash
   ./deploy-lexiav3.sh
   ```

4. Configurez Nginx ou Apache pour rediriger vers les ports 8083 (frontend) et 8089 (backend)

## Structure du projet

- `/frontend` : Application React (Vite)
- `/backend` : API REST Node.js/Express
- `/docker-compose.yml` : Configuration Docker Compose

## Développement local

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev
```

## Licence

Propriétaire - Tous droits réservés

## 🎯 À propos

LexiaV3 est une application web innovante conçue pour aider les personnes atteintes de dyscalculie et de difficultés d'apprentissage en mathématiques. Utilisant l'intelligence artificielle, LexiaV3 offre un accompagnement personnalisé et adaptatif.

## 🚀 Fonctionnalités

- **Assistant IA Personnalisé** : Adaptation en temps réel aux besoins de l'utilisateur
- **Exercices Interactifs** : Gamme complète d'exercices mathématiques adaptés
- **Suivi de Progression** : Tableaux de bord détaillés pour suivre l'évolution
- **Interface Intuitive** : Design moderne et accessible
- **Multi-plateforme** : Accessible sur ordinateur, tablette et mobile

## 🛠️ Technologies

- **Frontend** : React 19, Vite, TailwindCSS
- **Backend** : Node.js, Express, MongoDB
- **IA** : Google Vertex AI, OpenAI API
- **Infrastructure** : Docker, CyberPanel, AlmaLinux

## 📋 Prérequis

- Node.js 18+
- MongoDB 7.0+
- Docker & Docker Compose
- Git

## 🔧 Installation

### Installation locale

```bash
# Cloner le repository
git clone https://github.com/tachfineamnay/LexiaV3.git
cd LexiaV3

# Installer les dépendances
npm run install:all

# Configurer les variables d'environnement
cp backend/env.example backend/.env
# Éditer backend/.env avec vos valeurs

# Lancer l'application en développement
npm run dev
```

### Déploiement sur serveur (CyberPanel/AlmaLinux)

```bash
# Télécharger et exécuter le script de déploiement
curl -s https://raw.githubusercontent.com/tachfineamnay/LexiaV3/main/LexiaV3-deploy.sh -o LexiaV3-deploy.sh
chmod +x LexiaV3-deploy.sh
sudo ./LexiaV3-deploy.sh
```

## 📚 Documentation

- [Guide de démarrage](./LexiaV3-GETTING_STARTED.md)
- [Guide de déploiement](./LexiaV3-DEPLOYMENT.md)
- [Documentation UX/UI](./LexiaV3-UX_DESIGN.md)
- [Résumé d'implémentation](./LexiaV3-IMPLEMENTATION_SUMMARY.md)

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez consulter notre guide de contribution avant de soumettre des pull requests.

## 📄 Licence

Ce projet est sous licence propriétaire. Tous droits réservés.

## 📞 Contact

- **Auteur** : Tachfine Amnay
- **Email** : contact@lexiav3.ai
- **Site Web** : [https://app.lexiav3.ai](https://app.lexiav3.ai)

---

Développé avec ❤️ pour aider les personnes atteintes de dyscalculie 