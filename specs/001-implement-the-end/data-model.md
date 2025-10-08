# Data Model: CI/CD Build System

**Date**: 2025-10-08  
**Feature**: End-to-End CI/CD Build System  

## Core Entities

### Build Workflow
Represents the complete CI/CD pipeline configuration and execution.

**Fields**:
- `id`: Unique workflow run identifier (GitHub Actions run ID)
- `name`: Workflow name (e.g., "Web Build and Deploy")
- `trigger`: Event that initiated the workflow (push, pull_request, manual)
- `branch`: Git branch being built
- `commit_sha`: Specific commit hash
- `status`: Workflow status (queued, in_progress, completed, failed, cancelled)
- `created_at`: Workflow initiation timestamp
- `started_at`: Actual execution start timestamp
- `completed_at`: Workflow completion timestamp
- `duration_seconds`: Total execution time
- `runner_os`: Operating system of the runner (ubuntu-latest)
- `conclusion`: Final result (success, failure, cancelled, skipped)

**Relationships**:
- Has many `BuildArtifacts`
- Has many `BuildSteps`
- Belongs to one `Repository`
- Associated with one `CommitAuthor`

**Validation Rules**:
- `commit_sha` must be valid 40-character hex string
- `duration_seconds` must be positive integer
- `status` transitions: queued → in_progress → (completed|failed|cancelled)

### Build Artifact
Represents the output files from successful builds.

**Fields**:
- `id`: Unique artifact identifier
- `workflow_run_id`: Reference to parent workflow
- `name`: Artifact name (e.g., "web-build", "build-logs")
- `type`: Artifact type (web_bundle, apk, logs, reports)
- `size_bytes`: File size in bytes
- `download_url`: GitHub Actions artifact download URL
- `created_at`: Artifact creation timestamp
- `expires_at`: Artifact expiration timestamp (90 days default)
- `checksum`: SHA256 hash for integrity verification
- `deployment_url`: Live deployment URL (for web artifacts)

**Relationships**:
- Belongs to one `BuildWorkflow`
- May reference one `Release`

**Validation Rules**:
- `size_bytes` must be positive integer
- `checksum` must be valid SHA256 hash
- `expires_at` must be after `created_at`

### Release
Represents a versioned distribution of the application.

**Fields**:
- `id`: Unique release identifier
- `tag_name`: Git tag (e.g., "v1.0.0")
- `name`: Release display name
- `description`: Auto-generated release notes
- `draft`: Whether release is in draft state
- `prerelease`: Whether this is a pre-release version
- `created_at`: Release creation timestamp
- `published_at`: Release publication timestamp
- `target_commitish`: Git branch or commit the release targets
- `tarball_url`: Source code archive download URL
- `zipball_url`: Source code zip download URL

**Relationships**:
- Has many `BuildArtifacts` (attached assets)
- References one commit via `target_commitish`

**Validation Rules**:
- `tag_name` must follow semantic versioning (v\d+\.\d+\.\d+)
- `published_at` must be after `created_at` when set

### Environment Configuration
Represents deployment target settings and environment-specific variables.

**Fields**:
- `id`: Unique environment identifier
- `name`: Environment name (development, staging, production)
- `url`: Base URL for the environment
- `branch_pattern`: Git branch pattern that deploys to this environment
- `protection_rules`: JSON object defining approval requirements
- `variables`: JSON object of environment variables
- `secrets`: Array of secret names (values stored securely)
- `created_at`: Environment creation timestamp
- `updated_at`: Last modification timestamp

**Relationships**:
- Has many `BuildWorkflows` (deployments)

**Validation Rules**:
- `name` must be unique within repository
- `url` must be valid HTTP/HTTPS URL
- `branch_pattern` must be valid glob pattern

### Build Status
Represents the current state and history of build executions.

**Fields**:
- `id`: Unique status record identifier
- `workflow_run_id`: Reference to workflow
- `step_name`: Individual step within workflow
- `status`: Step status (pending, in_progress, completed, failed, skipped)
- `conclusion`: Step conclusion (success, failure, cancelled, skipped)
- `started_at`: Step start timestamp
- `completed_at`: Step completion timestamp
- `log_url`: URL to step execution logs
- `error_message`: Error details if step failed

**Relationships**:
- Belongs to one `BuildWorkflow`

**Validation Rules**:
- `completed_at` must be after `started_at` when set
- `error_message` required when `conclusion` is 'failure'

## State Transitions

### Build Workflow States
```
queued → in_progress → (completed|failed|cancelled)
                   ↘ cancelled (if manually cancelled)
```

### Build Step States  
```
pending → in_progress → (completed|skipped)
                    ↘ failed (on error)
```

### Release States
```
draft → published
    ↘ deleted (if not published)
```

## Data Access Patterns

### High-Frequency Queries
- Get latest build status for branch
- List recent builds for repository
- Get artifacts for specific build
- Check environment deployment status

### Batch Operations
- Cleanup expired artifacts
- Archive old build logs
- Generate release reports
- Calculate build metrics

### Integration Points
- GitHub API for workflow data
- GitHub Pages API for deployment status
- Email service for notifications
- Artifact storage for file management