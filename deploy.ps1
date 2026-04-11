# 🚀 InterviewMe Production Deployment Script (Windows)
# PowerShell script for automated deployment with safety checks

param(
    [string]$HerokuAppName = "interviewme-api-prod",
    [string]$HerokuRegion = "us"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 InterviewMe Production Deployment" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

function Print-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor White
}

# Check prerequisites
function Check-Prerequisites {
    Print-Info "Checking prerequisites..."
    
    # Check Heroku CLI
    if (-not (Get-Command heroku -ErrorAction SilentlyContinue)) {
        Print-Error "Heroku CLI not installed. Install from: https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    }
    Print-Success "Heroku CLI installed"
    
    # Check Git
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Print-Error "Git not installed"
        exit 1
    }
    Print-Success "Git installed"
    
    # Check Python
    if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
        Print-Error "Python not installed"
        exit 1
    }
    Print-Success "Python installed"
    
    # Check Heroku login
    try {
        heroku auth:whoami 2>&1 | Out-Null
        Print-Success "Logged into Heroku"
    } catch {
        Print-Error "Not logged into Heroku. Run: heroku login"
        exit 1
    }
    
    Write-Host ""
}

# Run tests
function Run-Tests {
    Print-Info "Running tests..."
    Set-Location backend
    
    try {
        python -m pytest tests/ -v --tb=short
        Print-Success "All tests passed"
    } catch {
        Print-Error "Tests failed. Fix issues before deploying."
        exit 1
    }
    
    Set-Location ..
    Write-Host ""
}

# Run production validation
function Run-Validation {
    Print-Info "Running production validation..."
    Set-Location backend
    
    try {
        python production_validation.py
        Print-Success "Production validation passed"
    } catch {
        Print-Error "Production validation failed"
        exit 1
    }
    
    Set-Location ..
    Write-Host ""
}

# Create Heroku app
function Create-HerokuApp {
    Print-Info "Checking Heroku app..."
    
    try {
        heroku apps:info -a $HerokuAppName 2>&1 | Out-Null
        Print-Success "Heroku app '$HerokuAppName' exists"
    } catch {
        Print-Warning "Heroku app '$HerokuAppName' doesn't exist. Creating..."
        heroku create $HerokuAppName --region $HerokuRegion
        Print-Success "Heroku app created"
    }
    
    Write-Host ""
}

# Add PostgreSQL
function Add-PostgreSQL {
    Print-Info "Checking PostgreSQL addon..."
    
    try {
        heroku addons:info heroku-postgresql -a $HerokuAppName 2>&1 | Out-Null
        Print-Success "PostgreSQL addon exists"
    } catch {
        Print-Warning "PostgreSQL addon doesn't exist. Adding..."
        heroku addons:create heroku-postgresql:essential-0 -a $HerokuAppName
        Print-Success "PostgreSQL addon added"
        Print-Info "Waiting for database to be ready..."
        Start-Sleep -Seconds 10
    }
    
    Write-Host ""
}

# Set environment variables
function Set-EnvVars {
    Print-Info "Setting environment variables..."
    
    # Check .env file
    if (-not (Test-Path "backend\.env")) {
        Print-Error "backend\.env file not found. Create it first."
        exit 1
    }
    
    # Read .env file
    $envVars = @{}
    Get-Content "backend\.env" | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $envVars[$matches[1]] = $matches[2]
        }
    }
    
    # Set environment
    heroku config:set ENVIRONMENT=production -a $HerokuAppName
    heroku config:set APP_DEBUG=False -a $HerokuAppName
    
    # Set JWT secret
    if (-not $envVars["JWT_SECRET"]) {
        Print-Warning "JWT_SECRET not set. Generating..."
        $bytes = New-Object byte[] 32
        [Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
        $JWT_SECRET = [BitConverter]::ToString($bytes).Replace("-", "").ToLower()
    } else {
        $JWT_SECRET = $envVars["JWT_SECRET"]
    }
    heroku config:set JWT_SECRET=$JWT_SECRET -a $HerokuAppName
    
    # Set Groq API
    if (-not $envVars["GROQ_API_KEY"]) {
        Print-Error "GROQ_API_KEY not set in .env"
        exit 1
    }
    heroku config:set GROQ_API_KEY=$envVars["GROQ_API_KEY"] -a $HerokuAppName
    heroku config:set GROQ_MODEL=$envVars["GROQ_MODEL"] -a $HerokuAppName
    
    # Set Redis
    if ($envVars["UPSTASH_REDIS_REST_URL"]) {
        heroku config:set UPSTASH_REDIS_REST_URL=$envVars["UPSTASH_REDIS_REST_URL"] -a $HerokuAppName
        heroku config:set UPSTASH_REDIS_REST_TOKEN=$envVars["UPSTASH_REDIS_REST_TOKEN"] -a $HerokuAppName
        heroku config:set REDIS_ENABLED=true -a $HerokuAppName
    }
    
    # Set CORS
    Print-Warning "Update CORS_ORIGINS with your frontend domain"
    heroku config:set CORS_ORIGINS='["https://your-frontend-domain.vercel.app"]' -a $HerokuAppName
    
    Print-Success "Environment variables set"
    Write-Host ""
}

# Deploy
function Deploy-App {
    Print-Info "Deploying to Heroku..."
    
    # Add Heroku remote
    $remotes = git remote
    if ($remotes -notcontains "heroku") {
        heroku git:remote -a $HerokuAppName
        Print-Success "Heroku remote added"
    }
    
    # Get current branch
    $currentBranch = git rev-parse --abbrev-ref HEAD
    Print-Info "Deploying from branch: $currentBranch"
    
    # Push to Heroku
    git push heroku "${currentBranch}:main"
    
    Print-Success "Deployment complete"
    Write-Host ""
}

# Verify deployment
function Verify-Deployment {
    Print-Info "Verifying deployment..."
    
    Start-Sleep -Seconds 10
    
    $appUrl = "https://$HerokuAppName.herokuapp.com"
    
    try {
        $response = Invoke-WebRequest -Uri "$appUrl/health" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Print-Success "Health check passed"
        }
    } catch {
        Print-Error "Health check failed"
        Print-Info "Check logs: heroku logs --tail -a $HerokuAppName"
        exit 1
    }
    
    Print-Info "API docs available at: $appUrl/docs"
    Write-Host ""
}

# Main
function Main {
    Write-Host "Target app: $HerokuAppName" -ForegroundColor Cyan
    Write-Host "Region: $HerokuRegion" -ForegroundColor Cyan
    Write-Host ""
    
    $confirmation = Read-Host "Continue with deployment? (y/n)"
    if ($confirmation -ne 'y') {
        Print-Warning "Deployment cancelled"
        exit 0
    }
    
    Check-Prerequisites
    Run-Tests
    Run-Validation
    Create-HerokuApp
    Add-PostgreSQL
    Set-EnvVars
    Deploy-App
    Verify-Deployment
    
    Print-Success "🎉 Deployment successful!"
    Write-Host ""
    Write-Host "📊 Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Update frontend NEXT_PUBLIC_API_URL to: https://$HerokuAppName.herokuapp.com"
    Write-Host "  2. Deploy frontend to Vercel"
    Write-Host "  3. Update CORS_ORIGINS with frontend domain"
    Write-Host "  4. Test full application flow"
    Write-Host "  5. Set up monitoring and alerts"
    Write-Host ""
    Write-Host "🔗 Useful commands:" -ForegroundColor Cyan
    Write-Host "  heroku logs --tail -a $HerokuAppName"
    Write-Host "  heroku ps -a $HerokuAppName"
    Write-Host "  heroku config -a $HerokuAppName"
    Write-Host "  heroku pg:info -a $HerokuAppName"
    Write-Host ""
}

# Run
Main
