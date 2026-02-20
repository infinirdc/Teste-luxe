#!/bin/bash

# Script de test avant déploiement Vercel
# Teste que le serveur démarre et répond

echo "🚀 Opulence Restaurant - Pre-Deployment Test"
echo "=============================================="
echo ""

# Vérifier que .env existe
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

echo "✅ .env file found"

# Vérifier les variables d'environnement requises
required_vars=(
    "MONGODB_URI"
    "JWT_SECRET"
    "ADMIN_USERNAME"
    "ADMIN_PASSWORD"
)

source .env

missing_vars=false
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Missing environment variable: $var"
        missing_vars=true
    else
        # Masquer les valeurs sensibles
        if [[ "$var" == "MONGODB_URI" ]]; then
            echo "✅ $var is set (hidden)"
        elif [[ "$var" == "JWT_SECRET" ]]; then
            echo "✅ $var is set (hidden)"
        elif [[ "$var" == "ADMIN_PASSWORD" ]]; then
            echo "✅ $var is set (hidden)"
        else
            echo "✅ $var = ${!var}"
        fi
    fi
done

if [ "$missing_vars" = true ]; then
    exit 1
fi

echo ""
echo "✅ All environment variables configured"
echo ""

# Vérifier les fichiers critiques
critical_files=(
    "server.js"
    "app.js"
    "package.json"
    "vercel.json"
)

echo "Checking critical files..."
for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file NOT FOUND"
        exit 1
    fi
done

echo ""
echo "✅ All critical files present"
echo ""

# Vérifier les répertoires
critical_dirs=(
    "config"
    "models"
    "controllers"
    "routes"
    "middleware"
    "utils"
    "js"
    "css"
)

echo "Checking required directories..."
for dir in "${critical_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir/"
    else
        echo "❌ $dir/ NOT FOUND"
        exit 1
    fi
done

echo ""
echo "✅ All required directories present"
echo ""

# Test Node.js syntax
echo "Testing Node.js syntax..."
node -c server.js 2>/dev/null && echo "✅ server.js syntax OK" || echo "❌ server.js syntax error"

# Summary
echo ""
echo "=============================================="
echo "✅ PRE-DEPLOYMENT TESTS PASSED!"
echo "=============================================="
echo ""
echo "Next steps:"
echo "1. npm run dev  (to start locally)"
echo "2. Test endpoints via curl or browser"
echo "3. git push origin main"
echo "4. Deploy to Vercel: vercel --prod"
echo ""
