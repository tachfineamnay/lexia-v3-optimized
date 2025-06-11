# LexiaV3

Application web pour assister les utilisateurs dans la création de dossiers VAE (Validation des Acquis de l'Expérience).

## Structure du projet

- **frontend/** : Application React avec interface utilisateur moderne
- **backend/** : API Node.js/Express avec authentification et gestion des dossiers

## Fonctionnalités principales

- Système d'authentification complet avec vérification d'email
- Interface utilisateur intuitive pour la création de dossiers VAE
- Stockage sécurisé des documents et informations utilisateur
- Système de récupération de mot de passe

## Installation

### Prérequis

- Node.js 14+
- MongoDB
- Docker (optionnel)

### Installation locale

```bash
# Installer les dépendances du projet
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Modifiez le fichier .env avec vos configurations

# Démarrer le projet
docker-compose up
```

## Déploiement

Le projet peut être déployé en utilisant Docker et docker-compose:

```bash
docker-compose up -d
```

## Licence

Tous droits réservés. 