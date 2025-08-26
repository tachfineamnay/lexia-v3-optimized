# Production-ready Node.js backend for Coolify deployment
FROM node:18-alpine

WORKDIR /app

# Install curl for health checks and dumb-init for signal handling
RUN apk add --no-cache curl dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S lexia -u 1001

# Create app directory and set permissions
RUN mkdir -p /app && chown lexia:nodejs /app

# Copy package files from backend directory
COPY backend/package*.json ./

# Install dependencies
RUN npm install --only=production && npm cache clean --force

# Copy all backend source code
COPY backend/ .

# Create necessary directories with proper permissions
RUN mkdir -p uploads exports logs && \
    chown -R lexia:nodejs /app && \
    chmod -R 755 uploads exports logs

# Switch to non-root user
USER lexia

# Add environment variables for better logging
ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Health check with more lenient timing (temporarily disabled for debugging)
# HEALTHCHECK --interval=60s --timeout=30s --start-period=120s --retries=5 \
#   CMD curl -f http://localhost:5000/api/health || exit 1

# Expose port
EXPOSE 5000

# Start the application with better logging
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "echo 'Starting LexiaV4 application...' && node server.js"]