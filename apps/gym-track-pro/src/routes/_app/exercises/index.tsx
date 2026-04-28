import { useRef, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { SlidersHorizontal, X } from 'lucide-react'
import { MAIN_MUSCLE_OPTIONS } from '@/lib/exercise-constants'
import { cn } from '@/lib/utils'
import { ExerciseFilterSheet } from '@/features/exercises/exercise-filter-sheet'
import { ExercisePagination } from '@/features/exercises/exercise-pagination'
import { ExerciseSearch } from '@/features/exercises/exercise-search'
import { ExerciseVirtualList } from '@/features/exercises/exercise-virtual-list'
import { useExercisesFiltered } from '@/features/exercises/use-exercises-filtered'

function ExercisesPage() {
  const navigate = useNavigate()
  const listRef = useRef<HTMLDivElement>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

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

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const removeMuscle = (id: string) =>
    setSelectedMuscles(selectedMuscles.filter((m) => m !== id))

  const activeFilterCount = selectedMuscles.length

  return (
    <div className='bg-background flex min-h-screen flex-col'>
      {/* Header */}
      <div className='flex items-center gap-3 px-5 pt-3 pb-2'>
        <h1 className='text-foreground text-[20px] font-bold'>Ejercicios</h1>
      </div>

      {/* Search */}
      <ExerciseSearch value={searchQuery} onChange={setSearchQuery} />

      {/* Filter button row */}
      <div className='flex items-center gap-2 px-5 py-2'>
        <button
          onClick={() => setSheetOpen(true)}
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-all',
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

        {/* Active filter chips — solo nombre */}
        {selectedMuscles.map((id) => {
          const opt = MAIN_MUSCLE_OPTIONS.find((m) => m.id === id)
          if (!opt) return null
          return (
            <button
              key={id}
              onClick={() => removeMuscle(id)}
              className='border-primary bg-primary/10 text-primary flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium'
            >
              {opt.label}
              <X size={10} strokeWidth={2.5} />
            </button>
          )
        })}
      </div>

      {/* List */}
      <div ref={listRef} className='scrollbar-hide flex-1 overflow-y-auto'>
        <ExerciseVirtualList
          exercises={exercises}
          isLoading={isLoading}
          onSelectExercise={(exercise) => {
            navigate({
              to: '/exercises/$exerciseId',
              params: { exerciseId: exercise.id },
            })
          }}
        />
      </div>

      {totalPages > 1 && (
        <ExercisePagination
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <ExerciseFilterSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        selectedMuscles={selectedMuscles}
        onMusclesChange={setSelectedMuscles}
      />
    </div>
  )
}

export const Route = createFileRoute('/_app/exercises/')({
  component: ExercisesPage,
})
