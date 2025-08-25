#!/bin/bash

# LexiaV3 Coolify Deployment Script
# This script prepares and validates the deployment for Coolify

set -e  # Exit on any error

echo "🚀 Starting LexiaV3 deployment preparation for Coolify..."

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

# Check if required files exist
print_status "Checking required files..."

required_files=(
    "docker-compose.yml"
    "backend/Dockerfile"
    "frontend/Dockerfile"
    "backend/package.json"
    "frontend/package.json"
    "coolify.json"
    "coolify.env"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file missing: $file"
        exit 1
    fi
done

print_success "All required files found"

# Validate docker-compose.yml
print_status "Validating docker-compose.yml..."
if command -v docker-compose &> /dev/null; then
    docker-compose config > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_success "docker-compose.yml is valid"
    else
        print_error "docker-compose.yml validation failed"
        exit 1
    fi
else
    print_warning "docker-compose not found, skipping validation"
fi

# Check for environment variables template
print_status "Checking environment variables..."
if [ ! -f ".env.example" ] && [ ! -f "env.example" ]; then
    print_warning "No .env.example file found"
else
    print_success "Environment template found"
fi

# Validate Node.js versions
print_status "Checking Node.js requirements..."
node_version=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ ! -z "$node_version" ] && [ "$node_version" -ge 18 ]; then
    print_success "Node.js version $node_version is compatible"
else
    print_warning "Node.js 18+ required for local development"
fi

# Create deployment checklist
print_status "Creating deployment checklist..."
cat > DEPLOYMENT_CHECKLIST.md << 'EOL'
# 📋 LexiaV3 Coolify Deployment Checklist

## Pre-deployment Steps

### 1. GitHub Repository Setup
- [ ] Code pushed to GitHub repository
- [ ] Repository is public or accessible to Coolify
- [ ] Main branch is ready for deployment

### 2. Environment Variables (Set in Coolify Dashboard)
- [ ] `NODE_ENV=production`
- [ ] `DB_USER=lexia_admin`
- [ ] `DB_PASSWORD` (secure password)
- [ ] `JWT_SECRET` (32+ character secure string)
- [ ] `REFRESH_TOKEN_SECRET` (32+ character secure string)
- [ ] `OPENAI_API_KEY` (required)
- [ ] `ANTHROPIC_API_KEY` (optional)
- [ ] `GOOGLE_AI_API_KEY` (optional)
- [ ] `CORS_ORIGIN` (your frontend domain)
- [ ] `VITE_API_URL` (your backend domain)

### 3. Domain Configuration
- [ ] Frontend domain configured in Coolify
- [ ] Backend domain configured in Coolify
- [ ] SSL certificates enabled
- [ ] DNS records pointing to Coolify

### 4. Coolify Project Setup
- [ ] New project created in Coolify
- [ ] GitHub repository connected
- [ ] Docker Compose deployment type selected
- [ ] Environment variables configured
- [ ] Volume persistence enabled for database

## Post-deployment Verification

### 5. Health Checks
- [ ] Backend health endpoint accessible: `/api/health`
- [ ] Frontend loads correctly
- [ ] Database connection working
- [ ] Redis connection working

### 6. Functionality Tests
- [ ] User registration works
- [ ] User login works
- [ ] AI features functional
- [ ] Document upload works
- [ ] VAE generation works

### 7. Security Checks
- [ ] All default passwords changed
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] API rate limiting active

## Troubleshooting

### Common Issues
1. **Database Connection Failed**
   - Check MongoDB container is running
   - Verify MONGODB_URI environment variable
   - Check network connectivity between services

2. **AI Features Not Working**
   - Verify API keys are correctly set
   - Check API key permissions and quotas
   - Review backend logs for AI service errors

3. **Frontend Can't Connect to Backend**
   - Verify VITE_API_URL is correct
   - Check CORS_ORIGIN configuration
   - Ensure backend service is accessible

### Useful Commands
```bash
# Check container logs
docker logs lexia-backend
docker logs lexia-frontend
docker logs lexia-mongodb

# Check container status
docker ps

# Restart services
docker-compose restart
```

## Support
If you encounter issues, check:
1. Coolify logs
2. Container logs
3. GitHub repository issues
4. Documentation
EOL

print_success "Deployment checklist created: DEPLOYMENT_CHECKLIST.md"

# Generate environment template for Coolify
print_status "Generating Coolify environment template..."
cat > .env.coolify.template << 'EOL'
# Required Environment Variables for Coolify Deployment
# Copy these to your Coolify project's environment variables

NODE_ENV=production
DB_USER=lexia_admin
DB_PASSWORD=CHANGE_THIS_SECURE_PASSWORD
JWT_SECRET=CHANGE_THIS_TO_SECURE_32_CHAR_STRING
REFRESH_TOKEN_SECRET=CHANGE_THIS_TO_ANOTHER_SECURE_32_CHAR_STRING
OPENAI_API_KEY=sk-your-openai-api-key-here
CORS_ORIGIN=https://your-frontend-domain.com
VITE_API_URL=https://your-backend-domain.com

# Optional but recommended
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here
GOOGLE_AI_API_KEY=your-google-ai-api-key-here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-email-password
EOL

print_success "Environment template created: .env.coolify.template"

# Final recommendations
echo ""
print_status "🎉 Deployment preparation complete!"
echo ""
print_warning "⚠️  IMPORTANT SECURITY REMINDERS:"
echo "   1. Change all default passwords and secrets"
echo "   2. Use strong, unique passwords for production"
echo "   3. Enable HTTPS for all domains"
echo "   4. Regularly update dependencies"
echo ""
print_success "✅ Ready for Coolify deployment!"
echo ""
print_status "Next steps:"
echo "   1. Push this code to GitHub"
echo "   2. Create a new project in Coolify"
echo "   3. Connect your GitHub repository"
echo "   4. Configure environment variables using .env.coolify.template"
echo "   5. Deploy and verify using DEPLOYMENT_CHECKLIST.md"
echo ""
print_success "🚀 Happy deploying!"