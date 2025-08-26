#!/bin/bash

# Local Docker Build and Test Script for LexiaV4 Backend

echo "🏗️ Building LexiaV4 Backend Docker Image..."

# Build the Docker image
docker build -t lexiav4-backend-test -f Dockerfile .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo "✅ Docker build successful!"

echo "🚀 Starting container for testing..."

# Run the container with minimal environment variables
docker run -d \
    --name lexiav4-test \
    -p 5000:5000 \
    -e NODE_ENV=production \
    -e PORT=5000 \
    -e HOST=0.0.0.0 \
    -e MONGODB_URI=mongodb://localhost:27017/lexiav4 \
    lexiav4-backend-test

if [ $? -ne 0 ]; then
    echo "❌ Failed to start container!"
    exit 1
fi

echo "⏳ Waiting for application to start..."
sleep 10

echo "📋 Container logs:"
docker logs lexiav4-test

echo ""
echo "🧪 Testing endpoints..."

# Test basic API endpoint
echo "Testing /api endpoint:"
curl -s http://localhost:5000/api | jq '.' || echo "Failed to reach /api"

echo ""
echo "Testing /api/test endpoint:"
curl -s http://localhost:5000/api/test | jq '.' || echo "Failed to reach /api/test"

echo ""
echo "Testing /api/health endpoint:"
curl -s http://localhost:5000/api/health | jq '.' || echo "Failed to reach /api/health"

echo ""
echo "🧹 Cleaning up..."
docker stop lexiav4-test
docker rm lexiav4-test

echo "✅ Test completed!"