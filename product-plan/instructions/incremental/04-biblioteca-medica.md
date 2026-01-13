# Milestone 4: Biblioteca Médica

> **Provide alongside:** `product-plan/product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

---

## Goal

Implement the Biblioteca Médica feature — Búsqueda inteligente en libros, artículos y evidencia médica global en cualquier idioma con resultados en español o inglés.

## Overview

Biblioteca Médica is a smart clinical research assistant with natural language search, structured category navigation, and AI-powered translation between medical languages (EN/ES). It helps clinicians find protocols, anatomical references, and evidence during patient evaluation.

**Key Functionality:**
- Natural language search for protocols and medical literature
- Structured category navigation (Osteology, Myology, Elasticity Tests, etc.)
- View detailed protocol cards (Ficha Explicativa) with definition, justification, procedure steps
- Toggle between original language (often English) and Spanish translation
- View bibliographic references with author, year, title, source
- Add references to treatment plans

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/biblioteca-medica/tests.md` for detailed test-writing instructions including:
- Key user flows to test (success and failure paths)
- Specific UI elements, button labels, and interactions to verify
- Expected behaviors and assertions

**TDD Workflow:**
1. Read `tests.md` and write failing tests for the key user flows
2. Implement the feature to make tests pass
3. Refactor while keeping tests green

## What to Implement

### Components

Copy the section components from `product-plan/sections/biblioteca-medica/components/`:

- **BibliotecaDashboard** — Main interface with search, categories, and results
- **SearchBar** — Prominent search input with natural language support
- **CategoryNav** — Structured category navigation (Osteology, Myology, etc.)
- **ProtocolList** — List of techniques/protocols matching search or category
- **BibliographyPanel** — Dedicated panel for formal citations and references

### Data Layer

The components expect these data shapes:

```typescript
// Protocol structure
interface Protocol {
  id: string
  nombre: string
  categoria: string
  definicionES: string
  definicionEN: string
  justificacion: string
  pasos: string[]
  referencias: ReferenciaBibliografica[]
}

// Reference structure
interface ReferenciaBibliografica {
  id: string
  protocoloId: string
  autor: string
  año: number
  titulo: string
  fuente: string
  url?: string
  idiomaOriginal?: string
}
```

You'll need to:
- Create API endpoints or data fetching logic for protocol/library search
- Implement natural language search with debouncing
- Connect real data to the components
- Implement translation toggle (ES/EN) logic
- Handle missing translations gracefully

### Callbacks

Wire up these user actions:

- `onSearch(query)` — Execute search with natural language query
- `onSelectCategory(category)` — Filter by category
- `onSelectProtocol(protocolId)` — View detailed protocol information
- `onToggleLanguage()` — Toggle between EN/ES translation
- `onViewReference(referenceId)` — View full bibliographic reference or open link
- `onAddToCase(protocolId)` — Add protocol reference to treatment plan

### Empty States

Implement empty state UI for when no data exists:

- **Initial state:** Show helpful welcome message with search and category options
- **No search results:** Display message when search returns no matches
- **Empty category:** Show message when selected category has no protocols yet
- **No bibliography:** Display message when protocol has no references

The provided components include empty state designs — make sure to render them when data is empty rather than showing blank screens.

## Files to Reference

- `product-plan/sections/biblioteca-medica/README.md` — Feature overview and design intent
- `product-plan/sections/biblioteca-medica/tests.md` — Test-writing instructions (use for TDD)
- `product-plan/sections/biblioteca-medica/components/` — React components
- `product-plan/sections/biblioteca-medica/types.ts` — TypeScript interfaces
- `product-plan/sections/biblioteca-medica/sample-data.json` — Test data

## Expected User Flows

When fully implemented, users should be able to complete these flows:

### Flow 1: Search for Protocol

1. User navigates to `/biblioteca`
2. User sees prominent search bar
3. User types natural language query (e.g., "88-year-old patient with hyperkyphosis")
4. System searches and displays matching protocols
5. User scrolls through results
6. **Outcome:** Relevant protocols displayed, user can select to view details

### Flow 2: Browse by Category

1. User sees category chips below search bar
2. User clicks "Osteology" category
3. System filters to show only osteology-related protocols
4. User views protocols
5. User clicks "Myology" category
6. **Outcome:** Results update immediately, only protocols in selected category display

### Flow 3: View Protocol Details (Ficha Explicativa)

1. User clicks on protocol card
2. "Ficha Explicativa" modal/panel opens
3. User reads definition in Spanish
4. User sees justification for using this technique
5. User follows step-by-step procedure
6. User toggles "Ver original" switch to English
7. User reviews bibliographic references
8. **Outcome:** Full protocol information accessible, translation toggle works, references visible

### Flow 4: Add Reference to Treatment Plan

1. User finds relevant protocol during evaluation
2. User views protocol details
3. User clicks "Añadir a Plan de Tratamiento" button
4. System adds reference to clinical case
5. **Outcome:** Reference appears in treatment plan bibliography, ready for reference during sessions

## Done When

- [ ] Tests written for key user flows (success and failure paths)
- [ ] All tests pass
- [ ] Components render with real data
- [ ] Empty states display properly when no search results or empty categories
- [ ] All user actions work (search, filter, select, toggle language)
- [ ] User can complete all expected flows end-to-end
- [ ] Matches the visual design
- [ ] Responsive on mobile
- [ ] Natural language search accepts complex medical queries
- [ ] Translation toggle switches between EN and ES smoothly
- [ ] Bibliographic references format correctly and links work
