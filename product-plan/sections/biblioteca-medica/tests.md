# Test Instructions: Biblioteca Médica

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup (Jest, Vitest, Playwright, Cypress, React Testing Library, RSpec, Minitest, PHPUnit, etc.).

## Overview

Biblioteca Médica is a smart clinical research assistant with natural language search, structured category navigation, and AI-powered translation between medical languages (EN/ES). It helps clinicians find protocols, anatomical references, and evidence during patient evaluation.

---

## User Flow Tests

### Flow 1: Intelligent Search

**Scenario:** User searches for treatment protocol using natural language

#### Success Path

**Setup:**

- Bibliography database is indexed and available
- User is authenticated

**Steps:**

1. User navigates to `/biblioteca`
2. User sees prominent search bar
3. User types "88-year-old patient with hyperkyphosis" in search
4. User presses Enter or clicks search icon
5. System displays matching protocols (McKenzie, RPG, etc.)
6. User scrolls through results

**Expected Results:**

- [ ] Search input accepts natural language queries
- [ ] Results display with relevant protocols sorted by relevance
- [ ] Each result shows protocol name and brief description
- [ ] Loading state appears during search (spinner or skeleton)
- [ ] Search debounces (doesn't fire on every keystroke)
- [ ] Results highlight search terms when present in description
- [ ] Empty results show helpful message if no matches found

#### Failure Path: No Results

**Setup:**

- User searches for non-existent or very specific query

**Steps:**

1. User types "quantum therapy protocol for martian physiology"
2. System searches database
3. No results found

**Expected Results:**

- [ ] Empty state message: "No se encontraron resultados"
- [ ] Helpful text: "Intenta con otros términos o navega por categorías."
- [ ] Search input remains enabled for refinement
- [ ] Category filters are still visible and clickable

---

### Flow 2: Category Browsing

**Scenario:** User navigates through structured clinical categories

#### Success Path

**Setup:**

- Categories are defined (Osteology, Myology, Elasticity Tests, etc.)

**Steps:**

1. User sees category chips below search bar
2. User clicks "Osteology" category
3. System filters protocols to show only osteology-related content
4. User clicks "Myology"
5. Results update to myology protocols

**Expected Results:**

- [ ] Category chips are visible and labeled
- [ ] Clicking category highlights it as active (teal background)
- [ ] Only protocols in selected category display
- [ ] Category selection persists until changed
- [ ] Search results update immediately on category change
- [ ] Active category indicator shows current filter

#### Failure Path: Empty Category

**Setup:**

- Selected category has no protocols yet

**Steps:**

1. User clicks on category with no content
2. System filters to empty set

**Expected Results:**

- [ ] Empty state message: "No hay protocolos en esta categoría"
- [ ] Suggestion: "Añade nuevos protocolos o busca en todas las categorías"
- [ ] User can navigate to other categories
- [ ] Search bar remains functional

---

### Flow 3: Protocol Consultation (Ficha Explicativa)

**Scenario:** User views detailed technique information with translation toggle

#### Success Path

**Setup:**

- Protocol is selected (e.g., "Sphinx Position")
- Protocol has definition, justification, procedure steps

**Steps:**

1. User clicks on protocol card from search results
2. "Ficha Explicativa" modal/panel opens
3. User reads definition in Spanish
4. User sees justification for using this technique
5. User follows step-by-step procedure
6. User toggles "Ver original" switch
7. Content changes to English source language

**Expected Results:**

- [ ] Ficha modal displays with clear sections (Definition, Justification, Procedure)
- [ ] Procedure steps are numbered and easy to follow
- [ ] Toggle switch shows current language (EN or ES)
- [ ] Toggling switches content between languages smoothly
- [ ] Original source displays with citation (author, year)
- [ ] Close button dismisses modal/panel
- [ ] Mobile: Modal is full-screen and scrollable

#### Failure Path: Missing Translation

**Setup:**

- Protocol exists in database but no Spanish translation available

**Steps:**

1. User selects protocol
2. User toggles to Spanish
3. System has no ES translation

**Expected Results:**

- [ ] Message: "Traducción no disponible"
- [ ] Original English text displays with fallback
- [ ] Toggle shows English as active
- [ ] User can still read original content

---

### Flow 4: Evidence Verification

**Scenario:** User reviews bibliographic references for a treatment

#### Success Path

**Setup:**

- Protocol has associated bibliography

**Steps:**

1. User scrolls to "Referencias Bibliográficas" section
2. User sees list of citations
3. User clicks on a reference
4. Full reference details display or link opens

**Expected Results:**

- [ ] Bibliography panel displays with proper formatting
- [ ] Each citation includes: Author, Year, Title, Source
- [ ] Links to original source are clickable
- [ ] Citations are numbered or bulleted clearly
- [ ] Reference panel is scrollable if many citations

#### Failure Path: No References

**Setup:**

- Protocol has no associated bibliography

**Steps:**

1. User views protocol details
2. User scrolls to reference section

**Expected Results:**

- [ ] Message: "No hay referencias disponibles"
- [ ] No broken UI or empty space
- [ ] Rest of protocol content displays normally

---

## Empty State Tests

### Initial Empty State

**Scenario:** User navigates to biblioteca with no search query

**Setup:**

- No search term entered
- No category selected

**Expected Results:**

- [ ] Welcome message or placeholder text visible
- [ ] Search bar is prominent and focused
- [ ] Category chips display all available categories
- [ ] Sample or "protocolos destacados" may show
- [ ] Clear call-to-action: "Busca por diagnóstico, nombre de técnica o categoría"
- [ ] No broken interface

### No Search Results

**Scenario:** Search returns no matches

**Setup:**

- Search term yields no protocols

**Expected Results:**

- [ ] Clear message: "No se encontraron resultados para [query]"
- [ ] Suggestion: "Intenta con otros términos"
- [ ] "Ver todas las categorías" link visible
- [ ] Search input retains query for editing
- [ ] Category filters remain clickable

---

## Component Interaction Tests

### BibliotecaDashboard

**Renders correctly:**

- [ ] Search bar is prominent and centrally positioned
- [ ] Category chips display in scrollable row below search
- [ ] Results area shows protocols or empty state
- [ ] Recent searches or "protocolos destacados" display if available

**User interactions:**

- [ ] Typing in search triggers search after debounce (300-500ms)
- [ ] Pressing Enter submits search immediately
- [ ] Clicking category chip filters results
- [ ] Clicking protocol card opens details modal

### SearchBar

**Renders correctly:**

- [ ] Input field with placeholder text is visible
- [ ] Search icon shows on left side
- [ ] Clear button (X) appears when text is entered

**User interactions:**

- [ ] Typing updates search state
- [ ] Clicking clear button empties input and clears results
- [ ] Focus shows ring or highlight effect
- [ ] Submit triggers search callback with query

### CategoryNav

**Renders correctly:**

- [ ] All categories display as chips/buttons
- [ ] Category names are clearly labeled
- [ ] Active category has distinct styling (teal background)

**User interactions:**

- [ ] Hover effect shows on category chips
- [ ] Clicking selects category and filters results
- [ ] Active category deselects when clicking different category
- [ ] Horizontal scroll appears if categories exceed viewport width

### ProtocolList

**Renders correctly:**

- [ ] Protocol cards display in grid or list layout
- [ ] Each card shows protocol name and brief description
- [ ] Search terms are highlighted in description
- [ ] Protocol card shows type or category badge

**User interactions:**

- [ ] Hover effect on protocol cards
- [ ] Clicking card opens protocol details
- [ ] Infinite scroll or "Load More" works if many results
- [ ] Cards respond to category filter changes

### BibliographyPanel

**Renders correctly:**

- [ ] Panel displays with heading "Referencias"
- [ ] Citations list in proper format (APA or similar)
- [ ] Each citation has link indicator if URL exists

**User interactions:**

- [ ] Clicking citation opens reference in new tab or shows details
- [ ] Panel scrolls if many citations
- [ ] Copy citation button (if present) works

---

## Edge Cases

- [ ] **Very long search queries:** Input doesn't break layout, may truncate visually
- [ ] **100+ protocols in category:** List scrolls smoothly, performance doesn't degrade
- [ ] **Special medical characters:** Greek letters, superscripts, subscripts display correctly
- [ ] **Protocol with 50+ steps:** Modal is scrollable, all steps accessible
- [ ] **No translation for protocol:** Falls back to English, shows message
- [ ] **Malformed URLs:** Invalid links show error or don't break navigation
- [ ] **Concurrent searches:** Multiple rapid searches don't cause race conditions
- [ ] **Empty bibliography:** Protocol still displays, message shows "No references"
- [ ] **Very long citation titles:** Truncate with ellipsis, full title visible on click/hover
- [ ] **Unicode characters in search:** Accents, tildes, special chars handled correctly
- [ ] **Search with only special characters:** Shows empty results gracefully
- [ ] **Rapid category switching:** No layout flash or content flicker

---

## Accessibility Checks

- [ ] Search input has associated label (visible or ARIA)
- [ ] Category chips are keyboard accessible (tab navigation)
- [ ] Protocol cards are keyboard accessible (enter to open)
- [ ] Modal/panel can be dismissed with Escape key
- [ ] Focus is trapped within modal when open
- [ ] Language toggle has aria-label indicating current state (EN/ES)
- [ ] Links to external references open in new tab (target="\_blank")
- [ ] Search results are announced to screen readers (count, first result)
- [ ] Empty state messages are clear and descriptive
- [ ] Error messages are announced immediately

---

## Sample Test Data

Use the data from `sample-data.json` or create variations:

```typescript
// Example test data - search results
const mockSearchResults: Protocol[] = [
  {
    id: 'prot-001',
    nombre: 'Posición de Esfinge',
    categoria: 'Osteology',
    definicionES: 'Decúbito prono con apoyo antebrazos y flexión de cervical',
    definicionEN: 'Prone position with forearm support and cervical flexion',
    justificacion: 'Reducir carga sobre columna cervical y mejorar alineación',
    pasos: [
      '1. Colocar paciente en decúbito prono',
      '2. Flexionar rodillas a 90°',
      '3. Colocar antebrazos debajo de la cabeza',
      '4. Mantener 5-10 minutos',
    ],
    referencias: [
      {
        autor: 'McKenzie, R.',
        año: 1981,
        titulo: 'The Lumbar Spine: Mechanical Diagnosis',
        fuente: 'Journal of Manual Medicine',
      },
    ],
  },
];

// Example test data - categories
const mockCategories: Category[] = [
  { id: 'cat-001', nombre: 'Osteology', protocolosCount: 45 },
  { id: 'cat-002', nombre: 'Myology', protocolosCount: 32 },
  { id: 'cat-003', nombre: 'Elasticity Tests', protocolosCount: 18 },
  { id: 'cat-004', nombre: 'Propiocepción', protocolosCount: 24 },
];

// Example test data - empty states
const mockEmptyResults: Protocol[] = [];

const mockNoBibliografia: Protocol = {
  id: 'prot-999',
  nombre: 'Técnica Personalizada',
  categoria: 'Custom',
  referencias: [],
};
```

---

## Notes for Test Implementation

- Mock search API to test success, empty, and error scenarios
- Test search debouncing with rapid typing
- Verify language toggle content switches between EN and ES correctly
- Test that category filters work independently from search
- Ensure modal/panel can be closed with multiple methods (X button, Escape, backdrop click)
- Test that long protocols scroll smoothly without performance issues
- Mock external reference links to test opening behavior
- Verify citation formatting is correct (APA, Vancouver, or custom)
- **Always test empty states** — No search results, empty categories, no bibliography
- Test transitions: search → results → select → modal → close
- Verify keyboard navigation works for all interactive elements
- Test that special characters and medical terminology don't break UI
- Ensure search is case-insensitive but respects exact matches
