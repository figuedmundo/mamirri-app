# API Reference

## Authentication

### POST /api/v1/auth/login

- **Body:** `{ "email": "user@example.com", "password": "password" }`
- **Response:** `{ "accessToken": "...", "refreshToken": "...", "user": { ... } }`

### POST /api/v1/auth/register

- **Body:** `{ "name": "Name", "email": "user@example.com", "password": "password", "confirmPassword": "password" }`
- **Response:** `{ "accessToken": "...", "refreshToken": "..." }`

## Patients

### GET /api/v1/patients

List patients with pagination and search.

- **Query Params:**
  - `page` (optional, default 1)
  - `limit` (optional, default 20)
  - `search` (optional, filters by firstName or lastName)
- **Response:**
  ```json
  {
    "data": [
      {
        "id": "cm...",
        "firstName": "John",
        "lastName": "Doe",
        "dob": "1990-01-01T00:00:00.000Z",
        "email": "john@example.com",
        "phone": "+1234567890",
        "createdAt": "2026-01-10T..."
      }
    ],
    "meta": { "total": 1, "page": 1, "lastPage": 1 }
  }
  ```

### POST /api/v1/patients

Create a new patient.

- **Body:**
  ```json
  {
    "firstName": "Jane",
    "lastName": "Doe",
    "dob": "1995-05-20",
    "email": "jane@example.com",
    "phone": "+1987654321"
  }
  ```
- **Response:** `201 Created` with patient object.

### GET /api/v1/patients/:id

Get a single patient by ID.

- **Response:** Patient object or `404 Not Found`.

### PATCH /api/v1/patients/:id

Update a patient.

- **Body:** Any subset of create fields (e.g., `{ "phone": "+111222333" }`).
- **Response:** Updated patient object.

### DELETE /api/v1/patients/:id

Soft delete a patient.

- **Response:** `204 No Content`.

---

**Last Updated:** 2026-01-10
