# 02. Flujos de Uso – Un Día Normal de Trabajo

**Proyecto:** PhysioCopilot (Asistente Clínico)
**Usuario:** Fisioterapeuta Experta
**Objetivo:** Describir la experiencia paso a paso sin fricción tecnológica.

---

## Escenario 1: Llega un Paciente Nuevo (Ingreso Rápido)

El objetivo aquí es que tu madre no pierda contacto visual con el paciente ni pierda tiempo escribiendo.

1. **Inicio Manos Libres:**
Tu madre abre la aplicación en la tablet. En lugar de ver un formulario con casillas pequeñas, ve un botón grande y claro: **"Nuevo Paciente"**. Al pulsarlo, el micrófono se activa automáticamente.
2. **Dictado Natural:**
Ella habla con naturalidad mientras observa al paciente:
    
    > "Este es Juan Pérez, tiene 45 años. Viene quejándose de un dolor punzante en el talón derecho cuando corre. Trabaja de camarero y pasa 8 horas de pie. Tiene antecedentes de esguinces mal curados."
    > 
    
    La aplicación escucha, transcribe la voz a texto y, lo más importante, organiza los datos (separa el nombre, la edad, los síntomas y la profesión) sin que ella tenga que hacer nada.
    
3. **Captura de Evidencia (Fotos):**
Ella pulsa el icono de **Cámara**.
    - Primero, toma una foto de la **postura completa** del paciente de espaldas.
    - Segundo, toma una foto de la **huella plantar** sobre el papel (el método que ella ya usa).
    - *Detalle inteligente:* Si la foto sale borrosa o el papel está muy torcido, la aplicación le dice amablemente: *"Por favor, acércate un poco más a los dedos"* para asegurar que el análisis posterior sea perfecto.
4. **El Botón de "Magia":**
Ella pulsa **"Analizar Caso"** y deja la tablet en la mesa para empezar a examinar al paciente manualmente.

---

## Escenario 2: El "Razonamiento" (Lo que ocurre mientras ella trabaja)

Mientras tu madre toca el pie del paciente y hace su exploración manual (unos 30-60 segundos), el sistema trabaja en silencio:

- **Visión Artificial:** El sistema "mira" la foto de la huella. Detecta que el arco del pie está colapsado y que hay mucha presión en la zona del talón. Corrige la inclinación de la foto para que parezca escaneada.
- **Consulta Bibliográfica:** El sistema busca en su base de datos de libros: *"Tratamiento para arco colapsado y dolor de talón en pacientes que trabajan de pie"*.
- **Síntesis:** La IA combina lo que vio en la foto + lo que escuchó en la nota de voz + lo que encontró en los libros para preparar una sugerencia.

---

## Escenario 3: La Consulta y Diseño (Colaboración Humano-IA)

Tu madre regresa a la tablet con una idea en su cabeza. Ahora usa la App para validar esa idea y diseñar la solución.

1. **Revisión de Tarjetas:**
La pantalla le muestra tres tarjetas simples con la conclusión:
    - **El Problema:** "Posible Fascitis Plantar con Pie Plano Flexible".
    - **La Evidencia:** Cita un libro de biomecánica que explica por qué el trabajo de camarero agrava esto.
    - **La Solución Sugerida:** Una plantilla con realce interno de 5mm y una talonera blanda.
2. **El Toque Experto (Corrección):**
Aquí es donde el sistema aprende. Supongamos que tu madre no está de acuerdo con el material sugerido.
Ella pulsa un botón y dice (o selecciona): *"No, para este paciente usaremos corcho porque necesita más estabilidad, no algo blando"*.
    
    El sistema actualiza el diseño al instante y guarda esa preferencia: *"A la Dra. le gusta el corcho para pacientes pesados"*.
    
3. **Resultado Final:**
Con un solo toque en **"Generar Ficha"**, la tablet crea un documento PDF limpio con el dibujo técnico de la plantilla y las medidas exactas. Ella puede usar esto como guía para fabricarla en su taller.

---

## Escenario 4: El Seguimiento (Semanas después)

El paciente Juan regresa al mes. Este es el momento donde la App brilla por su capacidad de memoria.

1. **Recuperación Instantánea:**
Tu madre selecciona a "Juan Pérez" en la lista de recientes. Inmediatamente ve el resumen de lo que le hicieron la última vez.
2. **Comparativa Visual ("El Antes y Después"):**
Ella toma una nueva foto de la huella de Juan hoy.
La aplicación muestra la **foto de hace un mes** a la izquierda y la **foto de hoy** a la derecha.
3. **Evolución Objetiva:**
El sistema resalta con colores las diferencias: *"El arco se ha levantado 3 milímetros comparado con la última vez"*. Esto le sirve a tu madre para confirmar que el tratamiento funciona y para mostrárselo al paciente, lo cual genera mucha confianza.

---

## Red de Seguridad (Manejo de Errores)

Para que tu madre se sienta segura usando tecnología:

- **Si no hay Internet:** La App le permite seguir tomando fotos y notas de voz. Le avisará: *"Modo sin conexión: guardando datos en la tablet. Analizaremos cuando vuelva la señal"*. Nada se pierde.
- **Si la IA duda:** Si el sistema no encuentra información clara en los libros, no inventará nada. Le dirá: *"No encontré referencias exactas para este caso específico, por favor confía en tu criterio manual"*.

---

### Nota Técnica para el Arquitecto (Tú)

Al eliminar las tablas, el flujo queda mucho más claro como "Experiencia de Usuario". Los puntos críticos técnicos que se derivan de esta narrativa son:

1. **Latencia del Audio:** El paso de Voz a Texto (Step 1.2) debe ser muy rápido.
2. **UI de Corrección:** El paso donde ella corrige el material (Step 3.2) debe ser botones muy grandes o voz, nada de menús desplegables pequeños.
3. **Homografía:** El paso de la foto de la huella (Step 2.1) requiere que uses OpenCV para "aplanar" la imagen del papel automáticamente.