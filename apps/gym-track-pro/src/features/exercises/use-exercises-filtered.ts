import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MUSCLE_OPTIONS } from '@/lib/exercise-constants'
import { supabase } from '@/lib/supabase'

const PAGE_SIZE = 20

export const useExercisesFiltered = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [page, setPage] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const { data, isLoading } = useQuery({
    queryKey: [
      'exercises',
      debouncedSearch,
      selectedMuscles,
      selectedEquipment,
      page,
    ],
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

      if (selectedMuscles.length > 0) {
        const muscleValues = selectedMuscles.flatMap(
          (id) => MUSCLE_OPTIONS.find((m) => m.id === id)?.values ?? []
        )
        if (muscleValues.length > 0) {
          query = query.or(
            muscleValues.map((v) => `target_muscle.ilike.%${v}%`).join(',')
          )
        }
      }

      if (selectedEquipment.length > 0) {
        query = query.or(
          selectedEquipment.map((v) => `equipment.ilike.%${v}%`).join(',')
        )
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
    imageUrl: ex.gif_url,
  }))

  const totalCount = data?.totalCount || 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const handleSetSearchQuery = (q: string) => {
    setPage(0)
    setSearchQuery(q)
  }

  const handleSetSelectedMuscles = (ids: string[]) => {
    setPage(0)
    setSelectedMuscles(ids)
  }

  const handleSetSelectedEquipment = (values: string[]) => {
    setPage(0)
    setSelectedEquipment(values)
  }

  return {
    exercises,
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    selectedMuscles,
    setSelectedMuscles: handleSetSelectedMuscles,
    selectedEquipment,
    setSelectedEquipment: handleSetSelectedEquipment,
    isLoading,
    page,
    setPage,
    totalPages,
    totalCount,
  }
}
