# Coolify Environment Variables Setup

## Required Environment Variables for LexiaV4 Backend

### Database Configuration
```
MONGODB_URI=mongodb://username:password@your-mongodb-host:27017/lexiav4?authSource=admin
```
**Note**: Replace with your actual MongoDB connection string

### Basic Application Settings
```
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
```

### Security Settings
```
JWT_SECRET=your-super-secret-jwt-key-here
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-here
CORS_ORIGIN=https://your-frontend-domain.com
```

### AI API Keys (Optional)
```
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

## Coolify Configuration Steps

1. **In Coolify Dashboard:**
   - Go to your backend application
   - Navigate to "Environment Variables" section
   - Add each variable above with appropriate values

2. **MongoDB Setup:**
   - If using Coolify's MongoDB service: `mongodb://lexia:password@mongodb:27017/lexiav4?authSource=admin`
   - If using external MongoDB: Use your external connection string

3. **Port Configuration:**
   - Ensure port 5000 is exposed in Coolify
   - Set internal port to 5000

4. **Health Check:**
   - URL: `/api/health`
   - Port: 5000
   - Method: GET

## Testing After Deployment

1. **Basic API Test:**
   ```
   curl https://your-backend-domain.com/api/test
   ```

2. **Health Check:**
   ```
   curl https://your-backend-domain.com/api/health
   ```

3. **API Info:**
   ```
   curl https://your-backend-domain.com/api
   ```

## Troubleshooting

### Empty Container Logs
- Check if all required environment variables are set
- Verify MongoDB connection string format
- Ensure MongoDB service is running and accessible

### Health Check Failures
- Verify the application is binding to 0.0.0.0:5000
- Check if `/api/health` endpoint is accessible
- Review container logs for startup errors

### Route Errors
- Check if all route files exist in backend/routes/
- Verify middleware files exist in backend/middleware/
- Look for missing dependencies in package.json