# Production-ready Node.js backend for Coolify deployment
FROM node:18-alpine

WORKDIR /app

# Install system dependencies with retry and timeout settings
RUN set -eux; \
    apk update --no-cache; \
    apk add --no-cache --virtual .build-deps curl dumb-init; \
    addgroup -g 1001 -S nodejs; \
    adduser -S lexia -u 1001

# Create app directory and set permissions
RUN mkdir -p /app uploads exports logs && \
    chown -R lexia:nodejs /app && \
    chmod -R 755 /app

# Copy package files from backend directory
COPY backend/package*.json ./

# Install dependencies with timeout and retry settings
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-timeout 300000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --only=production --no-audit --no-fund && \
    npm cache clean --force

# Copy all backend source code
COPY backend/ .

# Switch to non-root user
USER lexia

# Add environment variables for better logging
ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0
# Set minimal MongoDB URI to prevent startup failures
ENV MONGODB_URI=mongodb://localhost:27017/lexiav4

# Health check with very lenient timing for Coolify compatibility
HEALTHCHECK --interval=120s --timeout=30s --start-period=180s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Expose port
EXPOSE 5000

# Start the application with better logging
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]