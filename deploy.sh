#!/bin/bash
# TernaKuy Production Deploy Script
# Run this after deploying new code to cache configs and optimize performance.

set -e

echo "🚀 TernaKuy Production Deploy"
echo "=============================="

# Clear old caches first
echo "🧹 Clearing old caches..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan event:clear

# Re-cache everything for production
echo "⚡ Caching configurations..."
php artisan config:cache

echo "⚡ Caching routes..."
php artisan route:cache

echo "⚡ Caching views..."
php artisan view:cache

echo "⚡ Caching events..."
php artisan event:cache

# Run migrations
echo "📦 Running migrations..."
php artisan migrate --force

# Optimize autoloader
echo "⚡ Optimizing Composer autoloader..."
composer dump-autoload --optimize --no-dev

echo ""
echo "✅ Deploy complete! All caches warmed."
echo "   - Config: cached"
echo "   - Routes: cached"
echo "   - Views:  cached"
echo "   - Events: cached"
echo "   - Autoloader: optimized"
