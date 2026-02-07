# Application Shell

## Overview

Shell de navegación horizontal optimizado para tablet que maximiza el área de contenido visual (fotos, videos, comparativas antes/después). Diseñado para consultas activas donde la velocidad es crítica.

## Design Intent

- Horizontal navigation layout for maximum content width
- Tablet-optimized with responsive behavior
- Fast access to all sections during consultations
- Clean, distraction-free interface
- Dark mode support throughout

## Components Provided

- **AppShell** — Main layout wrapper with header and content area
- **MainNav** — Navigation component with active state highlighting
- **UserMenu** — User profile dropdown with logout option

## Navigation Structure

- Pacientes → Gestión de expedientes médicos
- Análisis → Análisis visual de huellas y videos
- Biblioteca Médica → Búsqueda inteligente en literatura médica
- Plantillas → Diseño de plantillas ortopédicas
- Ajustes → Configuración (idioma español/inglés, preferencias de IA, ajustes de voz)

## Props Interface

### AppShell

```typescript
interface AppShellProps {
  children: React.ReactNode;
  navigationItems: Array<{ label: string; href: string; isActive?: boolean }>;
  user?: { name: string; avatarUrl?: string };
  onNavigate?: (href: string) => void;
  onLogout?: () => void;
  onLogoClick?: () => void;
}
```

### MainNav

```typescript
interface MainNavProps {
  items: Array<{ label: string; href: string; isActive?: boolean }>;
  onItemClick?: (href: string) => void;
}
```

### UserMenu

```typescript
interface UserMenuProps {
  user: { name: string; avatarUrl?: string };
  onLogout?: () => void;
}
```

## Responsive Behavior

- **Tablet/Desktop (horizontal):** Navegación horizontal completa con texto e iconos
- **Tablet (vertical/portrait):** Navegación horizontal compacta (texto legible, sin iconos grandes)
- **Móvil:** Menú hamburguesa con swipe; overlay con lista completa de secciones

## Design Notes

- Integración con Google Calendar: No hay sección de calendario; agenda se gestiona vía Google Calendar app
- Cada perfil de paciente incluye botón "Agendar en Google Calendar" con datos pre-rellenados
- Diseño optimizado para manos libres: botones grandes, elementos touch-friendly
- Dark mode support con variantes `dark:` para todos los colores

## Colors Used

- Primary: `teal-600` (logo, active nav states)
- Neutral: `slate` palette for backgrounds, text, borders

## Fonts Used

- Heading: DM Sans
- Body: DM Sans
