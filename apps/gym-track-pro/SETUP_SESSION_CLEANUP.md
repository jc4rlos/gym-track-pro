# Auto-Finalizar Entrenamientos Antiguos

## SQL Trigger (Supabase)

Ejecuta en **Supabase → SQL Editor**:

```sql
CREATE OR REPLACE FUNCTION auto_finish_old_sessions()
RETURNS void AS $$
BEGIN
  UPDATE workout_sessions
  SET finished_at = NOW()
  WHERE finished_at IS NULL
    AND DATE(session_date) < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_auto_finish_on_new_session()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM auto_finish_old_sessions();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_finish_sessions_on_create ON workout_sessions;
CREATE TRIGGER auto_finish_sessions_on_create
  AFTER INSERT ON workout_sessions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_auto_finish_on_new_session();
```

**Qué hace:**

- Cuando usuario crea sesión nueva → finaliza automáticamente todas las sesiones antiguas sin terminar
- No interrumpe sesión hoy
- Marca `finished_at` = ahora

## Query Manual (Frontend)

Si quieres ejecutar manualmente, usa este hook:

```ts
const { mutate: finishOldSessions } = useMutation({
  mutationFn: async () => {
    await supabase
      .from('workout_sessions')
      .update({ finished_at: new Date().toISOString() })
      .is('finished_at', null)
      .lt('session_date', new Date().toISOString().split('T')[0])
  },
})
```

Llamar en `dashboard.tsx` al cargar (una sola vez).

## Botón Mejor Visible

En `/today.tsx` línea 211 ya existe "Finalizar entrenamiento".
Color primario + sombra = visible. Asegúrate de:

1. Scroll down si no lo ves
2. Es botón GRANDE amarillo-verde en vez de cerrar con X
