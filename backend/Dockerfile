FROM node:18-alpine

WORKDIR /app

# Installer curl pour les health checks
RUN apk add --no-cache curl

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --production

# Copier le code source
COPY . .

# Créer les dossiers nécessaires avec les bonnes permissions
RUN mkdir -p uploads exports logs && \
    chmod 755 uploads exports logs

# Exposer le port
EXPOSE 8089

# Commande de démarrage avec logs de debug
CMD ["sh", "-c", "echo 'Starting LexiaV3 Backend...' && ls -la && npm start"]

