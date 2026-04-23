# Exercise Components — Pantalla 9

Menús de filtrado para catálogo de ejercicios con 3 variantes visuales.

## Componentes

### 1. ExerciseFilterMenu (PILLS)

**Mejor para:** Mobile, espacios compactos, filtro simple

```tsx
<ExerciseFilterMenu
  options={filterOptions}
  selectedId='chest'
  onSelect={(id) => setSelected(id)}
  variant='pills'
  showArrows={true}
/>
```

- Deslizable horizontalmente
- Flechas para scroll (opcional)
- Colores: primary cuando activo, border/card cuando inactivo

### 2. ExerciseFilterTabs

**Mejor para:** Espacio generoso, mostrar cantidad de ejercicios

```tsx
<ExerciseFilterTabs
  options={tabOptions}
  activeTabId='chest'
  onTabChange={(id) => setActive(id)}
  size='md'
/>
```

- Borde inferior indicador
- Badges con count de ejercicios
- Underline style

### 3. ExerciseFilterGrid

**Mejor para:** Multi-selección, UI visual con iconos

```tsx
<ExerciseFilterGrid
  options={gridOptions}
  selectedIds={['chest', 'back']}
  onToggle={(id) => toggleSelection(id)}
  columns={3}
/>
```

- Toggle individual de categorías
- Iconos emoji opcionales
- Soporta 2 o 3 columnas
- Cuadrados con border indicador

## Colores configurados

- **Primary:** `#a3e635` (verde lima)
- **Primary Light:** `#111d00` (fondo verde oscuro)
- **Card:** `#1a1a1a` (gris oscuro)
- **Border:** `#2a2a2a` (borde gris)
- **Muted:** `#737373` (texto gris)

Sin hardcode. Usan variables CSS definidas en `src/styles/index.css`.

## Recomendación para Pantalla 9

Usar **ExerciseFilterMenu (Pills)** porque:

- Fit natural en mobile
- Intuitivo (scroll horizontal)
- Limpio visualmente
- Animación suave con flechas
- Align con design system del proyecto

Alternativas para futuros refinamientos:

- Tabs: si quieres mostrar "1,324 ejercicios totales"
- Grid: si cambias requisito a multi-select

## Hook: useExercises

```tsx
const {
  exercises,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  totalCount,
} = useExercises()
```

Maneja:

- Búsqueda por nombre (case-insensitive)
- Filtrado por categoría
- Cuenta total (mock: 1,324)

Replace con query real a Supabase cuando DB esté lista.
