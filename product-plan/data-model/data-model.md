# Data Model

## Entities

### Paciente

La persona que recibe tratamiento, con su historial completo.

### Caso clínico

Un episodio de atención para una condición específica (ej: "dolor lumbar", "pie plano").

### Evaluación

Sesión de diagnóstico con fotos, videos y hallazgos iniciales.

### Plan de tratamiento

Plan definido por el doctor con objetivos y modalidades (plantillas, masajes, ejercicios, en etapas o combinados).

### Sesión de tratamiento

Visitas donde se ejecuta el plan y se monitorea el progreso.

### Huella

Imágenes de huellas plantares capturadas para análisis visual.

### Video de postura

Grabaciones de caminatas o posturas para análisis biomecánico.

### Plantilla

Diseños de plantillas ortopédicas personalizadas.

### Referencia bibliográfica

Libros, artículos y evidencia médica consultada.

## Relationships

- Paciente tiene muchos Casos clínicos
- Caso clínico tiene una Evaluación inicial
- Caso clínico tiene un Plan de tratamiento
- Caso clínico tiene muchas Sesiones de tratamiento
- Evaluación tiene muchas Huellas
- Evaluación tiene muchos Videos de postura
- Plan de tratamiento tiene muchas Referencias bibliográficas
- Plantilla pertenece a un Caso clínico
