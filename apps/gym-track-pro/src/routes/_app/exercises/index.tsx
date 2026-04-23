import { useRef } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ExerciseFilterMenu,
  type FilterMenuOption,
} from '@/features/exercises/exercise-filter-menu'
import { ExercisePagination } from '@/features/exercises/exercise-pagination'
import { ExerciseSearch } from '@/features/exercises/exercise-search'
import { ExerciseVirtualList } from '@/features/exercises/exercise-virtual-list'
import { useExercisesFiltered } from '@/features/exercises/use-exercises-filtered'

const FILTER_OPTIONS: FilterMenuOption[] = [
  { id: 'all', label: 'Todo' },
  { id: 'chest', label: 'Pecho' },
  { id: 'back', label: 'Espalda' },
  { id: 'arms', label: 'Brazos' },
  { id: 'legs', label: 'Piernas' },
  { id: 'shoulders', label: 'Hombros' },
  { id: 'core', label: 'Core' },
]

function ExercisesPage() {
  const navigate = useNavigate()
  const listRef = useRef<HTMLDivElement>(null)
  const {
    exercises,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    isLoading,
    page,
    setPage,
    totalPages,
  } = useExercisesFiltered()

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className='flex min-h-screen flex-col bg-background'>
      <div className='flex items-center gap-3 px-5 pt-3 pb-2'>
        <h1 className='text-[20px] font-bold text-foreground'>Ejercicios</h1>
      </div>

      <ExerciseSearch value={searchQuery} onChange={setSearchQuery} />

      <ExerciseFilterMenu
        options={FILTER_OPTIONS}
        selectedId={selectedCategory}
        onSelect={(id) =>
          setSelectedCategory(id as Parameters<typeof setSelectedCategory>[0])
        }
        variant='pills'
        showArrows={true}
      />

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
    </div>
  )
}

export const Route = createFileRoute('/_app/exercises/')({
  component: ExercisesPage,
})
