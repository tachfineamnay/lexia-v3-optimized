# Stage 1: Build
FROM node:18-alpine AS builder

# Install dependencies for node-gyp
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy all source files
COPY . .

# Set build-time variables
ARG VITE_API_URL=http://168.231.86.146:8089
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN echo "🚀 Starting build process..." && \
    echo "📍 API URL: $VITE_API_URL" && \
    npm run build && \
    echo "✅ Build completed successfully!" && \
    echo "📁 Dist folder contents:" && \
    ls -la dist/ && \
    echo "📄 Index.html details:" && \
    ls -lh dist/index.html && \
    cat dist/index.html | head -10

# Stage 2: Production
FROM nginx:alpine

# Install curl for healthchecks
RUN apk add --no-cache curl

# Remove ALL default nginx content
RUN rm -rf /usr/share/nginx/html/* && \
    rm -f /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Verify the copy worked
RUN echo "🔍 Final verification:" && \
    echo "📁 Contents of /usr/share/nginx/html:" && \
    ls -la /usr/share/nginx/html/ && \
    echo "📄 Index.html size (MUST be ~1.4KB, NOT 625 bytes):" && \
    ls -lh /usr/share/nginx/html/index.html && \
    echo "📄 First lines of index.html:" && \
    head -10 /usr/share/nginx/html/index.html && \
    echo "✅ If you see 'Welcome to nginx' above, the build FAILED!"

# Create a health check file
RUN echo "healthy" > /usr/share/nginx/html/health.txt

# Expose port
EXPOSE 8083

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
