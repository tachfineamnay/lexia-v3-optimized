# Multi-stage build for React frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
# VITE_API_URL must be passed as a build argument.
# Example: --build-arg VITE_API_URL=https://api.example.com
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
ENV NODE_ENV=production

# Validate that the API URL was provided
RUN if [ -z "$VITE_API_URL" ]; then \
  echo "Error: VITE_API_URL build-arg is required." >&2; \
  exit 1; \
  fi

# Log the API URL being used for the build
RUN echo "Building with VITE_API_URL: $VITE_API_URL"

# Build the production app
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Create nginx configuration inline
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
  echo '    listen 80;' >> /etc/nginx/conf.d/default.conf && \
  echo '    server_name _;' >> /etc/nginx/conf.d/default.conf && \
  echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
  echo '    index index.html;' >> /etc/nginx/conf.d/default.conf && \
  echo '' >> /etc/nginx/conf.d/default.conf && \
  echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
  echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
  echo '    }' >> /etc/nginx/conf.d/default.conf && \
  echo '' >> /etc/nginx/conf.d/default.conf && \
  echo '    location /health.txt {' >> /etc/nginx/conf.d/default.conf && \
  echo '        access_log off;' >> /etc/nginx/conf.d/default.conf && \
  echo '    }' >> /etc/nginx/conf.d/default.conf && \
  echo '}' >> /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add health check file
RUN echo "OK" > /usr/share/nginx/html/health.txt

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
  chmod -R 755 /usr/share/nginx/html

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/health.txt || exit 1

# Expose port
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]