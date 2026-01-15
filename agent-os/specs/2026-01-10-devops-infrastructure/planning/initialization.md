# DevOps Infrastructure - Week 3

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

## Context

This is Week 3 of Phase 0: Foundations & Infrastructure. The goal is to establish solid DevOps practices before implementing business logic. Previous weeks (Week 1-2) have already set up Docker infrastructure, Prisma schema, NestJS structure, authentication, and MinIO integration.

## Tech Stack Context

- Framework: NestJS (Backend), React 19 + Vite (Frontend)
- Database: PostgreSQL 16 with pgvector
- Containerization: Docker & Docker Compose
- CI/CD: GitHub Actions (preferred)
- Package Manager: pnpm
- Testing: Jest
- Linting/Formatting: ESLint, Prettier
