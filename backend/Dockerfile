FROM node:18-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p uploads exports logs && \
    chmod -R 755 uploads exports logs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]

