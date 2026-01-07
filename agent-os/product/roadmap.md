# 🗺️ Roadmap

Tiempo Estimado Total: 12 a 16 Semanas (3-4 meses) para la versión con IA completa.
Metodología: Desarrollo Ágil (Sprints de 1 semana).

---

## 🏁 Fase 0: Cimientos e Infraestructura (Semanas 1-2)

**Objetivo:** Tener el entorno de desarrollo listo y la "tubería" conectada. Nada de lógica de negocio aún, solo infraestructura.

### Semana 1: Setup del Entorno (The "Hello World")

- [x] **1.1 Repositorio:** Crear Repo Monorepo (Git) con estructura `/client` y `/server`.
- [x] **1.2 Base de Datos:**
  - [x] 1.2.1 Levantar instancia de PostgreSQL (Docker local).
  - [x] 1.2.2 Inicializar proyecto **Prisma ORM**.
  - [x] 1.2.3 Definir el `schema.prisma` v1 (Tablas `User`, `Patient`, `Session`).
- [x] **1.3 Backend (NestJS):**
  - [x] 1.3.1 `npm install @nestjs/cli`
  - [x] 1.3.2 Configurar conexión a DB.
  - [x] 1.3.3 Configurar Swagger (Documentación automática de API).
- [x] **1.4 Frontend (React/Vite):**
  - [x] 1.4.1 Inicializar proyecto Vite + TypeScript.
  - [x] 1.4.2 Instalar `Shadcn/UI` y `TailwindCSS`.
  - [x] 1.4.3 Crear pantalla de "Login" (aunque sea dummy por ahora).

### Semana 2: Autenticación y Despliegue Temprano

- [ ] **2.1 Auth:** Implementar JWT simple en NestJS (Login/Logout).
- [ ] **2.2 Storage:** Configurar Bucket (AWS S3, MinIO o Supabase Storage) para archivos.
- [ ] **2.3 CI/CD Básico:**
  - [ ] 2.3.1 Configurar despliegue automático en **Render/Railway** (Backend) y **Vercel** (Frontend).
  - [ ] 2.3.2 _Hito:_ Poder abrir la URL en el iPad de tu madre y ver una pantalla en blanco que diga "PhysioCopilot v0.1".

---

## 🏗️ Fase 1: El MVP "Gestor Clínico" (Semanas 3-6)

**Objetivo:** Reemplazar el papel. Que tu madre pueda guardar pacientes, grabar voz y subir fotos. **Cero IA generativa aquí.**

### Semana 3: Gestión de Pacientes (CRUD)

- [ ] **3.1 Backend:** Endpoints `POST /patients`, `GET /patients`, `PATCH /patients`.
- [ ] **3.2 Frontend:**
  - [ ] 3.2.1 Lista de Pacientes (Buscador simple).
  - [ ] 3.2.2 Formulario "Nuevo Paciente" (Nombre, Edad, Ocupación).
  - [ ] 3.2.3 Vista "Detalle de Paciente" (Historial vacío).

### Semana 4: La Sesión Clínica (El Core)

- [ ] **4.1 Backend:** Lógica de `Session` (Draft vs Finalized).
- [ ] **4.2 Frontend:**
  - [ ] 4.2.1 Pantalla "Nueva Consulta".
  - [ ] 4.2.2 Componente de pasos: 1. Datos -> 2. Anamnesis -> 3. Fotos -> 4. Guardar.
- [ ] **4.3 UX Táctica:** Asegurar que los botones sean de tamaño "Dedo" (min 44px) para Tablet.

### Semana 5: Multimedia y "IA de Utilidad"

- [ ] **5.1 Módulo de Cámara:** Integrar `react-webcam` o input nativo de archivo. Subida a S3 y guardado de URL en BD.
- [ ] **5.2 Módulo de Voz (Groq/Whisper):**
  - [ ] 5.2.1 Componente `<VoiceRecorder />` en React.
  - [ ] 5.2.2 Endpoint NestJS que recibe audio -> Envía a **Groq (Whisper)** -> Retorna Texto.
  - [ ] 5.2.3 _Prueba:_ Dictar un párrafo médico rápido y verificar precisión.

### Semana 6: Pulido y "Entrega v1.0"

- [ ] **6.1 Manejo de Errores:** Pantallas de "Cargando..." y "Error de Red" amigables.
- [ ] **6.2 Prueba de Campo:** Instalar la Web App en el iPad (Agregar a Pantalla de Inicio).
- [ ] **6.3 Entrenamiento:** Enseñar a tu madre a usarlo con un paciente real (o contigo actuando).

---

## 🧪 Fase 2: Validación y Estabilización (Semanas 7-8)

**Objetivo:** Observar, callar y corregir. No escribir código nuevo, solo arreglar lo que le molesta a ella.

### Semana 7: La "Prueba de la Abuela"

- [ ] **7.1 Observación Pasiva:** Siéntate en una esquina mientras ella trabaja.
  - [ ] 7.1.1 _¿Dónde se traba?_
  - [ ] 7.1.2 _¿Qué botones no ve?_
  - [ ] 7.1.3 _¿La transcripción entiende sus términos médicos?_
- [ ] **7.2 Hotfixes:** Corregir bugs críticos esa misma noche.

### Semana 8: Robustez de Datos

- [ ] **8.1 Backups:** Configurar dump diario automático de PostgreSQL.
- [ ] **8.2 Optimización:** Asegurar que las fotos no pesen 10MB (comprimir en cliente antes de subir).
- [ ] **8.3 Seguridad:** Rotación de tokens, asegurar headers de seguridad (Helmet).

---

## 🧠 Fase 3: El Cerebro "Post-MVP" (Semanas 9-12)

**Objetivo:** Ahora que la app es útil, la hacemos inteligente. Introducimos RAG y Visión.

### Semana 9: Infraestructura de Conocimiento (RAG Setup)

- [ ] **9.1 Vector DB:** Activar extensión `pgvector` en Postgres.
- [ ] **9.2 Script de Ingesta:**
  - [ ] 9.2.1 Crear script Python/Node para leer PDFs.
  - [ ] 9.2.2 Procesar 2 o 3 libros clave de ella.
  - [ ] 9.2.3 Generar Embeddings y guardar en BD.

### Semana 10: El Agente Backend

- [ ] **10.1 NestJS:** Crear módulo `AIAnalysis`.
- [ ] **10.2 Lógica RAG:** Implementar búsqueda por similitud (Cosine Similarity).
- [ ] **10.3 Prompt Engineering:** Implementar el "System Prompt Maestro" (Chain of Thought) en el código.

### Semana 11: Visión y Orquestación

- [ ] **11.1 Visión:** Conectar **Gemini 1.5 Pro** Vision para describir las fotos de las huellas guardadas en Fase 1.
- [ ] **11.2 Endpoint "Analizar":** Crear el botón mágico que dispara: Visión + Búsqueda Libros + Resumen LLM.

### Semana 12: Interfaz de Sugerencias

- [ ] **12.1 Frontend:** Crear la UI de "Resultados del Análisis".
  - [ ] 12.1.1 Tarjetas de sugerencia.
  - [ ] 12.1.2 Citas bibliográficas desplegables.
- [ ] **12.2 Feedback Loop:** Botones "Me gusta" / "Corregir" para que la IA aprenda (guardar feedback en BD).

---

## 🚀 Fase 4: Futuro y Escala (Opcional / +3 meses)

**Objetivo:** Si la app es un éxito rotundo y otros fisios la quieren.

- [ ] **13.1 Multitenancy:** Adaptar BD para soportar múltiples clínicas (`clinic_id`).
- [ ] **13.2 Facturación:** Integrar Stripe.
- [ ] **13.3 App Nativa:** Migrar React a React Native (si se necesita acceso offline real).

---

## 📋 Lista de Compras (Recursos Necesarios)

Para empezar hoy, necesitas tener esto a mano:

### ✅ Ya tienes (Infraestructura Propia)

- [x] **Dominio:** Propio.
- [x] **Hosting:** Ubuntu Home Lab + Caddy (Reverse Proxy) + Cloudflare.
- [x] **IA Subscription:** Gemini 3 (Google).
- [x] **Hardware:** iPad/Tablet + Ordenador de desarrollo.

### 🛠 Configuración Pendiente

- [ ] **Groq API Key:** Necesaria para el servicio de Whisper (Transcripción ultra rápida).
- [ ] **Google Cloud Project:** Necesario para habilitar API de Gemini (Visión).
- [ ] **Almacenamiento de Archivos:**
  - Opción A: **MinIO** (Self-hosted en tu Ubuntu Docker).
  - Opción B: AWS S3 / Supabase Storage (Nube barata/gratis).
