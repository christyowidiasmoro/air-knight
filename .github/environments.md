# Environment Configurations

## Staging Environment

**Name**: `staging`

### Protection Rules
- **Required reviewers**: 0
- **Wait timer**: 0 minutes
- **Prevent self-review**: false
- **Deployment branch policy**: All branches

### Environment Variables
```
ENVIRONMENT=staging
NODE_ENV=production
VITE_APP_VERSION=${{ github.sha }}
VITE_ENVIRONMENT=staging
```

## Production Environment

**Name**: `production`

### Protection Rules
- **Required reviewers**: 1
- **Wait timer**: 0 minutes  
- **Prevent self-review**: true
- **Deployment branch policy**: Protected branches only
  - Branches: `main`

### Environment Variables
```
ENVIRONMENT=production
NODE_ENV=production
VITE_APP_VERSION=${{ github.sha }}
VITE_ENVIRONMENT=production
```

## Usage in Workflows

### Referencing Environments
```yaml
jobs:
  deploy:
    environment:
      name: staging
      url: ${{ steps.deployment.outputs.page_url }}
```

### Accessing Environment Variables
```yaml
env:
  VITE_ENVIRONMENT: ${{ vars.ENVIRONMENT }}
  VITE_APP_VERSION: ${{ github.sha }}
```