# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Nettoyer et installer les dépendances
RUN rm -rf node_modules package-lock.json && \
    npm install

# Copier le code source
COPY . .

# Build de l'application avec variables d'environnement
ARG VITE_API_URL=http://168.231.86.146:8089
ENV VITE_API_URL=$VITE_API_URL

# Debug: Afficher l'URL de l'API
RUN echo "Building with API URL: $VITE_API_URL"

RUN npm run build

# Vérifier que le build existe
RUN ls -la dist/

# Stage 2: Production
FROM nginx:alpine

# Installer curl pour les health checks
RUN apk add --no-cache curl

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés depuis le stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Vérifier que les fichiers sont copiés
RUN ls -la /usr/share/nginx/html/

# Exposer le port 8083 (correspond à nginx.conf)
EXPOSE 8083

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
