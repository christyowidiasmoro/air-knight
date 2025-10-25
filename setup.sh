#!/bin/bash

# Air Knight - Development Setup Script
# This script sets up the development environment and installs all dependencies

echo "🎮 Setting up Air Knight development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

cd game

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install Phaser (core game framework)
echo "🎯 Installing Phaser framework..."
npm install phaser@^3.70.0

# Install Capacitor for mobile (optional)
echo "📱 Installing Capacitor for mobile development..."
npm install @capacitor/core@^5.4.1 @capacitor/cli@^5.4.1

# Install additional dev dependencies
echo "🔧 Installing development tools..."
npm install --save-dev @types/jest@^29.5.5 jest@^29.7.0 ts-jest@^29.1.1 terser@^5.31.0

# Initialize Capacitor if not already done
if [ ! -f "capacitor.config.json" ]; then
    echo "⚙️ Initializing Capacitor..."
    npx cap init "Air Knight" "com.airknight.game" --web-dir=dist
fi

# Add mobile platforms
echo "📱 Adding mobile platforms..."
if [ ! -d "android" ]; then
    npx cap add android
    echo "✅ Android platform added"
fi

if [ ! -d "ios" ]; then
    npx cap add ios
    echo "✅ iOS platform added"
fi

# Create initial build
echo "🏗️ Creating initial build..."
npm run build

# Setup git hooks (if git is initialized)
if [ -d ".git" ]; then
    echo "🔗 Setting up git hooks..."
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# Air Knight pre-commit hook
# Runs linting and type checking before commits

echo "🔍 Running pre-commit checks..."

# Run TypeScript type checking
echo "📝 Type checking..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "❌ TypeScript type check failed. Please fix errors before committing."
    exit 1
fi

# Run linting
echo "🧹 Linting..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed. Please fix errors before committing."
    exit 1
fi

echo "✅ Pre-commit checks passed!"
exit 0
EOF
    chmod +x .git/hooks/pre-commit
    echo "✅ Pre-commit hook installed"
fi

echo ""
echo "🎉 Air Knight setup complete!"
echo ""
echo "Next steps:"
echo "  npm run dev          # Start development server"
echo "  npm run mobile:build # Build for mobile (optional)"
echo "  npm test             # Run tests"
echo ""
echo "For mobile development:"
echo "  npm run mobile:ios     # Open iOS project"
echo "  npm run mobile:android # Open Android project"
echo ""
echo "Happy game development! 🚀"