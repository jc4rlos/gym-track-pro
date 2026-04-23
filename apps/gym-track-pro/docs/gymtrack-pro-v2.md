# GymTrack Pro — Especificación Técnica v2.0

> Sistema web PWA mobile-first para tracking de entrenamiento físico con dashboard corporal interactivo, IMC, plan semanal y catálogo de ejercicios.

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Pantallas — Flujo completo](#3-pantallas--flujo-completo)
4. [Modelo de Base de Datos v2](#4-modelo-de-base-de-datos-v2)
5. [Diagrama ER](#5-diagrama-er)
6. [SQL Completo](#6-sql-completo)
7. [Triggers y Auditoría](#7-triggers-y-auditoría)
8. [Row Level Security](#8-row-level-security)
9. [Librería react-body-highlighter](#9-librería-react-body-highlighter)
10. [IMC — Lógica y siluetas](#10-imc--lógica-y-siluetas)
11. [ExerciseDB — Importar ejercicios](#11-exercisedb--importar-ejercicios)
12. [Arquitectura de componentes React](#12-arquitectura-de-componentes-react)
13. [Roadmap MVP](#13-roadmap-mvp)
14. [Guía de inicio rápido](#14-guía-de-inicio-rápido)

---

## 1. Visión General

GymTrack Pro es una PWA mobile-first que resuelve 5 problemas concretos del usuario de gym:

| Problema                                     | Solución                                                    |
| -------------------------------------------- | ----------------------------------------------------------- |
| No recuerda qué músculos entrenó esta semana | Dashboard con silueta corporal coloreada por grupo muscular |
| No sabe si entrenó todo el cuerpo            | TODO list semanal con progreso visual                       |
| No planifica la semana antes de ir           | Plan semanal: asigna músculos/ejercicios a cada día         |
| No sabe su estado físico objetivo            | Pantalla de IMC con silueta según composición corporal      |
| No conoce los ejercicios para cada músculo   | Catálogo de ejercicios desde ExerciseDB volcado a Supabase  |

---

## 2. Stack Tecnológico

| Capa             | Tecnología                              | Motivo                                     |
| ---------------- | --------------------------------------- | ------------------------------------------ |
| Frontend         | React 18 + Vite                         | Rápido, PWA-ready                          |
| Estilos          | Tailwind CSS + shadcn/ui                | Componentes mobile-first                   |
| Backend / Auth   | Supabase (PostgreSQL + Auth + Realtime) | BaaS con RLS nativo                        |
| Estado global    | TanStack Query (React Query)            | Cache + sync con Supabase                  |
| PWA              | vite-plugin-pwa + Workbox               | Instalable, offline parcial                |
| Router           | React Router v6                         | SPA navigation                             |
| Íconos           | Lucide React                            | Consistentes y ligeros                     |
| Animaciones      | Framer Motion                           | Transiciones entre pantallas               |
| Silueta muscular | react-body-highlighter                  | SVG hombre/mujer con coloreado por músculo |
| Silueta IMC      | CSS/SVG inline                          | Siluetas de composición corporal           |

---

## 3. Pantallas — Flujo completo

A continuación se describen todas las pantallas del MVP con su layout mobile (390px), navegación y lógica.

---

### PANTALLA 0 — Splash / Carga

```
┌─────────────────────────────┐
│                             │
│                             │
│         💪                  │
│    GymTrack Pro             │
│    ─────────────            │
│    Tu cuerpo, tu récord     │
│                             │
│    [████████░░░░] 70%        │
│                             │
│                             │
└─────────────────────────────┘
```

- Aparece mientras se verifica la sesión de Supabase
- Si hay sesión activa → redirige al Dashboard
- Si no hay sesión → redirige al Login

---

### PANTALLA 1 — Login

```
┌─────────────────────────────┐
│  9:41          ●●● 🔋        │
│                             │
│                             │
│         💪                  │
│    GymTrack Pro             │
│                             │
│  ┌─────────────────────┐    │
│  │  correo@email.com   │    │
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │  ••••••••           │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │    Iniciar sesión   │    │  ← fondo #a3e635
│  └─────────────────────┘    │
│                             │
│  ¿No tenés cuenta?          │
│  [Registrarse]              │
│                             │
│  ─── o continuar con ───    │
│  [G Google]  [Ⓐ Apple]     │
│                             │
└─────────────────────────────┘
```

**Lógica:**

- Email + password con Supabase Auth
- OAuth Google (opcional, requiere configurar en Supabase)
- Al login exitoso → verificar si `profiles` tiene `height` y `weight` → si no, redirigir a Onboarding

---

### PANTALLA 2 — Registro

```
┌─────────────────────────────┐
│  ← Crear cuenta             │
│                             │
│  Nombre completo            │
│  ┌─────────────────────┐    │
│  │  Carlos García      │    │
│  └─────────────────────┘    │
│                             │
│  Correo electrónico         │
│  ┌─────────────────────┐    │
│  │  carlos@mail.com    │    │
│  └─────────────────────┘    │
│                             │
│  Contraseña                 │
│  ┌─────────────────────┐    │
│  │  ••••••••••         │    │
│  └─────────────────────┘    │
│                             │
│  Género                     │
│  ┌──────────┐ ┌──────────┐  │
│  │ ♂ Hombre │ │ ♀ Mujer  │  │
│  └──────────┘ └──────────┘  │
│                             │
│  ┌─────────────────────┐    │
│  │    Crear cuenta     │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

**Lógica:**

- Trigger en Supabase crea `profiles` automáticamente al registrarse
- `gender` se guarda como metadato en `auth.users` y se copia a `profiles`
- Después del registro → redirige a Onboarding

---

### PANTALLA 3 — Onboarding (solo primera vez)

```
┌─────────────────────────────┐
│  Completá tu perfil  1/2    │
│  ─────────────────────────  │
│                             │
│  Para calcular tu IMC       │
│  necesitamos estos datos:   │
│                             │
│  Altura (cm)                │
│  ┌─────────────────────┐    │
│  │  175                │    │
│  └─────────────────────┘    │
│                             │
│  Peso actual (kg)           │
│  ┌─────────────────────┐    │
│  │  78                 │    │
│  └─────────────────────┘    │
│                             │
│  Fecha de nacimiento        │
│  ┌─────────────────────┐    │
│  │  15/03/1990         │    │
│  └─────────────────────┘    │
│                             │
│  Objetivo                   │
│  ○ Perder peso              │
│  ● Ganar músculo            │
│  ○ Mantenerme               │
│                             │
│  ┌─────────────────────┐    │
│  │    Continuar →      │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

```
┌─────────────────────────────┐
│  Plan inicial        2/2    │
│  ─────────────────────────  │
│                             │
│  ¿Cuántos días por semana   │
│  vas al gym?                │
│                             │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐  │
│  │ 2│ │ 3│ │●4│ │ 5│ │ 6│  │
│  └──┘ └──┘ └──┘ └──┘ └──┘  │
│                             │
│  ¿Ya tenés una rutina?      │
│                             │
│  ┌─────────────────────┐    │
│  │  Sí, crear mi plan  │    │
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │  No, empezar sin    │    │
│  │  plan por ahora     │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

---

### PANTALLA 4 — Dashboard (pantalla principal)

```
┌─────────────────────────────┐
│  9:41              C  🔥4   │  ← avatar + racha
│                             │
│  Hola, Carlos 💪            │
│  Semana 16 · 14–20 Abr      │
│                             │
│  ┌─────────────────────┐    │
│  │ Lun Mar Mié Jue Vie │    │
│  │  ✓   ✓   —   ✓  HOY│    │  ← sellos asistencia
│  └─────────────────────┘    │
│                             │
│  Músculos esta semana       │
│  ┌──────────┬──────────┐    │
│  │  Frente  │  Espalda │    │  ← toggle
│  └──────────┴──────────┘    │
│  ┌─────────────────────┐    │
│  │                     │    │
│  │   [SILUETA          │    │
│  │    react-body-      │    │
│  │    highlighter]     │    │
│  │   hombre o mujer    │    │
│  │   según perfil      │    │
│  │                     │    │
│  └─────────────────────┘    │
│  ● Hoy  ● Esta semana       │  ← leyenda
│                             │
│  8 / 14 músculos ████░░░    │
│                             │
│  Plan de hoy — Viernes      │
│  ┌──────────────────────┐   │
│  │ Pecho · Hombros · … │   │  ← viene del weekly plan
│  └──────────────────────┘   │
│                             │
│  ┌─────────────────────┐    │
│  │  + Registrar sesión │    │  ← FAB
│  └─────────────────────┘    │
│                             │
│  [⊡]  [✓]  [📅]  [📊]  [👤]│  ← nav
└─────────────────────────────┘
```

**Lógica:**

- La silueta usa `react-body-highlighter` con `gender` del perfil
- Colores: verde brillante `#a3e635` = hoy, verde suave `#86efac` = esta semana
- El plan de hoy se lee de `weekly_plans` para el día actual de la semana
- Si no hay plan para la semana actual → muestra banner "Sin plan esta semana → Crear plan"

---

### PANTALLA 5 — Sesión de hoy (TODO list)

```
┌─────────────────────────────┐
│  ← Viernes 18 Abr  ● ACTIVA│
│                             │
│  ┌─────────────────────┐    │
│  │  3 / 6   00:47      │    │
│  │  ████░░░░░░         │    │
│  └─────────────────────┘    │
│                             │
│  GRUPOS MUSCULARES     + Add│
│                             │
│  ┌──────────────────────┐   │
│  │ ▌ ✓ Pecho    4 series│   │  ← barra verde izq = frontal
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │ ▌ ✓ Hombros  3 series│   │
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │ ▌ ✓ Tríceps  3 series│   │  ← barra celeste = posterior
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │   ○ Abdomen          │   │  ← pendiente
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │   ○ Bíceps           │   │
│  └──────────────────────┘   │
│                             │
│  Notas                      │
│  ┌──────────────────────┐   │
│  │ Aumenté press banca..│   │
│  └──────────────────────┘   │
│                             │
│  ┌─────────────────────┐    │
│  │ 🏁 Finalizar · Sello│    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

---

### PANTALLA 6 — Plan Semanal (crear/ver)

```
┌─────────────────────────────┐
│  ← Plan semanal             │
│     Semana 16               │
│                             │
│  ┌──────────────────────┐   │
│  │ Lun  Mar  Mié  Jue   │   │
│  │ Vie  Sáb  Dom        │   │  ← selector día
│  └──────────────────────┘   │
│                             │
│  ╔══ LUNES ══════════════╗  │
│  ║ Músculos              ║  │
│  ║ ┌────────┐ ┌────────┐ ║  │
│  ║ │ Pecho ✓│ │Tríceps ✓│ ║  │
│  ║ └────────┘ └────────┘ ║  │
│  ║ [+ Agregar músculo]   ║  │
│  ║                       ║  │
│  ║ Ejercicios sugeridos  ║  │
│  ║ ┌───────────────────┐ ║  │
│  ║ │ Press banca plano │ ║  │
│  ║ │ 4×10 · 60seg rest │ ║  │
│  ║ └───────────────────┘ ║  │
│  ║ [+ Agregar ejercicio] ║  │
│  ╚═══════════════════════╝  │
│                             │
│  ┌─────────────────────┐    │
│  │  Guardar plan       │    │
│  └─────────────────────┘    │
│                             │
│  ─── Planes anteriores ───  │
│  Semana 15 · 3 días activos │
│  [Reutilizar este plan]     │
└─────────────────────────────┘
```

**Lógica:**

- Si al abrir la app no existe `weekly_plan` para la semana actual → modal/sheet propone crear uno nuevo o reutilizar el último
- Cada día puede tener N músculos y N ejercicios asignados
- Los ejercicios vienen del catálogo `exercises` (de ExerciseDB)
- Al llegar a ese día, el TODO list se pre-completa con lo planeado

---

### PANTALLA 7 — Modal "Sin plan esta semana"

```
┌─────────────────────────────┐
│                             │
│  ┌─────────────────────┐    │
│  │                     │    │
│  │  📅                 │    │
│  │  No hay plan para   │    │
│  │  esta semana        │    │
│  │                     │    │
│  │  ┌───────────────┐  │    │
│  │  │ Crear plan    │  │    │
│  │  └───────────────┘  │    │
│  │  ┌───────────────┐  │    │
│  │  │ Usar semana   │  │    │
│  │  │ anterior      │  │    │
│  │  └───────────────┘  │    │
│  │  ┌───────────────┐  │    │
│  │  │ Continuar sin │  │    │
│  │  │ plan          │  │    │
│  │  └───────────────┘  │    │
│  │                     │    │
│  └─────────────────────┘    │
│                             │
└─────────────────────────────┘
```

---

### PANTALLA 8 — IMC y Composición Corporal

```
┌─────────────────────────────┐
│  ← Mi cuerpo                │
│                             │
│  ┌──────────────────────┐   │
│  │  IMC: 24.1           │   │
│  │  Peso normal ✓       │   │
│  │  78 kg · 175 cm      │   │
│  └──────────────────────┘   │
│                             │
│  ┌──────────────────────┐   │
│  │ Bajo  Normal  Sobre  │   │
│  │ peso  ██████  peso   │   │
│  │  <18.5 18.5-24.9 25+ │   │
│  └──────────────────────┘   │
│                             │
│  Tu silueta estimada        │
│                             │
│  ┌──────────────────────┐   │
│  │                      │   │
│  │    [SILUETA SVG]     │   │
│  │    varía según IMC   │   │
│  │    hombre o mujer    │   │
│  │                      │   │
│  └──────────────────────┘   │
│                             │
│  Estadísticas               │
│  ┌──────────┬───────────┐   │
│  │  Peso    │  78.0 kg  │   │
│  │  Altura  │  175 cm   │   │
│  │  IMC     │  24.1     │   │
│  │  Categoría│  Normal  │   │
│  │  Peso ideal│ 67-75kg │   │
│  │  TMB     │ 1,847 cal │   │  ← Tasa metabólica basal
│  └──────────┴───────────┘   │
│                             │
│  Actualizar medidas         │
│  Peso  ┌──────┐  kg        │
│        │ 78   │             │
│        └──────┘             │
│  ┌─────────────────────┐    │
│  │  Guardar            │    │
│  └─────────────────────┘    │
│                             │
│  Historial de peso ↓        │
│  Abr ●────●────●            │
│       78  77.5  77          │
└─────────────────────────────┘
```

**Cálculos disponibles con solo peso + altura + género:**

| Métrica           | Fórmula                                                          |
| ----------------- | ---------------------------------------------------------------- |
| IMC               | peso / (altura_m²)                                               |
| Categoría IMC     | <18.5 bajo / 18.5-24.9 normal / 25-29.9 sobrepeso / ≥30 obesidad |
| Peso ideal        | Fórmula de Devine: hombre 50+2.3×(altura_pulgadas-60)            |
| TMB               | Harris-Benedict revisada                                         |
| TDEE              | TMB × factor actividad                                           |
| Déficit/superávit | TDEE ± 500 cal para objetivo                                     |

**Siluetas por categoría IMC:**

- Las siluetas son SVG inline con 5 variantes por género (muy delgado, delgado, normal, sobrepeso, obeso)
- Se selecciona la variante según el rango de IMC calculado

---

### PANTALLA 9 — Catálogo de Ejercicios

```
┌─────────────────────────────┐
│  ← Ejercicios               │
│                             │
│  ┌─────────────────────┐    │
│  │ 🔍 Buscar ejercicio │    │
│  └─────────────────────┘    │
│                             │
│  Filtrar por músculo        │
│  ┌────┐ ┌──────┐ ┌──────┐  │
│  │Todo│ │Pecho │ │Espal.│  │
│  └────┘ └──────┘ └──────┘  │
│  ┌─────┐ ┌─────┐ ┌──────┐  │
│  │Bíc. │ │Trí. │ │Piern.│  │
│  └─────┘ └─────┘ └──────┘  │
│                             │
│  ┌──────────────────────┐   │
│  │ [GIF] Press banca    │   │
│  │       Pecho · Barra  │   │
│  │       Intermedio     │   │
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │ [GIF] Curl martillo  │   │
│  │       Bíceps · Mancuerna│ │
│  │       Principiante   │   │
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │ [GIF] Sentadilla     │   │
│  │       Cuádriceps · Bar│  │
│  │       Avanzado       │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
```

---

### PANTALLA 10 — Detalle de Ejercicio

```
┌─────────────────────────────┐
│  ←  Press banca plano       │
│                             │
│  ┌──────────────────────┐   │
│  │                      │   │
│  │    [GIF animado]     │   │
│  │    del ejercicio     │   │
│  │                      │   │
│  └──────────────────────┘   │
│                             │
│  Músculo principal          │
│  Pecho                      │
│                             │
│  Músculos secundarios       │
│  Tríceps · Hombros          │
│                             │
│  Equipamiento               │
│  Barra · Banco              │
│                             │
│  Dificultad                 │
│  ●●○ Intermedio             │
│                             │
│  Descripción                │
│  Acostado en el banco...    │
│                             │
│  ┌─────────────────────┐    │
│  │ + Agregar a rutina  │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

---

### PANTALLA 11 — Armar Rutina

```
┌─────────────────────────────┐
│  ← Nueva rutina             │
│                             │
│  Nombre de la rutina        │
│  ┌──────────────────────┐   │
│  │ Día de pecho         │   │
│  └──────────────────────┘   │
│                             │
│  Grupos musculares          │
│  ┌──────────────────────┐   │
│  │ Pecho ×  Tríceps ×   │   │
│  │ [+ Agregar]          │   │
│  └──────────────────────┘   │
│                             │
│  Ejercicios                 │
│  ┌──────────────────────┐   │
│  │ ≡  Press banca       │   │
│  │    4 series · 8-12   │   │
│  │    ⏱ 60 seg          │   │
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │ ≡  Aperturas         │   │
│  │    3 series · 12-15  │   │
│  └──────────────────────┘   │
│  [+ Agregar ejercicio]      │
│                             │
│  ┌─────────────────────┐    │
│  │  Guardar rutina     │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

---

### PANTALLA 12 — Historial

```
┌─────────────────────────────┐
│  ← Historial                │
│                             │
│  ┌─────────────────────┐    │
│  │ Abr  May  Jun  …    │    │  ← filtro mes
│  └─────────────────────┘    │
│                             │
│  Abril 2025                 │
│                             │
│  ┌──────────────────────┐   │
│  │ Vie 18 · 47 min      │   │
│  │ Pecho · Hombros · Trí│   │
│  │ 3 grupos ██████░░    │   │
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │ Jue 17 · 55 min      │   │
│  │ Piernas · Glúteos    │   │
│  │ 4 grupos ████████░░  │   │
│  └──────────────────────┘   │
│  ┌──────────────────────┐   │
│  │ Mar 15 · 40 min      │   │
│  │ Espalda · Bíceps     │   │
│  │ 3 grupos ██████░░    │   │
│  └──────────────────────┘   │
│                             │
│  Estadísticas del mes       │
│  Sesiones: 12               │
│  Músculos más trabajados:   │
│  Pecho ████ · Espalda ███   │
└─────────────────────────────┘
```

---

### PANTALLA 13 — Perfil

```
┌─────────────────────────────┐
│  Perfil                     │
│                             │
│  ┌─────┐                    │
│  │  C  │  Carlos García     │
│  └─────┘  carlos@mail.com   │
│                             │
│  ─── Mis datos ───          │
│  Género      Masculino      │
│  Altura      175 cm         │
│  Peso        78 kg     [→]  │
│  IMC         24.1           │
│  Objetivo    Ganar músculo  │
│                             │
│  ─── Cuenta ────            │
│  Días de racha    🔥 4      │
│  Semanas activas  12        │
│  Total sesiones   47        │
│                             │
│  ─── Ajustes ───            │
│  Notificaciones   [●]       │
│  Tema oscuro      [●]       │
│  Idioma           Español   │
│                             │
│  [Cerrar sesión]            │
└─────────────────────────────┘
```

---

## 4. Modelo de Base de Datos v2

### Tablas nuevas o modificadas respecto a v1

---

#### `profiles` (MODIFICADA)

Se agregan campos de datos físicos e IMC.

| Columna             | Tipo                                                          | Descripción                      |
| ------------------- | ------------------------------------------------------------- | -------------------------------- |
| `id`                | `uuid` PK                                                     | Referencia a `auth.users.id`     |
| `username`          | `text` UNIQUE                                                 | Nombre de usuario                |
| `full_name`         | `text`                                                        | Nombre completo                  |
| `gender`            | `enum('male','female','other')`                               | Para silueta y cálculos          |
| `avatar_url`        | `text`                                                        | URL avatar                       |
| `birth_date`        | `date`                                                        | Para calcular edad y TMB         |
| `height_cm`         | `numeric(5,1)`                                                | Altura en centímetros            |
| `weight_kg`         | `numeric(5,2)`                                                | Peso más reciente (se actualiza) |
| `goal`              | `enum('lose_weight','gain_muscle','maintain')`                | Objetivo fitness                 |
| `activity_level`    | `enum('sedentary','light','moderate','active','very_active')` | Para calcular TDEE               |
| `gym_days_per_week` | `int` DEFAULT 3                                               | Días de entrenamiento planeados  |
| `created_at`        | `timestamptz`                                                 |                                  |
| `updated_at`        | `timestamptz`                                                 |                                  |

---

#### `body_measurements` (NUEVA)

Historial de mediciones de peso y talla para gráfica de progreso.

| Columna       | Tipo                      | Descripción              |
| ------------- | ------------------------- | ------------------------ |
| `id`          | `uuid` PK                 |                          |
| `user_id`     | `uuid` FK → `profiles.id` |                          |
| `measured_at` | `date` NOT NULL           | Fecha de la medición     |
| `weight_kg`   | `numeric(5,2)`            | Peso                     |
| `height_cm`   | `numeric(5,1)`            | Altura (rara vez cambia) |
| `bmi`         | `numeric(4,1)`            | IMC calculado al momento |
| `notes`       | `text`                    | Observaciones opcionales |
| `created_at`  | `timestamptz`             |                          |

> **Trigger:** Al insertar en `body_measurements`, actualiza automáticamente `profiles.weight_kg` con el valor más reciente.

---

#### `weekly_plans` (NUEVA)

Plan de entrenamiento para una semana específica.

| Columna          | Tipo                           | Descripción                    |
| ---------------- | ------------------------------ | ------------------------------ |
| `id`             | `uuid` PK                      |                                |
| `user_id`        | `uuid` FK → `profiles.id`      |                                |
| `week_number`    | `int` NOT NULL                 | Semana del año (1-53)          |
| `year`           | `int` NOT NULL                 | Año                            |
| `name`           | `text`                         | Ej: "Split 4 días push/pull"   |
| `is_template`    | `boolean` DEFAULT `false`      | Si es plantilla reutilizable   |
| `copied_from_id` | `uuid` FK → `weekly_plans.id`  | Si se copió de semana anterior |
| `created_at`     | `timestamptz`                  |                                |
| `updated_at`     | `timestamptz`                  |                                |
| UNIQUE           | `(user_id, week_number, year)` | Un plan por semana por usuario |

---

#### `weekly_plan_days` (NUEVA)

Qué músculos y rutina tiene asignada cada día del plan.

| Columna          | Tipo                            | Descripción                   |
| ---------------- | ------------------------------- | ----------------------------- |
| `id`             | `uuid` PK                       |                               |
| `weekly_plan_id` | `uuid` FK → `weekly_plans.id`   |                               |
| `day_of_week`    | `int` NOT NULL                  | 0=Domingo, 1=Lunes … 6=Sábado |
| `is_rest_day`    | `boolean` DEFAULT `false`       | Día de descanso               |
| `routine_id`     | `uuid` FK → `routines.id` NULL  | Rutina asignada (opcional)    |
| `notes`          | `text`                          | Notas del día                 |
| `created_at`     | `timestamptz`                   |                               |
| UNIQUE           | `(weekly_plan_id, day_of_week)` | Un registro por día           |

---

#### `weekly_plan_day_muscles` (NUEVA)

Músculos asignados a un día del plan (muchos a muchos).

| Columna           | Tipo                              | Descripción   |
| ----------------- | --------------------------------- | ------------- |
| `id`              | `uuid` PK                         |               |
| `plan_day_id`     | `uuid` FK → `weekly_plan_days.id` |               |
| `muscle_group_id` | `uuid` FK → `muscle_groups.id`    |               |
| UNIQUE            | `(plan_day_id, muscle_group_id)`  | Sin repetidos |

---

#### `exercises` (MODIFICADA — para ExerciseDB)

| Columna             | Tipo                                         | Descripción                       |
| ------------------- | -------------------------------------------- | --------------------------------- |
| `id`                | `uuid` PK                                    |                                   |
| `exercisedb_id`     | `text` UNIQUE                                | ID original de ExerciseDB         |
| `name`              | `text` NOT NULL                              | Nombre del ejercicio              |
| `name_es`           | `text`                                       | Traducción al español (manual/IA) |
| `muscle_group_id`   | `uuid` FK → `muscle_groups.id`               | Músculo principal (mapeado)       |
| `body_part`         | `text`                                       | bodyPart original de ExerciseDB   |
| `target_muscle`     | `text`                                       | target original de ExerciseDB     |
| `secondary_muscles` | `text[]`                                     | Array de músculos secundarios     |
| `equipment`         | `text`                                       | Equipo necesario                  |
| `gif_url`           | `text`                                       | URL del GIF animado               |
| `instructions`      | `text[]`                                     | Pasos del ejercicio               |
| `difficulty`        | `enum('beginner','intermediate','advanced')` |                                   |
| `is_custom`         | `boolean` DEFAULT `false`                    | Creado por el usuario             |
| `created_by`        | `uuid` FK → `profiles.id` NULL               | NULL = del sistema                |
| `created_at`        | `timestamptz`                                |                                   |

---

#### `routines` (sin cambios estructurales)

| Columna       | Tipo                      | Descripción |
| ------------- | ------------------------- | ----------- |
| `id`          | `uuid` PK                 |             |
| `user_id`     | `uuid` FK → `profiles.id` |             |
| `name`        | `text` NOT NULL           |             |
| `description` | `text`                    |             |
| `is_active`   | `boolean` DEFAULT `true`  |             |
| `created_at`  | `timestamptz`             |             |
| `updated_at`  | `timestamptz`             |             |

---

#### `routine_exercises` (sin cambios)

| Columna        | Tipo                       | Descripción |
| -------------- | -------------------------- | ----------- |
| `id`           | `uuid` PK                  |             |
| `routine_id`   | `uuid` FK → `routines.id`  |             |
| `exercise_id`  | `uuid` FK → `exercises.id` |             |
| `sets`         | `int` DEFAULT 3            |             |
| `reps`         | `text` DEFAULT '10-12'     |             |
| `rest_seconds` | `int` DEFAULT 60           |             |
| `order_index`  | `int` NOT NULL             |             |
| `notes`        | `text`                     |             |

---

#### `workout_sessions` (sin cambios)

| Columna        | Tipo                      | Descripción        |
| -------------- | ------------------------- | ------------------ |
| `id`           | `uuid` PK                 |                    |
| `user_id`      | `uuid` FK → `profiles.id` |                    |
| `session_date` | `date` NOT NULL           |                    |
| `started_at`   | `timestamptz`             |                    |
| `finished_at`  | `timestamptz`             | NULL = en progreso |
| `notes`        | `text`                    |                    |
| `week_number`  | `int`                     |                    |
| `year`         | `int`                     |                    |
| `created_at`   | `timestamptz`             |                    |
| `updated_at`   | `timestamptz`             |                    |
| UNIQUE         | `(user_id, session_date)` | Una sesión por día |

---

#### `session_muscle_groups` (sin cambios)

| Columna           | Tipo                              | Descripción |
| ----------------- | --------------------------------- | ----------- |
| `id`              | `uuid` PK                         |             |
| `session_id`      | `uuid` FK → `workout_sessions.id` |             |
| `muscle_group_id` | `uuid` FK → `muscle_groups.id`    |             |
| `is_completed`    | `boolean` DEFAULT `false`         |             |
| `completed_at`    | `timestamptz`                     |             |
| `sets_count`      | `int`                             |             |
| `notes`           | `text`                            |             |
| `created_at`      | `timestamptz`                     |             |
| UNIQUE            | `(session_id, muscle_group_id)`   |             |

---

#### `audit_log` (sin cambios)

| Columna      | Tipo                               | Descripción |
| ------------ | ---------------------------------- | ----------- |
| `id`         | `bigserial` PK                     |             |
| `table_name` | `text`                             |             |
| `operation`  | `enum('INSERT','UPDATE','DELETE')` |             |
| `row_id`     | `uuid`                             |             |
| `user_id`    | `uuid`                             |             |
| `old_data`   | `jsonb`                            |             |
| `new_data`   | `jsonb`                            |             |
| `changed_at` | `timestamptz` DEFAULT `now()`      |             |

---

## 5. Diagrama ER

```
auth.users
    │
    ▼
profiles ─────────────────────────────────────────────────────┐
    │                                                          │
    ├──▶ body_measurements                                     │
    │                                                          │
    ├──▶ workout_sessions                                      │
    │         │                                                │
    │         └──▶ session_muscle_groups                       │
    │                    │                                     │
    │                    ▼                                     │
    │              muscle_groups ◀─────────────────────────┐   │
    │                    ▲                                  │   │
    │                    │                                  │   │
    ├──▶ exercises ───────                                  │   │
    │         ▲                                             │   │
    │         │                                             │   │
    ├──▶ routines                                           │   │
    │         │                                             │   │
    │         └──▶ routine_exercises ──▶ exercises          │   │
    │                                                       │   │
    └──▶ weekly_plans                                       │   │
              │                                             │   │
              └──▶ weekly_plan_days                         │   │
                        │                                   │   │
                        └──▶ weekly_plan_day_muscles ───────┘   │
                                                                │
                                    (todas FK a profiles.id) ──┘
```

---

## 6. SQL Completo

```sql
-- ============================================================
-- GymTrack Pro v2 — Schema completo
-- Ejecutar en orden en el SQL Editor de Supabase
-- ============================================================

-- ── TIPOS ENUM ──────────────────────────────────────────────
CREATE TYPE gender_type       AS ENUM ('male', 'female', 'other');
CREATE TYPE body_side_type    AS ENUM ('front', 'back', 'both');
CREATE TYPE difficulty_type   AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE audit_op_type     AS ENUM ('INSERT', 'UPDATE', 'DELETE');
CREATE TYPE goal_type         AS ENUM ('lose_weight', 'gain_muscle', 'maintain');
CREATE TYPE activity_type     AS ENUM ('sedentary', 'light', 'moderate', 'active', 'very_active');

-- ── PROFILES ────────────────────────────────────────────────
CREATE TABLE profiles (
  id                uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username          text        UNIQUE NOT NULL,
  full_name         text        NOT NULL DEFAULT '',
  gender            gender_type NOT NULL DEFAULT 'other',
  avatar_url        text,
  birth_date        date,
  height_cm         numeric(5,1),
  weight_kg         numeric(5,2),
  goal              goal_type   DEFAULT 'maintain',
  activity_level    activity_type DEFAULT 'moderate',
  gym_days_per_week int         DEFAULT 3 CHECK (gym_days_per_week BETWEEN 1 AND 7),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ── MUSCLE GROUPS (catálogo) ─────────────────────────────────
CREATE TABLE muscle_groups (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text        UNIQUE NOT NULL,
  name_es        text        NOT NULL,
  name_en        text        NOT NULL,
  body_side      body_side_type NOT NULL DEFAULT 'front',
  svg_path_id    text        NOT NULL,
  display_order  int         NOT NULL DEFAULT 0
);

INSERT INTO muscle_groups (slug, name_es, name_en, body_side, svg_path_id, display_order) VALUES
  ('chest',       'Pecho',          'Chest',        'front', 'chest',        1),
  ('biceps',      'Bíceps',         'Biceps',       'front', 'biceps',       2),
  ('abs',         'Abdomen',        'Abs',          'front', 'abs',          3),
  ('obliques',    'Oblicuos',       'Obliques',     'front', 'obliques',     4),
  ('quadriceps',  'Cuádriceps',     'Quadriceps',   'front', 'quadriceps',   5),
  ('shoulders',   'Hombros',        'Shoulders',    'both',  'front-deltoids',6),
  ('forearms',    'Antebrazos',     'Forearms',     'both',  'forearm',      7),
  ('back',        'Espalda',        'Back',         'back',  'upper-back',   8),
  ('traps',       'Trapecios',      'Trapezius',    'back',  'trapezius',    9),
  ('lats',        'Dorsales',       'Lats',         'back',  'upper-back',   10),
  ('triceps',     'Tríceps',        'Triceps',      'back',  'triceps',      11),
  ('glutes',      'Glúteos',        'Glutes',       'back',  'gluteal',      12),
  ('hamstrings',  'Isquiotibiales', 'Hamstrings',   'back',  'hamstring',    13),
  ('calves',      'Pantorrillas',   'Calves',       'back',  'calves',       14);

-- ── BODY MEASUREMENTS ───────────────────────────────────────
CREATE TABLE body_measurements (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  measured_at date        NOT NULL DEFAULT CURRENT_DATE,
  weight_kg   numeric(5,2),
  height_cm   numeric(5,1),
  bmi         numeric(4,1),
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, measured_at)
);

CREATE INDEX idx_measurements_user_date ON body_measurements(user_id, measured_at DESC);

-- ── EXERCISES ───────────────────────────────────────────────
CREATE TABLE exercises (
  id                 uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  exercisedb_id      text            UNIQUE,
  name               text            NOT NULL,
  name_es            text,
  muscle_group_id    uuid            REFERENCES muscle_groups(id),
  body_part          text,
  target_muscle      text,
  secondary_muscles  text[]          DEFAULT '{}',
  equipment          text,
  gif_url            text,
  instructions       text[]          DEFAULT '{}',
  difficulty         difficulty_type DEFAULT 'beginner',
  is_custom          boolean         NOT NULL DEFAULT false,
  created_by         uuid            REFERENCES profiles(id) ON DELETE SET NULL,
  created_at         timestamptz     NOT NULL DEFAULT now()
);

CREATE INDEX idx_exercises_muscle    ON exercises(muscle_group_id);
CREATE INDEX idx_exercises_body_part ON exercises(body_part);
CREATE INDEX idx_exercises_name      ON exercises USING gin(to_tsvector('english', name));

-- ── ROUTINES ────────────────────────────────────────────────
CREATE TABLE routines (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  description text,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ── ROUTINE EXERCISES ───────────────────────────────────────
CREATE TABLE routine_exercises (
  id           uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id   uuid    NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  exercise_id  uuid    NOT NULL REFERENCES exercises(id),
  sets         int     NOT NULL DEFAULT 3,
  reps         text    NOT NULL DEFAULT '10-12',
  rest_seconds int     DEFAULT 60,
  order_index  int     NOT NULL DEFAULT 0,
  notes        text,
  UNIQUE (routine_id, order_index)
);

-- ── WEEKLY PLANS ────────────────────────────────────────────
CREATE TABLE weekly_plans (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_number    int         NOT NULL CHECK (week_number BETWEEN 1 AND 53),
  year           int         NOT NULL,
  name           text,
  is_template    boolean     NOT NULL DEFAULT false,
  copied_from_id uuid        REFERENCES weekly_plans(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_number, year)
);

-- ── WEEKLY PLAN DAYS ────────────────────────────────────────
CREATE TABLE weekly_plan_days (
  id             uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  weekly_plan_id uuid    NOT NULL REFERENCES weekly_plans(id) ON DELETE CASCADE,
  day_of_week    int     NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_rest_day    boolean NOT NULL DEFAULT false,
  routine_id     uuid    REFERENCES routines(id) ON DELETE SET NULL,
  notes          text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (weekly_plan_id, day_of_week)
);

-- ── WEEKLY PLAN DAY MUSCLES ─────────────────────────────────
CREATE TABLE weekly_plan_day_muscles (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_day_id      uuid NOT NULL REFERENCES weekly_plan_days(id) ON DELETE CASCADE,
  muscle_group_id  uuid NOT NULL REFERENCES muscle_groups(id),
  UNIQUE (plan_day_id, muscle_group_id)
);

-- ── WORKOUT SESSIONS ────────────────────────────────────────
CREATE TABLE workout_sessions (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_date  date        NOT NULL DEFAULT CURRENT_DATE,
  started_at    timestamptz NOT NULL DEFAULT now(),
  finished_at   timestamptz,
  notes         text,
  week_number   int         NOT NULL DEFAULT EXTRACT(WEEK FROM CURRENT_DATE)::int,
  year          int         NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::int,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, session_date)
);

CREATE INDEX idx_sessions_user_week ON workout_sessions(user_id, week_number, year);
CREATE INDEX idx_sessions_user_date ON workout_sessions(user_id, session_date DESC);

-- ── SESSION MUSCLE GROUPS ───────────────────────────────────
CREATE TABLE session_muscle_groups (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       uuid        NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  muscle_group_id  uuid        NOT NULL REFERENCES muscle_groups(id),
  is_completed     boolean     NOT NULL DEFAULT false,
  completed_at     timestamptz,
  sets_count       int,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, muscle_group_id)
);

CREATE INDEX idx_smg_session ON session_muscle_groups(session_id);

-- ── AUDIT LOG ───────────────────────────────────────────────
CREATE TABLE audit_log (
  id          bigserial       PRIMARY KEY,
  table_name  text            NOT NULL,
  operation   audit_op_type   NOT NULL,
  row_id      uuid,
  user_id     uuid,
  old_data    jsonb,
  new_data    jsonb,
  changed_at  timestamptz     NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_user       ON audit_log(user_id);
CREATE INDEX idx_audit_table      ON audit_log(table_name);
CREATE INDEX idx_audit_changed_at ON audit_log(changed_at DESC);
```

---

## 7. Triggers y Auditoría

```sql
-- ── updated_at automático ───────────────────────────────────
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_sessions
  BEFORE UPDATE ON workout_sessions FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_routines
  BEFORE UPDATE ON routines FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_updated_at_weekly_plans
  BEFORE UPDATE ON weekly_plans FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ── Crear perfil al registrarse ─────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, gender)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'gender', 'other')::gender_type
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Auto-completar completed_at al marcar músculo ───────────
CREATE OR REPLACE FUNCTION set_muscle_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed = true AND OLD.is_completed = false THEN
    NEW.completed_at = NOW();
  ELSIF NEW.is_completed = false THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_muscle_completed
  BEFORE UPDATE ON session_muscle_groups
  FOR EACH ROW EXECUTE FUNCTION set_muscle_completed_at();

-- ── Actualizar peso en profiles cuando se inserta medición ──
CREATE OR REPLACE FUNCTION sync_weight_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET
    weight_kg  = NEW.weight_kg,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_measurement_insert
  AFTER INSERT ON body_measurements
  FOR EACH ROW EXECUTE FUNCTION sync_weight_to_profile();

-- ── Calcular BMI automáticamente al insertar medición ───────
CREATE OR REPLACE FUNCTION calculate_bmi()
RETURNS TRIGGER AS $$
DECLARE
  v_height numeric;
BEGIN
  -- Usar altura del perfil si no se provee en la medición
  IF NEW.height_cm IS NULL THEN
    SELECT height_cm INTO v_height FROM profiles WHERE id = NEW.user_id;
    NEW.height_cm = v_height;
  END IF;

  IF NEW.weight_kg IS NOT NULL AND NEW.height_cm IS NOT NULL AND NEW.height_cm > 0 THEN
    NEW.bmi = ROUND(
      NEW.weight_kg / POWER(NEW.height_cm / 100.0, 2),
      1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_measurement_calculate_bmi
  BEFORE INSERT ON body_measurements
  FOR EACH ROW EXECUTE FUNCTION calculate_bmi();

-- ── Auditoría ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE v_user_id uuid;
BEGIN
  BEGIN v_user_id := auth.uid(); EXCEPTION WHEN OTHERS THEN v_user_id := NULL; END;

  IF    TG_OP = 'INSERT' THEN
    INSERT INTO audit_log(table_name, operation, row_id, user_id, new_data)
    VALUES (TG_TABLE_NAME, 'INSERT', NEW.id, v_user_id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log(table_name, operation, row_id, user_id, old_data, new_data)
    VALUES (TG_TABLE_NAME, 'UPDATE', NEW.id, v_user_id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log(table_name, operation, row_id, user_id, old_data)
    VALUES (TG_TABLE_NAME, 'DELETE', OLD.id, v_user_id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_workout_sessions
  AFTER INSERT OR UPDATE OR DELETE ON workout_sessions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_body_measurements
  AFTER INSERT OR UPDATE OR DELETE ON body_measurements
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_session_muscle_groups
  AFTER INSERT OR UPDATE OR DELETE ON session_muscle_groups
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

---

## 8. Row Level Security

```sql
-- Habilitar RLS
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_muscle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines             ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises    ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plans         ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plan_days     ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plan_day_muscles ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- body_measurements
CREATE POLICY "own measurements" ON body_measurements FOR ALL USING (auth.uid() = user_id);

-- workout_sessions
CREATE POLICY "own sessions" ON workout_sessions FOR ALL USING (auth.uid() = user_id);

-- session_muscle_groups (a través de la sesión)
CREATE POLICY "own session muscles" ON session_muscle_groups FOR ALL
  USING (EXISTS (
    SELECT 1 FROM workout_sessions ws
    WHERE ws.id = session_muscle_groups.session_id AND ws.user_id = auth.uid()
  ));

-- routines
CREATE POLICY "own routines" ON routines FOR ALL USING (auth.uid() = user_id);

-- routine_exercises (a través de la rutina)
CREATE POLICY "own routine exercises" ON routine_exercises FOR ALL
  USING (EXISTS (
    SELECT 1 FROM routines r WHERE r.id = routine_exercises.routine_id AND r.user_id = auth.uid()
  ));

-- weekly_plans
CREATE POLICY "own weekly plans" ON weekly_plans FOR ALL USING (auth.uid() = user_id);

-- weekly_plan_days
CREATE POLICY "own plan days" ON weekly_plan_days FOR ALL
  USING (EXISTS (
    SELECT 1 FROM weekly_plans wp WHERE wp.id = weekly_plan_days.weekly_plan_id AND wp.user_id = auth.uid()
  ));

-- weekly_plan_day_muscles
CREATE POLICY "own plan day muscles" ON weekly_plan_day_muscles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM weekly_plan_days wpd
    JOIN weekly_plans wp ON wp.id = wpd.weekly_plan_id
    WHERE wpd.id = weekly_plan_day_muscles.plan_day_id AND wp.user_id = auth.uid()
  ));

-- exercises: lectura pública del catálogo, escritura solo propios
CREATE POLICY "read all exercises" ON exercises FOR SELECT USING (true);
CREATE POLICY "write own exercises" ON exercises FOR INSERT WITH CHECK (created_by = auth.uid());

-- muscle_groups: solo lectura (catálogo del sistema)
ALTER TABLE muscle_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read muscle groups" ON muscle_groups FOR SELECT USING (true);
```

---

## 9. Librería react-body-highlighter

### Instalación

```bash
# Para React Web (Vite + React — tu caso)
npm install react-body-highlighter

# NO instalar react-native-body-highlighter (esa es para React Native/Expo)
```

### Componente BodyMap completo

```tsx
// src/components/body/BodyMap.tsx
import { useState, useMemo } from 'react'
import Model from 'react-body-highlighter'

type Gender = 'male' | 'female'
type ViewSide = 'front' | 'back'

interface TrainedMuscle {
  slug: string
  trainedAt: Date
}

interface BodyMapProps {
  gender: Gender
  trainedMuscles: TrainedMuscle[]
}

// Mapa de tus slugs de BD → slugs de react-body-highlighter
const MUSCLE_SLUG_MAP: Record<string, string[]> = {
  chest: ['chest'],
  shoulders: ['front-deltoids', 'back-deltoids'],
  biceps: ['biceps'],
  triceps: ['triceps'],
  forearms: ['forearm'],
  abs: ['abs'],
  obliques: ['obliques'],
  back: ['upper-back', 'lower-back'],
  lats: ['upper-back'],
  traps: ['trapezius'],
  glutes: ['gluteal'],
  quadriceps: ['quadriceps'],
  hamstrings: ['hamstring'],
  calves: ['calves'],
}

// Colores: índice 0 = semana, índice 2 = hoy (más intenso)
const HIGHLIGHT_COLORS = ['#86efac', '#4ade80', '#a3e635', '#65a30d']

export function BodyMap({ gender, trainedMuscles }: BodyMapProps) {
  const [side, setSide] = useState<ViewSide>('front')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const modelData = useMemo(() => {
    return trainedMuscles.flatMap((tm) => {
      const libSlugs = MUSCLE_SLUG_MAP[tm.slug]
      if (!libSlugs) return []

      const trainedDate = new Date(tm.trainedAt)
      trainedDate.setHours(0, 0, 0, 0)
      const isToday = trainedDate.getTime() === today.getTime()

      // Doble entrada para músculos entrenados hoy → mayor frecuencia → color más intenso
      const entries = [{ name: tm.slug, muscles: libSlugs }]
      if (isToday) entries.push({ name: `${tm.slug}_today`, muscles: libSlugs })

      return entries
    })
  }, [trainedMuscles])

  return (
    <div className='body-map-wrap'>
      {/* Toggle */}
      <div className='view-toggle'>
        <button
          className={side === 'front' ? 'active' : ''}
          onClick={() => setSide('front')}
        >
          Frente
        </button>
        <button
          className={side === 'back' ? 'active' : ''}
          onClick={() => setSide('back')}
        >
          Espalda
        </button>
      </div>

      {/* Silueta */}
      <Model
        data={modelData}
        gender={gender} // 'male' | 'female'
        side={side} // 'front' | 'back'
        scale={1.4}
        colors={HIGHLIGHT_COLORS}
        border='#1a1a1a'
        highlightedColors={HIGHLIGHT_COLORS}
        style={{ width: '100%', maxWidth: 220 }}
      />

      {/* Leyenda */}
      <div className='legend'>
        <span style={{ color: '#86efac' }}>● Esta semana</span>
        <span style={{ color: '#a3e635' }}>● Hoy</span>
      </div>
    </div>
  )
}
```

### Slugs disponibles en la librería (referencia)

```
Vista frontal:
  head | neck | chest | biceps | triceps | forearm
  abs | obliques | front-deltoids | adductor | tibialis
  quadriceps | knees | ankles

Vista posterior:
  trapezius | upper-back | lower-back
  back-deltoids | triceps | forearm
  gluteal | hamstring | calves | adductor | ankles
```

### Cómo alimentarlo desde Supabase

```tsx
// src/pages/DashboardPage.tsx

const { data: sessions } = await supabase
  .from('workout_sessions')
  .select(`
    session_date,
    session_muscle_groups (
      is_completed,
      completed_at,
      muscle_groups ( slug )
    )
  `)
  .eq('user_id', user.id)
  .gte('session_date', weekStart.toISOString().split('T')[0])

const trainedMuscles = sessions?.flatMap(session =>
  session.session_muscle_groups
    .filter(smg => smg.is_completed)
    .map(smg => ({
      slug:      smg.muscle_groups.slug,
      trainedAt: new Date(smg.completed_at || session.session_date),
    }))
) ?? []

// Pasar al componente:
<BodyMap gender={profile.gender} trainedMuscles={trainedMuscles} />
```

---

## 10. IMC — Lógica y siluetas

### Fórmulas

```ts
// src/lib/bmi.ts

export interface BodyStats {
  weightKg: number
  heightCm: number
  gender: 'male' | 'female' | 'other'
  birthDate?: Date
}

export interface BMIResult {
  bmi: number
  category: 'underweight' | 'normal' | 'overweight' | 'obese'
  categoryLabel: string
  idealWeightMin: number
  idealWeightMax: number
  bmr: number // Tasa metabólica basal (calorías en reposo)
  tdee: number // Gasto energético total diario
  silhouetteKey: 1 | 2 | 3 | 4 | 5 // Para elegir la silueta SVG
}

export function calculateBMI(
  stats: BodyStats,
  activityFactor = 1.55
): BMIResult {
  const { weightKg, heightCm, gender, birthDate } = stats
  const heightM = heightCm / 100

  // IMC
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10

  // Categoría
  let category: BMIResult['category']
  let categoryLabel: string
  if (bmi < 18.5) {
    category = 'underweight'
    categoryLabel = 'Bajo peso'
  } else if (bmi < 25) {
    category = 'normal'
    categoryLabel = 'Peso normal'
  } else if (bmi < 30) {
    category = 'overweight'
    categoryLabel = 'Sobrepeso'
  } else {
    category = 'obese'
    categoryLabel = 'Obesidad'
  }

  // Peso ideal (Fórmula de Devine)
  const heightInches = heightCm / 2.54
  const base = gender === 'female' ? 45.5 : 50
  const idealWeight = base + 2.3 * (heightInches - 60)
  const idealWeightMin = Math.round((idealWeight - 5) * 10) / 10
  const idealWeightMax = Math.round((idealWeight + 5) * 10) / 10

  // TMB — Harris-Benedict revisada
  const age = birthDate
    ? Math.floor((Date.now() - birthDate.getTime()) / 31557600000)
    : 30
  const bmr =
    gender === 'female'
      ? 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age
      : 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age

  const tdee = Math.round(bmr * activityFactor)

  // Clave de silueta (1=muy delgado, 3=normal, 5=obeso)
  const silhouetteKey: BMIResult['silhouetteKey'] =
    bmi < 17 ? 1 : bmi < 22 ? 2 : bmi < 27 ? 3 : bmi < 32 ? 4 : 5

  return {
    bmi,
    category,
    categoryLabel,
    idealWeightMin,
    idealWeightMax,
    bmr: Math.round(bmr),
    tdee,
    silhouetteKey,
  }
}
```

### Siluetas SVG por categoría

Las siluetas son 5 variantes SVG inline (no dependencia externa) que varían el ancho del torso y extremidades:

```
silhouetteKey = 1 → muy delgado (IMC < 17)
silhouetteKey = 2 → delgado     (IMC 17–22)
silhouetteKey = 3 → normal      (IMC 22–27)
silhouetteKey = 4 → sobrepeso   (IMC 27–32)
silhouetteKey = 5 → obeso       (IMC > 32)
```

Cada variante existe para género masculino y femenino = 10 SVGs inline en el componente `BMISilhouette.tsx`.

El componente usa `silhouetteKey` + `gender` para elegir el SVG correcto:

```tsx
// src/components/bmi/BMISilhouette.tsx
import { SILHOUETTES } from './silhouettes'

// objeto con los 10 SVGs

export function BMISilhouette({ silhouetteKey, gender }) {
  const key = `${gender}_${silhouetteKey}`
  return (
    <div
      className='silhouette'
      dangerouslySetInnerHTML={{ __html: SILHOUETTES[key] }}
    />
  )
}
```

### Pantalla IMC — componente completo

```tsx
// src/pages/BMIPage.tsx

export function BMIPage() {
  const { profile, measurements } = useProfile()
  const [weight, setWeight] = useState(profile.weight_kg ?? '')
  const [saving, setSaving] = useState(false)

  const stats = calculateBMI({
    weightKg: Number(profile.weight_kg),
    heightCm: Number(profile.height_cm),
    gender: profile.gender,
    birthDate: profile.birth_date ? new Date(profile.birth_date) : undefined,
  })

  async function saveMeasurement() {
    setSaving(true)
    await supabase.from('body_measurements').insert({
      user_id: profile.id,
      weight_kg: Number(weight),
      // El trigger calcula bmi y actualiza profiles.weight_kg automáticamente
    })
    setSaving(false)
  }

  return (
    <div>
      <BMICard result={stats} />
      <BMIScale bmi={stats.bmi} />
      <BMISilhouette
        silhouetteKey={stats.silhouetteKey}
        gender={profile.gender}
      />
      <StatsGrid result={stats} profile={profile} />
      <WeightHistory measurements={measurements} />
      <UpdateWeightForm
        weight={weight}
        onChange={setWeight}
        onSave={saveMeasurement}
        loading={saving}
      />
    </div>
  )
}
```

---

## 11. ExerciseDB — Importar ejercicios

### Fuente de datos

```
https://oss.exercisedb.dev/
```

ExerciseDB Open Source es **gratuito y sin API key**. Contiene más de 1,300 ejercicios con GIFs animados.

### Paso a paso para volcar a Supabase

**Paso 1 — Obtener todos los ejercicios**

```bash
# Descargar todos los ejercicios (puede demorar ~30 segundos)
curl "https://oss.exercisedb.dev/exercises?limit=1500&offset=0" \
  -o exercises-raw.json
```

**Paso 2 — Crear script de importación**

```ts
// scripts/import-exercises.ts
// Ejecutar con: npx tsx scripts/import-exercises.ts
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // usar service role para bypass RLS
)

// Mapa de bodyPart de ExerciseDB → slug de tu tabla muscle_groups
const BODY_PART_MAP: Record<string, string> = {
  chest: 'chest',
  back: 'back',
  shoulders: 'shoulders',
  'upper arms': 'biceps', // se refinará por target
  'lower arms': 'forearms',
  'upper legs': 'quadriceps', // se refinará por target
  'lower legs': 'calves',
  waist: 'abs',
  cardio: 'abs',
  neck: 'traps',
}

// Mapa de target muscle de ExerciseDB → slug de tu tabla
const TARGET_MAP: Record<string, string> = {
  pectorals: 'chest',
  lats: 'lats',
  'upper back': 'back',
  traps: 'traps',
  deltoids: 'shoulders',
  biceps: 'biceps',
  triceps: 'triceps',
  forearms: 'forearms',
  abs: 'abs',
  obliques: 'obliques',
  glutes: 'glutes',
  quads: 'quadriceps',
  hamstrings: 'hamstrings',
  calves: 'calves',
  adductors: 'quadriceps',
  spine: 'back',
  'cardiovascular system': 'abs',
}

async function importExercises() {
  // Leer archivo descargado
  const raw = JSON.parse(fs.readFileSync('exercises-raw.json', 'utf-8'))
  const exercises = raw.exercises ?? raw // la API devuelve { exercises: [...] } o directamente []

  console.log(`Total ejercicios a importar: ${exercises.length}`)

  // Cargar IDs de muscle_groups desde Supabase
  const { data: muscleGroups } = await supabase
    .from('muscle_groups')
    .select('id, slug')

  const muscleGroupMap = Object.fromEntries(
    muscleGroups!.map((mg) => [mg.slug, mg.id])
  )

  // Procesar en lotes de 100
  const BATCH_SIZE = 100
  let imported = 0
  let errors = 0

  for (let i = 0; i < exercises.length; i += BATCH_SIZE) {
    const batch = exercises.slice(i, i + BATCH_SIZE)

    const rows = batch.map((ex: any) => {
      // Determinar músculo principal
      const targetSlug =
        TARGET_MAP[ex.target?.toLowerCase()] ??
        BODY_PART_MAP[ex.bodyPart?.toLowerCase()]
      const muscleGroupId = targetSlug ? muscleGroupMap[targetSlug] : null

      return {
        exercisedb_id: ex.id,
        name: ex.name,
        body_part: ex.bodyPart,
        target_muscle: ex.target,
        secondary_muscles: ex.secondaryMuscles ?? [],
        equipment: ex.equipment,
        gif_url: ex.gifUrl,
        instructions: ex.instructions ?? [],
        muscle_group_id: muscleGroupId,
        is_custom: false,
      }
    })

    const { error } = await supabase
      .from('exercises')
      .upsert(rows, { onConflict: 'exercisedb_id', ignoreDuplicates: false })

    if (error) {
      console.error(`Error en lote ${i / BATCH_SIZE + 1}:`, error.message)
      errors += batch.length
    } else {
      imported += batch.length
      console.log(`Importados: ${imported} / ${exercises.length}`)
    }
  }

  console.log(`\nFinalizado. Importados: ${imported}, Errores: ${errors}`)
}

importExercises()
```

**Paso 3 — Ejecutar la importación**

```bash
# Instalar dependencias si no las tenés
npm install -D tsx @supabase/supabase-js

# Configurar variables de entorno
export SUPABASE_URL="https://tu-proyecto.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"

# Ejecutar
npx tsx scripts/import-exercises.ts
```

**Paso 4 — Verificar en Supabase**

```sql
-- Verificar cuántos ejercicios se importaron por grupo muscular
SELECT mg.name_es, COUNT(e.id) as total
FROM muscle_groups mg
LEFT JOIN exercises e ON e.muscle_group_id = mg.id
GROUP BY mg.name_es
ORDER BY total DESC;

-- Verificar ejercicios sin grupo muscular asignado
SELECT name, body_part, target_muscle
FROM exercises
WHERE muscle_group_id IS NULL
LIMIT 20;
```

**Paso 5 — Política RLS para exercises (ya incluida en sección 8)**

```sql
-- Los ejercicios del sistema son de lectura pública (ya configurado)
-- Solo verificar que esté activo
SELECT tablename, policyname FROM pg_policies WHERE tablename = 'exercises';
```

### Estructura de respuesta de ExerciseDB

```json
{
  "id": "0001",
  "name": "3/4 sit-up",
  "bodyPart": "waist",
  "equipment": "body weight",
  "gifUrl": "https://v2.exercisedb.io/image/abc123",
  "target": "abs",
  "secondaryMuscles": ["hip flexors", "lower back"],
  "instructions": [
    "Lie down on your back...",
    "Place your hands behind your head..."
  ]
}
```

---

## 12. Arquitectura de Componentes React

```
src/
├── main.tsx
├── App.tsx
├── router.tsx          ← rutas protegidas
│
├── lib/
│   ├── supabase.ts
│   ├── bmi.ts          ← cálculos IMC/TMB/TDEE
│   └── weekUtils.ts    ← getWeekNumber, getWeekDates
│
├── hooks/
│   ├── useProfile.ts
│   ├── useCurrentSession.ts
│   ├── useWeekSessions.ts
│   ├── useWeeklyPlan.ts
│   ├── useBMI.ts
│   └── useExercises.ts
│
├── pages/
│   ├── SplashPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── OnboardingPage.tsx
│   ├── DashboardPage.tsx
│   ├── SessionPage.tsx
│   ├── WeeklyPlanPage.tsx
│   ├── BMIPage.tsx
│   ├── ExercisesPage.tsx
│   ├── ExerciseDetailPage.tsx
│   ├── RoutineBuilderPage.tsx
│   ├── HistoryPage.tsx
│   └── ProfilePage.tsx
│
├── components/
│   ├── layout/
│   │   ├── BottomNav.tsx
│   │   ├── TopBar.tsx
│   │   └── PageWrapper.tsx
│   │
│   ├── body/
│   │   └── BodyMap.tsx         ← react-body-highlighter wrapper
│   │
│   ├── bmi/
│   │   ├── BMICard.tsx
│   │   ├── BMIScale.tsx
│   │   ├── BMISilhouette.tsx   ← siluetas SVG inline x 10
│   │   ├── StatsGrid.tsx
│   │   └── WeightHistory.tsx
│   │
│   ├── session/
│   │   ├── MuscleChecklist.tsx
│   │   ├── MuscleItem.tsx
│   │   └── SessionTimer.tsx
│   │
│   ├── plan/
│   │   ├── WeekCalendar.tsx
│   │   ├── PlanDayCard.tsx
│   │   ├── NoWeekPlanModal.tsx
│   │   └── MuscleSelector.tsx
│   │
│   ├── exercises/
│   │   ├── ExerciseCard.tsx
│   │   ├── ExerciseFilter.tsx
│   │   └── ExerciseSearch.tsx
│   │
│   └── ui/
│       ├── WeekStamps.tsx
│       ├── ProgressBar.tsx
│       └── StreakBadge.tsx
│
└── types/
    └── database.ts     ← tipos generados desde Supabase CLI
```

### Generar tipos de TypeScript desde Supabase

```bash
npx supabase gen types typescript \
  --project-id tu-project-id \
  > src/types/database.ts
```

---

## 13. Roadmap MVP

### Fase 1 — Core (semanas 1-3)

- [ ] Auth: login, registro, onboarding
- [ ] Dashboard: silueta con `react-body-highlighter` + sellos
- [ ] Sesión de hoy: TODO list muscular
- [ ] Perfil básico

### Fase 2 — Plan semanal (semana 4)

- [ ] Crear plan semanal día a día
- [ ] Modal "sin plan" al abrir app
- [ ] Reutilizar plan de semana anterior

### Fase 3 — IMC (semana 5)

- [ ] Pantalla IMC con cálculos
- [ ] Historial de peso (gráfica)
- [ ] Siluetas SVG por categoría

### Fase 4 — Ejercicios (semana 6)

- [ ] Importar ExerciseDB a Supabase (script)
- [ ] Catálogo de ejercicios con búsqueda y filtros
- [ ] Detalle de ejercicio con GIF

### Fase 5 — Rutinas (semana 7)

- [ ] Armar rutinas personalizadas
- [ ] Asignar rutinas a días del plan
- [ ] Historial con estadísticas

### Fase 6 — PWA + Pulido (semana 8)

- [ ] vite-plugin-pwa configurado
- [ ] Offline básico (cache de catálogo)
- [ ] Notificaciones push (recordatorio de entrenamiento)
- [ ] Animaciones de transición

---

## 14. Guía de Inicio Rápido

### 1. Crear proyecto

```bash
npm create vite@latest gymtrack-pro -- --template react-ts
cd gymtrack-pro
npm install @supabase/supabase-js @supabase/auth-helpers-react
npm install react-router-dom @tanstack/react-query zustand
npm install react-body-highlighter
npm install framer-motion lucide-react
npm install -D tailwindcss postcss autoprefixer vite-plugin-pwa tsx
npx tailwindcss init -p
```

### 2. Variables de entorno

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-key  # solo para scripts locales
```

### 3. Ejecutar SQL en Supabase

Copiar y ejecutar en orden en el **SQL Editor** de Supabase:

1. Los ENUMs (sección 6, primer bloque)
2. Las tablas en orden (profiles → muscle_groups → body_measurements → exercises → routines → ...)
3. Los índices
4. Los triggers (sección 7)
5. Las políticas RLS (sección 8)

### 4. Importar ejercicios de ExerciseDB

```bash
curl "https://oss.exercisedb.dev/exercises?limit=1500" -o exercises-raw.json
npx tsx scripts/import-exercises.ts
```

### 5. Configurar PWA

```ts
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'GymTrack Pro',
        short_name: 'GymTrack',
        theme_color: '#a3e635',
        background_color: '#0f0f0f',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
```

---

_GymTrack Pro — Especificación Técnica v2.0 — Abril 2025_
_No hay soft delete. Los DELETE son permanentes. La auditoría en `audit_log` permite reconstruir datos si es necesario._
