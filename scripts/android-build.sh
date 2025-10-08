#!/bin/bash
set -e

# Android Build Script for Air Knight CI/CD
# This script runs inside the Docker container to build the Android APK

echo "🚀 Starting Android build process..."

# Environment validation
echo "📋 Environment Check:"
echo "  Node.js: $(node --version)"
echo "  NPM: $(npm --version)"
echo "  Java: $(java -version 2>&1 | head -1)"
echo "  Android Home: $ANDROID_HOME"

# Check Capacitor after npm install
echo "  Capacitor CLI: Will check after npm install"

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm ci --prefer-offline --no-audit

# Verify Capacitor installation
echo "🔍 Verifying Capacitor installation..."
CAP_VERSION=$(npx --no-install cap --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "  Capacitor CLI: $CAP_VERSION"
else
    echo "❌ Capacitor CLI not working properly"
    exit 1
fi

# Type check
echo "🔍 Running TypeScript type check..."
npm run type-check

# Build web assets
echo "🏗️ Building web assets..."
# Ensure we use root path for Android (clear any GitHub Pages base path)
unset VITE_BASE_PATH
npm run build

# Verify web build exists
if [ ! -d "dist" ]; then
    echo "❌ Web build failed - dist directory not found"
    exit 1
fi

echo "✅ Web build completed successfully"

# Check if Android platform is added to Capacitor
echo "🔍 Checking Capacitor Android platform..."
if [ ! -d "android" ]; then
    echo "📱 Android platform not found, adding it..."
    npx --no-install cap add android
    if [ $? -ne 0 ]; then
        echo "❌ Failed to add Android platform"
        exit 1
    fi
    echo "✅ Android platform added successfully"
else
    echo "✅ Android platform already exists"
fi

# Ensure capacitor.config.json is properly configured
echo "🔧 Verifying Capacitor configuration..."
if [ ! -f "capacitor.config.json" ]; then
    echo "❌ capacitor.config.json not found"
    exit 1
fi

# Sync Capacitor (this copies web assets and updates native project)
echo "🔄 Syncing Capacitor..."
npx --no-install cap sync android
if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed"
    exit 1
fi
echo "✅ Capacitor sync completed successfully"

# Verify Android project exists and has required files after sync
if [ ! -d "android" ] || [ ! -f "android/app/build.gradle" ]; then
    echo "❌ Android project not properly configured after sync"
    exit 1
fi

# Navigate to Android directory
cd android

# Set up signing if environment variables are available
if [ -n "$ANDROID_SIGNING_KEY_BASE64" ] && [ -n "$ANDROID_KEY_ALIAS" ]; then
    echo "🔑 Setting up Android signing..."
    
    # Create keystore directory
    mkdir -p app/signing
    
    # Decode the base64 keystore
    echo "$ANDROID_SIGNING_KEY_BASE64" | base64 -d > app/signing/release.keystore
    
    # Create signing.properties file
    cat > signing.properties << EOF
storeFile=signing/release.keystore
storePassword=$ANDROID_KEYSTORE_PASSWORD
keyAlias=$ANDROID_KEY_ALIAS
keyPassword=$ANDROID_KEY_PASSWORD
EOF
    
    # Update build.gradle to use signing config
    if ! grep -q "signingConfigs" app/build.gradle; then
        echo "Adding signing configuration to build.gradle..."
        # This would be handled by the workflow setup
    fi
    
    echo "✅ Signing configuration set up"
    BUILD_TYPE="assembleRelease"
else
    echo "⚠️ No signing configuration found, building debug APK"
    BUILD_TYPE="assembleDebug"
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
./gradlew clean

# Build Android APK
echo "🔨 Building Android APK..."
./gradlew $BUILD_TYPE --stacktrace --info

# Show all build outputs for debugging
echo "📋 Build outputs structure:"
find app/build/outputs -type f -name "*.apk" -o -name "*.aab" 2>/dev/null | head -10

# Verify APK was created
echo "🔍 Searching for generated APK files..."
if [ "$BUILD_TYPE" = "assembleRelease" ]; then
    APK_DIR="app/build/outputs/apk/release"
    BUILD_VARIANT="release"
else
    APK_DIR="app/build/outputs/apk/debug"
    BUILD_VARIANT="debug"
fi

# List all APK files in the output directory
echo "📁 Checking APK directory: $APK_DIR"
if [ -d "$APK_DIR" ]; then
    ls -la "$APK_DIR"
    APK_FILES=$(find "$APK_DIR" -name "*.apk" -type f)
    
    if [ -z "$APK_FILES" ]; then
        echo "❌ No APK files found in $APK_DIR"
        echo "📋 Available files:"
        find app/build/outputs -name "*.apk" -type f 2>/dev/null || echo "No APK files found anywhere in build outputs"
        exit 1
    fi
    
    # Use the first APK found (should typically be only one)
    APK_PATH=$(echo "$APK_FILES" | head -1)
    echo "✅ Found APK: $APK_PATH"
else
    echo "❌ APK output directory not found: $APK_DIR"
    echo "📋 Available directories in app/build/outputs:"
    ls -la app/build/outputs/ 2>/dev/null || echo "No outputs directory found"
    exit 1
fi

# Copy APK to output directory
mkdir -p /workspace/build-output
APK_FILENAME=$(basename "$APK_PATH")
cp "$APK_PATH" "/workspace/build-output/$APK_FILENAME"

# Get APK info
APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
echo "✅ APK built successfully!"
echo "📦 APK filename: $APK_FILENAME"
echo "📦 APK size: $APK_SIZE"
echo "📁 APK location: $APK_PATH"
echo "📂 Copied to: /workspace/build-output/$APK_FILENAME"

# Calculate checksum
APK_CHECKSUM=$(sha256sum "$APK_PATH" | cut -d' ' -f1)
echo "🔐 APK SHA256: $APK_CHECKSUM"

# Create build metadata
cat > /workspace/build-output/build-metadata.json << EOF
{
  "build_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "build_type": "$BUILD_TYPE",
  "build_variant": "$BUILD_VARIANT",
  "apk_filename": "$APK_FILENAME",
  "apk_size_bytes": $(stat -c%s "$APK_PATH"),
  "apk_size_human": "$APK_SIZE",
  "apk_checksum": "$APK_CHECKSUM",
  "capacitor_version": "$(npx --no-install cap --version)",
  "gradle_version": "$(./gradlew --version | grep Gradle | cut -d' ' -f2)",
  "android_compile_sdk": "$(grep compileSdkVersion app/build.gradle | grep -o '[0-9]\+')",
  "app_version": "$(grep versionName app/build.gradle | cut -d'"' -f2)"
}
EOF

echo "🎉 Android build completed successfully!"
echo "📊 Build metadata saved to build-output/build-metadata.json"