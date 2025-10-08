#!/bin/bash
set -e

# Android Build Script for Air Knight CI/CD
# This script runs inside the Docker container to build the Android APK

echo "🚀 Starting Android build process..."

# Environment validation
echo "📋 Environment Check:"
echo "  Node.js: $(node --version)"
echo "  NPM: $(npm --version)"
echo "  Capacitor: $(npx cap --version)"
echo "  Gradle: $(gradle --version | head -1)"
echo "  Java: $(java -version 2>&1 | head -1)"
echo "  Android Home: $ANDROID_HOME"

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm ci --prefer-offline --no-audit

# Type check
echo "🔍 Running TypeScript type check..."
npm run type-check

# Build web assets
echo "🏗️ Building web assets..."
npm run build

# Verify web build exists
if [ ! -d "dist" ]; then
    echo "❌ Web build failed - dist directory not found"
    exit 1
fi

echo "✅ Web build completed successfully"

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

# Verify Android project exists
if [ ! -d "android" ]; then
    echo "❌ Android project not found"
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

# Verify APK was created
APK_PATH=""
if [ "$BUILD_TYPE" = "assembleRelease" ]; then
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
else
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
fi

if [ ! -f "$APK_PATH" ]; then
    echo "❌ APK build failed - file not found at $APK_PATH"
    exit 1
fi

# Copy APK to output directory
mkdir -p /workspace/build-output
cp "$APK_PATH" "/workspace/build-output/"

# Get APK info
APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
echo "✅ APK built successfully!"
echo "📦 APK size: $APK_SIZE"
echo "📁 APK location: $APK_PATH"

# Calculate checksum
APK_CHECKSUM=$(sha256sum "$APK_PATH" | cut -d' ' -f1)
echo "🔐 APK SHA256: $APK_CHECKSUM"

# Create build metadata
cat > /workspace/build-output/build-metadata.json << EOF
{
  "build_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "build_type": "$BUILD_TYPE",
  "apk_size_bytes": $(stat -c%s "$APK_PATH"),
  "apk_size_human": "$APK_SIZE",
  "apk_checksum": "$APK_CHECKSUM",
  "capacitor_version": "$(npx cap --version)",
  "gradle_version": "$(./gradlew --version | grep Gradle | cut -d' ' -f2)",
  "android_compile_sdk": "$(grep compileSdkVersion app/build.gradle | grep -o '[0-9]\+')",
  "app_version": "$(grep versionName app/build.gradle | cut -d'"' -f2)"
}
EOF

echo "🎉 Android build completed successfully!"
echo "📊 Build metadata saved to build-output/build-metadata.json"