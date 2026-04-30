# Muscle Colors Configurable — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir al usuario elegir los colores de músculos entrenados hoy vs. esta semana en el dashboard, guardando la preferencia en Supabase `profiles`.

**Architecture:** Dos nuevas columnas TEXT en `profiles` (`muscle_primary_color`, `muscle_secondary_color`) con defaults. Un nuevo hook `useUpdateMuscleColors` en `use-body.ts` con cast de tipos (columnas no en `database.types.ts` hasta regenerar). Color picker integrado en el sheet de perfil existente. `BodyCardAlt` acepta props de color con fallback.

**Tech Stack:** React 19 + TypeScript strict + Supabase + React Query (TanStack Query v5) + Tailwind CSS v4. Sin nuevas dependencias.

---

## File Map

| Archivo | Acción | Responsabilidad |
|---------|--------|-----------------|
| `supabase/migrations/20260430000000_add_muscle_colors.sql` | CREATE | SQL para añadir columnas a `profiles` |
| `src/features/profile/use-body.ts` | MODIFY | Añadir `useUpdateMuscleColors` hook |
| `src/features/profile/profile-edit-sheet.tsx` | MODIFY | Añadir tipo + state + UI color picker |
| `src/features/dashboard/body-card-alt.tsx` | MODIFY | Aceptar `primaryColor`/`secondaryColor` props |
| `src/routes/_app/dashboard.tsx` | MODIFY | Leer colores de profile y pasarlos a `BodyCardAlt` |
| `src/routes/_app/profile.tsx` | MODIFY | Pasar colores al `ProfileEditSheet` |

---

### Task 1: SQL migration

**Files:**
- Create: `supabase/migrations/20260430000000_add_muscle_colors.sql`

- [ ] **Step 1: Crear archivo de migración**

```sql
-- supabase/migrations/20260430000000_add_muscle_colors.sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS muscle_primary_color TEXT DEFAULT '#0984e3',
  ADD COLUMN IF NOT EXISTS muscle_secondary_color TEXT DEFAULT '#a3e635';
```

- [ ] **Step 2: Compartir el SQL con el usuario**

Decirle al usuario: "Ejecuta este SQL en tu Supabase Dashboard → SQL Editor (o via `supabase db push` si tienes la CLI configurada). Cuando lo ejecutes, avísame para continuar."

> ⚠️ NO ejecutar el SQL — el usuario lo ejecuta manualmente.
> Después de ejecutar: hacer `supabase gen types typescript --local > src/lib/database.types.ts` para regenerar tipos. Hasta entonces, usamos casts de tipos en el código.

---

### Task 2: Hook `useUpdateMuscleColors` en `use-body.ts`

**Files:**
- Modify: `src/features/profile/use-body.ts`

- [ ] **Step 1: Añadir el hook al final de `use-body.ts`**

Añadir después de `useSaveMeasurement` (línea 127):

```ts
export function useUpdateMuscleColors() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (colors: {
      muscle_primary_color: string
      muscle_secondary_color: string
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase
        .from('profiles')
        .update(colors as never)
        .eq('id', user!.id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })
}
```

- [ ] **Step 2: Verificar que el archivo compila**

```bash
pnpm tsc --noEmit 2>&1 | grep "use-body"
```

Expected: sin output (sin errores en ese archivo).

- [ ] **Step 3: Commit**

```bash
git add src/features/profile/use-body.ts supabase/migrations/20260430000000_add_muscle_colors.sql
git commit -m "feat: add useUpdateMuscleColors hook and migration for muscle color columns"
```

---

### Task 3: Color picker UI en `ProfileEditSheet`

**Files:**
- Modify: `src/features/profile/profile-edit-sheet.tsx`

- [ ] **Step 1: Ampliar el tipo `Profile` local para incluir los colores**

Reemplazar el bloque `type Profile` (líneas 5–11) con:

```ts
type Profile = {
  full_name: string
  gender: 'male' | 'female' | 'other'
  height_cm: number | null
  goal: 'lose_weight' | 'gain_muscle' | 'maintain'
  daily_steps_goal: number
  muscle_primary_color?: string | null
  muscle_secondary_color?: string | null
}
```

- [ ] **Step 2: Añadir import de `useUpdateMuscleColors`**

Reemplazar:
```ts
import { useUpdateProfile } from './use-body'
```
Con:
```ts
import { useUpdateProfile, useUpdateMuscleColors } from './use-body'
```

- [ ] **Step 3: Añadir state y hook para colores en `ProfileEditSheet`**

Dentro de `ProfileEditSheet`, después de `const update = useUpdateProfile()` añadir:

```ts
const [primaryColor, setPrimaryColor] = useState(
  profile.muscle_primary_color ?? '#0984e3'
)
const [secondaryColor, setSecondaryColor] = useState(
  profile.muscle_secondary_color ?? '#a3e635'
)
const updateColors = useUpdateMuscleColors()
```

- [ ] **Step 4: Incluir guardado de colores en `handleSave`**

Reemplazar `handleSave`:

```ts
const handleSave = () => {
  update.mutate(
    {
      full_name: name.trim() || profile.full_name,
      gender,
      height_cm: height ? parseFloat(height) : null,
      goal,
      daily_steps_goal: parseInt(stepsGoal) || 10000,
    },
    {
      onSuccess: () => {
        updateColors.mutate(
          { muscle_primary_color: primaryColor, muscle_secondary_color: secondaryColor },
          { onSuccess: onClose }
        )
      },
    }
  )
}
```

- [ ] **Step 5: Añadir sección de color picker en el JSX**

Añadir después del bloque de "Meta de pasos diarios" (antes del `</div>` de cierre del `flex flex-col gap-4`):

```tsx
<div>
  <label className='text-muted mb-1.5 block text-[11px] font-semibold uppercase tracking-wide'>
    Colores de músculos
  </label>
  <div className='flex gap-3'>
    <div className='flex flex-1 flex-col gap-1.5'>
      <span className='text-muted text-[10px]'>Hoy</span>
      <div className='border-border flex items-center gap-2 rounded-xl border px-3 py-2'>
        <input
          type='color'
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
          className='h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0'
        />
        <span className='text-foreground font-mono text-[12px]'>{primaryColor}</span>
      </div>
    </div>
    <div className='flex flex-1 flex-col gap-1.5'>
      <span className='text-muted text-[10px]'>Esta semana</span>
      <div className='border-border flex items-center gap-2 rounded-xl border px-3 py-2'>
        <input
          type='color'
          value={secondaryColor}
          onChange={(e) => setSecondaryColor(e.target.value)}
          className='h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0'
        />
        <span className='text-foreground font-mono text-[12px]'>{secondaryColor}</span>
      </div>
    </div>
  </div>
  {/* Preview */}
  <div className='border-border mt-2 flex items-center gap-2 rounded-xl border px-3 py-2'>
    <div className='h-3 w-3 rounded-full' style={{ background: primaryColor }} />
    <div className='h-3 w-3 rounded-full' style={{ background: secondaryColor }} />
    <span className='text-muted text-[10px]'>Preview combinación</span>
  </div>
</div>
```

- [ ] **Step 6: Verificar que el isPending del botón incluya ambas mutaciones**

Reemplazar la condición `disabled` del botón guardar:

```tsx
disabled={update.isPending || updateColors.isPending}
```

Y el texto:

```tsx
{update.isPending || updateColors.isPending ? 'Guardando...' : 'Guardar cambios'}
```

- [ ] **Step 7: Verificar compilación del archivo**

```bash
pnpm tsc --noEmit 2>&1 | grep "profile-edit-sheet"
```

Expected: sin output.

---

### Task 4: Props de color en `BodyCardAlt`

**Files:**
- Modify: `src/features/dashboard/body-card-alt.tsx`

- [ ] **Step 1: Añadir props de color al tipo `Props`**

Reemplazar:

```ts
type Props = {
  weekMuscleSlugs: Set<string>
  todayMuscleSlugs: Set<string>
  gender?: 'male' | 'female' | 'other' | null
}
```

Con:

```ts
const DEFAULT_PRIMARY = '#0984e3'
const DEFAULT_SECONDARY = '#a3e635'

type Props = {
  weekMuscleSlugs: Set<string>
  todayMuscleSlugs: Set<string>
  gender?: 'male' | 'female' | 'other' | null
  primaryColor?: string | null
  secondaryColor?: string | null
}
```

- [ ] **Step 2: Desestructurar y usar en el componente**

Reemplazar la firma:

```ts
export function BodyCardAlt({ weekMuscleSlugs, todayMuscleSlugs, gender }: Props) {
```

Con:

```ts
export function BodyCardAlt({
  weekMuscleSlugs,
  todayMuscleSlugs,
  gender,
  primaryColor,
  secondaryColor,
}: Props) {
  const colorToday = primaryColor ?? DEFAULT_PRIMARY
  const colorWeek = secondaryColor ?? DEFAULT_SECONDARY
```

- [ ] **Step 3: Usar las variables en el JSX**

Reemplazar en el `<Body>`:

```tsx
colors={['#0984e3', '#a3e635']}
```

Con:

```tsx
colors={[colorToday, colorWeek]}
```

Reemplazar en la leyenda (dos `style={{ background: '...' }}`):

```tsx
{/* Hoy */}
<div className='h-2.5 w-2.5 shrink-0 rounded-xs' style={{ background: colorToday }} />
{/* Esta semana */}
<div className='h-2.5 w-2.5 shrink-0 rounded-xs' style={{ background: colorWeek }} />
```

- [ ] **Step 4: Verificar compilación**

```bash
pnpm tsc --noEmit 2>&1 | grep "body-card-alt"
```

Expected: sin output.

---

### Task 5: Conectar colores en `dashboard.tsx` y `profile.tsx`

**Files:**
- Modify: `src/routes/_app/dashboard.tsx`
- Modify: `src/routes/_app/profile.tsx`

#### dashboard.tsx

- [ ] **Step 1: Leer colores del profile en `DashboardPage`**

En `DashboardPage`, ya se tiene `profile` de `useDashboardData()`. Añadir helper de tipo justo antes del `return`:

```ts
const profileRecord = profile as Record<string, unknown> | undefined
const muscleColors = {
  primary: typeof profileRecord?.muscle_primary_color === 'string'
    ? profileRecord.muscle_primary_color
    : undefined,
  secondary: typeof profileRecord?.muscle_secondary_color === 'string'
    ? profileRecord.muscle_secondary_color
    : undefined,
}
```

- [ ] **Step 2: Pasar props a `BodyCardAlt`**

Reemplazar:

```tsx
<BodyCardAlt weekMuscleSlugs={weekMuscleSlugs} todayMuscleSlugs={todayMuscleSlugs} gender={profile?.gender} />
```

Con:

```tsx
<BodyCardAlt
  weekMuscleSlugs={weekMuscleSlugs}
  todayMuscleSlugs={todayMuscleSlugs}
  gender={profile?.gender}
  primaryColor={muscleColors.primary}
  secondaryColor={muscleColors.secondary}
/>
```

#### profile.tsx

- [ ] **Step 3: Pasar colores al `ProfileEditSheet`**

En `profile.tsx`, buscar el bloque donde se llama `<ProfileEditSheet` (línea ~475). Añadir las props de color:

```tsx
<ProfileEditSheet
  profile={{
    full_name: profile.full_name ?? '',
    gender: (profile.gender as 'male' | 'female' | 'other') ?? 'other',
    height_cm: profile.height_cm ?? null,
    goal: (profile.goal as 'lose_weight' | 'gain_muscle' | 'maintain') ?? 'maintain',
    daily_steps_goal: profile.daily_steps_goal ?? 10000,
    muscle_primary_color: (profile as Record<string, unknown>).muscle_primary_color as string | undefined,
    muscle_secondary_color: (profile as Record<string, unknown>).muscle_secondary_color as string | undefined,
  }}
  onClose={() => setShowEdit(false)}
/>
```

---

### Task 6: Build final y verificación

- [ ] **Step 1: Ejecutar build completo**

```bash
pnpm run build 2>&1
```

Expected: `✓ built in X.XXs` sin errores de TypeScript.

- [ ] **Step 2: Smoke test manual**

1. Abrir la app (`pnpm dev`)
2. Ir a Perfil → "Editar perfil"
3. Cambiar "Colores de músculos" → elegir dos colores distintos
4. Guardar
5. Ir a Dashboard → verificar que `BodyCardAlt` muestra los nuevos colores
6. Recargar página → confirmar que los colores persisten (vienen de Supabase)

- [ ] **Step 3: Commit final**

```bash
git add \
  src/features/profile/use-body.ts \
  src/features/profile/profile-edit-sheet.tsx \
  src/features/dashboard/body-card-alt.tsx \
  src/routes/_app/dashboard.tsx \
  src/routes/_app/profile.tsx
git commit -m "feat: configurable muscle highlight colors stored in profiles"
```

---

## Notas importantes

### Tipos de TypeScript hasta regenerar `database.types.ts`
Las columnas `muscle_primary_color` y `muscle_secondary_color` no estarán en `Tables<'profiles'>` hasta ejecutar `supabase gen types`. Por eso:
- En `useUpdateMuscleColors`: `as never` en el `.update()` call
- En consumidores: cast via `profile as Record<string, unknown>` + comprobación `typeof === 'string'`

Después de que el usuario ejecute la migración y regenere tipos:
1. `supabase gen types typescript --local > src/lib/database.types.ts`
2. Eliminar los casts — TypeScript ya conocerá los campos
3. Añadir los campos directamente en el tipo `Profile` de `profile-edit-sheet.tsx`

### Query key invalidation
`useUpdateMuscleColors` invalida `['profile']` al igual que `useUpdateProfile`. El dashboard ya usa `useDashboardData()` → `useProfile()` con la misma key, así que el re-render es automático.
