# LexiaV3 - Assistant IA pour la Validation des Acquis de l'Expérience

## 🚀 Déploiement Rapide

### Prérequis
- Docker et Docker Compose installés
- Un serveur Linux (Ubuntu/Debian recommandé)
- Nom de domaine configuré (optionnel)

### Installation

1. **Cloner le projet**
```bash
git clone https://github.com/votre-repo/LexiaV3.git
cd LexiaV3
```

2. **Configurer l'environnement**
```bash
cp backend/env.example .env
# Éditer .env avec vos paramètres
nano .env
```

3. **Déployer l'application**
```bash
# Pour un déploiement propre (recommandé)
sudo bash clean-and-deploy.sh

# Ou pour un déploiement standard
sudo bash deploy-lexiav3.sh
```

### 🔧 Scripts Utiles

- `clean-and-deploy.sh` : Nettoie complètement et redéploie (résout les problèmes de cache)
- `deploy-lexiav3.sh` : Déploiement standard
- `check-deployment.sh` : Diagnostic de l'installation
- `cleanup-project.sh` : Nettoie les fichiers obsolètes

### 📋 Vérification

```bash
# Vérifier le statut
sudo bash check-deployment.sh

# Voir les logs
docker-compose logs -f
```

### 🌐 Accès

- Frontend: http://localhost:8083
- Backend API: http://localhost:8089/api
- Health Check: http://localhost:8089/api/health

### ⚠️ Résolution des Problèmes

**L'ancienne version persiste ?**
1. Exécutez `sudo bash clean-and-deploy.sh`
2. Videz le cache du navigateur (Ctrl+F5)
3. Utilisez la navigation privée

**Erreur Docker ?**
```bash
# Redémarrer Docker
sudo systemctl restart docker

# Nettoyer Docker
docker system prune -af
```

### 🔒 Sécurité

1. Changez tous les mots de passe dans `.env`
2. Configurez HTTPS avec Let's Encrypt
3. Limitez l'accès aux ports avec un firewall

### 📞 Support

Pour toute question, consultez la documentation ou ouvrez une issue sur GitHub.

---
© 2025 LexiaV3 - Développé par Tachfine Amnay
