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

# Build de l'application
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copier la configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés depuis le stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer le port 8080
EXPOSE 8080

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
