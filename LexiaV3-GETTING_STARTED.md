# Guide de Démarrage - LexiaV3

## 🚀 Démarrage Rapide

### 1. Configuration de l'environnement

Créez un fichier `.env` dans le dossier `backend/` avec les variables suivantes :

```env
# Configuration Serveur
NODE_ENV=development
PORT=5000

# Base de données
MONGODB_URI=mongodb://localhost:27017/LexiaV3

# Configuration JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# Configuration CORS
FRONTEND_URL=http://localhost:3001

# Configuration Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# Clé de chiffrement pour données sensibles
ENCRYPTION_KEY=cle-de-chiffrement-a-changer-en-production

# Configuration Refresh Token
REFRESH_TOKEN_SECRET=your-refresh-secret-key-here
```

### 2. Installation des dépendances

```bash
# Installation des dépendances backend et frontend
npm install

# Ou installation séparée
cd backend && npm install
cd ../frontend && npm install
```

### 3. Démarrage de l'application

```bash
# Depuis la racine du projet
npm run dev
```

L'application sera accessible à :
- Frontend : http://localhost:3001
- Backend API : http://localhost:5000

## 📋 Nouvelles Fonctionnalités

### Interface d'Administration

Accédez au tableau de bord administrateur : `/admin`

#### 1. **Configuration Système** (`/admin/config`)
- Gérez toutes les variables d'environnement depuis l'interface
- Catégories disponibles :
  - **Serveur** : Port, environnement, URL frontend
  - **Base de données** : URI MongoDB (chiffrée)
  - **Sécurité** : JWT Secret, clés de chiffrement
  - **API** : Clés OpenAI, Anthropic, Google (chiffrées)
  - **IA** : Configuration Vertex AI
  - **Email** : Configuration SMTP
  - **Stockage** : Répertoires et limites de fichiers

- Fonctionnalités :
  - ✅ Génération automatique de clés sécurisées
  - 🔒 Chiffrement des données sensibles
  - 🧪 Test des configurations (MongoDB, Email, Vertex AI)
  - 👁️ Affichage/masquage des mots de passe

#### 2. **Tableau de Bord Admin** (`/admin`)
- Vue d'ensemble des statistiques
- Alertes système
- Accès rapide aux sections d'administration
- État du système en temps réel

## 🔐 Sécurité

### Gestion des Clés

1. **JWT Secret** : 
   - Minimum 32 caractères
   - Générez une nouvelle clé via l'interface admin
   - Changez régulièrement en production

2. **Clés API** :
   - Stockées chiffrées dans la base de données
   - Utilisez l'interface admin pour les configurer
   - Ne jamais les committer dans Git

3. **Chiffrement** :
   - Les données sensibles sont chiffrées avec AES-256-GCM
   - Clé de chiffrement configurable via `ENCRYPTION_KEY`

## 🛠️ Développement

### Structure des Configurations

Les configurations sont stockées dans MongoDB via le modèle `SystemConfig` :
- Catégorisation par type
- Historique des modifications
- Chiffrement automatique des valeurs sensibles

### API Endpoints

```javascript
// Configuration
GET  /api/config/all              // Toutes les configurations (admin)
GET  /api/config/:category        // Configurations par catégorie
POST /api/config/:category        // Mise à jour des configurations
POST /api/config/test/:category   // Test d'une configuration
GET  /api/config/generate/:type   // Génération de clés sécurisées
```

## 🚨 Dépannage

### MongoDB non disponible
L'application peut fonctionner sans MongoDB pour le développement :
- Le serveur continue de fonctionner
- Certaines fonctionnalités seront limitées
- Un message d'avertissement s'affiche

### Port 3000 occupé
Le frontend utilise automatiquement le port 3001 si le 3000 est occupé.

### Erreurs de configuration
1. Vérifiez les logs dans la console
2. Utilisez l'interface admin pour corriger les configurations
3. Testez les configurations via les boutons de test

## 📝 Notes Importantes

1. **Premier Utilisateur Admin** :
   - Créez un compte via `/register`
   - Modifiez manuellement le rôle en `admin` dans MongoDB
   - Ou utilisez un script d'initialisation

2. **Production** :
   - Changez toutes les clés par défaut
   - Activez HTTPS
   - Configurez les variables d'environnement via l'interface admin
   - Sauvegardez régulièrement la base de données

3. **Développement** :
   - MongoDB optionnel pour les tests rapides
   - Utilisez les valeurs par défaut du `.env.example`
   - Les configurations sont rechargées à chaud

## 🆘 Support

En cas de problème :
1. Consultez les logs du serveur
2. Vérifiez les configurations via `/admin/config`
3. Testez les connexions (MongoDB, APIs externes)
4. Consultez la documentation technique dans `/docs` 