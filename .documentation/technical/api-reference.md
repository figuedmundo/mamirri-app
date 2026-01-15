# API Reference

**Last Updated:** 2026-01-15

All endpoints require authentication via Bearer token (JWT) unless otherwise noted.

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
