# Script de test de l'API d'inscription Lexia V4
# Utilisation: .\test-registration-api.ps1

Write-Host "🧪 Tests d'API - Inscription Lexia V4" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Configuration
$ApiBase = "http://localhost:5000/api"
$RegisterEndpoint = "$ApiBase/auth/register"

Write-Host ""
Write-Host "📍 Endpoint testé: $RegisterEndpoint" -ForegroundColor Yellow
Write-Host ""

# Headers
$Headers = @{
    "Content-Type" = "application/json"
}

Write-Host "✅ Tests de succès:" -ForegroundColor Green
Write-Host ""

# Test 1: Inscription réussie (format frontend)
Write-Host "Test 1: Inscription réussie (firstName/lastName)" -ForegroundColor White
$Body1 = @{
    email = "test@example.com"
    password = "12345678"
    firstName = "Jean"
    lastName = "Dupont"
} | ConvertTo-Json

Write-Host "PowerShell:" -ForegroundColor Gray
Write-Host "Invoke-RestMethod -Uri '$RegisterEndpoint' -Method POST -Headers @{'Content-Type'='application/json'} -Body '$($Body1 -replace '[\r\n]', '')'" -ForegroundColor DarkGray
Write-Host ""

# Test 2: Format legacy
Write-Host "Test 2: Format legacy (prenom/nom)" -ForegroundColor White
$Body2 = @{
    email = "legacy@example.com"
    password = "12345678"
    prenom = "Marie"
    nom = "Martin"
} | ConvertTo-Json

Write-Host "PowerShell:" -ForegroundColor Gray
Write-Host "Invoke-RestMethod -Uri '$RegisterEndpoint' -Method POST -Headers @{'Content-Type'='application/json'} -Body '$($Body2 -replace '[\r\n]', '')'" -ForegroundColor DarkGray
Write-Host ""

Write-Host "❌ Tests d'erreur:" -ForegroundColor Red
Write-Host ""

# Test 3: Champs manquants
Write-Host "Test 3: Champs manquants (doit retourner 400)" -ForegroundColor White
$Body3 = @{
    email = "incomplete@example.com"
} | ConvertTo-Json

Write-Host "PowerShell:" -ForegroundColor Gray
Write-Host "Invoke-RestMethod -Uri '$RegisterEndpoint' -Method POST -Headers @{'Content-Type'='application/json'} -Body '$($Body3 -replace '[\r\n]', '')'" -ForegroundColor DarkGray
Write-Host ""

# Test 4: Email invalide
Write-Host "Test 4: Email invalide (doit retourner 400)" -ForegroundColor White
$Body4 = @{
    email = "invalid-email"
    password = "12345678"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

Write-Host "PowerShell:" -ForegroundColor Gray
Write-Host "Invoke-RestMethod -Uri '$RegisterEndpoint' -Method POST -Headers @{'Content-Type'='application/json'} -Body '$($Body4 -replace '[\r\n]', '')'" -ForegroundColor DarkGray
Write-Host ""

Write-Host "📋 Réponse attendue pour succès (201):" -ForegroundColor Cyan
@"
{
  "success": true,
  "message": "Utilisateur créé avec succès. Veuillez vérifier votre email pour activer votre compte.",
  "token": "eyJhbGciOiJIUzI1NiIs....",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs....",
  "user": {
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "test@example.com",
    "role": "user",
    "isEmailVerified": false,
    ...
  }
}
"@ | Write-Host -ForegroundColor DarkGreen

Write-Host ""
Write-Host "📋 Réponse attendue pour erreur (400):" -ForegroundColor Cyan
@"
{
  "success": false,
  "message": "Email, mot de passe, prénom et nom sont requis"
}
"@ | Write-Host -ForegroundColor DarkRed

Write-Host ""

# Si exécuté avec -Run, lance les tests
param([switch]$Run)

if ($Run) {
    Write-Host "🚀 Exécution des tests..." -ForegroundColor Cyan
    Write-Host ""
    
    try {
        Write-Host "Test 1: Inscription réussie" -ForegroundColor Yellow
        $Response1 = Invoke-RestMethod -Uri $RegisterEndpoint -Method POST -Headers $Headers -Body $Body1
        Write-Host "✅ Succès - Status: 201" -ForegroundColor Green
        Write-Host ($Response1 | ConvertTo-Json -Depth 3) -ForegroundColor DarkGreen
    }
    catch {
        Write-Host "❌ Erreur - $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $StatusCode = $_.Exception.Response.StatusCode
            Write-Host "Status Code: $StatusCode" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Test 3: Champs manquants" -ForegroundColor Yellow
    try {
        $Response3 = Invoke-RestMethod -Uri $RegisterEndpoint -Method POST -Headers $Headers -Body $Body3
        Write-Host "❌ Inattendu - Devrait retourner 400" -ForegroundColor Red
        Write-Host ($Response3 | ConvertTo-Json -Depth 3) -ForegroundColor DarkRed
    }
    catch {
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode -eq 400) {
            Write-Host "✅ Erreur 400 comme attendu" -ForegroundColor Green
            try {
                $ErrorStream = $_.Exception.Response.GetResponseStream()
                $Reader = New-Object System.IO.StreamReader($ErrorStream)
                $ErrorContent = $Reader.ReadToEnd()
                Write-Host $ErrorContent -ForegroundColor DarkYellow
            }
            catch {
                Write-Host "Impossible de lire le contenu de l'erreur" -ForegroundColor DarkRed
            }
        }
        else {
            Write-Host "❌ Erreur inattendue - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}
else {
    Write-Host "ℹ️  Pour exécuter les tests automatiquement: .\test-registration-api.ps1 -Run" -ForegroundColor Cyan
}