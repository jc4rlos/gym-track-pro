# GymTrack Pro — Especificación Técnica Completa

> Sistema web PWA para tracking de entrenamiento físico con dashboard corporal interactivo

---

## Tabla de Contenidos

1. [Visión General del Producto](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [API de Ejercicios (Gratuita)](#api-de-ejercicios)
4. [Modelo de Base de Datos](#modelo-de-base-de-datos)
5. [Diagrama Entidad-Relación](#diagrama-er)
6. [Triggers y Auditoría](#triggers-y-auditoría)
7. [Row Level Security (RLS)](#row-level-security)
8. [Scripts SQL Completos](#scripts-sql-completos)
9. [Arquitectura de Componentes React](#arquitectura-react)
10. [Diseño UI/UX — Mockups](#diseño-uiux)
11. [Roadmap de Features](#roadmap)
12. [Guía de Inicio Rápido](#guía-de-inicio)

---

## 1. Visión General del Producto

GymTrack Pro resuelve el problema de no recordar qué músculos entrenaste en la semana. El sistema ofrece:

- **Dashboard corporal visual** — silueta SVG del cuerpo humano con músculos coloreados según actividad semanal
- **Todo list semanal** — checklist de grupos musculares para la semana actual
- **Sellos de asistencia** — calendario semanal que se marca al finalizar cada entrenamiento
- **Registro diario** — log de qué parte del cuerpo trabajaste cada día
- **Perfil con género** — silueta femenina o masculina según el usuario
- **Gestión de ejercicios y rutinas** — feature futuro ya modelado en la BD

---

## 2. Stack Tecnológico

| Capa           | Tecnología                              |
| -------------- | --------------------------------------- |
| Frontend       | React 18 + Vite                         |
| Estilos        | Tailwind CSS + shadcn/ui                |
| Backend / Auth | Supabase (PostgreSQL + Auth + Realtime) |
| Estado global  | Zustand o React Query                   |
| PWA            | vite-plugin-pwa + Workbox               |
| Router         | React Router v6                         |
| Íconos         | Lucide React                            |
| Animaciones    | Framer Motion                           |

---

## 3. API de Ejercicios (Gratuita)

### Opción recomendada: ExerciseDB (vía RapidAPI)

```
https://exercisedb.p.rapidapi.com/exercises
```

- **Plan gratuito:** 1,000 requests/mes
- **Más de 1,300 ejercicios** con nombre, músculo objetivo, equipamiento, GIFs animados
- Campos: `name`, `target` (músculo), `bodyPart`, `equipment`, `gifUrl`

### Alternativa 100% gratuita y sin límites: wger REST API

```
https://wger.de/api/v2/exercise/?format=json&language=2&limit=100
```

- Open source, sin API key
- Ejercicios en inglés y español
- Puedes hacer self-host si lo necesitas

### Estrategia sugerida

Usar wger para no depender de API keys en MVP. Importar los ejercicios relevantes a tu propia tabla `exercises` en Supabase y trabajar con tus propios datos desde ahí.

---

## 4. Modelo de Base de Datos

### Grupos musculares del sistema

El sistema maneja estos 14 grupos musculares mapeados a la silueta:

```
chest         → Pecho
back          → Espalda
shoulders     → Hombros
biceps        → Bíceps
triceps       → Tríceps
forearms      → Antebrazos
abs           → Abdomen
obliques      → Oblicuos
glutes        → Glúteos
quadriceps    → Cuádriceps
hamstrings    → Isquiotibiales
calves        → Pantorrillas
traps         → Trapecios
lats          → Dorsales
```

### Tablas principales

---

#### `profiles`

Extiende la tabla `auth.users` de Supabase con datos del perfil.

| Columna      | Tipo                            | Descripción                   |
| ------------ | ------------------------------- | ----------------------------- |
| `id`         | `uuid` PK                       | Referencia a `auth.users.id`  |
| `username`   | `text`                          | Nombre de usuario único       |
| `full_name`  | `text`                          | Nombre completo               |
| `gender`     | `enum('male','female','other')` | Para mostrar silueta correcta |
| `avatar_url` | `text`                          | URL del avatar                |
| `created_at` | `timestamptz`                   | Fecha de creación             |
| `updated_at` | `timestamptz`                   | Última actualización          |

---

#### `muscle_groups`

Catálogo inmutable de grupos musculares.

| Columna         | Tipo                          | Descripción                   |
| --------------- | ----------------------------- | ----------------------------- |
| `id`            | `uuid` PK                     |                               |
| `slug`          | `text` UNIQUE                 | Ej: `biceps`, `chest`         |
| `name_es`       | `text`                        | Nombre en español             |
| `name_en`       | `text`                        | Nombre en inglés              |
| `body_side`     | `enum('front','back','both')` | Para renderizar silueta       |
| `svg_path_id`   | `text`                        | ID del path SVG en la silueta |
| `display_order` | `int`                         | Orden en la lista             |

---

#### `workout_sessions`

Cada vez que el usuario va al gym y registra un entrenamiento.

| Columna        | Tipo                      | Descripción                          |
| -------------- | ------------------------- | ------------------------------------ |
| `id`           | `uuid` PK                 |                                      |
| `user_id`      | `uuid` FK → `profiles.id` |                                      |
| `session_date` | `date`                    | Fecha del entrenamiento              |
| `started_at`   | `timestamptz`             | Hora de inicio                       |
| `finished_at`  | `timestamptz`             | Hora de fin (marca el sello del día) |
| `notes`        | `text`                    | Notas libres                         |
| `week_number`  | `int`                     | Número de semana del año             |
| `year`         | `int`                     | Año                                  |
| `created_at`   | `timestamptz`             |                                      |
| `updated_at`   | `timestamptz`             |                                      |

> **Lógica de sello:** Cuando `finished_at` es NOT NULL, ese día se considera "asistido" y se pinta el sello en el calendario semanal.

---

#### `session_muscle_groups`

Qué músculos trabajaste en cada sesión (el TODO list).

| Columna           | Tipo                              | Descripción                  |
| ----------------- | --------------------------------- | ---------------------------- |
| `id`              | `uuid` PK                         |                              |
| `session_id`      | `uuid` FK → `workout_sessions.id` |                              |
| `muscle_group_id` | `uuid` FK → `muscle_groups.id`    |                              |
| `is_completed`    | `boolean` DEFAULT `false`         | Check del TODO list          |
| `completed_at`    | `timestamptz`                     | Cuándo se marcó como listo   |
| `sets_count`      | `int`                             | Series realizadas (opcional) |
| `notes`           | `text`                            | Notas del músculo            |
| `created_at`      | `timestamptz`                     |                              |

---

#### `exercises`

Catálogo de ejercicios (poblar desde wger API).

| Columna                | Tipo                                         | Descripción                  |
| ---------------------- | -------------------------------------------- | ---------------------------- |
| `id`                   | `uuid` PK                                    |                              |
| `name`                 | `text`                                       | Nombre del ejercicio         |
| `muscle_group_id`      | `uuid` FK → `muscle_groups.id`               | Músculo principal            |
| `secondary_muscle_ids` | `uuid[]`                                     | Músculos secundarios         |
| `equipment`            | `text`                                       | Equipo necesario             |
| `difficulty`           | `enum('beginner','intermediate','advanced')` |                              |
| `gif_url`              | `text`                                       | GIF animado (de API externa) |
| `description`          | `text`                                       | Descripción del ejercicio    |
| `external_id`          | `text`                                       | ID en la API externa         |
| `is_custom`            | `boolean`                                    | Si fue creado por el usuario |
| `created_by`           | `uuid` FK → `profiles.id`                    | NULL si es del sistema       |
| `created_at`           | `timestamptz`                                |                              |

---

#### `routines`

Rutinas armadas por el usuario (feature futuro).

| Columna             | Tipo                      | Descripción                  |
| ------------------- | ------------------------- | ---------------------------- |
| `id`                | `uuid` PK                 |                              |
| `user_id`           | `uuid` FK → `profiles.id` |                              |
| `name`              | `text`                    | Ej: "Día de pecho y tríceps" |
| `description`       | `text`                    |                              |
| `target_muscle_ids` | `uuid[]`                  | Grupos musculares objetivo   |
| `is_active`         | `boolean`                 | Si la usa actualmente        |
| `created_at`        | `timestamptz`             |                              |
| `updated_at`        | `timestamptz`             |                              |

---

#### `routine_exercises`

Ejercicios dentro de cada rutina.

| Columna        | Tipo                       | Descripción           |
| -------------- | -------------------------- | --------------------- |
| `id`           | `uuid` PK                  |                       |
| `routine_id`   | `uuid` FK → `routines.id`  |                       |
| `exercise_id`  | `uuid` FK → `exercises.id` |                       |
| `sets`         | `int`                      | Series planificadas   |
| `reps`         | `text`                     | Ej: "8-12" o "15"     |
| `rest_seconds` | `int`                      | Descanso entre series |
| `order_index`  | `int`                      | Orden en la rutina    |
| `notes`        | `text`                     |                       |

---

#### `audit_log`

Registro de auditoría de todas las operaciones sensibles.

| Columna      | Tipo                               | Descripción                      |
| ------------ | ---------------------------------- | -------------------------------- |
| `id`         | `bigserial` PK                     |                                  |
| `table_name` | `text`                             | Tabla afectada                   |
| `operation`  | `enum('INSERT','UPDATE','DELETE')` |                                  |
| `row_id`     | `uuid`                             | ID del registro afectado         |
| `user_id`    | `uuid`                             | Usuario que realizó la acción    |
| `old_data`   | `jsonb`                            | Datos anteriores (UPDATE/DELETE) |
| `new_data`   | `jsonb`                            | Datos nuevos (INSERT/UPDATE)     |
| `changed_at` | `timestamptz` DEFAULT `now()`      |                                  |
| `ip_address` | `inet`                             | IP del cliente (si disponible)   |

---

## 5. Diagrama ER

```
auth.users
    │
    ▼
profiles ──────────────────────────────────────┐
    │                                           │
    ├──▶ workout_sessions                       │
    │         │                                 │
    │         └──▶ session_muscle_groups        │
    │                    │                      │
    │                    ▼                      │
    │              muscle_groups                │
    │                    ▲                      │
    │                    │                      │
    ├──▶ exercises ───────                      │
    │         │                                 │
    │         ▼                                 │
    └──▶ routines                               │
              │                                 │
              └──▶ routine_exercises ───────────┘
                         │
                         └──▶ exercises
```

### Relaciones clave

- `profiles` (1) → (N) `workout_sessions`
- `workout_sessions` (1) → (N) `session_muscle_groups`
- `muscle_groups` (1) → (N) `session_muscle_groups`
- `profiles` (1) → (N) `routines`
- `routines` (1) → (N) `routine_exercises`
- `exercises` (1) → (N) `routine_exercises`
- `muscle_groups` (1) → (N) `exercises`

---

## 6. Triggers y Auditoría

### Trigger 1: `updated_at` automático

Se aplica a todas las tablas con columna `updated_at`.

```sql
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Trigger 2: Crear perfil al registrarse

Cuando un usuario se registra en Supabase Auth, se crea automáticamente su perfil.

```sql
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
```

### Trigger 3: Auto-poblar músculos en nueva sesión

Cuando se crea una sesión, opcionalmenete se puede auto-agregar todos los grupos musculares como "pendientes".

```sql
CREATE OR REPLACE FUNCTION populate_session_muscle_groups()
RETURNS TRIGGER AS $$
BEGIN
  -- No auto-poblar, dejar que el usuario elija
  -- Puedes activar esto si prefieres que aparezcan todos marcados como pendientes
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Trigger 4: Auditoría general

Función reutilizable para todas las tablas auditadas.

```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Obtener el usuario actual de Supabase Auth
  BEGIN
    v_user_id := (auth.uid());
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
  END;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, operation, row_id, user_id, new_data)
    VALUES (TG_TABLE_NAME, 'INSERT', NEW.id, v_user_id, to_jsonb(NEW));
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, operation, row_id, user_id, old_data, new_data)
    VALUES (TG_TABLE_NAME, 'UPDATE', NEW.id, v_user_id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, operation, row_id, user_id, old_data)
    VALUES (TG_TABLE_NAME, 'DELETE', OLD.id, v_user_id, to_jsonb(OLD));
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 7. Row Level Security (RLS)

Supabase usa RLS para que cada usuario solo acceda a sus datos.

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_muscle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;

-- profiles: solo tu propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- workout_sessions: solo tus sesiones
CREATE POLICY "Users can CRUD own sessions"
  ON workout_sessions FOR ALL USING (auth.uid() = user_id);

-- session_muscle_groups: a través de la sesión
CREATE POLICY "Users can CRUD own session muscles"
  ON session_muscle_groups FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions ws
      WHERE ws.id = session_muscle_groups.session_id
      AND ws.user_id = auth.uid()
    )
  );

-- muscle_groups: lectura pública (catálogo del sistema)
CREATE POLICY "Anyone can read muscle groups"
  ON muscle_groups FOR SELECT USING (true);

-- exercises: lectura de sistema + propios
CREATE POLICY "Users can read system and own exercises"
  ON exercises FOR SELECT
  USING (is_custom = false OR created_by = auth.uid());

CREATE POLICY "Users can create own exercises"
  ON exercises FOR INSERT
  WITH CHECK (created_by = auth.uid() AND is_custom = true);

-- routines: solo las tuyas
CREATE POLICY "Users can CRUD own routines"
  ON routines FOR ALL USING (auth.uid() = user_id);
```

---

## 8. Scripts SQL Completos

```sql
-- ============================================================
-- GymTrack Pro — Schema completo
-- ============================================================

-- TIPOS ENUM
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
CREATE TYPE body_side_type AS ENUM ('front', 'back', 'both');
CREATE TYPE difficulty_type AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE audit_op_type AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- ============================================================
-- TABLA: profiles
-- ============================================================
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    text UNIQUE NOT NULL,
  full_name   text NOT NULL DEFAULT '',
  gender      gender_type NOT NULL DEFAULT 'other',
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLA: muscle_groups (catálogo del sistema)
-- ============================================================
CREATE TABLE muscle_groups (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text UNIQUE NOT NULL,
  name_es        text NOT NULL,
  name_en        text NOT NULL,
  body_side      body_side_type NOT NULL DEFAULT 'front',
  svg_path_id    text NOT NULL,
  display_order  int NOT NULL DEFAULT 0
);

-- Insertar los 14 grupos musculares
INSERT INTO muscle_groups (slug, name_es, name_en, body_side, svg_path_id, display_order) VALUES
  ('chest',       'Pecho',          'Chest',       'front', 'muscle-chest',       1),
  ('biceps',      'Bíceps',         'Biceps',      'front', 'muscle-biceps',      2),
  ('abs',         'Abdomen',        'Abs',         'front', 'muscle-abs',         3),
  ('obliques',    'Oblicuos',       'Obliques',    'front', 'muscle-obliques',    4),
  ('quadriceps',  'Cuádriceps',     'Quads',       'front', 'muscle-quads',       5),
  ('shoulders',   'Hombros',        'Shoulders',   'both',  'muscle-shoulders',   6),
  ('forearms',    'Antebrazos',     'Forearms',    'both',  'muscle-forearms',    7),
  ('back',        'Espalda',        'Back',        'back',  'muscle-back',        8),
  ('traps',       'Trapecios',      'Traps',       'back',  'muscle-traps',       9),
  ('lats',        'Dorsales',       'Lats',        'back',  'muscle-lats',        10),
  ('triceps',     'Tríceps',        'Triceps',     'back',  'muscle-triceps',     11),
  ('glutes',      'Glúteos',        'Glutes',      'back',  'muscle-glutes',      12),
  ('hamstrings',  'Isquiotibiales', 'Hamstrings',  'back',  'muscle-hamstrings',  13),
  ('calves',      'Pantorrillas',   'Calves',      'back',  'muscle-calves',      14);

-- ============================================================
-- TABLA: workout_sessions
-- ============================================================
CREATE TABLE workout_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_date  date NOT NULL DEFAULT CURRENT_DATE,
  started_at    timestamptz NOT NULL DEFAULT now(),
  finished_at   timestamptz,
  notes         text,
  week_number   int NOT NULL DEFAULT EXTRACT(WEEK FROM CURRENT_DATE)::int,
  year          int NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::int,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, session_date)
);

-- ============================================================
-- TABLA: session_muscle_groups
-- ============================================================
CREATE TABLE session_muscle_groups (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       uuid NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  muscle_group_id  uuid NOT NULL REFERENCES muscle_groups(id),
  is_completed     boolean NOT NULL DEFAULT false,
  completed_at     timestamptz,
  sets_count       int,
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, muscle_group_id)
);

-- ============================================================
-- TABLA: exercises
-- ============================================================
CREATE TABLE exercises (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL,
  muscle_group_id       uuid NOT NULL REFERENCES muscle_groups(id),
  secondary_muscle_ids  uuid[] DEFAULT '{}',
  equipment             text,
  difficulty            difficulty_type DEFAULT 'beginner',
  gif_url               text,
  description           text,
  external_id           text,
  is_custom             boolean NOT NULL DEFAULT false,
  created_by            uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at            timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLA: routines
-- ============================================================
CREATE TABLE routines (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name                text NOT NULL,
  description         text,
  target_muscle_ids   uuid[] DEFAULT '{}',
  is_active           boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TABLA: routine_exercises
-- ============================================================
CREATE TABLE routine_exercises (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id   uuid NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  exercise_id  uuid NOT NULL REFERENCES exercises(id),
  sets         int NOT NULL DEFAULT 3,
  reps         text NOT NULL DEFAULT '10-12',
  rest_seconds int DEFAULT 60,
  order_index  int NOT NULL DEFAULT 0,
  notes        text,
  UNIQUE(routine_id, order_index)
);

-- ============================================================
-- TABLA: audit_log
-- ============================================================
CREATE TABLE audit_log (
  id          bigserial PRIMARY KEY,
  table_name  text NOT NULL,
  operation   audit_op_type NOT NULL,
  row_id      uuid,
  user_id     uuid,
  old_data    jsonb,
  new_data    jsonb,
  changed_at  timestamptz NOT NULL DEFAULT now(),
  ip_address  inet
);

-- Índices para audit_log
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_changed_at ON audit_log(changed_at DESC);

-- ============================================================
-- ÍNDICES DE RENDIMIENTO
-- ============================================================
CREATE INDEX idx_sessions_user_week ON workout_sessions(user_id, week_number, year);
CREATE INDEX idx_sessions_user_date ON workout_sessions(user_id, session_date DESC);
CREATE INDEX idx_smg_session ON session_muscle_groups(session_id);
CREATE INDEX idx_exercises_muscle ON exercises(muscle_group_id);

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_sessions
  BEFORE UPDATE ON workout_sessions
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_routines
  BEFORE UPDATE ON routines
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- TRIGGER: auto-completar completed_at al marcar músculo
-- ============================================================
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

-- ============================================================
-- TRIGGER: crear perfil al registrarse
-- ============================================================
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

-- ============================================================
-- TRIGGER: auditoría en sesiones y músculos
-- ============================================================
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
BEGIN
  BEGIN
    v_user_id := (auth.uid());
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
  END;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, operation, row_id, user_id, new_data)
    VALUES (TG_TABLE_NAME, 'INSERT', NEW.id, v_user_id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, operation, row_id, user_id, old_data, new_data)
    VALUES (TG_TABLE_NAME, 'UPDATE', NEW.id, v_user_id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, operation, row_id, user_id, old_data)
    VALUES (TG_TABLE_NAME, 'DELETE', OLD.id, v_user_id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_workout_sessions
  AFTER INSERT OR UPDATE OR DELETE ON workout_sessions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_session_muscle_groups
  AFTER INSERT OR UPDATE OR DELETE ON session_muscle_groups
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

---

## 9. Arquitectura de Componentes React

```
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
│
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx       ← Silueta + resumen semanal
│   ├── TodayPage.tsx           ← TODO list del día actual
│   ├── HistoryPage.tsx         ← Historial de sesiones
│   └── ProfilePage.tsx
│
├── components/
│   ├── body/
│   │   ├── BodySilhouette.tsx  ← SVG principal con músculos coloreables
│   │   ├── BodyMale.tsx        ← SVG silueta masculina
│   │   ├── BodyFemale.tsx      ← SVG silueta femenina
│   │   └── MuscleTooltip.tsx
│   │
│   ├── week/
│   │   ├── WeekStamps.tsx      ← Los 7 sellos de días
│   │   ├── DayStamp.tsx        ← Un sello individual
│   │   └── WeekProgress.tsx    ← Barra de progreso semanal
│   │
│   ├── muscle/
│   │   ├── MuscleChecklist.tsx ← TODO list de músculos
│   │   ├── MuscleItem.tsx      ← Item individual del checklist
│   │   └── MuscleGroupBadge.tsx
│   │
│   └── session/
│       ├── StartSessionButton.tsx
│       ├── FinishSessionButton.tsx
│       └── SessionNotes.tsx
│
├── hooks/
│   ├── useCurrentWeek.ts
│   ├── useWeekSessions.ts
│   ├── useMusclesToday.ts
│   └── useBodyMapColors.ts     ← Lógica de colores según músculos entrenados
│
├── lib/
│   ├── supabase.ts
│   └── constants.ts            ← MUSCLE_GROUPS con colores y paths SVG
│
└── types/
    └── database.ts             ← Tipos generados desde Supabase
```

### Hook clave: `useBodyMapColors`

```typescript
// Retorna un objeto { [muscleSlug]: color }
// según los músculos entrenados en la semana actual
export function useBodyMapColors(userId: string) {
  const { data: sessions } = useWeekSessions(userId)

  const colorMap = useMemo(() => {
    const map: Record<string, string> = {}
    sessions?.forEach((session) => {
      session.session_muscle_groups.forEach((smg) => {
        if (smg.is_completed) {
          const daysSinceTraining = differenceInDays(
            new Date(),
            new Date(smg.completed_at)
          )
          // Músculo reciente = verde brillante, más antiguo = verde apagado
          map[smg.muscle_groups.slug] =
            daysSinceTraining === 0
              ? '#22c55e' // verde brillante (hoy)
              : daysSinceTraining <= 2
                ? '#86efac' // verde claro (ayer/anteayer)
                : '#bbf7d0' // verde muy claro (hace más días)
        }
      })
    })
    return map
  }, [sessions])

  return colorMap
}
```

---

## 10. Diseño UI/UX — Guía de Estilo

### Paleta de colores

```css
--color-bg: #0f0f0f /* Negro profundo */ --color-surface: #1a1a1a
  /* Superficie de tarjetas */ --color-border: #2a2a2a /* Bordes sutiles */
  --color-accent: #a3e635 /* Verde lima — acción principal */
  --color-accent-dim: #65a30d /* Acento oscuro */ --color-text: #f5f5f5
  /* Texto principal */ --color-text-muted: #737373 /* Texto secundario */
  --color-muscle-hot: #22c55e /* Músculo entrenado hoy */
  --color-muscle-warm: #86efac /* Entrenado esta semana */
  --color-muscle-rest: #1f2937 /* Sin entrenar */;
```

### Pantallas principales (flujo de usuario)

#### Pantalla 1 — Login

```
┌─────────────────────────────┐
│         [fondo #0f0f0f]     │
│                             │
│        🏋 (Dumbbell)        │
│      Gym Track Pro          │
│   Tu entrenamiento,         │
│        organizado           │
│                             │
│  ┌───────────────────────┐  │
│  │  Iniciar sesión       │  │
│  │                       │  │
│  │  [Email__________]    │  │
│  │  [Contraseña_____]    │  │
│  │  ¿Olvidaste tu pwd?   │  │
│  │                       │  │
│  │  [  Ingresar  ██████] │  │  ← bg #a3e635, text #0f0f0f
│  └───────────────────────┘  │
│                             │
│  ¿No tienes cuenta?         │
│  → Regístrate               │  ← link color #a3e635
└─────────────────────────────┘
```

#### Pantalla 2 — Registro

```
┌─────────────────────────────┐
│         [fondo #0f0f0f]     │
│                             │
│        🏋 Crear cuenta      │
│      Únete a Gym Track Pro  │
│                             │
│  ┌───────────────────────┐  │
│  │  [Nombre completo___] │  │
│  │  [Usuario___________] │  │
│  │  [Correo____________] │  │
│  │  [Contraseña________] │  │
│  │  [Confirmar pwd_____] │  │
│  │                       │  │
│  │  Género:              │  │
│  │  [Hombre][Mujer][Otro]│  │  ← seleccionado: bg primary lima
│  │                       │  │
│  │  [ Crear cuenta ████] │  │
│  └───────────────────────┘  │
│                             │
│  ¿Ya tienes cuenta?         │
│  → Inicia sesión            │
└─────────────────────────────┘
```

**Flujo:** `supabase.auth.signUp` con metadata `{ full_name, username, gender }` → trigger BD crea perfil → redirect `/onboarding`

#### Pantalla 3 — Onboarding (solo primera vez)

Se muestra cuando `profiles.goal === null`. 3 pasos con barra de progreso.

```
┌─────────────────────────────┐
│  🏋 Configura tu perfil     │
│       Paso 1 de 3           │
│  [██░░░░░░] progreso         │  ← 3 segmentos, activos = lima
│                             │
│  PASO 1 — Objetivo          │
│  ┌─────────────────────┐    │
│  │ 🔥 Perder peso      │    │  ← borde lima cuando activo
│  │   Reducir grasa     │    │
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │ 💪 Ganar músculo    │    │
│  │   Aumentar masa     │    │
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │ 🎯 Mantenerme       │    │
│  │   Mantener condición│    │
│  └─────────────────────┘    │
│                             │
│       [ Continuar ████]     │
└─────────────────────────────┘

┌─────────────────────────────┐
│  🏋 Configura tu perfil     │
│       Paso 2 de 3           │
│  [████░░░░] progreso         │
│                             │
│  PASO 2 — Nivel de actividad│
│  ○ Sedentario               │
│    Poco o nada de ejercicio │
│  ○ Ligero                   │
│    1–3 días por semana      │
│  ● Moderado          [●]   │  ← seleccionado: borde lima + dot
│    3–5 días por semana      │
│  ○ Activo                   │
│    6–7 días por semana      │
│  ○ Muy activo               │
│    Intenso todos los días   │
│                             │
│  [Atrás]     [Continuar ██] │
└─────────────────────────────┘

┌─────────────────────────────┐
│  🏋 Configura tu perfil     │
│       Paso 3 de 3           │
│  [████████] progreso         │
│                             │
│  PASO 3 — Días de gym       │
│  Por semana, en promedio    │
│                             │
│         [−]  3  [+]         │  ← número en lima, grande
│       3 días por semana     │
│                             │
│  [Atrás]       [¡Listo! ██] │
└─────────────────────────────┘
```

**Flujo:** `profiles.update({ goal, activity_level, gym_days_per_week })` → redirect `/dashboard`
**Guard:** Si `profile.goal !== null`, el usuario ya completó onboarding.

#### Pantalla 4 — Dashboard (pantalla principal)

- Header: saludo + día/semana actual
- Silueta corporal SVG centrada (70% del ancho)
  - Músculos entrenados esta semana en verde (intensidad según días)
  - Tap en músculo muestra tooltip con info
- Sección inferior: 7 sellos de asistencia semanal
- FAB (botón flotante) para registrar sesión de hoy

#### Pantalla 3 — Sesión de hoy (TODO list)

- Barra de progreso: X/14 músculos completados
- Lista scrolleable de grupos musculares
- Cada item: checkbox + nombre + sets opcionalmente
- Al marcar → animación check + actualización inmediata de silueta
- Botón "Finalizar entrenamiento" al fondo

#### Pantalla 4 — Historial

- Lista de sesiones pasadas ordenadas por fecha
- Badge con músculos entrenados en cada sesión
- Tap para ver detalle de la sesión

### Tipografía sugerida

- Display/Títulos: **Bebas Neue** o **Space Grotesk**
- Cuerpo: **Inter** o **DM Sans**
- Números grandes: **JetBrains Mono** (para estadísticas)

---

## 11. Roadmap de Features

### Fase 1 — MVP (lo que necesitas ahora)

- [ ] Autenticación con Supabase Auth
- [ ] Perfil con selección de género
- [ ] Dashboard con silueta corporal coloreada
- [ ] TODO list semanal de grupos musculares
- [ ] Sellos de asistencia 7 días
- [ ] Registro y cierre de sesiones

### Fase 2 — Ejercicios y rutinas

- [ ] Importar ejercicios desde wger API
- [ ] Catálogo de ejercicios filtrable por músculo
- [ ] Constructor de rutinas personalizadas
- [ ] Asociar rutinas a sesiones

### Fase 3 — Analytics

- [ ] Heatmap de músculos por mes
- [ ] Rachas de asistencia
- [ ] Gráficas de volumen por músculo
- [ ] Exportar historial

### Fase 4 — Social / Avanzado

- [ ] Modo offline completo (PWA)
- [ ] Notificaciones push (recordatorios)
- [ ] Compartir progreso semanal
- [ ] Timer de descanso entre series

---

## 12. Guía de Inicio Rápido

### 1. Crear proyecto en Supabase

```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar proyecto
supabase init

# Crear proyecto en supabase.com y obtener:
# - Project URL
# - Anon Key
```

### 2. Crear proyecto React + Vite

```bash
npm create vite@latest gymtrack-pro -- --template react-ts
cd gymtrack-pro
npm install @supabase/supabase-js @supabase/auth-helpers-react
npm install react-router-dom zustand date-fns
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Configurar variables de entorno

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 4. Ejecutar el script SQL

Copia el SQL completo de la sección 8 y ejecútalo en el **SQL Editor** de Supabase. El orden es importante — los tipos ENUM van primero.

### 5. Habilitar RLS

Ejecuta los statements de RLS de la sección 7 en el mismo SQL Editor.

### 6. Configurar cliente Supabase

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### 7. Configurar PWA

```bash
npm install -D vite-plugin-pwa
```

```typescript
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
      },
    }),
  ],
})
```

---

## Notas Importantes

**No hay soft delete** — todos los DELETE son permanentes. La auditoría en `audit_log` permite reconstruir datos eliminados si es necesario. Si en el futuro decides agregar soft delete, agrega `deleted_at timestamptz` a la tabla y una policy de RLS adicional.

**Semana actual** — la lógica de "esta semana" usa `week_number` + `year` en la tabla `workout_sessions`. Asegúrate de usar `date-fns` con `getISOWeek()` en el frontend para consistencia con PostgreSQL's `EXTRACT(WEEK FROM date)`.

**Silueta SVG** — necesitarás un SVG de cuerpo humano con IDs en cada grupo muscular que coincidan con `svg_path_id` en la tabla `muscle_groups`. Puedes obtener SVGs gratuitos en [Human Body SVG](https://www.svgrepo.com) o dibujar uno simplificado con Figma/Inkscape.

---

_Documento generado para GymTrack Pro — Versión 1.0_
