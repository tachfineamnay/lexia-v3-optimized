#!/bin/bash

# Fix Frontend Deployment Script for LexiaV3
# This script ensures the frontend is properly built and deployed

set -e

echo "🚀 Starting Frontend Deployment Fix..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Stop any running containers
print_status "Stopping existing containers..."
docker-compose down || true

# Step 2: Clean up old images
print_status "Cleaning up old images..."
docker image prune -f || true

# Step 3: Build with no cache to ensure fresh build
print_status "Building frontend with no cache..."
docker-compose build --no-cache frontend

# Step 4: Start the application
print_status "Starting the application..."
docker-compose up -d

# Step 5: Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 10

# Step 6: Check if frontend is serving correctly
print_status "Checking frontend service..."
if curl -f http://localhost:8083/health.txt > /dev/null 2>&1; then
    print_success "Frontend health check passed!"
else
    print_error "Frontend health check failed!"
    exit 1
fi

# Step 7: Test if the application loads properly
print_status "Testing application loading..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8083/)
if [ "$response" = "200" ]; then
    print_success "Frontend is serving content correctly!"
else
    print_error "Frontend is not serving content properly (HTTP $response)"
    exit 1
fi

# Step 8: Show running containers
print_status "Current running containers:"
docker-compose ps

print_success "✅ Frontend deployment fix completed successfully!"
echo ""
echo "🌐 Access your application at:"
echo "   - Frontend: http://localhost:8083"
echo "   - Backend: http://localhost:5000"
echo ""
echo "📋 For Coolify deployment:"
echo "   1. Push these changes to your repository"
echo "   2. Trigger a new deployment in Coolify"
echo "   3. Verify the VITE_API_URL environment variable is set correctly"
echo "   4. Check that the frontend service is mapped to the correct port (8083)"