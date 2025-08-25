#!/bin/bash

# LexiaV3 Deployment Configuration Validator
# Script pour vérifier que tout est prêt pour le déploiement Coolify

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 LexiaV3 Deployment Configuration Validator${NC}"
echo "=================================================="
echo ""

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1 exists"
        return 0
    else
        echo -e "${RED}❌${NC} $1 is missing"
        return 1
    fi
}

# Function to check directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅${NC} Directory $1 exists"
        return 0
    else
        echo -e "${RED}❌${NC} Directory $1 is missing"
        return 1
    fi
}

# Function to check JSON syntax
check_json() {
    if jq . "$1" >/dev/null 2>&1; then
        echo -e "${GREEN}✅${NC} $1 has valid JSON syntax"
        return 0
    else
        echo -e "${RED}❌${NC} $1 has invalid JSON syntax"
        return 1
    fi
}

# Initialize counters
total_checks=0
passed_checks=0

echo "📁 Checking File Structure"
echo "=========================="

# Check essential files
files=(
    ".github/workflows/deploy.yml"
    "coolify.json"
    "docker-compose.yml"
    "backend/Dockerfile"
    "frontend/Dockerfile"
    "backend/package.json"
    "frontend/package.json"
    "test-deployment.sh"
    "deploy-coolify.sh"
)

for file in "${files[@]}"; do
    total_checks=$((total_checks + 1))
    if check_file "$file"; then
        passed_checks=$((passed_checks + 1))
    fi
done

# Check directories
echo ""
echo "📂 Checking Directory Structure"
echo "==============================="

dirs=(
    "backend/models"
    "backend/routes"
    "backend/services"
    "backend/middleware"
    "frontend/src"
    "frontend/src/components"
    "frontend/src/pages"
)

for dir in "${dirs[@]}"; do
    total_checks=$((total_checks + 1))
    if check_dir "$dir"; then
        passed_checks=$((passed_checks + 1))
    fi
done

# Check JSON files
echo ""
echo "📋 Checking JSON Configuration"
echo "=============================="

json_files=(
    "coolify.json"
    "backend/package.json"
    "frontend/package.json"
)

for json_file in "${json_files[@]}"; do
    if [ -f "$json_file" ]; then
        total_checks=$((total_checks + 1))
        if check_json "$json_file"; then
            passed_checks=$((passed_checks + 1))
        fi
    fi
done

# Check Docker configuration
echo ""
echo "🐳 Checking Docker Configuration"
echo "================================"

# Check if docker-compose.yml has required services
total_checks=$((total_checks + 1))
if grep -q "mongodb:" docker-compose.yml && grep -q "redis:" docker-compose.yml && grep -q "backend:" docker-compose.yml && grep -q "frontend:" docker-compose.yml; then
    echo -e "${GREEN}✅${NC} docker-compose.yml has all required services"
    passed_checks=$((passed_checks + 1))
else
    echo -e "${RED}❌${NC} docker-compose.yml is missing required services"
fi

# Check Dockerfiles
total_checks=$((total_checks + 1))
if grep -q "FROM node" backend/Dockerfile && grep -q "FROM node" frontend/Dockerfile; then
    echo -e "${GREEN}✅${NC} Dockerfiles are properly configured"
    passed_checks=$((passed_checks + 1))
else
    echo -e "${RED}❌${NC} Dockerfiles configuration issues"
fi

# Check GitHub Actions workflow
echo ""
echo "🔄 Checking GitHub Actions"
echo "=========================="

total_checks=$((total_checks + 1))
if grep -q "Deploy to Coolify" .github/workflows/deploy.yml; then
    echo -e "${GREEN}✅${NC} GitHub Actions workflow is configured"
    passed_checks=$((passed_checks + 1))
else
    echo -e "${RED}❌${NC} GitHub Actions workflow issues"
fi

total_checks=$((total_checks + 1))
if grep -q "tachfineamnay" .github/workflows/deploy.yml; then
    echo -e "${GREEN}✅${NC} GitHub username is correctly configured"
    passed_checks=$((passed_checks + 1))
else
    echo -e "${RED}❌${NC} GitHub username needs to be configured"
fi

# Check executable permissions
echo ""
echo "🔐 Checking Permissions"
echo "======================="

total_checks=$((total_checks + 1))
if [ -x "test-deployment.sh" ]; then
    echo -e "${GREEN}✅${NC} test-deployment.sh is executable"
    passed_checks=$((passed_checks + 1))
else
    echo -e "${YELLOW}⚠️${NC} test-deployment.sh is not executable (will be fixed during deployment)"
fi

total_checks=$((total_checks + 1))
if [ -x "deploy-coolify.sh" ]; then
    echo -e "${GREEN}✅${NC} deploy-coolify.sh is executable"
    passed_checks=$((passed_checks + 1))
else
    echo -e "${YELLOW}⚠️${NC} deploy-coolify.sh is not executable (may need chmod +x)"
fi

# Summary
echo ""
echo "📊 Validation Summary"
echo "===================="
echo -e "Total checks: ${BLUE}$total_checks${NC}"
echo -e "Passed: ${GREEN}$passed_checks${NC}"
echo -e "Failed: ${RED}$((total_checks - passed_checks))${NC}"

if [ $passed_checks -eq $total_checks ]; then
    echo -e "${GREEN}🎉 All checks passed! Ready for deployment!${NC}"
    exit 0
elif [ $passed_checks -gt $((total_checks * 80 / 100)) ]; then
    echo -e "${YELLOW}⚠️ Most checks passed. Review failed items before deployment.${NC}"
    exit 1
else
    echo -e "${RED}❌ Multiple issues found. Please fix before deployment.${NC}"
    exit 2
fi