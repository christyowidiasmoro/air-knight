# Android Build Configuration Guide

## Overview

This guide explains how to configure the Android build system for the Air Knight CI/CD pipeline. The Android build workflow uses Docker to ensure consistent build environments and supports both debug and release builds.

## Prerequisites

Before using the Android build workflow, ensure you have:

1. **Android Project Setup**: The Capacitor Android project configuration files are tracked in git
2. **Repository Secrets**: Required secrets for release builds (see below)
3. **GitHub Actions**: Enabled in your repository

### Android Project Structure

The repository tracks essential Android configuration files but ignores generated content:

**Tracked Files** (in git):
- `android/app/build.gradle` - Build configuration
- `android/app/src/main/AndroidManifest.xml` - App manifest
- `android/gradle.properties` - Gradle properties
- `android/settings.gradle` - Project settings
- Other configuration and source files

**Ignored Files** (not in git):
- `android/.gradle/` - Gradle cache
- `android/app/build/` - Build outputs
- `android/.idea/` - IDE files
- `android/app/src/main/assets/public/` - Generated web assets

This approach ensures CI/CD can recreate the Android project while keeping the repository clean.

## Repository Secrets Configuration

For **release builds** and **signed APKs**, you need to configure the following repository secrets:

### Required Secrets

1. **`ANDROID_SIGNING_KEY_BASE64`**
   - Your Android keystore file encoded in base64
   - Generate with: `base64 -w 0 your-release-key.keystore`

2. **`ANDROID_KEYSTORE_PASSWORD`**
   - Password for the keystore file
   - Should be a strong password

3. **`ANDROID_KEY_ALIAS`**
   - Alias name for the signing key within the keystore
   - Example: `release-key`

4. **`ANDROID_KEY_PASSWORD`**
   - Password for the specific key alias
   - May be the same as keystore password

### Setting Up Secrets

1. Go to your GitHub repository
2. Navigate to `Settings` → `Secrets and variables` → `Actions`
3. Click `New repository secret`
4. Add each of the required secrets listed above

### Creating a Release Keystore

If you don't have a release keystore yet:

```bash
# Generate a new keystore
keytool -genkey -v -keystore release-key.keystore -alias release-key -keyalg RSA -keysize 2048 -validity 10000

# Convert to base64 for GitHub secrets
base64 -w 0 release-key.keystore
```

⚠️ **Important**: Store your keystore file and passwords securely. If lost, you cannot update your app on the Play Store.

## Build Types

### Debug Builds
- **Trigger**: Any branch push or PR
- **Requirements**: No special configuration needed
- **Output**: Debug APK (app-debug.apk)
- **Signing**: Debug keystore (auto-generated)

### Release Builds
- **Trigger**: Push to `main` branch or manual dispatch
- **Requirements**: All repository secrets configured
- **Output**: Signed release APK (app-release.apk)
- **Signing**: Your release keystore

## Workflow Triggers

The Android build workflow runs on:

1. **Push to branches**: `main`, `develop`, `feature/*`
2. **Pull requests**: to `main` or `develop`
3. **Manual dispatch**: Via GitHub Actions UI with options:
   - Build type selection (debug/release)
   - Artifact upload toggle

## Docker Build Environment

The Android build uses a custom Docker image (`Dockerfile.android`) that includes:

### Base System Components
- **Operating System**: Ubuntu with CircleCI user
- **Java**: OpenJDK 17 (required for Android builds)
- **Node.js**: Version 20.x (for web build and package management)
- **Android SDK**: Platform tools, build tools, and required API levels
- **Gradle**: Build system for Android projects

### Project-Specific Components (installed during build)
- **Capacitor CLI**: Installed from project's package.json for version consistency
- **Project Dependencies**: All npm packages from package.json
- **Web Assets**: Built using Vite and synced to Android project

## Build Process

1. **Quality Gate**: Runs type checking, linting, and tests
2. **Docker Setup**: Builds Android build environment image with base tools
3. **Dependency Installation**: Installs project dependencies including Capacitor CLI
4. **Web Build**: Creates Vite production build with root paths (clears `VITE_BASE_PATH`)
5. **Capacitor Sync**: Syncs web assets to Android project using local CLI
6. **Android Build**: Compiles APK using Gradle
7. **Artifact Upload**: Stores APK and metadata
8. **Analysis**: Validates APK size and build performance

### Important: Base Path Handling

The Android build automatically clears the `VITE_BASE_PATH` environment variable to ensure the web build uses root paths (`/assets/...`) instead of GitHub Pages subdirectory paths (`/repository-name/assets/...`). This is crucial because:

- **Android apps** serve files from the local device filesystem
- **Capacitor** expects assets at root paths within the app bundle
- **GitHub Pages** requires subdirectory paths for repository deployments

The build script handles this automatically, but if building manually:
```bash
unset VITE_BASE_PATH && npm run build && npx cap sync android
```

### Why Local Capacitor CLI?
The Docker image doesn't include Capacitor CLI globally because:
- **Version Consistency**: Uses exact version from package.json
- **Dependency Management**: Avoids version conflicts between global and local
- **Project Isolation**: Each build uses its own Capacitor version

## Performance Targets

- **Build Time**: Under 15 minutes (currently optimized for ~10 minutes)
- **APK Size**: Under 100MB
- **Success Rate**: 99%+ for clean builds

## Artifacts

The workflow generates these artifacts:

### APK Artifact
- **Name**: `android-apk-{build-type}-{commit-sha}`
- **Contents**: 
  - Built APK file
  - Build metadata JSON
- **Retention**: 30 days

### Build Logs
- **Name**: `android-build-logs-{commit-sha}`
- **Contents**:
  - Gradle build logs
  - Build metadata
- **Retention**: 7 days

## Monitoring and Notifications

### Build Status
- View build progress in GitHub Actions tab
- Check artifact uploads for successful builds
- Review build logs for debugging

### Notifications
- Console output shows build progress and results
- Failed builds include error details and suggestions
- Future: Email notifications for build completion

## Troubleshooting

### Common Issues

1. **"android platform has not been added yet" Error**
   - **Cause**: Android platform files missing or not properly synced
   - **Solution**: The build script automatically handles this by:
     - Checking if `android/` directory exists
     - Running `npx cap add android` if needed
     - Running `npx cap sync android --force` to ensure proper setup
   - **Manual Fix**: Run `npx cap add android` locally and commit the changes

2. **Build Timeout**
   - Check if dependencies are cached properly
   - Verify Docker image builds successfully
   - Review Gradle memory settings

3. **Signing Failures**
   - Verify all secrets are set correctly
   - Check keystore base64 encoding
   - Ensure passwords match keystore configuration

4. **APK Not Generated**
   - Check web build completion
   - Verify Capacitor sync successful
   - Review Android project structure

5. **Size Issues**
   - Monitor bundle analysis reports
   - Check for unnecessary dependencies
   - Optimize asset compression

### Debug Steps

1. **Check Quality Gate**: Ensure all tests pass
2. **Verify Docker Build**: Look for Docker image creation errors
3. **Review Build Logs**: Download build log artifacts
4. **Test Locally**: Run build script locally with Docker

## Local Development

To test the Android build locally:

```bash
# Build Docker image
docker build -t android-build-env -f Dockerfile.android .

# Run build locally
docker run --rm -v $(pwd):/workspace -w /workspace android-build-env bash scripts/android-build.sh
```

## Integration with Release Workflow

The Android build integrates with the release management workflow:

- Release builds trigger automatically on version tags
- APK artifacts are attached to GitHub releases
- Release notes include build information

## Security Considerations

- **Keystore Protection**: Never commit keystores to version control
- **Secret Management**: Use GitHub secrets for sensitive data
- **Access Control**: Limit repository access for release builds
- **Audit Trail**: All builds are logged and traceable

## Performance Optimization

The build system includes several optimizations:

- **Docker Caching**: Reuses Docker layers between builds
- **Gradle Caching**: Caches dependencies and build outputs
- **Parallel Processing**: Runs independent tasks concurrently
- **Resource Limits**: Configured for GitHub Actions environment

## Future Enhancements

Planned improvements:

- **Email Notifications**: Build completion notifications
- **Slack Integration**: Team build status updates
- **Performance Metrics**: Detailed build analytics
- **Auto-deployment**: Direct Play Store uploads
- **Multi-variant Builds**: Different APK configurations