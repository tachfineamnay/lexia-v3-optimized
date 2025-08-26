# Multi-stage build for optimized production image
FROM node:18-alpine AS dependencies

WORKDIR /app

# Install curl for health checks and other utilities
RUN apk add --no-cache curl dumb-init

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev for build)
RUN npm install

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install runtime dependencies only
RUN apk add --no-cache curl dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S lexia -u 1001

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p uploads exports logs && \
    chown -R lexia:nodejs uploads exports logs && \
    chmod -R 755 uploads exports logs

# Switch to non-root user
USER lexia

# Enhanced health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Expose port
EXPOSE 5000

# Set working directory
WORKDIR /app
COPY . .

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]

