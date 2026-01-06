# 🗺️ Roadmap

Tiempo Estimado Total: 12 a 16 Semanas (3-4 meses) para la versión con IA completa.
Metodología: Desarrollo Ágil (Sprints de 1 semana).
**🏁 Fase 0: Cimientos e Infraestructura (Semanas 1-2)**
**Objetivo:** Tener el entorno de desarrollo listo y la "tubería" conectada. Nada de lógica de negocio aún, solo infraestructura.
**Semana 1: Setup del Entorno (The "Hello World")**
• [ ] **Repositorio:** Crear Repo Monorepo (Git) con estructura `/client` y `/server`.
• [ ] **Base de Datos:**
    ◦ Levantar instancia de PostgreSQL (Docker local).
    ◦ Inicializar proyecto **Prisma ORM**.
    ◦ Definir el `schema.prisma` v1 (Tablas `User`, `Patient`, `Session`).
• [ ] **Backend (NestJS):**
    ◦ `npm install @nestjs/cli`
    ◦ Configurar conexión a DB.
    ◦ Configurar Swagger (Documentación automática de API).
• [ ] **Frontend (React/Vite):**
    ◦ Inicializar proyecto Vite + TypeScript.
    ◦ Instalar `Shadcn/UI` y `TailwindCSS`.
    ◦ Crear pantalla de "Login" (aunque sea dummy por ahora).
**Semana 2: Autenticación y Despliegue Temprano**
• [ ] **Auth:** Implementar JWT simple en NestJS (Login/Logout).
• [ ] **Storage:** Configurar Bucket (AWS S3, MinIO o Supabase Storage) para archivos.
• [ ] **CI/CD Básico:**
    ◦ Configurar despliegue automático en **Render/Railway** (Backend) y **Vercel** (Frontend).
    ◦ *Hito:* Poder abrir la URL en el iPad de tu madre y ver una pantalla en blanco que diga "PhysioCopilot v0.1".
**🏗️ Fase 1: El MVP "Gestor Clínico" (Semanas 3-6)**
**Objetivo:** Reemplazar el papel. Que tu madre pueda guardar pacientes, grabar voz y subir fotos. **Cero IA generativa aquí.
Semana 3: Gestión de Pacientes (CRUD)**
• [ ] **Backend:** Endpoints `POST /patients`, `GET /patients`, `PATCH /patients`.
• [ ] **Frontend:**
    ◦ Lista de Pacientes (Buscador simple).
    ◦ Formulario "Nuevo Paciente" (Nombre, Edad, Ocupación).
    ◦ Vista "Detalle de Paciente" (Historial vacío).
**Semana 4: La Sesión Clínica (El Core)**
• [ ] **Backend:** Lógica de `Session` (Draft vs Finalized).
• [ ] **Frontend:**
    ◦ Pantalla "Nueva Consulta".
    ◦ Componente de pasos: 1. Datos -> 2. Anamnesis -> 3. Fotos -> 4. Guardar.
• [ ] **UX Táctica:** Asegurar que los botones sean de tamaño "Dedo" (min 44px) para Tablet.
**Semana 5: Multimedia y "IA de Utilidad"**
• [ ] **Módulo de Cámara:** Integrar `react-webcam` o input nativo de archivo. Subida a S3 y guardado de URL en BD.
• [ ] **Módulo de Voz (Whisper):**
    ◦ Componente `<VoiceRecorder />` en React.
    ◦ Endpoint NestJS que recibe audio -> Envía a OpenAI Whisper -> Retorna Texto.
    ◦ *Prueba:* Dictar un párrafo médico rápido y verificar precisión.
**Semana 6: Pulido y "Entrega v1.0"**
• [ ] **Manejo de Errores:** Pantallas de "Cargando..." y "Error de Red" amigables.
• [ ] **Prueba de Campo:** Instalar la Web App en el iPad (Agregar a Pantalla de Inicio).
• [ ] **Entrenamiento:** Enseñar a tu madre a usarlo con un paciente real (o contigo actuando).
**🧪 Fase 2: Validación y Estabilización (Semanas 7-8)**
**Objetivo:** Observar, callar y corregir. No escribir código nuevo, solo arreglar lo que le molesta a ella.
**Semana 7: La "Prueba de la Abuela"**
• [ ] **Observación Pasiva:** Siéntate en una esquina mientras ella trabaja.
    ◦ *¿Dónde se traba?*
    ◦ *¿Qué botones no ve?*
    ◦ *¿La transcripción entiende sus términos médicos?*
• [ ] **Hotfixes:** Corregir bugs críticos esa misma noche.
**Semana 8: Robustez de Datos**
• [ ] **Backups:** Configurar dump diario automático de PostgreSQL.
• [ ] **Optimización:** Asegurar que las fotos no pesen 10MB (comprimir en cliente antes de subir).
• [ ] **Seguridad:** Rotación de tokens, asegurar headers de seguridad (Helmet).
**🧠 Fase 3: El Cerebro "Post-MVP" (Semanas 9-12)**
**Objetivo:** Ahora que la app es útil, la hacemos inteligente. Introducimos RAG y Visión.
**Semana 9: Infraestructura de Conocimiento (RAG Setup)**
• [ ] **Vector DB:** Activar extensión `pgvector` en Postgres.
• [ ] **Script de Ingesta:**
    ◦ Crear script Python/Node para leer PDFs.
    ◦ Procesar 2 o 3 libros clave de ella.
    ◦ Generar Embeddings y guardar en BD.
**Semana 10: El Agente Backend**
• [ ] **NestJS:** Crear módulo `AIAnalysis`.
• [ ] **Lógica RAG:** Implementar búsqueda por similitud (Cosine Similarity).
• [ ] **Prompt Engineering:** Implementar el "System Prompt Maestro" (Chain of Thought) en el código.
**Semana 11: Visión y Orquestación**
• [ ] **Visión:** Conectar GPT-4o Vision para describir las fotos de las huellas guardadas en Fase 1.
• [ ] **Endpoint "Analizar":** Crear el botón mágico que dispara: Visión + Búsqueda Libros + Resumen LLM.
**Semana 12: Interfaz de Sugerencias**
• [ ] **Frontend:** Crear la UI de "Resultados del Análisis".
    ◦ Tarjetas de sugerencia.
    ◦ Citas bibliográficas desplegables.
• [ ] **Feedback Loop:** Botones "Me gusta" / "Corregir" para que la IA aprenda (guardar feedback en BD).
**🚀 Fase 4: Futuro y Escala (Opcional / +3 meses)**
**Objetivo:** Si la app es un éxito rotundo y otros fisios la quieren.
• [ ] **Multitenancy:** Adaptar BD para soportar múltiples clínicas (`clinic_id`).
• [ ] **Facturación:** Integrar Stripe.
• [ ] **App Nativa:** Migrar React a React Native (si se necesita acceso offline real).
**📋 Lista de Compras (Recursos Necesarios)**
Para empezar hoy, necesitas tener esto a mano:
1. **Dominio:** (Opcional, ej: `physiocopilot.app`) - ~$12/año.
2. **Hosting:**
    ◦ **Vercel:** Gratis (Frontend).
    ◦ **Render/Railway:** ~$5/mes (Backend + Redis/Worker).
    ◦ **Supabase/Neon:** Gratis al inicio (Base de Datos).
3. **APIs:**
    ◦ **OpenAI:** Poner $20 USD de crédito (durará meses en desarrollo).
4. **Hardware:**
    ◦ El iPad/Tablet de tu madre.
    ◦ Tu ordenador de desarrollo.
****