# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier TOUT le code source
COPY . .

# Variables d'environnement pour le build
ARG VITE_API_URL=http://168.231.86.146:8089
ENV VITE_API_URL=$VITE_API_URL

# Build l'application
RUN echo "🔨 Building with API URL: $VITE_API_URL" && \
    npm run build && \
    echo "📁 Build completed, checking dist folder:" && \
    ls -la dist/ && \
    echo "📄 Index.html size:" && \
    ls -lh dist/index.html && \
    echo "✅ Build verification complete"

# Stage 2: Production
FROM nginx:alpine

# Supprimer TOUT le contenu par défaut de nginx
RUN rm -rf /usr/share/nginx/html/* && \
    rm -rf /etc/nginx/conf.d/default.conf

# Copier notre config nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés - FORCE LA COPIE
COPY --from=builder /app/dist/* /usr/share/nginx/html/
COPY --from=builder /app/dist/assets /usr/share/nginx/html/assets

# Vérification finale CRITIQUE
RUN echo "🔍 VERIFICATION FINALE:" && \
    echo "📁 Contenu de /usr/share/nginx/html:" && \
    ls -la /usr/share/nginx/html/ && \
    echo "📄 Taille index.html:" && \
    ls -lh /usr/share/nginx/html/index.html && \
    echo "📄 Premières lignes index.html:" && \
    head -5 /usr/share/nginx/html/index.html && \
    echo "✅ Si vous voyez 'Welcome to nginx', le build a ÉCHOUÉ !"

# Exposer le port 8083
EXPOSE 8083

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
