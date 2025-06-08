# Étape de build
FROM node:18-alpine AS builder

WORKDIR /app

# Arguments de build
ARG VITE_API_URL

# Copie des fichiers de dépendances
COPY package*.json ./
RUN npm install

# Copie du reste des fichiers
COPY . .

# Construction de l'application React/Vite
RUN npm run build

# Étape finale : servir l'application avec un serveur léger
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
RUN npm install -g serve
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]