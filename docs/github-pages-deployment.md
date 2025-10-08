# GitHub Pages Deployment Guide

## Overview

This guide explains how the Air Knight project is configured for GitHub Pages deployment and how to handle the subdirectory path issues.

## Problem

GitHub Pages serves repositories from a subdirectory path (e.g., `https://username.github.io/repository-name/`), but Vite builds generate absolute paths (`/assets/main.js`) by default. This causes assets to not load correctly when deployed to GitHub Pages.

## Solution

The project uses Vite's `base` configuration to handle different deployment scenarios:

### Configuration

**vite.config.ts**:
```typescript
export default defineConfig({
  // Set base path for GitHub Pages deployment
  base: process.env.VITE_BASE_PATH || '/',
  // ... other config
});
```

**GitHub Actions Workflow**:
```yaml
- name: Build application
  run: npm run build
  env:
    VITE_BASE_PATH: ${{ github.ref == 'refs/heads/main' && '/air-knight/' || '/' }}
```

## Build Commands

### Production Build for GitHub Pages
```bash
npm run build:github-pages
```
This sets `VITE_BASE_PATH=/air-knight/` and generates assets with the correct subdirectory paths for GitHub Pages.

### Mobile/Android Build
```bash
npm run mobile:build
```
This clears `VITE_BASE_PATH` and builds with root paths (`/assets/...`) which is required for Capacitor apps.

### Local Development Build
```bash
npm run build:local
```
This sets `VITE_BASE_PATH=/` for local testing without subdirectory paths.

### Standard Build
```bash
npm run build
```
Uses the default configuration (root path `/`) unless `VITE_BASE_PATH` is set in the environment.

## How It Works

1. **Environment Variable**: The workflow sets `VITE_BASE_PATH` based on the target branch
2. **Vite Configuration**: Vite uses this variable to set the `base` option
3. **Asset Paths**: All generated asset paths include the base path prefix
4. **Result**: Assets load correctly from the GitHub Pages subdirectory

### Example Output

**Without base path** (broken on GitHub Pages):
```html
<script src="/assets/main-abc123.js"></script>
```

**With base path** (works on GitHub Pages):
```html
<script src="/air-knight/assets/main-abc123.js"></script>
```

## Environment-Specific Configuration

### Development
- **Base Path**: `/` (root)
- **URL**: `http://localhost:5173/`
- **Assets**: Load from root path

### Mobile/Android Apps
- **Base Path**: `/` (root) - **REQUIRED**
- **File System**: Local device assets
- **Assets**: Must use root paths for Capacitor to find them
- **Build**: Always clears `VITE_BASE_PATH` to ensure root paths

### Staging/PR Previews
- **Base Path**: `/` (root)
- **Deployment**: Artifact only, no live deployment
- **Purpose**: Testing and review

### Production (GitHub Pages)
- **Base Path**: `/air-knight/`
- **URL**: `https://christyowidiasmoro.github.io/air-knight/`
- **Assets**: Load from subdirectory

## Verification

After building with the correct base path, verify the generated `dist/index.html`:

```bash
# Build for GitHub Pages
npm run build:github-pages

# Check the generated script tag
grep -o 'src="[^"]*"' dist/index.html
# Should output: src="/air-knight/assets/main-abc123.js"
```

## Troubleshooting

### Assets Not Loading on GitHub Pages

**Symptoms**:
- Page loads but shows blank screen
- Browser console shows 404 errors for JS/CSS files
- Network tab shows failed requests to `/assets/...`

**Solution**:
1. Verify the build used the correct base path
2. Check that `VITE_BASE_PATH` is set in the workflow
3. Ensure the repository name matches the base path

### Relative vs Absolute Paths

**Issue**: Some assets might still use absolute paths
**Solution**: Ensure all asset references in code use Vite's asset handling:

```typescript
// ✅ Correct - Vite will handle the path
import logoUrl from './logo.png'

// ❌ Incorrect - Hard-coded absolute path
const logoUrl = '/images/logo.png'
```

### Local Testing of GitHub Pages Build

To test the GitHub Pages build locally:

```bash
# Build with GitHub Pages paths
npm run build:github-pages

# Serve with the correct base path
npx vite preview --base /air-knight/
```

## Repository Configuration

### GitHub Pages Settings

1. Go to repository **Settings** → **Pages**
2. Set **Source** to "GitHub Actions"
3. The workflow will handle deployment automatically

### Custom Domain (Optional)

If using a custom domain:
1. Set `VITE_BASE_PATH=/` in the workflow
2. Configure the custom domain in GitHub Pages settings
3. Update the workflow base path logic accordingly

## Related Files

- `vite.config.ts` - Vite configuration with base path
- `.github/workflows/web-build.yml` - Deployment workflow
- `package.json` - Build scripts
- `dist/index.html` - Generated HTML with correct paths

## Best Practices

1. **Always test** GitHub Pages builds before deploying
2. **Use environment variables** for configuration differences
3. **Verify asset paths** in the generated HTML
4. **Test locally** with the same base path as production
5. **Monitor** the GitHub Pages deployment for any issues