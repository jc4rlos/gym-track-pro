# Importar Ejercicios desde ExerciseDB

Los componentes de Pantalla 9 y 10 traen ejercicios **únicamente desde Supabase**. Para que funcionen, necesitas importar datos a la tabla `exercises`.

## Opción 1: Script de Importación (Automático)

```bash
# 1. Descargar ejercicios desde ExerciseDB
curl "https://oss.exercisedb.dev/exercises?limit=1500" -o exercises-raw.json

# 2. Importar a Supabase
npx tsx scripts/import-exercises.ts
```

Requiere:

- `SUPABASE_URL` env var
- `SUPABASE_SERVICE_ROLE_KEY` env var

## Opción 2: Insertar Manualmente (Rápido para test)

En **Supabase Dashboard → SQL Editor**, ejecuta:

```sql
INSERT INTO exercises (name, name_es, body_part, target_muscle, secondary_muscles, equipment, gif_url, instructions, difficulty)
VALUES
  (
    'Barbell Bench Press',
    'Press banca plano',
    'chest',
    'pectorals',
    ARRAY['triceps', 'shoulders'],
    'barbell',
    'https://via.placeholder.com/300',
    ARRAY['Recostado en banco', 'Baja la barra al pecho', 'Sube extendiendo codos'],
    'intermediate'
  ),
  (
    'Dumbbell Curl',
    'Curl martillo',
    'upper arms',
    'biceps',
    ARRAY[]::text[],
    'dumbbell',
    'https://via.placeholder.com/300',
    ARRAY['De pie con mancuernas', 'Flexiona los codos', 'Baja controladamente'],
    'beginner'
  );
```

## Verificación

1. Ve a `/exercises` en la app
2. Si ves ejercicios → OK ✅
3. Click en uno → abre Pantalla 10 con detalle desde BD ✅

## Nota

- **Sin mocks/hardcodeados**: Si la tabla está vacía, mostrará "No hay ejercicios disponibles"
- **Datos reales**: Todo es desde `exercises` table en Supabase
- **Sin fallbacks**: No hay ejercicios ficticios de relleno
