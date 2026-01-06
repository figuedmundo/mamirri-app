# 05. Seguridad y Privacidad

**(Sección completa – MVP del Asistente Clínico de Fisioterapia)**

## 1. Enfoque general

Desde el MVP, el sistema debe tratar toda la información como **datos clínicos sensibles**, independientemente del marco legal específico del país. El diseño asume un estándar alto de protección desde el inicio para evitar rediseños futuros y generar confianza inmediata en el profesional.

El sistema **no está orientado a investigación**, **no entrena modelos externos**, y **no comparte datos** bajo ninguna circunstancia en esta fase.

---

## 2. Principios de Seguridad

1. **Minimización de datos**
    
    Solo se almacenan los datos estrictamente necesarios para la práctica clínica.
    
2. **Decisión humana central**
    
    Ningún proceso automatizado toma decisiones clínicas ni actúa sin supervisión humana.
    
3. **Simplicidad segura**
    
    Se priorizan soluciones simples, probadas y mantenibles frente a arquitecturas complejas.
    
4. **Cero pérdida de datos**
    
    La pérdida de información clínica se considera un fallo crítico.
    

---

## 3. Autenticación y Acceso

- Acceso restringido únicamente al profesional autorizado.
- Autenticación mediante credenciales fuertes.
- Sesión persistente controlada (evitar reautenticación constante para no afectar la experiencia).
- No existen usuarios anónimos ni accesos públicos.
- No se implementan roles complejos en el MVP.

---

## 4. Comunicación Segura

- Todo el tráfico entre cliente y servidor se realiza mediante **HTTPS/TLS**.
- No se permiten conexiones sin cifrado.
- Certificados gestionados automáticamente y renovados de forma periódica.

---

## 5. Almacenamiento de Datos Clínicos

### 5.1 Base de datos

- Base de datos relacional protegida (PostgreSQL).
- Sin acceso directo desde Internet.
- Acceso exclusivo desde el backend mediante credenciales seguras.
- Registro de creación y modificación de registros clínicos.

### 5.2 Separación de responsabilidades

- Datos estructurados (pacientes, sesiones, observaciones) separados de archivos binarios (imágenes).
- Ningún archivo se almacena directamente en la base de datos.

---

## 6. Imágenes y Archivos Clínicos

- Almacenamiento en **object storage privado** (S3 compatible).
- Acceso únicamente mediante URLs firmadas con expiración.
- No existen URLs públicas permanentes.
- Cada imagen debe estar obligatoriamente asociada a:
    - Un paciente
    - Una sesión
    - Una fecha

Esto garantiza trazabilidad clínica y evita archivos huérfanos.

---

## 7. Backups y Recuperación

- Backups automáticos diarios de la base de datos.
- Retención mínima de 30 días.
- Backups cifrados.
- Procedimiento documentado de restauración.
- Pruebas periódicas de recuperación para verificar integridad.

---

## 8. Auditoría y Trazabilidad

- Registro de:
    - Cuándo se crea un paciente
    - Cuándo se añade una sesión
    - Cuándo se modifican observaciones
- Historial clínico inmutable por sesión.
- El sistema **no borra información clínica**, solo permite añadir correcciones o nuevas observaciones.

---

## 9. Privacidad del Paciente

- Acceso exclusivo del profesional responsable.
- No se comparten datos con terceros.
- No se utilizan datos para:
    - entrenamiento de modelos externos
    - análisis comerciales
    - estudios agregados
- No existe exportación automática de datos en el MVP.

---

## 10. Uso de Inteligencia Artificial (MVP)

En el MVP:

- ❌ No se utilizan servicios de IA externos.
- ❌ No se envían datos clínicos a modelos de terceros.
- ❌ No se generan recomendaciones automáticas.

Esto es intencional para preservar privacidad y control total.

---

## 11. Preparación para fases futuras (sin activar)

La arquitectura queda preparada para, en fases posteriores:

- Introducir IA **aislada en servicios independientes**
- Anonimizar datos antes de cualquier procesamiento avanzado
- Aplicar controles explícitos de consentimiento

Nada de esto se activa en el MVP.

---

## 12. Cierre

La seguridad y la privacidad no son funcionalidades añadidas, sino **condiciones de existencia del sistema**.

Este enfoque garantiza que el producto sea confiable desde el primer uso, y viable para una evolución futura hacia un entorno clínico-comercial sin rediseños estructurales.