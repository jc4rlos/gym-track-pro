import { useState, useMemo } from 'react'
import { useExercisesQuery } from './use-exercises-query'

type Category =
  | 'all'
  | 'chest'
  | 'back'
  | 'arms'
  | 'legs'
  | 'shoulders'
  | 'core'

export const useExercises = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>('all')

  const { data: exercises = [], isLoading } = useExercisesQuery()

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch = exercise.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      const matchesCategory =
        selectedCategory === 'all' ||
        exercise.muscleGroup.toLowerCase().includes(selectedCategory)
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory, exercises])

  return {
    exercises: filteredExercises,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    totalCount: exercises.length,
    isLoading,
  }
}
