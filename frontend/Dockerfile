# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --include=dev

# Copy source files
COPY . .

# Build the application with proper environment
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL
ENV NODE_ENV=production

RUN npm run build

# Production stage with optimized nginx
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Create health check endpoint
RUN echo 'OK' > /usr/share/nginx/html/health.txt

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Enhanced health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/health.txt || exit 1

EXPOSE 80

# Use nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]
