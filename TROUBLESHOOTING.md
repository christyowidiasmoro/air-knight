# Troubleshooting Guide

## Common Build Issues

### 1. "terser not found" Error

**Problem**: `Error: terser not found. Since Vite v3, terser has become an optional dependency.`

**Solution**: ✅ **FIXED** - Install terser as a dev dependency:
```bash
npm install --save-dev terser@^5.31.0
```

This has been added to the package.json and setup script.

### 2. "Generated an empty chunk: phaser" Warning

**Problem**: Warning about empty Phaser chunk during build.

**Solution**: This has been fixed in `vite.config.ts` with dynamic chunk splitting. The warning should no longer appear.

### 3. Security Vulnerabilities in Dependencies

**Problem**: npm audit shows moderate vulnerabilities in esbuild/vite.

**Current Status**: These are development-only dependencies and don't affect production builds. Monitor for updates but avoid `npm audit fix --force` as it may introduce breaking changes.

**Safe approach**:
```bash
# Check for updates without forcing
npm update
```

### 4. Mobile Platform Not Added

**Problem**: `android platform has not been added yet` or `ios platform has not been added yet`

**Solution**: ✅ **FIXED** - Add the mobile platforms:
```bash
# Add both platforms
npm run mobile:setup

# Or add individually
npx cap add android
npx cap add ios
```

This creates the native project directories and is now included in the setup script.

### 5. Other Mobile Build Issues

**Problem**: `npm run mobile:build` fails after platform setup.

**Solutions**:
1. Ensure all dependencies are installed: `npm install`
2. Install terser: `npm install --save-dev terser`
3. Check that Capacitor is properly configured
4. Verify `dist/` directory exists after build

### 5. TypeScript Errors

**Problem**: TypeScript compilation errors.

**Solutions**:
1. Check `tsconfig.json` paths are correct
2. Ensure all imports use the `@/` alias correctly
3. Run type checking: `npm run type-check`

### 6. Phaser Not Loading

**Problem**: Phaser framework not found.

**Solution**: Install Phaser:
```bash
npm install phaser@^3.70.0
```

### 7. Mobile Development Setup

**Prerequisites for iOS**:
- macOS required
- Xcode installed
- iOS Simulator or device

**Prerequisites for Android**:
- Android Studio installed
- Android SDK configured
- Android device or emulator

**Commands**:
```bash
# Build and sync
npm run mobile:build

# Open in IDEs
npm run mobile:ios      # Opens Xcode
npm run mobile:android  # Opens Android Studio
```

### 8. Development Server Issues

**Problem**: `npm run dev` fails to start.

**Solutions**:
1. Check port 5173 is available
2. Clear cache: `rm -rf node_modules/.vite`
3. Restart with clean cache: `npm run dev -- --force`

### 9. Canvas/WebGL Issues

**Problem**: Game doesn't render properly.

**Solutions**:
1. Check browser WebGL support
2. Verify canvas element exists in HTML
3. Check console for WebGL context errors

### 11. Git Pre-commit Hook Issues

**Problem**: `couldn't execute ".git/hooks/pre-commit": no such file or directory`

**Solution**: ✅ **FIXED** - The pre-commit hook has been corrected with proper formatting:
```bash
# The hook is automatically created by setup.sh
# Or recreate manually if needed:
chmod +x .git/hooks/pre-commit
```

**Skip pre-commit checks** (if urgently needed):
```bash
git commit --no-verify -m "your message"
```

**What the hook does:**
- Runs TypeScript type checking
- Runs ESLint code quality checks
- Prevents commits with errors

### 12. Performance Issues on Mobile
- Low performance mode activates when FPS < 45
- Memory warnings at >150MB usage
- Quality settings auto-adjust

**Manual optimizations**:
- Reduce particle counts
- Optimize image sizes
- Use object pooling
- Monitor performance metrics

## Getting Help

1. Check the console for detailed error messages
2. Verify all dependencies are installed
3. Ensure you're using Node.js 18+
4. Review the main [README.md](README.md) for setup instructions
5. Check the [Constitution](.specify/memory/constitution.md) for project principles

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Production build
npm run preview         # Preview build
npm test               # Run tests
npm run lint           # Check code quality

# Mobile
npm run mobile:build    # Build for mobile
npm run mobile:ios     # Open iOS project
npm run mobile:android # Open Android project

# Maintenance
npm install            # Install dependencies
npm update             # Update dependencies
npm audit              # Check vulnerabilities
npm run type-check     # TypeScript validation
```