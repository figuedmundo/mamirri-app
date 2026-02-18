# API Reference

**Last Updated:** 2026-02-18

All endpoints require authentication via Bearer token (JWT) unless otherwise noted.

---

## AI Analysis

### POST /api/v1/ai/analyze

Analyze a clinical case using RAG over medical literature. Returns treatment suggestions with citations.

- **Body:**
  ```json
  {
    "clinicalCaseId": "uuid-of-clinical-case"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "primarySuggestion": {
      "title": "Tratamiento conservador para fascitis plantar",
      "description": "Se recomienda estiramientos y terapia manual...",
      "confidence": "HIGH",
      "reasoning": "Basado en la presentación clínica y literatura..."
    },
    "alternatives": [...],
    "citations": [
      {
        "quote": "El estiramiento es el pilar del tratamiento...",
        "quoteOriginal": "Stretching is the pillar of treatment...",
        "documentTitle": "Manual de Fisioterapia",
        "author": "Kapandji",
        "pageNumber": 234,
        "relevance": 0.95
      }
    ],
    "reasoning": {
      "step1_understanding": "Análisis de síntomas...",
      "step2_literature": "Resultados de búsqueda...",
      "step3_synthesis": "Recomendación final..."
    },
    "metadata": {
      "processingTimeMs": 1200,
      "anonymizationApplied": true
    }
  }
  ```
- **Errors:**
  - `401 Unauthorized`: Token missing or invalid.
  - `403 Forbidden`: Case belongs to another therapist.
  - `404 Not Found`: Case does not exist.

---

## Authentication

### POST /api/v1/auth/register

Register a new therapist account.

- **Body:**
  ```json
  {
    "name": "Dr. María García",
    "email": "maria@clinic.com",
    "password": "securePassword123",
    "confirmPassword": "securePassword123"
  }
  ```
- **Response:** `201 Created`
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
  ```

### POST /api/v1/auth/login

Authenticate and receive tokens.

- **Body:**
  ```json
  {
    "email": "maria@clinic.com",
    "password": "securePassword123"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "cm123...",
      "name": "Dr. María García",
      "email": "maria@clinic.com"
    }
  }
  ```

---

## Patients

All patient endpoints are scoped to the authenticated therapist. Patients belonging to other therapists return `404 Not Found`.

### GET /api/v1/patients

List patients with pagination and search.

- **Query Params:**
  | Param | Type | Default | Description |
  |-------|------|---------|-------------|
  | `page` | number | 1 | Page number |
  | `limit` | number | 20 | Items per page |
  | `search` | string | - | Filter by name or phone |

- **Response:** `200 OK`
  ```json
  {
    "data": [
      {
        "id": "cm123...",
        "name": "Juan Pérez",
        "age": 45,
        "occupation": "Ingeniero",
        "phone": "+34612345678",
        "email": "juan@email.com",
        "birthDate": "1979-03-15T00:00:00.000Z",
        "isActive": true,
        "clinicalCases": [
          {
            "id": "cm456...",
            "title": "Lumbalgia Crónica",
            "status": "active",
            "evaluations": [...],
            "treatmentSessions": [...]
          }
        ]
      }
    ],
    "meta": {
      "total": 25,
      "page": 1,
      "lastPage": 2
    }
  }
  ```

### POST /api/v1/patients

Create a new patient with initial clinical case.

- **Body:**
  ```json
  {
    "name": "Ana López",
    "age": 32,
    "occupation": "Profesora",
    "previousOccupation": "Bailarina",
    "address": "Calle Mayor 123",
    "gender": "F",
    "phone": "+34698765432",
    "email": "ana@email.com",
    "birthDate": "1992-07-20"
  }
  ```
- **Required Fields:** `name`, `age`, `occupation`, `phone`, `birthDate`
- **Validation:**
  - `name`: min 2 characters
  - `age`: positive integer
  - `phone`: valid phone format
  - `email`: valid email format (if provided)
  - `birthDate`: ISO date string

- **Response:** `201 Created`
  ```json
  {
    "id": "cm789...",
    "name": "Ana López",
    "age": 32,
    "clinicalCases": [
      {
        "id": "cm012...",
        "title": "Initial Case - General Evaluation",
        "status": "active",
        "evaluations": [{ "id": "...", "type": "INITIAL" }],
        "treatmentPlan": { "id": "...", "phases": [] }
      }
    ]
  }
  ```

### GET /api/v1/patients/:id

Get a single patient with all clinical data.

- **Response:** `200 OK` - Patient object with nested clinical cases, evaluations, sessions
- **Error:** `404 Not Found` if patient doesn't exist or belongs to another therapist

### PATCH /api/v1/patients/:id

Update a patient.

- **Body:** Any subset of create fields
  ```json
  {
    "phone": "+34611222333",
    "occupation": "Jubilado"
  }
  ```
- **Response:** `200 OK` - Updated patient object

### DELETE /api/v1/patients/:id

Soft delete a patient (sets `deletedAt` timestamp).

- **Response:** `204 No Content`

---

## Clinical Cases

### GET /api/v1/clinical-cases

List clinical cases with filters.

- **Query Params:**
  | Param | Type | Default | Description |
  |-------|------|---------|-------------|
  | `page` | number | 1 | Page number |
  | `limit` | number | 20 | Items per page |
  | `patientId` | string | - | Filter by patient |
  | `status` | string | - | Filter by status (active, completed, inactive) |
  | `search` | string | - | Filter by title or consultation reason |

- **Response:** `200 OK`
  ```json
  {
    "data": [
      {
        "id": "cm456...",
        "title": "Lumbalgia Crónica",
        "status": "active",
        "startDate": "2026-01-10T00:00:00.000Z",
        "consultationReason": "Dolor lumbar de 3 meses",
        "patient": { "id": "cm123...", "name": "Juan Pérez" }
      }
    ],
    "meta": { "total": 5, "page": 1, "lastPage": 1 }
  }
  ```

### POST /api/v1/clinical-cases

Create a new clinical case for an existing patient.

- **Body:**
  ```json
  {
    "patientId": "cm123...",
    "title": "Rehabilitación Rodilla",
    "consultationReason": "Post-cirugía LCA"
  }
  ```

---

## Medical Library (Biblioteca)

All biblioteca endpoints require authentication. Read/search is available to authenticated therapists. Protocol CRUD is admin-only.

### GET /api/v1/library/categories

List available clinical categories.

- **Response:** `200 OK` - Array of category objects

### GET /api/v1/library/protocols

List protocols or perform filtered retrieval.

- **Query Params:**
  | Param | Type | Default | Description |
  |-------|------|---------|-------------|
  | `categoryId` | string | - | Filter by category |
  | `q` | string | - | Search query (title/definition/tags) |
  | `includeDeleted` | boolean | false | Include archived protocols (admin only) |

- **Response:** `200 OK`
  - If `q` is present: `{ protocols: Protocol[], ragResults: RagResult[] }`
  - Otherwise: `Protocol[]`

### GET /api/v1/library/protocols/:id

Get protocol details with category and references.

- **Response:** `200 OK` - Protocol object
- **Errors:**
  - `404 Not Found`: Protocol doesn't exist or is archived for therapist view

### GET /api/v1/library/references

List bibliographic references.

- **Response:** `200 OK` - Array of references

### POST /api/v1/library/treatment-plans/:planId/protocols

Attach a protocol to a treatment plan owned by the authenticated therapist.

- **Body:**
  ```json
  {
    "protocolId": "cm_protocol_id",
    "notes": "Optional note"
  }
  ```
- **Response:** `201 Created`
- **Errors:**
  - `404 Not Found`: Plan/protocol not found or protocol archived
  - `409 Conflict`: Protocol already attached to this plan

### POST /api/v1/library/protocols (Admin only)

Create protocol.

- **Body:**
  ```json
  {
    "title": "Posición de Esfinge",
    "categoryId": "cm_category",
    "definition": "Descripción clínica",
    "rationale": "Justificación terapéutica",
    "procedure": ["Paso 1", "Paso 2"],
    "tags": ["lumbar", "extension"],
    "referenceIds": ["cm_ref_1"]
  }
  ```
- **Response:** `201 Created`
- **Errors:**
  - `403 Forbidden`: Non-admin user
  - `404 Not Found`: Category/reference does not exist
  - `409 Conflict`: Duplicate active title in same category

### PATCH /api/v1/library/protocols/:id (Admin only)

Update protocol fields and references.

- **Body:** Partial subset of create payload fields
- **Response:** `200 OK`
- **Errors:** `403`, `404`, `409`

### DELETE /api/v1/library/protocols/:id (Admin only)

Archive protocol (soft delete).

- **Response:** `204 No Content`
- **Errors:** `403`, `404`

### POST /api/v1/library/protocols/:id/restore (Admin only)

Restore archived protocol.

- **Response:** `200 OK`
- **Errors:** `403`, `404`, `409`
- **Response:** `201 Created` - Clinical case object

### GET /api/v1/clinical-cases/:id

Get a clinical case with evaluations, sessions, and treatment plan.

- **Response:** `200 OK`
  ```json
  {
    "id": "cm456...",
    "title": "Lumbalgia Crónica",
    "status": "active",
    "patient": { "id": "cm123...", "name": "Juan Pérez" },
    "evaluations": [...],
    "treatmentSessions": [...],
    "treatmentPlan": { ... }
  }
  ```

### PATCH /api/v1/clinical-cases/:id

Update a clinical case.

- **Body:**
  ```json
  {
    "status": "completed",
    "title": "Lumbalgia - Finalizado"
  }
  ```
- **Response:** `200 OK` - Updated case object

### DELETE /api/v1/clinical-cases/:id

Delete a clinical case (hard delete).

- **Response:** `204 No Content`

---

## Treatment Sessions

### POST /api/v1/patients/cases/:caseId/sessions

Add a treatment session to a clinical case.

- **Body:**
  ```json
  {
    "date": "2026-01-15T10:00:00Z",
    "phaseNumber": 1,
    "procedures": ["Masaje descontracturante", "Electroterapia"],
    "patientResponse": "Buena tolerancia al tratamiento",
    "finalPainLevel": 4,
    "observations": "Progreso notable en movilidad"
  }
  ```
- **Response:** `201 Created` - Treatment session object

---

## Evaluations

### PATCH /api/v1/patients/evaluations/:id

Update an evaluation.

- **Body:**
  ```json
  {
    "painScale": { "rest": 2, "activity": 5 },
    "posturogram": { "anterior": {...}, "posterior": {...} },
    "diagnosis": { "primary": "Lumbalgia mecánica" }
  }
  ```
- **Response:** `200 OK` - Updated evaluation object

---

## Treatment Plans

### PATCH /api/v1/treatment-plans/:id/objectives

Update treatment plan objectives.

- **Body:**
  ```json
  {
    "therapeutic": "Reducir dolor en fase aguda",
    "prophylactic": "Prevenir recidivas mediante higiene postural",
    "educational": "Instruir en ejercicios de movilidad"
  }
  ```
- **Response:** `200 OK` - Updated TreatmentPlan object

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 404,
  "message": "Patient with ID cm123... not found",
  "error": "Not Found"
}
```

### Common Status Codes

| Code  | Meaning                                             |
| ----- | --------------------------------------------------- |
| `400` | Bad Request - Validation failed                     |
| `401` | Unauthorized - Missing or invalid JWT               |
| `404` | Not Found - Resource doesn't exist or access denied |
| `500` | Internal Server Error                               |

---

## Swagger Documentation

Interactive API documentation is available at:

```
http://localhost:3000/api/docs
```
