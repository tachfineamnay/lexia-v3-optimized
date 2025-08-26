@echo off
REM Local Docker Build and Test Script for LexiaV4 Backend (Windows)

echo 🏗️ Building LexiaV4 Backend Docker Image...

REM Build the Docker image
docker build -t lexiav4-backend-test -f Dockerfile .

if %ERRORLEVEL% neq 0 (
    echo ❌ Docker build failed!
    exit /b 1
)

echo ✅ Docker build successful!

echo 🚀 Starting container for testing...

REM Run the container with minimal environment variables
docker run -d --name lexiav4-test -p 5000:5000 -e NODE_ENV=production -e PORT=5000 -e HOST=0.0.0.0 -e MONGODB_URI=mongodb://localhost:27017/lexiav4 lexiav4-backend-test

if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to start container!
    exit /b 1
)

echo ⏳ Waiting for application to start...
timeout /t 10 /nobreak > nul

echo 📋 Container logs:
docker logs lexiav4-test

echo.
echo 🧪 Testing endpoints...

REM Test basic API endpoint
echo Testing /api endpoint:
curl -s http://localhost:5000/api || echo Failed to reach /api

echo.
echo Testing /api/test endpoint:
curl -s http://localhost:5000/api/test || echo Failed to reach /api/test

echo.
echo Testing /api/health endpoint:
curl -s http://localhost:5000/api/health || echo Failed to reach /api/health

echo.
echo 🧹 Cleaning up...
docker stop lexiav4-test
docker rm lexiav4-test

echo ✅ Test completed!
pause