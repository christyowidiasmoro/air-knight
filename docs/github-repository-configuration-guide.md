# GitHub Repository Configuration Guide

## T004: Configure GitHub Repository Settings

### Actions Required (Manual Configuration via GitHub UI)

#### 1. Enable GitHub Actions
- Navigate to: `Settings` → `Actions` → `General`
- Set "Actions permissions" to: **Allow all actions and reusable workflows**
- Set "Workflow permissions" to: **Read and write permissions**
- Enable: **Allow GitHub Actions to create and approve pull requests**

#### 2. Configure Repository Permissions
- Navigate to: `Settings` → `Actions` → `General` → `Workflow permissions`
- Select: **Read and write permissions**
- Check: **Allow GitHub Actions to create and approve pull requests**

#### 3. Set Up Environments
- Navigate to: `Settings` → `Environments`
- Create environment: **staging**
  - Protection rules: No required reviewers
  - Deployment branches: All branches
- Create environment: **production**  
  - Protection rules: Require 1 reviewer
  - Deployment branches: Protected branches only (main)

#### 4. Configure GitHub Pages
- Navigate to: `Settings` → `Pages`
- Set "Source" to: **GitHub Actions**
- Custom domain: Optional (can be configured later)

#### 5. Configure Repository Secrets (Future Tasks)
- Navigate to: `Settings` → `Secrets and variables` → `Actions`
- Secrets will be added in later tasks as needed

### Verification Steps
1. Go to `Actions` tab - should show "Get started with GitHub Actions"
2. Check `Settings` → `Environments` - should show staging and production
3. Check `Settings` → `Actions` → `General` - permissions should be read/write
4. Check `Settings` → `Pages` - should show "GitHub Actions" as source

### Status
**Manual configuration required** - This task needs to be completed via GitHub web interface.

**Next Steps**: Complete T005 and T006 can proceed in parallel once T004 is done.