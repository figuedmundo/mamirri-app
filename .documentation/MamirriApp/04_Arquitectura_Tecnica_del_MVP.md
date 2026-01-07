# 04. Arquitectura Técnica del MVP

> Versión: 1.0.0
> 
> 
> Estado: Aprobado para Desarrollo
> 
> Stack: React + NestJS + PostgreSQL
> 
> Enfoque: Monolito Modular (Modular Monolith)
> 

---

## 1. Visión Arquitectónica

El objetivo es construir una plataforma clínica robusta que priorice la **integridad de los datos** y la **facilidad de uso (UX)** sobre la complejidad algorítmica.

- **Filosofía:** "Data-First, AI-Later". Primero construimos una estructura de datos relacional sólida y una interfaz táctil fluida. La IA se utiliza únicamente como **utilidad de transcripción** (Whisper) para eliminar la fricción del teclado.
- **Patrón:** Arquitectura en Capas (Layered Architecture) implementada sobre un Monolito Modular en NestJS. Esto permite la separación lógica de dominios (`Patients`, `Sessions`) manteniendo la simplicidad de un solo despliegue.

---

## 2. Stack Tecnológico & Decisiones

| **Capa** | **Tecnología** | **Decisión / Racional** |
| --- | --- | --- |
| **Frontend** | **React 18 + Vite** | Estándar de la industria. Vite ofrece un *Hot Module Replacement* instantáneo para desarrollo rápido. |
| **Lenguaje FE** | **TypeScript** | Tipado estático para prevenir errores en tiempo de ejecución (vital para app médica). |
| **UI Framework** | **Shadcn/UI + Tailwind** | Componentes accesibles, ligeros y altamente personalizables. Diseño "Mobile-First" nativo. |
| **Backend** | **NestJS (Node.js)** | Framework progresivo. Ofrece inyección de dependencias, módulos y validación (Pipes) out-of-the-box. |
| **Base de Datos** | **PostgreSQL 16** | Base de datos relacional robusta. Soporte nativo de JSONB (para flexibilidad) y pgvector (preparado para Fase 2). |
| **ORM** | **Prisma** | Ofrece la mejor experiencia de desarrollo (DX) y seguridad de tipos entre la DB y el Backend. |
| **Almacenamiento** | **S3 Compatible** | AWS S3 o Supabase Storage para guardar imágenes y audios. Desacopla los binarios de la base de datos. |
| **IA (Utility)** | **OpenAI Whisper API** | Modelo SOTA (State of the Art) para transcripción de voz a texto. Alta precisión en español médico. |

---

## 3. Diagrama de Arquitectura (C4 - Nivel Contenedor)

Code snippet

```mermaid
graph TD
    %% CLIENTE
    subgraph Client [Tablet / Web Browser]
        UI[React App]
        AudioMod[Módulo de Audio]
        CamMod[Módulo de Cámara]
    end

    %% BACKEND
    subgraph Backend [NestJS API Gateway]
        AuthC[Auth Controller]
        PatC[Patient Controller]
        ClinC[Clinical Controller]
        UtilC[Utility Controller]
        
        AuthS[Auth Service]
        PatS[Patient Service]
        ClinS[Clinical Service]
        TransS[Transcription Service]
        MediaS[Storage Service]
    end

    %% INFRAESTRUCTURA
    subgraph Infra [Persistencia & Externos]
        DB[(PostgreSQL)]
        S3[(Object Storage)]
        Whisper[OpenAI Whisper API]
    end

    %% FLUJOS
    UI -->|HTTPS/JSON| AuthC
    UI -->|HTTPS/JSON| PatC
    UI -->|HTTPS/JSON| ClinC
    
    %% Flujo Dictado
    AudioMod -->|File Upload .webm| UtilC
    UtilC --> TransS
    TransS -->|API Call| Whisper
    Whisper -->|Text| TransS
    TransS -->|JSON Response| UI

    %% Flujo Datos
    PatC --> PatS
    PatS -->|Prisma| DB
    
    ClinC --> ClinS
    ClinS -->|Prisma| DB
    
    %% Flujo Imagen
    CamMod -->|Multipart Upload| ClinC
    ClinS --> MediaS
    MediaS -->|Put Object| S3
    S3 -->|URL| MediaS
    MediaS -->|URL Metadata| DB
```

---

## 4. Diseño del Backend (NestJS)

El backend se organizará en **Módulos de Dominio**. Cada módulo encapsula su lógica, controladores y servicios.

### 4.1 Estructura de Módulos

1. **`AuthModule`**: Manejo de Login, JWT Strategy y Guards.
2. **`PatientsModule`**: CRUD de pacientes.
3. **`SessionsModule`**: Lógica de la visita (Crear sesión, finalizar sesión).
4. **`MediaModule`**: Lógica de subida a S3 y generación de URLs.
5. **`TranscribeModule`**: Servicio *Stateless* (sin base de datos) que recibe audio y devuelve texto.

### 4.2 Patrones de Diseño

- **DTOs (Data Transfer Objects):** Usaremos `class-validator` para asegurar que los datos que entran cumplen las reglas.
    - *Ejemplo:* `CreatePatientDto` valida que el nombre no esté vacío.
- **Guards:** Protección de endpoints. Solo usuarios autenticados pueden acceder.
- **Interceptors:** Para transformar la respuesta estándar (ej: quitar contraseñas de los objetos de usuario antes de enviarlos).

---

## 5. Modelo de Datos (Esquema Prisma)

Este es el contrato de datos definitivo para el MVP.

```jsx
// schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// --- ENUMS ---
enum SessionStatus {
  DRAFT       // Sesión abierta, se puede editar
  FINALIZED   // Sesión cerrada, inmutable (para seguridad legal)
}

enum ObservationType {
  ANAMNESIS
  EXPLORATION
  DIAGNOSIS
  TREATMENT_PLAN
}

enum MediaType {
  FOOT_PRINT    // Huella en papel
  POSTURE_BACK  // Foto espalda
  POSTURE_SIDE  // Foto perfil
  OTHER
}

// --- MODELOS ---

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  name          String
  createdAt     DateTime  @default(now())
  
  // Relaciones
  // En MVP single-user, un usuario ve todos los pacientes.
  // En futuro multi-tenant, aquí iría la relación con Clinics.
}

model Patient {
  id            String    @id @default(uuid())
  fullName      String
  birthDate     DateTime
  occupation    String?   // Contexto clave para futuras IAs
  phone         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions      Session[] // Historial de visitas
}

model Session {
  id          String        @id @default(uuid())
  patientId   String
  date        DateTime      @default(now())
  status      SessionStatus @default(DRAFT)
  
  patient     Patient       @relation(fields: [patientId], references: [id])
  
  observations Observation[]
  attachments  Attachment[]
}

model Observation {
  id          String          @id @default(uuid())
  sessionId   String
  type        ObservationType
  content     String          @db.Text // El texto transcrito
  createdAt   DateTime        @default(now())

  session     Session         @relation(fields: [sessionId], references: [id])
}

model Attachment {
  id          String    @id @default(uuid())
  sessionId   String
  mediaType   MediaType
  url         String    // URL pública o firmada del S3
  mimeType    String    // image/jpeg, etc.
  createdAt   DateTime  @default(now())

  session     Session   @relation(fields: [sessionId], references: [id])
}
```

---

## 6. Definición de API (Endpoints Clave)

### Dominio: Transcripción (Utility)

- `POST /api/transcribe`
    - **Input:** `multipart/form-data` (archivo audio).
    - **Proceso:** Envía a Whisper API.
    - **Output:** `{ "text": "El paciente refiere dolor..." }`.
    - **Nota:** No guarda en BD. El frontend recibe el texto y lo pone en el formulario.

### Dominio: Pacientes

- `GET /api/patients` (Lista con búsqueda simple).
- `POST /api/patients` (Crear ficha).
- `GET /api/patients/:id` (Ver detalle e historial de sesiones).

### Dominio: Sesiones (Flujo Diario)

- `POST /api/sessions`
    - Input: `{ patientId: "uuid" }`. Crea una sesión `DRAFT`.
- `POST /api/sessions/:id/observations`
    - Input: `{ type: "ANAMNESIS", content: "Texto..." }`.
- `POST /api/sessions/:id/attachments`
    - Input: `multipart/form-data` (Imagen) + `mediaType`.
    - Proceso: Sube a S3 -> Guarda URL en BD -> Retorna objeto Attachment.
- `PATCH /api/sessions/:id/finalize`
    - Proceso: Cambia status a `FINALIZED`. Bloquea edición futura.

---

## 7. Estrategia de UX "Zero-Friction" (Frontend)

Para cumplir el requisito de "Simplicidad Extrema":

1. **Cache Local (React Query):**
    - Si internet parpadea, la app no se bloquea.
    - Usaremos `TanStack Query` para manejar el estado del servidor y cachear la lista de pacientes.
2. **Componente `<VoiceInput />`:**
    - Un componente de React reutilizable.
    - **UI:** Un botón de micrófono flotante al lado de cada `Textarea`.
    - **Lógica:**
        - `onPressIn`: Empieza a grabar (MediaRecorder API).
        - `onPressOut`: Detiene grabación -> Envía a `/api/transcribe` -> Pega el texto en el input padre.
3. **Componente `<CameraCapture />`:**
    - Usa `react-webcam`.
    - Muestra una capa semitransparente (overlay) con la forma de un pie para guiar a tu madre a tomar la foto a la distancia correcta.

---

## 8. Seguridad y Configuración

### Variables de Entorno (.env)

Bash

```jsx
# Backend
DATABASE_URL="postgresql://user:pass@host:5432/physiodb"
JWT_SECRET="super_secret_key_change_me"
OPENAI_API_KEY="sk-..."

# Storage (Ej: AWS S3 o MinIO)
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_BUCKET_NAME="physio-media-bucket"
```

### Seguridad de Datos

- **CORS:** Configurado para aceptar peticiones solo desde el dominio del Frontend.
- **Payload Limit:** Configurar NestJS para aceptar imágenes de hasta 10MB (`app.use(json({ limit: '10mb' }))`).
- **Sanitización:** Prisma previene Inyección SQL automáticamente. React previene XSS automáticamente.

---

## 9. Plan de Implementación (Paso a Paso)

1. **Setup Inicial (Día 1):**
    - Inicializar Repo Monorepo (carpeta `client` y `server`).
    - Levantar Postgres (Docker) y configurar Prisma.
2. **Backend Core (Día 2-3):**
    - Implementar Auth y Patients CRUD.
    - Probar con Postman.
3. **Integración Whisper (Día 4):**
    - Crear endpoint `/transcribe`.
    - Validar calidad de transcripción en español.
4. **Frontend Esqueleto (Día 5-6):**
    - Login y Lista de Pacientes.
    - Ficha de Paciente.
5. **Flujo Clínico (Día 7-10):**
    - Implementar `<VoiceInput />`.
    - Implementar subida de imágenes a S3.
    - Conectar todo en la vista "Nueva Sesión".