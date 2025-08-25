#!/bin/bash

# LexiaV3 Post-Deployment Test Script
# This script validates the deployment after it's live on Coolify

set -e

# Configuration
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
BACKEND_URL="${BACKEND_URL:-http://localhost:5000}"
TIMEOUT=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to print colored output
print_test() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Function to test URL with timeout
test_url() {
    local url=$1
    local expected_status=${2:-200}
    local timeout=${3:-$TIMEOUT}
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $timeout "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        return 0
    else
        return 1
    fi
}

# Function to test JSON endpoint
test_json_endpoint() {
    local url=$1
    local timeout=${2:-$TIMEOUT}
    
    local response=$(curl -s --max-time $timeout -H "Accept: application/json" "$url" 2>/dev/null)
    
    if echo "$response" | jq . >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

echo "🚀 Starting LexiaV3 Post-Deployment Tests"
echo "Frontend URL: $FRONTEND_URL"
echo "Backend URL: $BACKEND_URL"
echo ""

# Test counter
total_tests=0
passed_tests=0

# Frontend Tests
echo "🎨 Frontend Tests"
echo "=================="

print_test "Frontend accessibility"
total_tests=$((total_tests + 1))
if test_url "$FRONTEND_URL" 200; then
    print_pass "Frontend is accessible"
    passed_tests=$((passed_tests + 1))
else
    print_fail "Frontend is not accessible"
fi

print_test "Frontend health check"
total_tests=$((total_tests + 1))
if test_url "$FRONTEND_URL/health.txt" 200; then
    print_pass "Frontend health check passed"
    passed_tests=$((passed_tests + 1))
else
    print_fail "Frontend health check failed"
fi

print_test "Frontend static assets"
total_tests=$((total_tests + 1))
if test_url "$FRONTEND_URL/favicon.ico" 200; then
    print_pass "Static assets are served"
    passed_tests=$((passed_tests + 1))
else
    print_warn "Static assets test failed (may be normal)"
fi

# Backend Tests
echo ""
echo "⚙️  Backend Tests"
echo "=================="

print_test "Backend accessibility"
total_tests=$((total_tests + 1))
if test_url "$BACKEND_URL/api/health" 200; then
    print_pass "Backend is accessible"
    passed_tests=$((passed_tests + 1))
else
    print_fail "Backend is not accessible"
fi

print_test "Backend health endpoint JSON"
total_tests=$((total_tests + 1))
if test_json_endpoint "$BACKEND_URL/api/health"; then
    print_pass "Health endpoint returns valid JSON"
    passed_tests=$((passed_tests + 1))
else
    print_fail "Health endpoint JSON is invalid"
fi

print_test "Backend detailed health"
total_tests=$((total_tests + 1))
if test_url "$BACKEND_URL/api/health/detailed" 200; then
    print_pass "Detailed health endpoint works"
    passed_tests=$((passed_tests + 1))
else
    print_fail "Detailed health endpoint failed"
fi

print_test "API info endpoint"
total_tests=$((total_tests + 1))
if test_url "$BACKEND_URL/api" 200; then
    print_pass "API info endpoint works"
    passed_tests=$((passed_tests + 1))
else
    print_fail "API info endpoint failed"
fi

# Database Connection Test
echo ""
echo "🗄️  Database Tests"
echo "=================="

print_test "Database connection via health check"
total_tests=$((total_tests + 1))
health_response=$(curl -s "$BACKEND_URL/api/health" 2>/dev/null)
if echo "$health_response" | grep -q '"database":"healthy"'; then
    print_pass "Database connection is healthy"
    passed_tests=$((passed_tests + 1))
elif echo "$health_response" | grep -q '"database"'; then
    print_fail "Database connection issues detected"
else
    print_fail "Cannot determine database status"
fi

# AI Services Test
echo ""
echo "🤖 AI Services Tests"
echo "==================="

print_test "AI services configuration"
total_tests=$((total_tests + 1))
if echo "$health_response" | grep -q '"ai":"configured'; then
    print_pass "AI services are configured"
    passed_tests=$((passed_tests + 1))
elif echo "$health_response" | grep -q '"ai"'; then
    print_warn "AI services configuration unclear"
else
    print_fail "Cannot determine AI services status"
fi

# Security Tests
echo ""
echo "🔒 Security Tests"
echo "=================="

print_test "HTTPS redirect (if applicable)"
total_tests=$((total_tests + 1))
if [[ "$FRONTEND_URL" == https://* ]]; then
    http_url="${FRONTEND_URL/https:/http:}"
    redirect_response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$http_url" 2>/dev/null || echo "000")
    if [ "$redirect_response" = "301" ] || [ "$redirect_response" = "302" ]; then
        print_pass "HTTPS redirect is working"
        passed_tests=$((passed_tests + 1))
    else
        print_warn "HTTPS redirect not detected (may be handled by proxy)"
    fi
else
    print_warn "HTTPS not configured - test skipped"
fi

print_test "Security headers"
total_tests=$((total_tests + 1))
security_headers=$(curl -s -I "$FRONTEND_URL" 2>/dev/null | grep -i "x-frame-options\|x-content-type-options\|x-xss-protection")
if [ -n "$security_headers" ]; then
    print_pass "Security headers are present"
    passed_tests=$((passed_tests + 1))
else
    print_warn "Security headers not detected"
fi

# Performance Tests
echo ""
echo "⚡ Performance Tests"
echo "==================="

print_test "Frontend response time"
total_tests=$((total_tests + 1))
frontend_time=$(curl -o /dev/null -s -w "%{time_total}" --max-time 10 "$FRONTEND_URL" 2>/dev/null || echo "999")
if (( $(echo "$frontend_time < 3.0" | bc -l) )); then
    print_pass "Frontend responds in ${frontend_time}s (< 3s)"
    passed_tests=$((passed_tests + 1))
else
    print_warn "Frontend slow response: ${frontend_time}s"
fi

print_test "Backend response time"
total_tests=$((total_tests + 1))
backend_time=$(curl -o /dev/null -s -w "%{time_total}" --max-time 10 "$BACKEND_URL/api/health" 2>/dev/null || echo "999")
if (( $(echo "$backend_time < 2.0" | bc -l) )); then
    print_pass "Backend responds in ${backend_time}s (< 2s)"
    passed_tests=$((passed_tests + 1))
else
    print_warn "Backend slow response: ${backend_time}s"
fi

# Summary
echo ""
echo "📊 Test Summary"
echo "================"
echo "Total tests: $total_tests"
echo "Passed: $passed_tests"
echo "Failed: $((total_tests - passed_tests))"

pass_rate=$(echo "scale=1; $passed_tests * 100 / $total_tests" | bc)
echo "Pass rate: ${pass_rate}%"

if [ "$passed_tests" -eq "$total_tests" ]; then
    print_pass "🎉 All tests passed! Deployment is successful."
    exit 0
elif [ "$pass_rate" -ge 80 ]; then
    print_warn "⚠️  Most tests passed. Review failed tests."
    exit 0
else
    print_fail "❌ Multiple tests failed. Deployment may have issues."
    exit 1
fi