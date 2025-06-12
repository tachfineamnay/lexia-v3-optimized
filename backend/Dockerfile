FROM node:18-alpine

WORKDIR /app

# Installer curl pour les health checks
RUN apk add --no-cache curl

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Créer les dossiers nécessaires
RUN mkdir -p uploads exports logs

# Exposer le port
EXPOSE 8089

# Commande de démarrage
CMD ["npm", "start"]

