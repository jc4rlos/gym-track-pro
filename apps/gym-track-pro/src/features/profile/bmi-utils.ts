export type BmiCategory =
  | 'underweight'
  | 'normal'
  | 'overweight'
  | 'obese'
  | 'extremely_obese'

export function calcBmi(weightKg: number, heightCm: number): number {
  return weightKg / Math.pow(heightCm / 100, 2)
}

export function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return 'underweight'
  if (bmi < 25) return 'normal'
  if (bmi < 30) return 'overweight'
  if (bmi < 35) return 'obese'
  return 'extremely_obese'
}

export const BMI_LABELS: Record<BmiCategory, string> = {
  underweight: 'Bajo peso',
  normal: 'Peso normal ✓',
  overweight: 'Sobrepeso',
  obese: 'Obesidad',
  extremely_obese: 'Obesidad severa',
}

export const BMI_COLORS: Record<BmiCategory, string> = {
  underweight: '#22d3ee',
  normal: '#a3e635',
  overweight: '#facc15',
  obese: '#f97316',
  extremely_obese: '#ef4444',
}

export const BMI_SCALE_COLOR =
  'linear-gradient(90deg, #22d3ee 0%, #a3e635 22%, #facc15 50%, #f97316 72%, #ef4444 100%)'

/** Devine formula ideal weight range [min, max] in kg */
export function calcIdealWeight(
  heightCm: number,
  isFemale: boolean
): [number, number] {
  const h = heightCm - 152.4
  const base = isFemale ? 45.5 + 0.9 * (h / 2.54) : 50 + 0.9 * (h / 2.54)
  return [Math.round(base * 0.9 * 10) / 10, Math.round(base * 1.1 * 10) / 10]
}

/** Mifflin-St Jeor BMR in kcal/day */
export function calcTMB(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  isFemale: boolean
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears
  return Math.round(isFemale ? base - 161 : base + 5)
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export function calcTDEE(tmb: number, activityLevel: string | null): number {
  return Math.round(
    tmb * (ACTIVITY_MULTIPLIERS[activityLevel ?? 'moderate'] ?? 1.55)
  )
}

export function getAgeFromBirthDate(birthDate: string | null): number {
  if (!birthDate) return 30
  const born = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - born.getFullYear()
  const m = now.getMonth() - born.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < born.getDate())) age--
  return age
}

export function getBmiScalePercent(bmi: number): number {
  // Scale: 15 to 40
  return Math.min(100, Math.max(0, ((bmi - 15) / (40 - 15)) * 100))
}

export type GoalCalories = { label: string; value: number; delta: number }

export function getGoalCalories(
  tdee: number,
  goal: string | null
): GoalCalories {
  if (goal === 'lose_weight')
    return { label: '−500 cal déficit', value: tdee - 500, delta: -500 }
  if (goal === 'gain_muscle')
    return { label: '+500 cal superávit', value: tdee + 500, delta: 500 }
  return { label: 'Balance calórico', value: tdee, delta: 0 }
}
