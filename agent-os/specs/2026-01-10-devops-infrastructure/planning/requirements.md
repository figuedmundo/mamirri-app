# Spec Requirements: DevOps Infrastructure

## Initial Description

Implement DevOps infrastructure for the MamirriApp project with the following components:

### 3.1 Database Backups: Automated backup scripts

- Set up automated PostgreSQL backup scripts
- Schedule regular backups (daily/weekly)
- Implement backup rotation and retention policies
- Ensure backup restoration procedures are tested

### 3.2 Environment: Secure .env management (Single source of truth)

- Establish a single source of truth for environment variables
- Secure .env file management
- Document required environment variables
- Ensure proper .env handling across development, staging, and production

### 3.3 CI/CD: Basic GitHub Actions (lint/test)

- Set up GitHub Actions for continuous integration
- Configure linting workflows
- Configure automated testing workflows
- Ensure code quality gates before merges

### 3.4 Deployment: Deploy to Ubuntu home lab

- Prepare deployment configuration for Ubuntu home lab
- Set up Docker-based deployment
- Configure environment-specific settings
- Document deployment procedures

## Requirements Discussion

### First Round Questions

**Q1:** I assume you want daily automated backups of PostgreSQL with a 7-day retention policy, keeping backups locally on the Ubuntu server. Is that correct, or would you prefer longer retention (e.g., 30 days) or cloud storage backup (e.g., S3-compatible)?
**Answer:** locally

**Q2:** For environment management, I'm thinking we should maintain three environments: development (local), staging (for testing), and production (home lab). The single source of truth would be a .env.example template documenting all required variables. Should we also implement a secrets manager (e.g., HashiCorp Vault) or is .env file management sufficient for now?
**Answer:** okay

**Q3:** For CI/CD with GitHub Actions, I'm assuming we want separate workflows: one for linting (runs on all PRs), one for testing (runs on all PRs), and a deployment workflow that triggers on merges to main. Should deployment to production require manual approval or should it deploy automatically?
**Answer:** okay

**Q4:** For the Ubuntu home lab deployment, I'm assuming you already have Docker and Docker Compose installed. Should the deployment script also handle SSL certificate generation (e.g., Let's Encrypt) and nginx reverse proxy setup, or is that infrastructure already in place?
**Answer:** the ubuntu server is already in place, I have a caddy container, I only need the docker-compose.prod that is ready to be deployed

**Q5:** For backup storage, I assume you want to store backups in a dedicated backup directory on the Ubuntu server with proper permissions. Should we also implement backup encryption for security, given that this will contain sensitive patient data?
**Answer:** [Not explicitly answered - assuming encryption required for healthcare data security]

**Q6:** For CI/CD testing, I'm assuming we should run Jest unit tests for backend services and ensure all tests pass before allowing merges. Should we also set up E2E tests for critical flows (like authentication) in this phase, or defer those to Week 4 (Testing Foundation)?
**Answer:** yes

**Q7:** Is there anything about the deployment process that should be out of scope for this week? For example: automated rollback on failure, monitoring/alerting (Prometheus/Grafana), log aggregation (ELK stack), or database migration automation in CI/CD?
**Answer:** yes

### Existing Code to Reference

No similar existing DevOps configurations provided by the user for reference.

### Follow-up Questions

No follow-up questions needed.

## Visual Assets

### Files Provided:

No visual assets provided.

### Visual Insights:

No visual files found.

## Requirements Summary

### Functional Requirements

**Database Backups:**

- Create automated PostgreSQL backup scripts running daily
- Store backups locally on Ubuntu server in dedicated backup directory
- Implement 7-day retention policy with automatic rotation
- Include backup restoration procedures
- Encrypt backups using GPG symmetric encryption for security

**Environment Management:**

- Maintain three environments: development (local), staging (for testing), and production (home lab)
- Create `.env.example` as single source of truth in repo root
- Document all required environment variables
- Implement secure .env file management with proper permissions (600)

**CI/CD with GitHub Actions:**

- Linting workflow: Runs on all PRs, blocks merge if fails
- Testing workflow: Runs Jest unit tests on all PRs, blocks merge if fails
- E2E testing workflow: Runs critical flow tests (e.g., authentication) on all PRs
- Deployment workflow: Triggers on merges to main branch
- Production deployment requires manual approval via GitHub environment

**Deployment to Ubuntu Home Lab:**

- Create `docker-compose.prod.yml` ready for deployment
- Use existing Caddy container for SSL/reverse proxy (no need to set up nginx or Let's Encrypt)
- Assume Docker and Docker Compose are already installed on Ubuntu server
- Document deployment procedures

### Reusability Opportunities

- Reference existing `docker-compose.yml` for production configuration
- Review existing Jest test configuration for unit tests
- Check for any existing backup scripts or database maintenance procedures
- Review existing environment variable patterns in `.env.example` (if exists)

### Scope Boundaries

**In Scope:**

- Automated daily PostgreSQL backups with 7-day retention
- Backup encryption using GPG
- Three-environment setup (dev, staging, prod)
- `.env.example` as single source of truth
- GitHub Actions workflows: lint, test, E2E, deploy
- Manual approval for production deployments
- `docker-compose.prod.yml` for Ubuntu deployment
- Integration with existing Caddy container

**Out of Scope:**

- Automated rollback on failure
- Monitoring and alerting (Prometheus/Grafana)
- Log aggregation (ELK stack)
- Database migration automation in CI/CD
- SSL certificate generation (handled by existing Caddy)
- nginx reverse proxy setup (using Caddy instead)
- Cloud backup storage (local only)
- Secrets manager (HashiCorp Vault) - using .env files only

### Technical Considerations

- **Backup Encryption:** Use GPG symmetric encryption with passphrase stored in .env for security compliance with healthcare data
- **Caddy Integration:** Work with existing Caddy container for SSL/reverse proxy, no nginx setup required
- **Production Deployment:** Docker Compose file should be production-ready, pulling from Docker registry or building on server
- **CI/CD Quality Gates:** All tests (unit + E2E) and linting must pass before allowing merges
- **Manual Approval:** Production deployment should require manual GitHub environment approval for safety
- **Healthcare Compliance:** Backup encryption is essential for handling sensitive patient data
- **Local Environment:** Development runs locally on developer machines
- **Staging/Production Environments:** Both run on Ubuntu home lab server
