# 03. Definición del MVP (Producto Mínimo Viable)

**Proyecto:** PhysioCopilot (Versión 0.1)
**Objetivo:** Validar la utilidad clínica y la facilidad de uso del asistente.
**Fecha:** Enero 2026

---

## 1. El Objetivo del MVP

No buscamos el software perfecto todavía. Buscamos responder una sola pregunta:

> "¿Puede este sistema ahorrarle tiempo a la fisioterapeuta y generarle confianza en sus diagnósticos sin complicarle la vida?"

Si el MVP logra que tu madre diga: "¡Guau, esto pensó en algo que yo había olvidado!", entonces es un éxito.

---

## 2. Alcance Funcional (Lo que SÍ incluye)

Para esta primera versión, nos centraremos exclusivamente en el flujo "Paciente - Análisis - Sugerencia".

### A. Interfaz "Túnel" (Lineal)

No habrá menús, ni configuraciones, ni pestañas. Será una Web App (accesible desde el iPad) con un flujo de una sola dirección:

1. Botón "Inicio".
2. Botón "Grabar/Foto".
3. Pantalla "Resultados".
4. Botón "Terminar".

### B. Módulo de Entrada (Ojos y Oídos)

1. **Audio:** Capacidad de grabar hasta 2 minutos de voz y transcribirlo a texto perfecto (usando Whisper).
2. **Foto:** Capacidad de subir/tomar **una** foto de la huella plantar.
   - _Limitación del MVP:_ No medirá ángulos milimétricos exactos todavía. Hará un análisis cualitativo (forma, arco, zonas de presión visibles).

### C. Cerebro Médico (RAG Limitado)

1. **Base de Conocimiento:** Cargaremos **solo 3 a 5 libros clave** que tu madre use o respete mucho (su "Biblia" de fisioterapia). Esto asegura que las respuestas sean de fuentes que ella valida.
2. **Lógica:** El sistema cruzará la transcripción de voz + la descripción visual de la foto + los 5 libros.

### D. Salida (El Entregable)

El sistema generará una pantalla simple con texto que incluye:

- **Resumen:** Lo que entendió del paciente.
- **Sugerencia de Plantilla:** Material y forma sugerida.
- **Fuente:** "¿Por qué digo esto? (Ver Libro X, pág Y)".

---

## 3. Fuera del Alcance (Lo que NO incluye por ahora)

Para no retrasar el lanzamiento, **excluimos deliberadamente**:

- **Comparativa Histórica:** En el MVP no se comparará "foto de hoy vs. foto de hace un mes". Cada consulta es única.
- **Gestión de Usuarios/Cuentas:** Solo habrá un usuario (tu madre). Sin login/password complejo.
- **Edición de Documentos PDF:** El sistema dará el texto, pero no generará un PDF imprimible bonito todavía.
- **Cálculos Biométricos Precisos:** No habrá herramientas de dibujo sobre la foto (reglas, goniómetros digitales) en esta fase.

---

## 4. Stack Tecnológico del MVP (Para el Arquitecto)

Para construir esto rápido y robusto:

- **Frontend:** **Streamlit** (Python).
  - _Por qué:_ Permite crear la interfaz web en horas, funciona perfecto en navegador de iPad, y maneja la cámara y el audio nativamente. Cero complicaciones de CSS/HTML.
- **Backend/Lógica:** Python puro.
- **Modelos AI:**
  - Audio: OpenAI Whisper.
  - Cerebro & Visión: GPT-4o (todo en uno).
- **Base de Datos Vectorial:** **ChromaDB** (Local/Simple) o Pinecone (Cloud tier gratuito).
  - _Por qué:_ No necesitamos infraestructura compleja para 5 libros.
- **Almacenamiento de Datos:** Una carpeta segura en la nube (S3 o simplemente local si corre en un servidor casero inicialmente) para guardar los logs de las sesiones.

---

## 5. Criterios de Éxito

Consideraremos el MVP terminado y exitoso si:

1. **Prueba de la Abuela (Usabilidad):** Tu madre puede completar un análisis (desde la foto hasta el resultado) sin preguntarte "¿Y ahora qué botón toco?".
2. **Prueba del Experto (Alucinación):** De 10 pruebas con pacientes reales, en al menos 8 el sistema sugiere algo coherente y correcto según el criterio de tu madre.
3. **Velocidad:** Todo el proceso (subir foto -> obtener respuesta) tarda menos de 30 segundos.
