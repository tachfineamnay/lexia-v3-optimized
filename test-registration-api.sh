#!/bin/bash
# Script de test de l'API d'inscription Lexia V4
# Utilisation: bash test-registration-api.sh

echo "🧪 Tests d'API - Inscription Lexia V4"
echo "===================================="

# Configuration
API_BASE="http://localhost:5000/api"
REGISTER_ENDPOINT="$API_BASE/auth/register"

echo ""
echo "📍 Endpoint testé: $REGISTER_ENDPOINT"
echo ""

# Test 1: Inscription réussie (format frontend)
echo "✅ Test 1: Inscription réussie (firstName/lastName)"
echo "curl -X POST $REGISTER_ENDPOINT -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"password\":\"12345678\",\"firstName\":\"Jean\",\"lastName\":\"Dupont\"}'"
echo ""

# Test 2: Format legacy
echo "✅ Test 2: Format legacy (prenom/nom)"
echo "curl -X POST $REGISTER_ENDPOINT -H 'Content-Type: application/json' -d '{\"email\":\"legacy@example.com\",\"password\":\"12345678\",\"prenom\":\"Marie\",\"nom\":\"Martin\"}'"
echo ""

# Test 3: Format name unique
echo "✅ Test 3: Format name unique"
echo "curl -X POST $REGISTER_ENDPOINT -H 'Content-Type: application/json' -d '{\"email\":\"name@example.com\",\"password\":\"12345678\",\"name\":\"Pierre Durand\"}'"
echo ""

# Test 4: Champs manquants
echo "❌ Test 4: Champs manquants (doit retourner 400)"
echo "curl -X POST $REGISTER_ENDPOINT -H 'Content-Type: application/json' -d '{\"email\":\"incomplete@example.com\"}'"
echo ""

# Test 5: Email invalide
echo "❌ Test 5: Email invalide (doit retourner 400)"
echo "curl -X POST $REGISTER_ENDPOINT -H 'Content-Type: application/json' -d '{\"email\":\"invalid-email\",\"password\":\"12345678\",\"firstName\":\"Test\",\"lastName\":\"User\"}'"
echo ""

# Test 6: Mot de passe trop court
echo "❌ Test 6: Mot de passe trop court (doit retourner 400)"
echo "curl -X POST $REGISTER_ENDPOINT -H 'Content-Type: application/json' -d '{\"email\":\"short@example.com\",\"password\":\"123\",\"firstName\":\"Test\",\"lastName\":\"User\"}'"
echo ""

echo "📋 Réponse attendue pour succès (201):"
echo "{"
echo "  \"success\": true,"
echo "  \"message\": \"Utilisateur créé avec succès. Veuillez vérifier votre email pour activer votre compte.\","
echo "  \"token\": \"eyJhbGciOiJIUzI1NiIs....\","
echo "  \"refreshToken\": \"eyJhbGciOiJIUzI1NiIs....\","
echo "  \"user\": {"
echo "    \"firstName\": \"Jean\","
echo "    \"lastName\": \"Dupont\","
echo "    \"email\": \"test@example.com\","
echo "    \"role\": \"user\","
echo "    \"isEmailVerified\": false,"
echo "    ..."
echo "  }"
echo "}"
echo ""

echo "📋 Réponse attendue pour erreur (400):"
echo "{"
echo "  \"success\": false,"
echo "  \"message\": \"Email, mot de passe, prénom et nom sont requis\""
echo "}"
echo ""

# Si exécuté avec --run, lance les tests
if [ "$1" = "--run" ]; then
    echo "🚀 Exécution des tests..."
    echo ""
    
    echo "Test 1: Inscription réussie"
    curl -X POST $REGISTER_ENDPOINT \
         -H "Content-Type: application/json" \
         -d '{"email":"test@example.com","password":"12345678","firstName":"Jean","lastName":"Dupont"}' \
         -w "\nStatut HTTP: %{http_code}\n" \
         -s | jq . 2>/dev/null || echo "Réponse reçue (jq non disponible)"
    echo ""
    
    echo "Test 4: Champs manquants"
    curl -X POST $REGISTER_ENDPOINT \
         -H "Content-Type: application/json" \
         -d '{"email":"incomplete@example.com"}' \
         -w "\nStatut HTTP: %{http_code}\n" \
         -s | jq . 2>/dev/null || echo "Réponse reçue (jq non disponible)"
    echo ""
fi

echo "ℹ️  Pour exécuter les tests automatiquement: bash test-registration-api.sh --run"