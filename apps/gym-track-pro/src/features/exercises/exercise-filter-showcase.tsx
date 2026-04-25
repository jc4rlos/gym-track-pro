import { useState } from 'react'
import {
  ExerciseFilterGrid,
  type GridFilterOption,
} from './exercise-filter-grid'
import {
  ExerciseFilterMenu,
  type FilterMenuOption,
} from './exercise-filter-menu'
import { ExerciseFilterTabs, type TabOption } from './exercise-filter-tabs'

const MENU_OPTIONS: FilterMenuOption[] = [
  { id: 'all', label: 'Todo' },
  { id: 'chest', label: 'Pecho' },
  { id: 'back', label: 'Espalda' },
  { id: 'arms', label: 'Brazos' },
  { id: 'legs', label: 'Piernas' },
  { id: 'shoulders', label: 'Hombros' },
  { id: 'core', label: 'Core' },
]

const TAB_OPTIONS: TabOption[] = [
  { id: 'all', label: 'Todo', badge: 1324 },
  { id: 'chest', label: 'Pecho', badge: 180 },
  { id: 'back', label: 'Espalda', badge: 165 },
  { id: 'arms', label: 'Brazos', badge: 220 },
  { id: 'legs', label: 'Piernas', badge: 195 },
  { id: 'shoulders', label: 'Hombros', badge: 150 },
  { id: 'core', label: 'Core', badge: 220 },
]

const GRID_OPTIONS: GridFilterOption[] = [
  { id: 'all', label: 'Todo', icon: '⭐', count: 1324 },
  { id: 'chest', label: 'Pecho', icon: '🏋️', count: 180 },
  { id: 'back', label: 'Espalda', icon: '🔱', count: 165 },
  { id: 'arms', label: 'Brazos', icon: '💪', count: 220 },
  { id: 'legs', label: 'Piernas', icon: '🦵', count: 195 },
  { id: 'shoulders', label: 'Hombros', icon: '🤸', count: 150 },
  { id: 'core', label: 'Core', icon: '🧘', count: 220 },
]

export const ExerciseFilterShowcase = () => {
  const [selectedPills, setSelectedPills] = useState('all')
  const [selectedTabs, setSelectedTabs] = useState('all')
  const [selectedGrid, setSelectedGrid] = useState<string[]>(['all'])

  return (
    <div className='space-y-8 p-5'>
      <div>
        <h2 className='mb-3 text-[16px] font-bold'>
          Menú tipo PILLS (horizontal deslizable)
        </h2>
        <p className='text-muted mb-2 text-[12px]'>
          Ideal para filtros simples en espacios pequeños
        </p>
        <div className='border-border bg-card rounded-[12px] border p-2'>
          <ExerciseFilterMenu
            options={MENU_OPTIONS}
            selectedId={selectedPills}
            onSelect={setSelectedPills}
            variant='pills'
            showArrows={true}
          />
        </div>
      </div>

      <div>
        <h2 className='mb-3 text-[16px] font-bold'>Menú tipo TABS</h2>
        <p className='text-muted mb-2 text-[12px]'>
          Alternativa minimalista con badges de cantidad
        </p>
        <div className='border-border bg-card overflow-hidden rounded-[12px] border'>
          <ExerciseFilterTabs
            options={TAB_OPTIONS}
            activeTabId={selectedTabs}
            onTabChange={setSelectedTabs}
            size='md'
          />
        </div>
      </div>

      <div>
        <h2 className='mb-3 text-[16px] font-bold'>Menú tipo GRID</h2>
        <p className='text-muted mb-2 text-[12px]'>
          Multi-select con iconos, permite filtrar múltiples categorías
        </p>
        <div className='border-border bg-card rounded-[12px] border p-2'>
          <ExerciseFilterGrid
            options={GRID_OPTIONS}
            selectedIds={selectedGrid}
            onToggle={(id) => {
              if (id === 'all') {
                setSelectedGrid(selectedGrid.includes('all') ? [] : ['all'])
              } else {
                setSelectedGrid(
                  selectedGrid.includes(id)
                    ? selectedGrid.filter((x) => x !== id && x !== 'all')
                    : [...selectedGrid.filter((x) => x !== 'all'), id]
                )
              }
            }}
            columns={3}
          />
        </div>
      </div>

      <div className='bg-primary-light rounded-[12px] border border-[#2a4a1a] p-4'>
        <h3 className='text-primary mb-2 text-[13px] font-bold'>
          Recomendación
        </h3>
        <p className='text-[12px] leading-relaxed text-[#4a7a4a]'>
          Para Pantalla 9 (Catálogo de Ejercicios) uso <strong>Pills</strong>{' '}
          (mejor UX móvil, intuitivo, deslizable). Alternativas: Tabs si quieres
          mostrar cantidad, o Grid si permites multi-selección.
        </p>
      </div>
    </div>
  )
}
