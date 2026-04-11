#!/bin/bash

# 🚀 InterviewMe Production Deployment Script
# This script automates the deployment process with safety checks

set -e  # Exit on error

echo "🚀 InterviewMe Production Deployment"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
HEROKU_APP_NAME="${HEROKU_APP_NAME:-interviewme-api-prod}"
HEROKU_REGION="${HEROKU_REGION:-us}"

# Functions
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo "ℹ️  $1"
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check Heroku CLI
    if ! command -v heroku &> /dev/null; then
        print_error "Heroku CLI not installed. Install from: https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    print_success "Heroku CLI installed"
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git not installed"
        exit 1
    fi
    print_success "Git installed"
    
    # Check Python
    if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
        print_error "Python not installed"
        exit 1
    fi
    print_success "Python installed"
    
    # Check if logged into Heroku
    if ! heroku auth:whoami &> /dev/null; then
        print_error "Not logged into Heroku. Run: heroku login"
        exit 1
    fi
    print_success "Logged into Heroku"
    
    echo ""
}

# Run tests
run_tests() {
    print_info "Running tests..."
    cd backend
    
    if python -m pytest tests/ -v --tb=short; then
        print_success "All tests passed"
    else
        print_error "Tests failed. Fix issues before deploying."
        exit 1
    fi
    
    cd ..
    echo ""
}

# Run production validation
run_validation() {
    print_info "Running production validation..."
    cd backend
    
    if python production_validation.py; then
        print_success "Production validation passed"
    else
        print_error "Production validation failed"
        exit 1
    fi
    
    cd ..
    echo ""
}

# Create Heroku app if doesn't exist
create_heroku_app() {
    print_info "Checking Heroku app..."
    
    if heroku apps:info -a "$HEROKU_APP_NAME" &> /dev/null; then
        print_success "Heroku app '$HEROKU_APP_NAME' exists"
    else
        print_warning "Heroku app '$HEROKU_APP_NAME' doesn't exist. Creating..."
        heroku create "$HEROKU_APP_NAME" --region "$HEROKU_REGION"
        print_success "Heroku app created"
    fi
    
    echo ""
}

# Add PostgreSQL addon
add_postgresql() {
    print_info "Checking PostgreSQL addon..."
    
    if heroku addons:info heroku-postgresql -a "$HEROKU_APP_NAME" &> /dev/null; then
        print_success "PostgreSQL addon exists"
    else
        print_warning "PostgreSQL addon doesn't exist. Adding..."
        heroku addons:create heroku-postgresql:essential-0 -a "$HEROKU_APP_NAME"
        print_success "PostgreSQL addon added"
        print_info "Waiting for database to be ready..."
        sleep 10
    fi
    
    echo ""
}

# Set environment variables
set_env_vars() {
    print_info "Setting environment variables..."
    
    # Check if .env exists
    if [ ! -f "backend/.env" ]; then
        print_error "backend/.env file not found. Create it first."
        exit 1
    fi
    
    # Read required variables
    source backend/.env
    
    # Set environment
    heroku config:set ENVIRONMENT=production -a "$HEROKU_APP_NAME"
    heroku config:set APP_DEBUG=False -a "$HEROKU_APP_NAME"
    
    # Set secrets
    if [ -z "$JWT_SECRET" ]; then
        print_warning "JWT_SECRET not set. Generating..."
        JWT_SECRET=$(openssl rand -hex 32)
    fi
    heroku config:set JWT_SECRET="$JWT_SECRET" -a "$HEROKU_APP_NAME"
    
    # Set Groq API
    if [ -z "$GROQ_API_KEY" ]; then
        print_error "GROQ_API_KEY not set in .env"
        exit 1
    fi
    heroku config:set GROQ_API_KEY="$GROQ_API_KEY" -a "$HEROKU_APP_NAME"
    heroku config:set GROQ_MODEL="$GROQ_MODEL" -a "$HEROKU_APP_NAME"
    
    # Set Redis
    if [ ! -z "$UPSTASH_REDIS_REST_URL" ]; then
        heroku config:set UPSTASH_REDIS_REST_URL="$UPSTASH_REDIS_REST_URL" -a "$HEROKU_APP_NAME"
        heroku config:set UPSTASH_REDIS_REST_TOKEN="$UPSTASH_REDIS_REST_TOKEN" -a "$HEROKU_APP_NAME"
        heroku config:set REDIS_ENABLED=true -a "$HEROKU_APP_NAME"
    fi
    
    # Set CORS (update with your frontend domain)
    print_warning "Update CORS_ORIGINS with your frontend domain"
    heroku config:set CORS_ORIGINS='["https://your-frontend-domain.vercel.app"]' -a "$HEROKU_APP_NAME"
    
    print_success "Environment variables set"
    echo ""
}

# Deploy to Heroku
deploy() {
    print_info "Deploying to Heroku..."
    
    # Add Heroku remote if doesn't exist
    if ! git remote | grep -q heroku; then
        heroku git:remote -a "$HEROKU_APP_NAME"
        print_success "Heroku remote added"
    fi
    
    # Get current branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    print_info "Deploying from branch: $CURRENT_BRANCH"
    
    # Push to Heroku
    git push heroku "$CURRENT_BRANCH:main"
    
    print_success "Deployment complete"
    echo ""
}

# Verify deployment
verify_deployment() {
    print_info "Verifying deployment..."
    
    # Wait for app to start
    sleep 10
    
    # Check health endpoint
    APP_URL="https://$HEROKU_APP_NAME.herokuapp.com"
    
    if curl -f "$APP_URL/health" &> /dev/null; then
        print_success "Health check passed"
    else
        print_error "Health check failed"
        print_info "Check logs: heroku logs --tail -a $HEROKU_APP_NAME"
        exit 1
    fi
    
    # Check API docs
    print_info "API docs available at: $APP_URL/docs"
    
    echo ""
}

# Main deployment flow
main() {
    echo "Target app: $HEROKU_APP_NAME"
    echo "Region: $HEROKU_REGION"
    echo ""
    
    read -p "Continue with deployment? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled"
        exit 0
    fi
    
    check_prerequisites
    run_tests
    run_validation
    create_heroku_app
    add_postgresql
    set_env_vars
    deploy
    verify_deployment
    
    print_success "🎉 Deployment successful!"
    echo ""
    echo "📊 Next steps:"
    echo "  1. Update frontend NEXT_PUBLIC_API_URL to: https://$HEROKU_APP_NAME.herokuapp.com"
    echo "  2. Deploy frontend to Vercel"
    echo "  3. Update CORS_ORIGINS with frontend domain"
    echo "  4. Test full application flow"
    echo "  5. Set up monitoring and alerts"
    echo ""
    echo "🔗 Useful commands:"
    echo "  heroku logs --tail -a $HEROKU_APP_NAME"
    echo "  heroku ps -a $HEROKU_APP_NAME"
    echo "  heroku config -a $HEROKU_APP_NAME"
    echo "  heroku pg:info -a $HEROKU_APP_NAME"
    echo ""
}

# Run main function
main
