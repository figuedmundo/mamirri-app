# Recording Instructions for Transcription Accuracy Tests

## Goal

Create a standardized set of audio files to verify that our AI transcription system accurately recognizes Spanish physiotherapy terminology.

## Requirements

- **Device**: iPad or iPhone (Voice Memos app is perfect)
- **Format**: M4A (Apple default)
- **Environment**: Quiet room, no background music/TV
- **Speaking Style**: Natural clinical dictation pace (clear, professional, not artificially slow)
- **Files**: 8 clips total (approx. 15-30 seconds each)

## Instructions

1. Open **Voice Memos** app.
2. Record each of the following scripts as a separate file.
3. Name the files EXACTLY as shown (e.g., `conditions-1.m4a`).
4. Transfer files to your computer.
5. Place them in: `apps/server/src/modules/transcription/__fixtures__/audio/`

---

### File 1: `conditions-1.m4a`

**Script:**

> "El paciente acude a consulta por dolor intenso en la planta del pie derecho al levantarse por la mañana. A la exploración física, presenta dolor a la palpación en la inserción de la fascia plantar. Diagnóstico preliminar de fascitis plantar bilateral con componente inflamatorio agudo."

### File 2: `conditions-2.m4a`

**Script:**

> "Paciente de 45 años con historia de dolor lumbar crónico. Refiere episodios recurrentes de lumbalgia mecánica que irradia hacia glúteo. En la evaluación postural se observa una escoliosis lumbar levo-convexa y rectificación de la lordosis cervical, provocando cervicalgia tensional frecuente."

### File 3: `conditions-3.m4a`

**Script:**

> "Acude por dolor irradiado en pierna izquierda compatible con ciática. La resonancia magnética muestra una hernia discal L4-L5 posterolateral izquierda que comprime la raíz nerviosa. El paciente refiere parestesia en miembro inferior izquierdo que llega hasta el primer dedo del pie."

### File 4: `conditions-4.m4a`

**Script:**

> "Jugador de tenis amateur con dolor en hombro derecho. Presenta signos positivos para tendinitis del supraespinoso y contractura muscular en trapecio superior. Además, relata un antecedente reciente de esguince de tobillo grado dos que aún presenta leve edema residual."

### File 5: `conditions-5.m4a`

**Script:**

> "Paciente mujer de 60 años con dolor en cara lateral de la cadera derecha compatible con bursitis trocantérica. También consulta por adormecimiento en manos, con diagnóstico previo de síndrome del túnel carpiano bilateral. Refiere además dolor en codo derecho sugestivo de epicondilitis lateral."

### File 6: `conditions-6.m4a`

**Script:**

> "Evaluación postural completa. Se observa hiperlordosis lumbar compensatoria a una cifosis dorsal aumentada. El paciente refiere gonalgia derecha al subir escaleras y coxalgia bilateral de predominio matutino. Refiere también dorsalgia mecánica tras jornadas laborales prolongadas."

### File 7: `clinical-tests.m4a`

**Script:**

> "Pruebas funcionales realizadas: Prueba de Lasègue positiva a treinta grados en pierna izquierda. Maniobra de Phalen positiva a los 45 segundos en ambas manos. Test de Thomas negativo, sin acortamiento del psoas ilíaco."

### File 8: `scales-full.m4a`

**Script:**

> "Valoración inicial: Dolor reportado en escala EVA siete sobre diez en reposo. Índice de Barthel de ochenta y cinco puntos, indicando dependencia leve. Goniometría de rodilla muestra flexión de ciento veinte grados y extensión completa de cero grados."
