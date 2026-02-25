# Mamirri App Documentation 📚

Welcome to the central documentation hub for **Mamirri App** (formerly PhysioCopilot). This repository contains all product, technical, and process documentation for the Digital Clinical Assistant.

---

## 🚀 Quick Start

| Section                                                                         | Description                                                     |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [**Developer Setup**](onboarding/developer-setup.md)                            | **Start here!** Environment setup and local installation guide. |
| [**Product Vision**](.documentation/product/product-vision.md)                  | The "why" and "what" of Mamirri App.                            |
| [**Biblioteca Overview**](.documentation/product/biblioteca-medica-overview.md) | Functional overview of books-only library search and citations. |
| [**Architecture Overview**](technical/architecture.md)                          | High-level system design and technology choices.                |
| [**Biblioteca (Books-Only)**](technical/biblioteca-books-only.md)               | UI routing, caching, open-book viewer, and production mounting. |
| [**CI/CD Pipeline**](technical/ci-cd.md)                                        | GitHub Actions configuration and secrets management.            |
| [**Deployment Guide**](onboarding/deployment-guide.md)                          | Instructions for deploying to home lab environment.             |

---

## 📚 Documentation Sections

Comprehensive documentation is available in the [`.documentation/`](.documentation/) directory:

### 🏥 Product & Vision

- **[User Personas**](.documentation/product/user-personas.md): Detailed persona "María (The Expert Physiotherapist)" with pain points and use cases.
- **[Development Phases**](.documentation/product/phases/):
  - [Phase 1: Core Clinical](.documentation/product/phases/phase-1-core-clinical.md): Patient records and history.
  - [Phase 2: Passive AI](.documentation/product/phases/phase-2-passive-ai.md): Medical knowledge base search.
  - [Phase 3: Supervised AI](.documentation/product/phases/phase-3-supervised-ai.md): AI-assisted clinical suggestions.
  - [Phase 4: Visual Analysis](.documentation/product/phases/phase-4-visual-analysis.md): Foot and posture analysis.
- **[Architecture Decisions (ADRs)**](.documentation/product/decisions/): A log of critical technical choices (Prisma, NestJS, etc.).

### ⚙️ Technical Specifications

- **[Database Schema](.documentation/technical/database-schema.md)**: Data models and PostgreSQL structure.
- **[API Reference](.documentation/technical/api-reference.md)**: REST API endpoints and payload examples.
- **[Security & Privacy](.documentation/technical/security.md)**: Data encryption and anonymization requirements.
- **[Logging System](.documentation/technical/logging-system.md)**: Structured logging, sanitization, and observability.
- **[Knowledge Base & RAG](.documentation/technical/knowledge-base-rag.md)**: AI semantic search and medical literature retrieval.
- **[AI Analysis Guide](.documentation/technical/ai-analysis-feature-guide.md)**: Multi-modal AI orchestration (Voice + Vision + RAG + LLM) for clinical suggestions.
- **[Frontend Auth](.documentation/technical/frontend-authentication.md)**: Implementation details for JWT and protected routes.

### 🔐 Roles & Onboarding (NEW)

- **[Roles & Onboarding](.documentation/roles-and-onboarding.md)**: **Complete guide** covering the 3-tier role system (ADMIN, CLINIC_OWNER, THERAPIST), permissions, and the new clinic-first onboarding flow.
- **[Quick Reference](.documentation/QUICK_REFERENCE.md)**: Developer cheat sheet with code snippets, API examples, and common patterns for role-based development.

### 🇪🇸 Original Project Proposal (ES)

The original project proposal is documented in Spanish:

- **[Propuesta de Proyecto](.documentation/MamirriApp/PROPUESTA_DE_PROYECTO_TECNOLOGICO.md)**: Detailed technical proposal describing the problem, solution, and implementation approach.

This document captures the foundational vision for "Copiloto Clínico", including:

- **Problem definition**: Information dispersion (paper notes, mental records, photos on phone)
- **Solution approach**: "Copiloto Clínico" - Digital Clinical Assistant with voice and photos
- **AI approach**: Evidence-based suggestions, never autonomous diagnoses
- **Technical implementation**: Tablet app with touch interface
- **Future vision**: Transition from private tool to commercial product

**Context**: This provides historical context for understanding the project's original intent. English user stories should reference this proposal for consistency with the original vision.

---

## 🛠 Documentation Standards

### 📖 Documentation Structure

To maintain consistency, all documentation should follow these standards:

#### File Naming

- Use kebab-case for directory names: `product-phases/`, `technical/`, etc.
- Use descriptive file names: `developer-setup.md`, not `dev-setup.md`.
- Group related files in subdirectories: All `phase-*.md` files go in `product/phases/`.

#### Content Guidelines

- **Language**: All product and phase documents should be in English. Historical Spanish documents (e.g., the original proposal) should be preserved but clearly labeled.
- **Format**: All documentation must be written in Markdown.
- **Organization**:
  - Product vision → `product/` directory
  - Phase breakdown → `product/phases/` directory
  - Technical specs → `technical/` directory
  - Developer guides → `onboarding/` directory
- **Cross-referencing**: When referencing other documents, use relative paths (e.g., `../../product/decisions/`).

#### Maintenance

- **"Last Modified"**: Each `.md` file should include a `Last Modified: $(date +%Y-%m-%d)` footer.
- **Link Integrity**: Test all links before committing. Use [`[Section Name](#section-name)`] syntax for cross-file references.

#### Writing Process

- **User Stories**: New significant features should start with a User Story in `.documentation/user-stories/[phase-X]/` following the template.
- **Technical Specs**: Create new `.md` files in `technical/` when architecture changes significantly.
- **Guides**: Update `onboarding/` guides when workflows or infrastructure changes.

### 📖 Documentation Directory Structure

```
documentation/
├── README.md                          # This file (main index)
├── roles-and-onboarding.md            # Role system & onboarding flow (NEW)
├── QUICK_REFERENCE.md                 # Developer cheat sheet (NEW)
├── product/                           # Product vision, personas, and phases
│   ├── product-vision.md             # Product vision and strategic goals
│   ├── user-personas.md               # Target user personas
│   ├── phases/                         # Development phase breakdown
│   │   ├── phase-1-core-clinical.md   # Phase 1: Core Clinical
│   │   ├── phase-2-passive-ai.md       # Phase 2: Passive AI
│   │   ├── phase-3-supervised-ai.md      # Phase 3: Supervised AI
│   │   └── phase-4-visual-analysis.md     # Phase 4: Visual Analysis
│   └── decisions/                     # Architecture Decision Records (ADRs)
├── technical/                         # Technical specifications
│   ├── architecture.md                # System design and architecture
│   ├── ci-cd.md                       # CI/CD pipeline and secrets
│   ├── database-schema.md            # Prisma models and relationships
│   ├── api-reference.md            # API endpoint documentation
│   ├── knowledge-base-rag.md         # RAG and Knowledge Base infrastructure
│   ├── ai-analysis-feature-guide.md    # AI Clinical suggestions pipeline
│   ├── security.md                   # Security and privacy requirements
│   ├── logging-system.md              # Logging, sanitization, and observability
│   └── frontend-authentication.md      # Frontend auth implementation
└── onboarding/                         # Getting started guides
    ├── developer-setup.md            # New developer environment setup
    └── deployment-guide.md          # Production deployment instructions
```

---

## 🗺️ Historical Context

**Note**: The `.documentation/MamirriApp/` subdirectory contains the original project proposal documents in Spanish. These files provide valuable historical context:

- **[Propuesta de Proyecto](.documentation/MamirriApp/PROPUESTA_DE_PROYECTO_TECNOLOGICO.md)**: Full technical proposal defining the "Copiloto Clínico" vision.
- **[Vision y Problema](.documentation/MamirriApp/01_Vision_y_Problema.md)** and **[Flujos de Trabajo](.documentation/MamirriApp/02_Flujos_de_Trabajo.md)**: Additional supporting documents.

These documents were created during the initial concept phase and should be **preserved for historical reference**. When implementing features, consider both the English current requirements and the original Spanish proposal to understand the full vision.
