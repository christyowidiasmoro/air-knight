# GitHub Actions Troubleshooting Guide

### 4. GitHub Pages Deployment Issues

**Error**: Assets not loading on GitHub Pages (404 errors for JS/CSS files)

**Common Causes**:
- Incorrect base path configuration
- Assets generated with absolute paths instead of subdirectory paths
- Missing pages permissions
- Pages not enabled in repository

**Solutions**:
```yaml
# In workflow file
env:
  VITE_BASE_PATH: ${{ github.ref == 'refs/heads/main' && '/repository-name/' || '/' }}
```

```typescript
// In vite.config.ts
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  // ... other config
});
```

**Verification**:
- Check generated `dist/index.html` for correct script paths
- Test locally: `npm run build:github-pages && npx vite preview --base /repository-name/`

### 5. Android Build Environment Setup# Common Issues and Solutions

### 1. Permission Denied Error for PR Comments

**Error**: `Resource not accessible by integration (403)`

**Cause**: GitHub Actions trying to comment on pull requests without proper permissions.

**Solution**: Add required permissions to workflow file:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
  pull-requests: write  # Required for PR comments
  issues: write         # Required for issue comments
```

**Additional Notes**:
- This error commonly occurs on forked repositories
- External PRs have limited permissions by default for security
- Use `continue-on-error: true` for non-critical PR comments

### 2. Docker Permission Issues

**Error**: `EACCES: permission denied` when installing npm packages globally

**Cause**: Trying to install global npm packages as non-root user in Docker.

**Solution**: Install packages as root, then switch back to regular user:

```dockerfile
USER root
RUN npm install -g @capacitor/core @capacitor/cli
USER circleci
```

### 3. Android Build Environment Setup

**Common Issues**:
- Missing Android SDK components
- Gradle permission errors
- Capacitor CLI not found

**Solutions**:
- Use official Android SDK Docker images
- Install required SDK components explicitly
- Set proper environment variables
- Accept SDK licenses programmatically

### 4. GitHub Pages Deployment Issues

**Error**: Pages deployment failures

**Common Causes**:
- Missing pages permissions
- Incorrect artifact path
- Pages not enabled in repository

**Solution**:
```yaml
permissions:
  pages: write
  id-token: write

steps:
  - uses: actions/configure-pages@v4
  - uses: actions/upload-pages-artifact@v3
    with:
      path: dist/
  - uses: actions/deploy-pages@v4
```

## Best Practices

### Security
1. **Minimal Permissions**: Only grant required permissions
2. **Secret Management**: Use repository secrets for sensitive data
3. **Fork Safety**: Handle external PRs carefully

### Error Handling
1. **Continue on Error**: Use for non-critical steps
2. **Conditional Execution**: Check prerequisites before running
3. **Graceful Degradation**: Provide fallbacks for optional features

### Performance
1. **Caching**: Cache dependencies and build outputs
2. **Parallel Jobs**: Run independent tasks concurrently
3. **Resource Limits**: Set appropriate timeouts

### Debugging
1. **Detailed Logging**: Add debug output for complex steps
2. **Artifact Upload**: Save logs and build outputs
3. **Step Summary**: Use GitHub step summaries for status

## Repository Setup Checklist

Before using the CI/CD workflows, ensure:

- [ ] GitHub Actions enabled
- [ ] GitHub Pages configured (if using web deployment)
- [ ] Required secrets set (for Android signing)
- [ ] Branch protection rules configured
- [ ] Environments set up (staging, production)

## Testing Workflows

### Local Testing
- Test Docker builds locally before pushing
- Validate scripts in isolation
- Check file permissions and paths

### Gradual Rollout
- Test on feature branches first
- Validate with simple commits
- Monitor resource usage and timing

## Common Environment Variables

```bash
# GitHub Context
GITHUB_TOKEN         # Automatic token (limited permissions)
GITHUB_REPOSITORY    # Repository name
GITHUB_REF          # Branch or tag reference
GITHUB_SHA          # Commit hash
GITHUB_ACTOR        # User who triggered workflow

# Build Configuration
NODE_VERSION        # Node.js version
JAVA_VERSION       # Java version for Android
BUILD_TYPE         # debug or release
```

## Support Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Android Build Documentation](https://developer.android.com/studio/build)
- [Capacitor CLI Reference](https://capacitorjs.com/docs/cli)