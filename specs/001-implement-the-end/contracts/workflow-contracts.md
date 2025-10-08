# GitHub Actions Workflow Contracts

## Web Build and Deploy Workflow

**File**: `.github/workflows/web-build.yml`  
**Triggers**: Push to main, pull requests, manual dispatch

### Inputs
```yaml
# Manual dispatch inputs
inputs:
  environment:
    description: 'Target environment for deployment'
    required: false
    default: 'staging'
    type: choice
    options:
      - staging
      - production
  
  skip_tests:
    description: 'Skip running tests'
    required: false
    default: false
    type: boolean
```

### Outputs
```yaml
# Workflow outputs (accessible to dependent workflows)
outputs:
  deployment_url:
    description: 'URL where the application was deployed'
    value: ${{ jobs.deploy.outputs.page_url }}
  
  build_version:
    description: 'Build version/commit SHA'
    value: ${{ github.sha }}
  
  artifact_id:
    description: 'GitHub Actions artifact ID'
    value: ${{ jobs.build.outputs.artifact_id }}
```

### Environment Variables
```yaml
env:
  NODE_VERSION: '18'
  VITE_APP_VERSION: ${{ github.sha }}
  VITE_ENVIRONMENT: ${{ inputs.environment || 'staging' }}
```

### Secrets Required
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions
- No additional secrets required for GitHub Pages deployment

### Job Dependencies
```
install-deps → test → build → deploy
                 ↘ security-scan
```

## Quality Assurance Workflow

**File**: `.github/workflows/quality.yml`  
**Triggers**: Push to any branch, pull requests

### Test Requirements
- Unit tests must pass (Jest)
- Code coverage ≥ 80%
- ESLint errors = 0
- TypeScript compilation successful
- Bundle size within limits

### Performance Budgets
```yaml
budgets:
  initial_bundle_size: 500kb  # gzipped
  total_asset_size: 2mb
  lighthouse_performance: 90
  lighthouse_accessibility: 95
```

### Security Scanning
- Dependency vulnerability scan (npm audit)
- SAST scan with CodeQL
- Secret detection

## Release Workflow

**File**: `.github/workflows/release.yml`  
**Triggers**: Manual dispatch, release tag creation

### Inputs
```yaml
inputs:
  version:
    description: 'Release version (semver)'
    required: true
    type: string
  
  prerelease:
    description: 'Mark as pre-release'
    required: false
    default: false
    type: boolean
  
  generate_notes:
    description: 'Auto-generate release notes'
    required: false
    default: true
    type: boolean
```

### Release Process
1. Validate version format
2. Build web application
3. Run full test suite
4. Create GitHub release
5. Upload build artifacts
6. Deploy to production (if not prerelease)

## Notification Contracts

### Email Notifications

**Success Notification**:
```json
{
  "to": ["commit_author@email.com"],
  "subject": "✅ Build Success: {repo_name} - {branch}",
  "body": {
    "workflow": "Web Build and Deploy",
    "status": "success",
    "branch": "main",
    "commit": "abc123f",
    "deployment_url": "https://owner.github.io/repo",
    "duration": "3m 45s",
    "triggered_by": "push"
  }
}
```

**Failure Notification**:
```json
{
  "to": ["commit_author@email.com"],
  "subject": "❌ Build Failed: {repo_name} - {branch}",
  "body": {
    "workflow": "Web Build and Deploy",
    "status": "failure",
    "branch": "feature/new-feature",
    "commit": "abc123f",
    "error_summary": "Tests failed: 3 failing",
    "logs_url": "https://github.com/owner/repo/actions/runs/123456",
    "duration": "2m 15s",
    "triggered_by": "push"
  }
}
```

## Artifact Contracts

### Web Build Artifact
```yaml
name: web-build
path: dist/
retention-days: 30
contents:
  - index.html
  - assets/
    - js/
    - css/
    - images/
  - favicon.ico
  - manifest.json
```

### Build Reports Artifact
```yaml
name: build-reports
path: reports/
retention-days: 90
contents:
  - test-results.xml
  - coverage-report.html
  - bundle-analysis.json
  - lighthouse-report.html
  - security-scan.sarif
```

## Environment Contracts

### Staging Environment
```yaml
name: staging
url: https://owner.github.io/repo
protection_rules:
  required_reviewers: 0
  prevent_self_review: false
variables:
  ENVIRONMENT: staging
  API_BASE_URL: https://api-staging.example.com
```

### Production Environment
```yaml
name: production
url: https://your-domain.com  # Custom domain if configured
protection_rules:
  required_reviewers: 1
  prevent_self_review: true
  deployment_branch_policy:
    protected_branches: true
variables:
  ENVIRONMENT: production
  API_BASE_URL: https://api.example.com
```

## Error Handling Contracts

### Workflow Failure Scenarios
1. **Test Failures**: Workflow stops, sends notification with test results
2. **Build Failures**: Workflow stops, sends notification with build logs
3. **Deployment Failures**: Rollback if possible, send notification with error details
4. **Timeout**: Cancel workflow after 10 minutes, send timeout notification

### Retry Policies
- Network-related failures: 3 retries with exponential backoff
- GitHub API rate limiting: Automatic retry with delay
- Dependency installation: 2 retries for npm install failures

### Cleanup Procedures
- Remove failed deployment attempts
- Clean up temporary artifacts
- Update PR status checks with failure information