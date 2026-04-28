import { useState, useRef } from 'react'
import {
  ChevronLeft,
  SlidersHorizontal,
  X,
  Plus,
  Check,
  Trash2,
} from 'lucide-react'
import { MAIN_MUSCLE_OPTIONS } from '@/lib/exercise-constants'
import { cn } from '@/lib/utils'
import { ExerciseFilterSheet } from '@/features/exercises/exercise-filter-sheet'
import { ExercisePagination } from '@/features/exercises/exercise-pagination'
import { ExerciseSearch } from '@/features/exercises/exercise-search'
import { useExercisesFiltered } from '@/features/exercises/use-exercises-filtered'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WizardExercise {
  exerciseId: string
  exercise_id: string
  name: string
  muscle: string
  equipment: string
  imageUrl: string | null
  sets: number
  reps: string
  rest_seconds: number
  order_index: number
  id: string
}

// ─── Catalog row (module-level, no inline component) ─────────────────────────

interface CatalogRowProps {
  exerciseId: string
  name: string
  muscle: string
  equipment: string
  imageUrl: string | null
  isAdded: boolean
  onToggle: (exerciseId: string) => void
}

const CatalogExerciseRow = ({
  exerciseId,
  name,
  muscle,
  equipment,
  imageUrl,
  isAdded,
  onToggle,
}: CatalogRowProps) => (
  <div
    className={cn(
      'flex items-center gap-3 rounded-[14px] border p-3 transition-colors',
      isAdded ? 'border-primary bg-primary/5' : 'border-border bg-card'
    )}
  >
    <div className='bg-card flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] text-xl'>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          loading='lazy'
          decoding='async'
          className='h-full w-full object-cover'
        />
      ) : (
        '💪'
      )}
    </div>

    <div className='min-w-0 flex-1'>
      <p className='text-foreground truncate text-[13px] font-bold'>{name}</p>
      <p className='text-muted text-[11px]'>
        {muscle} · {equipment}
      </p>
    </div>

    <button
      onClick={() => onToggle(exerciseId)}
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
        isAdded
          ? 'bg-primary text-primary-foreground'
          : 'border-border bg-background text-muted hover:border-primary hover:text-primary border'
      )}
    >
      {isAdded ? (
        <Check size={14} strokeWidth={2.5} />
      ) : (
        <Plus size={14} strokeWidth={2.5} />
      )}
    </button>
  </div>
)

// ─── Config row (module-level) ────────────────────────────────────────────────

interface ConfigRowProps {
  ex: WizardExercise
  index: number
  onChange: (
    index: number,
    field: 'sets' | 'reps' | 'rest_seconds',
    value: number | string
  ) => void
  onRemove: (index: number) => void
}

const ConfigExerciseRow = ({
  ex,
  index,
  onChange,
  onRemove,
}: ConfigRowProps) => (
  <div className='border-border bg-card rounded-[14px] border p-3.5'>
    <div className='mb-3 flex items-center gap-2'>
      <div className='bg-background flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[8px] text-lg'>
        {ex.imageUrl ? (
          <img
            src={ex.imageUrl}
            alt={ex.name}
            className='h-full w-full object-cover'
          />
        ) : (
          '💪'
        )}
      </div>
      <div className='min-w-0 flex-1'>
        <p className='text-foreground truncate text-[13px] font-bold'>
          {ex.name}
        </p>
        <p className='text-muted text-[11px]'>{ex.muscle}</p>
      </div>
      <button
        onClick={() => onRemove(index)}
        className='text-muted hover:text-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full'
      >
        <Trash2 size={14} />
      </button>
    </div>

    <div className='grid grid-cols-3 gap-2'>
      <div>
        <label className='text-muted mb-1 block text-[10px] font-semibold'>
          Series
        </label>
        <input
          type='number'
          min={1}
          value={ex.sets}
          onChange={(e) =>
            onChange(index, 'sets', parseInt(e.target.value) || 1)
          }
          className='border-border bg-background text-foreground w-full rounded-[8px] border px-2 py-1.5 text-center text-[13px] font-bold'
        />
      </div>
      <div>
        <label className='text-muted mb-1 block text-[10px] font-semibold'>
          Reps
        </label>
        <input
          value={ex.reps}
          onChange={(e) => onChange(index, 'reps', e.target.value)}
          className='border-border bg-background text-foreground w-full rounded-[8px] border px-2 py-1.5 text-center text-[13px]'
          placeholder='10-12'
        />
      </div>
      <div>
        <label className='text-muted mb-1 block text-[10px] font-semibold'>
          Descanso (s)
        </label>
        <input
          type='number'
          min={0}
          value={ex.rest_seconds}
          onChange={(e) =>
            onChange(index, 'rest_seconds', parseInt(e.target.value) || 0)
          }
          className='border-border bg-background text-foreground w-full rounded-[8px] border px-2 py-1.5 text-center text-[13px]'
        />
      </div>
    </div>
  </div>
)

// ─── Main wizard ──────────────────────────────────────────────────────────────

interface RoutineWizardProps {
  onBack: () => void
  onSave: (name: string, exercises: WizardExercise[]) => void
  isSaving?: boolean
}

export function RoutineWizard({
  onBack,
  onSave,
  isSaving,
}: RoutineWizardProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<WizardExercise[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  const {
    exercises,
    searchQuery,
    setSearchQuery,
    selectedMuscles,
    setSelectedMuscles,
    isLoading,
    page,
    setPage,
    totalPages,
  } = useExercisesFiltered()

  const selectedIds = new Set(selected.map((e) => e.exerciseId))
  const activeFilterCount = selectedMuscles.length

  const toggleExercise = (exerciseId: string) => {
    if (selectedIds.has(exerciseId)) {
      setSelected((prev) => prev.filter((e) => e.exerciseId !== exerciseId))
    } else {
      const ex = exercises.find((e) => e.id === exerciseId)
      if (!ex) return
      setSelected((prev) => [
        ...prev,
        {
          exerciseId: ex.id,
          exercise_id: ex.id,
          id: Math.random().toString(),
          name: ex.name,
          muscle: ex.muscleGroup,
          equipment: ex.equipment,
          imageUrl: ex.imageUrl ?? null,
          sets: 3,
          reps: '10-12',
          rest_seconds: 60,
          order_index: prev.length,
        },
      ])
    }
  }

  const updateExercise = (
    index: number,
    field: 'sets' | 'reps' | 'rest_seconds',
    value: number | string
  ) => {
    setSelected((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    )
  }

  const removeExercise = (index: number) => {
    setSelected((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Step 0: Name ─────────────────────────────────────────────────────────

  if (step === 0) {
    return (
      <div className='bg-background flex min-h-screen flex-col px-5'>
        <div className='border-border flex items-center gap-3 border-b py-3'>
          <button onClick={onBack} className='hover:bg-card rounded-lg p-2'>
            <ChevronLeft size={20} />
          </button>
          <h1 className='text-foreground text-[17px] font-bold'>
            Nueva rutina
          </h1>
        </div>

        <div className='flex flex-1 flex-col justify-center gap-6 pb-40'>
          <div className='text-center'>
            <p className='text-foreground text-[22px] font-bold'>
              ¿Cómo se llama tu rutina?
            </p>
            <p className='text-muted mt-1 text-[13px]'>
              Dale un nombre que te identifique el día o el objetivo
            </p>
          </div>

          <input
            type='text'
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(1)}
            placeholder='ej: Push Day, Piernas, Full Body...'
            className='border-border bg-card text-foreground placeholder:text-muted focus:border-primary rounded-[14px] border px-4 py-4 text-[16px] font-medium focus:outline-none'
          />
        </div>

        <div className='border-border bg-background fixed right-0 bottom-16 left-0 z-40 border-t px-5 py-4'>
          <button
            onClick={() => setStep(1)}
            disabled={!name.trim()}
            className='bg-primary text-primary-foreground w-full rounded-[14px] py-3.5 text-[15px] font-bold disabled:opacity-40'
          >
            Continuar →
          </button>
        </div>
      </div>
    )
  }

  // ── Step 1: Catalog ───────────────────────────────────────────────────────

  if (step === 1) {
    return (
      <div className='bg-background flex min-h-screen flex-col'>
        {/* Header */}
        <div className='border-border flex items-center gap-3 border-b px-5 py-3'>
          <button
            onClick={() => setStep(0)}
            className='hover:bg-card rounded-lg p-2'
          >
            <ChevronLeft size={20} />
          </button>
          <div className='flex-1'>
            <h1 className='text-foreground text-[15px] font-bold'>
              Agregar ejercicios
            </h1>
            <p className='text-muted text-[11px]'>{name}</p>
          </div>
          {selected.length > 0 && (
            <div className='bg-primary flex items-center gap-1.5 rounded-full px-3 py-1'>
              <span className='text-primary-foreground text-[12px] font-bold'>
                {selected.length} añadidos
              </span>
            </div>
          )}
        </div>

        {/* Search */}
        <ExerciseSearch value={searchQuery} onChange={setSearchQuery} />

        {/* Filter row */}
        <div className='scrollbar-hide flex items-center gap-2 overflow-x-auto px-5 py-2'>
          <button
            onClick={() => setSheetOpen(true)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-all',
              activeFilterCount > 0
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted'
            )}
          >
            <SlidersHorizontal size={13} strokeWidth={2.5} />
            Filtros
            {activeFilterCount > 0 && (
              <span className='bg-primary-foreground text-primary flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold'>
                {activeFilterCount}
              </span>
            )}
          </button>

          {selectedMuscles.map((id) => {
            const opt = MAIN_MUSCLE_OPTIONS.find((m) => m.id === id)
            if (!opt) return null
            return (
              <button
                key={id}
                onClick={() =>
                  setSelectedMuscles(selectedMuscles.filter((m) => m !== id))
                }
                className='border-primary bg-primary/10 text-primary flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium'
              >
                {opt.label}
                <X size={10} strokeWidth={2.5} />
              </button>
            )
          })}
        </div>

        {/* Exercise list */}
        <div
          ref={listRef}
          className='scrollbar-hide flex-1 overflow-y-auto px-5 pb-44'
        >
          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent' />
            </div>
          ) : exercises.length === 0 ? (
            <div className='py-12 text-center'>
              <p className='text-muted text-[14px]'>Sin resultados</p>
              <p className='text-muted mt-1 text-[12px]'>
                Probá con otros filtros
              </p>
            </div>
          ) : (
            <div className='flex flex-col gap-2 py-2'>
              {exercises.map((ex) => (
                <CatalogExerciseRow
                  key={ex.id}
                  exerciseId={ex.id}
                  name={ex.name}
                  muscle={ex.muscleGroup}
                  equipment={ex.equipment}
                  imageUrl={ex.imageUrl ?? null}
                  isAdded={selectedIds.has(ex.id)}
                  onToggle={toggleExercise}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <ExercisePagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>

        {/* Sticky bottom CTA */}
        <div className='border-border bg-background fixed right-0 bottom-16 left-0 z-40 border-t px-5 py-4'>
          <button
            onClick={() => setStep(2)}
            disabled={selected.length === 0}
            className='bg-primary text-primary-foreground w-full rounded-[14px] py-3.5 text-[15px] font-bold disabled:opacity-40'
          >
            {selected.length === 0
              ? 'Seleccioná ejercicios'
              : `Continuar con ${selected.length} ejercicio${selected.length !== 1 ? 's' : ''} →`}
          </button>
        </div>

        <ExerciseFilterSheet
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          selectedMuscles={selectedMuscles}
          onMusclesChange={setSelectedMuscles}
        />
      </div>
    )
  }

  // ── Step 2: Configure & Save ──────────────────────────────────────────────

  return (
    <div className='bg-background flex min-h-screen flex-col'>
      <div className='border-border flex items-center gap-3 border-b px-5 py-3'>
        <button
          onClick={() => setStep(1)}
          className='hover:bg-card rounded-lg p-2'
        >
          <ChevronLeft size={20} />
        </button>
        <div className='flex-1'>
          <h1 className='text-foreground text-[15px] font-bold'>
            Configurar ejercicios
          </h1>
          <p className='text-muted text-[11px]'>
            {name} · {selected.length} ejercicios
          </p>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto px-5 py-4 pb-44'>
        {selected.length === 0 ? (
          <div className='flex flex-col items-center gap-3 py-16 text-center'>
            <p className='text-muted text-[14px]'>Sin ejercicios</p>
            <button
              onClick={() => setStep(1)}
              className='text-primary text-[13px] font-semibold'
            >
              ← Volver al catálogo
            </button>
          </div>
        ) : (
          <div className='flex flex-col gap-3'>
            {selected.map((ex, idx) => (
              <ConfigExerciseRow
                key={ex.id}
                ex={ex}
                index={idx}
                onChange={updateExercise}
                onRemove={removeExercise}
              />
            ))}

            <button
              onClick={() => setStep(1)}
              className='border-border text-primary flex w-full items-center justify-center gap-2 rounded-[14px] border border-dashed py-3 text-[13px] font-medium'
            >
              <Plus size={14} strokeWidth={2.5} />
              Agregar más ejercicios
            </button>
          </div>
        )}
      </div>

      <div className='border-border bg-background fixed right-0 bottom-16 left-0 z-40 border-t px-5 py-4'>
        <button
          onClick={() => onSave(name, selected)}
          disabled={isSaving || selected.length === 0 || !name.trim()}
          className='bg-primary text-primary-foreground w-full rounded-[14px] py-3.5 text-[15px] font-bold disabled:opacity-40'
        >
          {isSaving ? 'Guardando...' : 'Guardar rutina'}
        </button>
      </div>
    </div>
  )
}
