# LexiaV3 - Assistant IA pour Dyscalculie et Difficultés Mathématiques

## Présentation

LexiaV3 est une application intelligente dédiée à l'aide aux enfants et adultes souffrant de dyscalculie et de difficultés d'apprentissage en mathématiques. Utilisant des algorithmes d'intelligence artificielle avancés et des approches pédagogiques validées par la recherche, LexiaV3 fournit un environnement d'apprentissage personnalisé pour améliorer les compétences mathématiques fondamentales.

## Fonctionnalités principales

- **Évaluation cognitive** : Tests adaptatifs pour identifier les forces et faiblesses spécifiques
- **Apprentissage personnalisé** : Parcours d'apprentissage adaptés aux besoins individuels
- **Visualisation intuitive** : Représentations visuelles des concepts mathématiques
- **Feedback en temps réel** : Retours immédiats et encourageants pour renforcer l'apprentissage
- **Suivi des progrès** : Tableaux de bord pour visualiser l'évolution et les accomplissements
- **Mode multi-utilisateurs** : Gestion de plusieurs profils avec progression indépendante

## Architecture technique

LexiaV3 est construit avec une architecture moderne et évolutive :

- **Frontend** : React.js avec Vite et TailwindCSS
- **Backend** : Node.js/Express avec MongoDB
- **Déploiement** : Docker avec configuration optimisée pour CyberPanel
- **Sécurité** : JWT pour l'authentification, HTTPS, et bonnes pratiques OWASP

## Installation et déploiement

Voir les fichiers `LexiaV3-DEPLOYMENT.md` et `LexiaV3-GETTING_STARTED.md` pour les instructions détaillées d'installation et de déploiement.

Pour un déploiement rapide sur un serveur CyberPanel :

```bash
# En tant que root
wget https://raw.githubusercontent.com/tachfineamnay/LexiaV3/main/LexiaV3-deploy.sh
chmod +x LexiaV3-deploy.sh
./LexiaV3-deploy.sh
```

## Résolution des problèmes courants

### Erreur "unexpected character / in variable name"

Si vous rencontrez une erreur concernant un caractère inattendu dans le fichier .env :

```
failed to read /home/ialexia/public_html/.env: line 8: unexpected character "/" in variable name
```

Pas de souci ! Notre script de déploiement inclut désormais une correction automatique pour ce problème.
Exécutez simplement :

```bash
# En tant que root
wget https://raw.githubusercontent.com/tachfineamnay/LexiaV3/main/LexiaV3-deploy.sh
chmod +x LexiaV3-deploy.sh
./LexiaV3-deploy.sh
```

Le script détectera et corrigera automatiquement les problèmes dans le fichier .env.

### Migration de ialexia vers LexiaV3

Si vous avez déjà un déploiement avec l'ancien nom "ialexia", le script gère automatiquement la migration :

```bash
# En tant que root
cd /root
wget https://raw.githubusercontent.com/tachfineamnay/LexiaV3/main/LexiaV3-deploy.sh
chmod +x LexiaV3-deploy.sh
./LexiaV3-deploy.sh
```

Le script détectera l'installation existante et configurera les liens nécessaires pour une transition en douceur.

## Documentation

- `LexiaV3-GETTING_STARTED.md` - Guide de démarrage pour les développeurs
- `LexiaV3-DEPLOYMENT.md` - Instructions de déploiement détaillées
- `LexiaV3-UX_DESIGN.md` - Documentation sur l'expérience utilisateur
- `LexiaV3-IMPLEMENTATION_SUMMARY.md` - Résumé technique de l'implémentation

## Licence

© 2024 LexiaV3. Tous droits réservés. 