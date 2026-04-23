import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

type Category =
  | 'all'
  | 'chest'
  | 'back'
  | 'arms'
  | 'legs'
  | 'shoulders'
  | 'core'

const CATEGORY_MAP: Record<Category, string[]> = {
  all: [],
  chest: ['chest', 'pectoral'],
  back: ['back', 'lats', 'trapezius'],
  arms: ['biceps', 'triceps', 'forearm'],
  legs: ['quadriceps', 'hamstring', 'glute'],
  shoulders: ['shoulder', 'deltoid'],
  core: ['abs', 'oblique'],
}

const PAGE_SIZE = 20

export const useExercisesFiltered = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>('all')
  const [page, setPage] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data, isLoading } = useQuery({
    queryKey: ['exercises', debouncedSearch, selectedCategory, page],
    queryFn: async () => {
      let query = supabase
        .from('exercises')
        .select(
          'id, name, name_es, body_part, target_muscle, secondary_muscles, equipment, gif_url, instructions, difficulty',
          { count: 'exact' }
        )

      if (debouncedSearch) {
        query = query.or(
          `name.ilike.%${debouncedSearch}%,name_es.ilike.%${debouncedSearch}%`
        )
      }

      if (selectedCategory !== 'all') {
        const targets = CATEGORY_MAP[selectedCategory]
        if (targets.length > 0) {
          query = query.or(
            targets.map((t) => `target_muscle.ilike.%${t}%`).join(',')
          )
        }
      }

      const from = page * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data, error, count } = await query.range(from, to)

      if (error) throw error
      return { items: data || [], totalCount: count || 0 }
    },
  })

  const exercises = (data?.items || []).map((ex) => ({
    id: ex.id,
    name: ex.name_es || ex.name,
    muscleGroup: ex.target_muscle || ex.body_part || 'General',
    equipment: ex.equipment || 'Peso corporal',
    difficulty:
      (ex.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
    primaryMuscles: [ex.target_muscle || 'General'],
    secondaryMuscles: (ex.secondary_muscles || []) as string[],
    emoji: '💪',
  }))

  const totalCount = data?.totalCount || 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const handleSetSearchQuery = (q: string) => {
    setPage(0)
    setSearchQuery(q)
  }

  const handleSetSelectedCategory = (cat: Category) => {
    setPage(0)
    setSelectedCategory(cat)
  }

  return {
    exercises,
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    selectedCategory,
    setSelectedCategory: handleSetSelectedCategory,
    isLoading,
    page,
    setPage,
    totalPages,
    totalCount,
  }
}
