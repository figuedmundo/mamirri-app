# 🚀 06. Arquitectura Post-MVP: Integración de Inteligencia Artificial

> Fase: 2.0 (Cognitive Layer)
Objetivo: Convertir el gestor de datos en un "Segundo Cerebro" clínico.
Enfoque: RAG (Retrieval-Augmented Generation) + Visión Computacional.
> 

---

## 1. Visión Estratégica

En el MVP, el sistema **registra** lo que el humano ve y dice.
En la Fase Post-MVP, el sistema **comprende** lo que ve y **sugiere** basado en lo que sabe.

### Nuevas Capacidades

1. **Memoria Infinita (RAG):** El sistema puede "leer" y consultar una biblioteca de libros de fisioterapia y biomecánica en milisegundos.
2. **Ojos Expertos (Computer Vision):** Análisis automático de la huella plantar para detectar anomalías que al ojo humano se le pueden pasar por cansancio.
3. **Razonamiento Asistido:** Cruce automático de variables (Síntoma + Huella + Libro) para proponer tratamientos.

---

## 2. Diagrama de Arquitectura Evolucionada

El bloque "Backend" se expande. La base de datos PostgreSQL se vuelve híbrida (Relacional + Vectorial).

Code snippet

`graph TD
    subgraph "Tablet (Cliente)"
        UI[React App]
        Voice[Dictado]
        Cam[Cámara]
    end

    subgraph "Backend (NestJS)"
        API[API Gateway]
        
        %% Módulos MVP (Existentes)
        Pat[Patients Module]
        Clin[Clinical Module]
        
        %% Módulos NUEVOS (IA)
        AI_Orch[Orquestador Agéntico]
        Vision[Servicio de Visión]
        RAG[Servicio RAG / Buscador]
    end

    subgraph "Capa de Datos Híbrida"
        DB[(PostgreSQL)]
        subgraph "Tablas MVP"
            T_Pat[Pacientes]
            T_Ses[Sesiones]
        end
        subgraph "Tablas Post-MVP"
            T_Vec[Vectores pgvector]
            T_Books[Libros & chunks]
        end
    end

    subgraph "Inteligencia Externa"
        LLM[OpenAI GPT-4o]
        Embed[OpenAI Embeddings]
    end

    %% Flujos
    UI --> API
    API --> AI_Orch
    
    AI_Orch -->|1. Ver| Vision
    Vision -->|Imagen| LLM
    
    AI_Orch -->|2. Buscar| RAG
    RAG -->|Query| Embed
    Embed -->|Vector| RAG
    RAG -->|Similitud| T_Vec
    
    AI_Orch -->|3. Razonar| LLM
    
    AI_Orch -->|Guarda Sugerencia| Clin`

---

## 3. Componentes Técnicos Nuevos

### 3.1 Base de Datos Vectorial (`pgvector`)

No contrataremos una base de datos nueva (como Pinecone). Usaremos la extensión `pgvector` de PostgreSQL. Esto mantiene todo en un solo lugar.

- **¿Qué guarda?** Fragmentos ("chunks") de los libros de fisioterapia convertidos a números (embeddings).
- **Nueva Tabla:** `knowledge_library`SQL
    
    `CREATE TABLE knowledge_library (
      id UUID PRIMARY KEY,
      content TEXT,              -- El párrafo del libro
      source_title TEXT,         -- "Biomecánica de Kapandji"
      page_number INT,
      embedding vector(1536)     -- La representación matemática
    );`
    

### 3.2 Módulo RAG (Retrieval-Augmented Generation)

Es el bibliotecario.

- **Tecnología:** LangChain.js (integrado en Node/NestJS).
- **Función:**
    1. Recibe una duda: *"Tratamiento fascitis plantar en camareros"*.
    2. Convierte la duda a vector.
    3. Hace una consulta semántica a PostgreSQL: `SELECT * FROM knowledge_library ORDER BY embedding <-> query_embedding LIMIT 3`.
    4. Devuelve los 3 párrafos más relevantes.

### 3.3 Módulo de Visión (Hybrid Vision)

Combina dos técnicas para máxima precisión:

1. **Visión Determinista (OpenCV):**
    - Se ejecuta en un microservicio de Python (o usando `opencv4nodejs`).
    - **Tarea:** Corrección de perspectiva (Homografía). Toma la foto chueca del papel y la aplana perfecta ("Bird's eye view").
2. **Visión Generativa (GPT-4o Vision):**
    - **Tarea:** Análisis cualitativo. *"Observo un arco longitudinal interno colapsado y callosidad en el quinto metatarso"*.

---

## 4. El Flujo de Trabajo del Agente (Agentic Workflow)

Cuando tu madre presiona el botón **"Analizar Caso"** en la Fase 2, ocurre esta secuencia interna:

1. **Fase de Percepción (Input):**
    - El Agente lee la transcripción del audio (del MVP).
    - El Agente recibe la descripción visual de la huella.
2. **Fase de Investigación (Retrieval):**
    - Agente: *"El paciente tiene dolor de talón y pie plano. Buscador, dame literatura sobre esto".*
    - RAG: *"Aquí tienes extractos del Libro A (pág 40) y Libro B (pág 120)".*
3. **Fase de Razonamiento (Synthesis):**
    - Agente envía todo al LLM con el **System Prompt Maestro**:
        
        > "Actúa como experto. Tienes este paciente y esta literatura. Genera una recomendación de plantilla. CITA TUS FUENTES."
        > 
4. **Fase de Entrega (Output):**
    - El sistema guarda un JSON en la base de datos con la sugerencia, pero marcado como `status: PENDING_REVIEW`.
    - La Tablet muestra la tarjeta de sugerencia para que tu madre la apruebe.

---

## 5. Estrategia de Ingesta de Conocimiento (El "Setup" Inicial)

Para que la IA sepa de fisioterapia, hay que "entrenarla" (darle contexto) una sola vez.

- **Script de Ingesta (`ingest_books.ts`):**
    1. Colocas los PDFs de los libros en una carpeta segura.
    2. El script usa `pdf-parse` para extraer texto.
    3. Divide el texto en bloques de 500 palabras ("Chunks").
    4. Envía cada bloque a OpenAI (`text-embedding-3-small`) para crear vectores.
    5. Guarda texto + vector en PostgreSQL.

> Nota: Este proceso es manual y lo haces tú como administrador cuando consigues un libro nuevo. Tu madre no ve esto.
> 

---

## 6. Privacidad y Seguridad en Fase IA

Al introducir IA externa (OpenAI), debemos reforzar la privacidad (HIPAA compliance básico).

- **Anonimización (PII Stripping):**
Antes de enviar cualquier texto a GPT-4:
    1. El Backend busca patrones de nombres o IDs.
    2. Reemplaza "Juan Pérez" por "Paciente_X".
    3. Envía el caso anonimizado.
- **Cero Retención:**
Configuramos la API de OpenAI con `zero data retention` (si aplica en la cuenta Enterprise) o simplemente confiamos en su política de no usar datos de API para entrenamiento (que es el estándar actual).

---

## 7. Roadmap de Implementación Fase 2

No intentes hacer esto junto con el MVP. Hazlo en este orden:

1. **Mes 1-2:** MVP (Solo datos, React/Nest/Postgres). **Estabilizar uso.**
2. **Mes 3:** Activar `pgvector` e importar 1 libro de prueba. Crear buscador simple de texto.
3. **Mes 4:** Integrar GPT-4 para que "lea" los resultados del buscador y resuma.
4. **Mes 5:** Integrar Visión para las fotos.

---

### Conclusión para el Arquitecto

Esta arquitectura Post-MVP es **segura** porque:

1. Si la IA falla o se cae, el MVP sigue funcionando (la base de datos y las fotos siguen ahí).
2. La IA está "anclada" (Grounded) a los libros que tú subiste a Postgres, impidiendo que invente tratamientos mágicos.
3. El coste es bajo (solo pagas tokens de OpenAI cuando se usa el botón "Analizar").