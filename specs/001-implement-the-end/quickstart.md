# Quickstart: CI/CD Build System

**Feature**: Automated Web Build and Deployment  
**Time to Complete**: 15-20 minutes  
**Prerequisites**: GitHub repository with admin access

## Overview

This quickstart implements User Story 1: Automated Web Build and Deployment using GitHub Actions. The system will automatically build and deploy your web application to GitHub Pages whenever code is pushed.

## Implementation Steps

### Step 1: Create Web Build Workflow (5 minutes)

Create `.github/workflows/web-build.yml`:

```yaml
name: Web Build and Deploy

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: false
        default: 'staging'
        type: choice
        options:
          - staging
          - production

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build
        env:
          VITE_APP_VERSION: ${{ github.sha }}
          VITE_ENVIRONMENT: ${{ inputs.environment || 'staging' }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: web-build
          path: dist/
          retention-days: 30

      - name: Setup Pages
        if: github.ref == 'refs/heads/main'
        uses: actions/configure-pages@v4

      - name: Upload to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist/

  deploy:
    if: github.ref == 'refs/heads/main'
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

  notify:
    if: always()
    needs: [build, deploy]
    runs-on: ubuntu-latest
    steps:
      - name: Send email notification
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: smtp.gmail.com
          server_port: 587
          username: ${{ secrets.EMAIL_USERNAME }}
          password: ${{ secrets.EMAIL_PASSWORD }}
          subject: "${{ job.status == 'success' && '✅' || '❌' }} Build ${{ job.status }}: ${{ github.repository }} - ${{ github.ref_name }}"
          to: ${{ github.actor }}@users.noreply.github.com
          from: "Air Knight CI <noreply@example.com>"
          body: |
            Workflow: ${{ github.workflow }}
            Status: ${{ job.status }}
            Branch: ${{ github.ref_name }}
            Commit: ${{ github.sha }}
            Triggered by: ${{ github.event_name }}
            
            View details: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
```

### Step 2: Create Quality Assurance Workflow (3 minutes)

Create `.github/workflows/quality.yml`:

```yaml
name: Quality Assurance

on:
  push:
    branches: [ "**" ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run tests with coverage
        run: npm test -- --coverage --watchAll=false

      - name: Check coverage threshold
        run: |
          coverage=$(cat coverage/coverage-summary.json | jq -r '.total.lines.pct')
          if (( $(echo "$coverage < 80" | bc -l) )); then
            echo "Coverage $coverage% is below 80% threshold"
            exit 1
          fi

      - name: Bundle size check
        run: npm run build && npm run analyze

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run security audit
        run: npm audit --audit-level high

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
```

### Step 3: Configure GitHub Pages (2 minutes)

1. Go to your repository **Settings** → **Pages**
2. Set **Source** to "GitHub Actions"
3. Save the configuration

### Step 4: Add Package.json Scripts (2 minutes)

Ensure these scripts exist in your `package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "test": "jest",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "analyze": "npx vite-bundle-analyzer dist/stats.html"
  }
}
```

### Step 5: Configure Email Notifications (3 minutes)

1. **For Gmail**: 
   - Generate an App Password in your Google Account settings
   - Add these secrets to your repository:
     - `EMAIL_USERNAME`: Your Gmail address
     - `EMAIL_PASSWORD`: The generated app password

2. **Alternative**: Remove the notification job if email is not needed

### Step 6: Test the Setup (2-3 minutes)

1. **Push code to main branch**:
   ```bash
   git add .
   git commit -m "Add CI/CD workflows"
   git push origin main
   ```

2. **Verify the build**:
   - Go to **Actions** tab in your repository
   - Watch the "Web Build and Deploy" workflow execute
   - Check that all jobs complete successfully

3. **Check deployment**:
   - Visit your GitHub Pages URL: `https://[username].github.io/[repository]`
   - Verify your application loads correctly

## Validation Checklist

- [ ] Workflow triggers on push to main
- [ ] Tests run and pass
- [ ] Application builds successfully
- [ ] Artifacts are uploaded
- [ ] GitHub Pages deployment completes
- [ ] Site is accessible at the Pages URL
- [ ] Email notification is received (if configured)
- [ ] Build completes in under 5 minutes

## Troubleshooting

### Common Issues

**Build fails with "npm ci" error**:
- Ensure `package-lock.json` is committed
- Check Node.js version compatibility

**GitHub Pages deployment fails**:
- Verify Pages is enabled in repository settings
- Check that workflow has `pages: write` permission

**Email notifications not working**:
- Verify email credentials in repository secrets
- Check spam folder for notifications

**Tests fail in CI but pass locally**:
- Ensure all test dependencies are in `package.json`
- Check for environment-specific test configurations

### Debug Commands

```bash
# Local build test
npm ci && npm test && npm run build

# Check workflow syntax
github-actions-validator .github/workflows/web-build.yml

# View workflow logs
gh run list
gh run view [run-id]
```

## Next Steps

After completing this quickstart:

1. **Set up branch protection**: Require status checks before merging
2. **Add pull request previews**: Deploy feature branches to temporary URLs  
3. **Configure custom domain**: Set up your own domain for production
4. **Implement Android builds**: Add User Story 2 workflows
5. **Add release automation**: Implement User Story 3 workflows

## Success Metrics

Your implementation is successful when:
- ✅ Builds complete in under 5 minutes
- ✅ 99% of builds that pass locally also pass in CI
- ✅ Team receives notifications within 1 minute of build completion
- ✅ Zero manual deployment steps required

**Estimated setup time**: 15-20 minutes  
**Time to first successful build**: 3-5 minutes after push