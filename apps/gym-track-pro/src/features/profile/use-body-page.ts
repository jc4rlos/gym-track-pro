import { useState } from 'react'
import {
  calcBmi,
  getBmiCategory,
  BMI_COLORS,
  getBmiScalePercent,
  calcIdealWeight,
  calcTMB,
  calcTDEE,
  getAgeFromBirthDate,
  getGoalCalories,
} from './bmi-utils'
import { useProfile, useBodyMeasurements, useSaveMeasurement } from './use-body'

export function useBodyPage() {
  const { data: profile } = useProfile()
  const { data: measurements = [] } = useBodyMeasurements()
  const saveMeasurement = useSaveMeasurement()

  const [weightInput, setWeightInput] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)

  const latestWeight = measurements[0]?.weight_kg ?? profile?.weight_kg ?? null
  const heightCm = profile?.height_cm ?? null
  const gender = profile?.gender ?? 'male'
  const isFemale = gender === 'female'

  const bmi = latestWeight && heightCm ? calcBmi(latestWeight, heightCm) : null
  const category = bmi ? getBmiCategory(bmi) : 'normal'
  const color = BMI_COLORS[category]
  const scalePercent = bmi ? getBmiScalePercent(bmi) : null

  const age = getAgeFromBirthDate(profile?.birth_date ?? null)
  const tmb =
    latestWeight && heightCm
      ? calcTMB(latestWeight, heightCm, age, isFemale)
      : null
  const tdee = tmb ? calcTDEE(tmb, profile?.activity_level ?? null) : null
  const idealWeight = heightCm ? calcIdealWeight(heightCm, isFemale) : null
  const goalCal = tdee ? getGoalCalories(tdee, profile?.goal ?? null) : null

  const lastMeasuredDate = measurements[0]?.measured_at
    ? new Date(measurements[0].measured_at).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Sin datos aún'

  const handleSave = async () => {
    const w = parseFloat(weightInput.replace(',', '.'))
    if (isNaN(w) || w < 20 || w > 300) {
      setSaveError('Peso inválido (20–300 kg)')
      return
    }
    if (!heightCm) {
      setSaveError('Actualizá tu altura en el perfil primero')
      return
    }
    setSaveError(null)
    const newBmi = calcBmi(w, heightCm)
    await saveMeasurement.mutateAsync({ weightKg: w, heightCm, bmi: newBmi })
    setWeightInput('')
  }

  return {
    bmi,
    category,
    color,
    scalePercent,
    latestWeight,
    heightCm,
    gender,
    tmb,
    tdee,
    idealWeight,
    goalCal,
    measurements,
    lastMeasuredDate,
    weightInput,
    setWeightInput,
    saveError,
    handleSave,
    isSaving: saveMeasurement.isPending,
  }
}
