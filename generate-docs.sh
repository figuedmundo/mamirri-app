#!/bin/bash
# scripts/generate-docs.sh
# Generates the complete documentation structure for PhysioCopilot

set -e

echo "📚 Generating PhysioCopilot Documentation Structure..."

# Create directory structure
mkdir -p docs/{product/{phases,decisions},technical,user-stories/{phase-1,phase-2,phase-3,phase-4},onboarding}
mkdir -p .github/ISSUE_TEMPLATE

# ========================
# 1. Documentation Index
# ========================
cat > docs/README.md << 'EOF'
# PhysioCopilot Documentation

## Quick Links

### Product Documentation
- [Product Vision](product/product-vision.md) - The "why" behind PhysioCopilot
- [User Personas](product/user-personas.md) - Who we're building for
- [Phase Roadmaps](product/phases/) - Detailed phase breakdown

### Technical Documentation
- [Architecture Overview](technical/architecture.md)
- [Database Schema](technical/database-schema.md)
- [API Reference](technical/api-reference.md)
- [Security Requirements](technical/security.md)

### Development
- [Developer Setup](onboarding/developer-setup.md) - Start here!
- [Deployment Guide](onboarding/deployment-guide.md)
- [Architecture Decisions](product/decisions/) - Why we made key choices

### User Stories
- [Phase 1: Core Clinical](user-stories/phase-1/)
- [Phase 2: Passive AI](user-stories/phase-2/)
- [Phase 3: Supervised AI](user-stories/phase-3/)
- [Phase 4: Visual Analysis](user-stories/phase-4/)

## Documentation Standards

- Use markdown for all docs
- Link between documents liberally
- Update "Last Modified" date when editing
- Follow the user story template for new features
EOF

# ========================
# 2. Product Vision
# ========================
cat > docs/product/product-vision.md << 'EOF'
# Product Vision: PhysioCopilot

## The Problem
Clinical excellence is hindered by:
- Information scattered across paper, photos, and memory
- Language barriers to medical literature
- Tedious data entry disrupting therapy flow

## The Solution
A "Second Brain" for physiotherapists that:
- Captures clinical data effortlessly (voice + photos)
- Organizes patient history automatically
- Consults global medical literature instantly
- **Never replaces human judgment, only supports it**

## Core Principles
1. **Human Decides:** AI never diagnoses or prescribes autonomously
2. **Zero Friction:** No keyboards during therapy
3. **Evidence-Based:** All suggestions cite sources
4. **Progressive Enhancement:** Each phase adds value independently

## Success Metrics
- **Phase 1:** Therapist can complete a session faster than paper
- **Phase 2:** AI saves 30 minutes/day in literature review
- **Phase 3:** Pattern recognition suggests relevant past cases 80% of the time
- **Phase 4:** Visual analysis catches missed asymmetries in 1 of 10 cases

## Non-Goals (Explicitly Out of Scope)
- ❌ Autonomous diagnosis
- ❌ CAD for orthotic design (Phase 1-3)
- ❌ Multi-clinic management (Phase 1-3)
- ❌ Billing/Insurance integration
- ❌ Replacing manual examination

---

**Last Updated:** $(date +%Y-%m-%d)
**Stakeholder:** [Your Mom's Name]
EOF

# ========================
# 3. User Personas
# ========================
cat > docs/product/user-personas.md << 'EOF'
# User Personas

## Primary Persona: The Expert Physiotherapist

**Name:** María (Placeholder - your mom's actual profile)

**Demographics:**
- Age: 50s
- Experience: 25+ years in clinical practice
- Specialization: Podiatry, postural biomechanics
- Tech comfort: Moderate (uses iPad, but prefers simple tools)

**Daily Workflow:**
- Sees 8-12 patients per day
- Each session: 30-45 minutes
- Spends 5-10 minutes on notes per patient (wants: <3 minutes)
- Takes photos of feet/posture on phone
- Stores paper records in physical folders

**Pain Points:**
1. **Memory Overload:** "I can't remember exactly how this patient looked 6 months ago"
2. **Time Waste:** "I know I read about this condition, but I can't find the book"
3. **Data Chaos:** "Photos are on my phone, notes on paper, measurements in my head"
4. **Tech Friction:** "Software with too many buttons makes me slower, not faster"

**Goals:**
- Focus on patient, not paperwork
- Access entire clinical knowledge base instantly
- Compare patient progress objectively over time
- Delegate tedious tasks to technology

**Fears:**
- Technology that makes mistakes with patient data
- Losing patient trust if AI gets something wrong
- System crashes during a busy day
- Software that's harder than paper

**Technology Adoption Pattern:**
- "Show me it works once, then I'll use it"
- Needs verbal training, not written manuals
- Values reliability over fancy features

---

**Last Updated:** $(date +%Y-%m-%d)
EOF

# ========================
# 4. Phase 1 Documentation (From Mom's Feedback)
# ========================
cat > docs/product/phases/phase-1-core-clinical.md << 'EOF'
# Phase 1: Core Clinical System (MVP)

**Duration:** 8 weeks  
**Status:** 🔴 Not Started  
**Goal:** Functional clinical data manager without AI (better than paper)

---

## 1.1 Core Clinical Data

### Entities
- **Patient** - Demographics, history
- **Session** - Date, observations, treatments
- **Observations** - Clinical notes (text/voice)
- **Treatments** - Applied techniques
- **Images** - Foot prints, posture, gait
- **Orthotic Metadata** - Conceptual design notes (not CAD)

### Key Features
- ✅ Complete CRUD operations
- ✅ Immutable history (finalized sessions can't be edited)
- ✅ Offline-first data access

---

## 1.2 Patient Management (Ultra-Simple UX)

### MVP Requirements
**Must Have:**
- Create patient in < 1 minute
- Minimum fields:
  - Full name
  - Age (or birthdate)
  - Chief complaint (why they came)

**Optional Fields:**
- Phone, Email, Occupation, Medical history

### Design Rule
> "If it's not used daily, it's not in the MVP."

### Acceptance Criteria
- [ ] Patient list loads in < 2 seconds
- [ ] Search by name works instantly
- [ ] Creating a patient requires max 3 taps
- [ ] Can create patient with voice only (accessibility)

---

## 1.3 Session Recording

### Automatic Data
- Date/time (auto-captured)
- Session number (auto-incremented)

### Manual Entry
- Free-form observations (text or voice dictation)
- Techniques used (checkboxes):
  - [ ] Massage therapy
  - [ ] Electrotherapy
  - [ ] Therapeutic exercises
  - [ ] Orthotic adjustment
  - [ ] Manual therapy
  - [ ] Other: _______

### Media Attachment
- Attach photos directly
- Auto-associate to current session
- Timestamp each photo

---

## 1.4 Clinical Images

### Requirements
- Direct upload from tablet/mobile camera
- Auto-association to current session
- Chronological display
- **No editing tools in MVP**

### Image Types (Metadata Tags)
- Foot print (plantar/dorsal)
- Posture (anterior/posterior/lateral)
- Gait analysis
- Other

---

## 1.5 Security (MVP Requirements)

### Data Protection
- ✅ Data encrypted at rest (database level)
- ✅ Data encrypted in transit (HTTPS only)
- ✅ Access only by authorized user (JWT)

### Backup Strategy
- ✅ Automatic daily backups (3:00 AM local time)
- ✅ 30-day retention
- ✅ Encrypted backup files

### Privacy
- ❌ No external synchronization
- ❌ No cloud analytics
- ❌ No third-party services (except storage)

---

## Phase 1 Success Criteria

**The system is ready when:**
1. ✅ Therapist completes 10 real sessions without asking for help
2. ✅ Zero data loss in 1 month of use
3. ✅ Faster than paper workflow (measured: avg 3 min vs 5 min)
4. ✅ Therapist actively chooses digital over paper

---

**Last Updated:** $(date +%Y-%m-%d)
EOF

# ========================
# 5. Phase 2 Documentation
# ========================
cat > docs/product/phases/phase-2-passive-ai.md << 'EOF'
# Phase 2: Passive Intelligence (MVP+)

**Duration:** 4-6 weeks  
**Status:** 🔴 Not Started  
**Goal:** AI assists with knowledge, doesn't make decisions

---

## 2.1 Knowledge Base (RAG Initial)

### Components
- Vector database (pgvector)
- Documents:
  - Physiotherapy textbooks
  - Personal notes
  - Scanned PDFs
  - Multilingual texts

### Function
- Semantic search
- Answers in Spanish
- Clinical context, not generic

**Critical Rule:** AI doesn't see patient data, only reference texts.

---

## 2.2 Theoretical Consultation Assistant

### Examples
- "What do authors say about lumbar pain and pronated gait?"
- "Relationship between knee valgus and plantar fasciitis?"

### Hard Limitations
- ❌ No treatment suggestions
- ❌ No patient mentions
- ❌ No diagnoses

---

## 2.3 Automatic Summaries

- Session summary
- Patient evolution (generated text)
- **Always editable by the professional**

---

## Success Criteria

**The system is ready when:**
1. ✅ Knowledge base contains 5+ key textbooks
2. ✅ Search returns relevant passages 80% of the time
3. ✅ Therapist uses search feature 3+ times per week
4. ✅ Zero hallucinations (all answers cite sources)

---

**Last Updated:** $(date +%Y-%m-%d)
EOF

# ========================
# 6. Phase 3 & 4 (Brief Placeholders)
# ========================
cat > docs/product/phases/phase-3-supervised-ai.md << 'EOF'
# Phase 3: Supervised Clinical Intelligence

**Duration:** 6-10 weeks  
**Status:** 🔴 Not Started  
**Goal:** AI learns from therapist's decisions

---

## 3.1 Decision Capture

System records:
- What was observed
- What was decided
- Treatment applied
- Observed outcome

---

## 3.2 Pattern Models (NOT diagnosis)

AI can:
- Detect repeated patterns
- Suggest "similar cases"
- Show historical comparisons

**Never:**
- "Do this"
- "Patient has..."

---

## 3.3 Explainable AI

Every suggestion shows:
- Why it appears
- Which cases it's based on
- Confidence level

---

**Last Updated:** $(date +%Y-%m-%d)
EOF

cat > docs/product/phases/phase-4-visual-analysis.md << 'EOF'
# Phase 4: Advanced Support (Posture & Gait)

**Duration:** 8-12 weeks  
**Status:** 🔴 Not Started  
**Goal:** AI-assisted visual analysis

---

## 4.1 Image Analysis (Assisted)

- Image comparison over time
- Basic asymmetry detection
- Approximate measurements (simple angles)

⚠️ **Disclaimer:**
"Visual assistance, not certified medical measurement"

---

## 4.2 Orthotics (Conceptual Level)

- Record conceptual design
- Adjustment history
- Design → clinical evolution relationship

**Not CAD yet**

---

**Last Updated:** $(date +%Y-%m-%d)
EOF

# ========================
# 7. ADR Template
# ========================
cat > docs/product/decisions/template.md << 'EOF'
# ADR-XXX: [Decision Title]

**Status:** 🟡 Proposed / ✅ Accepted / ❌ Rejected / ⚠️ Deprecated  
**Date:** YYYY-MM-DD  
**Deciders:** [Names]

---

## Context

What's the situation? What problem are we solving?

---

## Decision

What did we decide? Be specific.

---

## Consequences

### Positive
- ✅ Benefit 1
- ✅ Benefit 2

### Negative
- ⚠️ Downside 1
- ⚠️ Downside 2

### Mitigation
How do we address the negatives?

---

## Alternatives Considered

### Option A (Rejected)
Why we didn't choose this

### Option B (Rejected)
Why we didn't choose this

---

## References
- Link to related docs
- External resources
EOF

# ========================
# 8. Technical Docs (Placeholders)
# ========================
cat > docs/technical/architecture.md << 'EOF'
# System Architecture

## Overview
PhysioCopilot uses a modular monolith architecture built with:
- **Frontend:** React + Vite + Shadcn/UI
- **Backend:** NestJS + Prisma ORM
- **Database:** PostgreSQL (with pgvector extension)
- **Storage:** MinIO (S3-compatible)

## Diagrams
[TODO: Add C4 diagrams in future iterations]

---

**Last Updated:** $(date +%Y-%m-%d)
EOF

cat > docs/technical/database-schema.md << 'EOF'
# Database Schema

## Prisma Models

[TODO: Document each Prisma model with:
- Fields and types
- Relationships
- Validation rules
- Example queries]

---

**Last Updated:** $(date +%Y-%m-%d)
EOF

cat > docs/technical/api-reference.md << 'EOF'
# API Reference

## Authentication

### POST /api/auth/login
[TODO: Document each endpoint]

---

**Last Updated:** $(date +%Y-%m-%d)
EOF

cat > docs/technical/security.md << 'EOF'
# Security Requirements

## Phase 1: MVP Security
- JWT authentication
- HTTPS only
- Encrypted data at rest
- Daily backups

## Phase 2+: Enhanced Security
[TODO: Document AI-specific security measures]

---

**Last Updated:** $(date +%Y-%m-%d)
EOF

# ========================
# 9. Onboarding Docs
# ========================
cat > docs/onboarding/developer-setup.md << 'EOF'
# Developer Setup Guide

## Prerequisites
- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- Git

## Quick Start

1. Clone the repository
```bash
git clone <repo-url>
cd mamirri-app
```

2. Run setup script
```bash
./scripts/setup-dev.sh
```

3. Edit .env with your API keys
```bash
nano .env
# Add: GROQ_API_KEY, GOOGLE_API_KEY
```

4. Start development servers
```bash
pnpm dev
```

5. Access
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- MinIO: http://localhost:9001

---

**Last Updated:** $(date +%Y-%m-%d)
EOF

cat > docs/onboarding/deployment-guide.md << 'EOF'
# Deployment Guide

## Ubuntu Home Lab Deployment

[TODO: Document deployment steps for your Ubuntu server]

---

**Last Updated:** $(date +%Y-%m-%d)
EOF

# ========================
# 10. GitHub Issue Templates
# ========================
cat > .github/ISSUE_TEMPLATE/user-story.md << 'EOF'
---
name: User Story
about: Feature request following user story format
title: '[US-XXX] '
labels: user-story
assignees: ''
---

## User Story

**As a** [type of user]  
**I want to** [action]  
**So that** [benefit]

## Acceptance Criteria

- [ ] Given [context], When [action], Then [expected result]
- [ ] Given [context], When [action], Then [expected result]

## Technical Tasks

### Backend
- [ ] Task 1
- [ ] Task 2

### Frontend
- [ ] Task 1
- [ ] Task 2

## Definition of Done
- [ ] Code merged to main
- [ ] Tests pass
- [ ] Reviewed by peer
- [ ] Documentation updated
EOF

cat > .github/ISSUE_TEMPLATE/bug-report.md << 'EOF'
---
name: Bug Report
about: Report a bug
title: '[BUG] '
labels: bug
assignees: ''
---

## Description
A clear description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen?

## Actual Behavior
What actually happens?

## Screenshots
If applicable, add screenshots.

## Environment
- Device: [iPad, Desktop, etc.]
- Browser: [Chrome, Safari, etc.]
- Version: [e.g., v1.0.0]
EOF

cat > .github/ISSUE_TEMPLATE/phase-completion.md << 'EOF'
---
name: Phase Completion Review
about: Checklist for phase sign-off
title: 'Phase X Completion Review'
labels: phase-review
assignees: ''
---

## Phase Summary
**Phase:** [1, 2, 3, or 4]  
**Duration:** X weeks  
**Status:** 🟢 Complete / 🟡 Needs Work

## Checklist

### Development
- [ ] All user stories completed
- [ ] All acceptance criteria met
- [ ] Tests pass (unit + integration + E2E)
- [ ] Documentation updated

### Validation
- [ ] Stakeholder demo completed
- [ ] Feedback incorporated
- [ ] Performance meets benchmarks
- [ ] Security audit passed (if applicable)

### Decision
- [ ] **Proceed to next phase** (all green)
- [ ] **Pivot required** (major issues found)
- [ ] **Extend current phase** (minor issues)

## Notes
[Add any important observations or lessons learned]
EOF

# ========================
# Final Message
# ========================
echo ""
echo "✅ Documentation structure created successfully!"
echo ""
echo "📂 Generated:"
echo "   - docs/product/ (vision, personas, phases)"
echo "   - docs/technical/ (architecture, schema, API)"
echo "   - docs/user-stories/ (phase folders)"
echo "   - docs/onboarding/ (setup guides)"
echo "   - .github/ISSUE_TEMPLATE/ (issue templates)"
echo ""
echo "📝 Next steps:"
echo "   1. Review docs/product/product-vision.md"
echo "   2. Customize docs/product/user-personas.md with your mom's details"
echo "   3. Start filling in user stories for Phase 1"
echo ""
echo "💡 Tip: Use 'docs/product/decisions/template.md' whenever you make a big technical decision"
echo ""