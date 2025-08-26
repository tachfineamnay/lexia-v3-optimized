# Production-ready Node.js backend
FROM node:18-alpine

WORKDIR /app

# Install curl for health checks and dumb-init for signal handling
RUN apk add --no-cache curl dumb-init && \
    addgroup -g 1001 -S nodejs && \
    adduser -S lexia -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production && npm cache clean --force

# Copy all backend source code
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p uploads exports logs && \
    chown -R lexia:nodejs . && \
    chmod -R 755 uploads exports logs

# Switch to non-root user
USER lexia

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Expose port
EXPOSE 5000

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

