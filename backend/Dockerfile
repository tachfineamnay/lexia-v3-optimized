FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copier les fichiers de dépendances
COPY package*.json ./

# Nettoyer avant d'installer les dépendances
RUN rm -rf node_modules package-lock.json

# Installer les dépendances
RUN npm install --production

# Copier le code source
COPY . .

# Stage de production
FROM node:18-alpine

WORKDIR /usr/src/app

# Installer dumb-init pour une meilleure gestion des signaux
RUN apk add --no-cache dumb-init

# Créer un utilisateur non-root avec l'UID 1001
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs nodejs

# Créer les dossiers nécessaires avec les bonnes permissions
RUN mkdir -p uploads exports && \
    chown -R nodejs:nodejs /usr/src/app

# Copier depuis le builder
COPY --from=builder --chown=nodejs:nodejs /usr/src/app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

# Utiliser l'utilisateur non-root
USER nodejs

EXPOSE 8089

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
